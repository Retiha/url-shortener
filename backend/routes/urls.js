const express = require('express');
const router = express.Router();
const { nanoid } = require('nanoid');
const Url = require('../models/Url');
const { protect } = require('../middleware/auth');

const isValidUrl = (string) => {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
};

const parseUserAgent = (ua) => {
  if (!ua) return { browser: 'Unknown', device: 'Unknown' };
  let browser = 'Unknown';
  let device = 'Desktop';
  if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Edg')) browser = 'Edge';
  if (ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone')) device = 'Mobile';
  else if (ua.includes('Tablet') || ua.includes('iPad')) device = 'Tablet';
  return { browser, device };
};

// POST /api/urls - Create short URL
router.post('/', protect, async (req, res) => {
  try {
    const { originalUrl, alias, expiresAt, title } = req.body;
    if (!originalUrl) {
      return res.status(400).json({ success: false, message: 'Original URL is required' });
    }
    if (!isValidUrl(originalUrl)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid URL (must start with http:// or https://)' });
    }

    let shortCode = alias ? alias.trim() : nanoid(7);
    
    if (alias) {
      const aliasRegex = /^[a-zA-Z0-9_-]+$/;
      if (!aliasRegex.test(alias)) {
        return res.status(400).json({ success: false, message: 'Alias can only contain letters, numbers, hyphens, and underscores' });
      }
      const existing = await Url.findOne({ $or: [{ shortCode: alias }, { alias }] });
      if (existing) {
        return res.status(400).json({ success: false, message: 'This alias is already taken' });
      }
    } else {
      // Ensure uniqueness
      let exists = await Url.findOne({ shortCode });
      while (exists) {
        shortCode = nanoid(7);
        exists = await Url.findOne({ shortCode });
      }
    }

    const url = await Url.create({
      user: req.user._id,
      originalUrl,
      shortCode,
      alias: alias || null,
      title: title || null,
      expiresAt: expiresAt || null
    });

    const shortUrl = `${process.env.BASE_URL}/r/${shortCode}`;
    res.status(201).json({
      success: true,
      message: 'Short URL created successfully',
      data: { ...url.toObject(), shortUrl }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/urls - Get all URLs for user
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const urls = await Url.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-clicks');

    const total = await Url.countDocuments({ user: req.user._id });
    
    const baseUrl = process.env.BASE_URL;
    const urlsWithShort = urls.map(url => ({
      ...url.toObject(),
      shortUrl: `${baseUrl}/r/${url.shortCode}`
    }));

    res.json({
      success: true,
      data: urlsWithShort,
      pagination: { total, page, pages: Math.ceil(total / limit), limit }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/urls/:id/analytics - Get analytics for a URL
router.get('/:id/analytics', protect, async (req, res) => {
  try {
    const url = await Url.findOne({ _id: req.params.id, user: req.user._id });
    if (!url) {
      return res.status(404).json({ success: false, message: 'URL not found' });
    }

    // Daily click trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentClicks = url.clicks.filter(c => new Date(c.timestamp) >= thirtyDaysAgo);
    
    // Group by day
    const dailyClicks = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      dailyClicks[key] = 0;
    }
    recentClicks.forEach(click => {
      const key = new Date(click.timestamp).toISOString().split('T')[0];
      if (dailyClicks[key] !== undefined) dailyClicks[key]++;
    });

    // Browser breakdown
    const browsers = {};
    url.clicks.forEach(c => {
      const b = c.browser || 'Unknown';
      browsers[b] = (browsers[b] || 0) + 1;
    });

    // Device breakdown
    const devices = {};
    url.clicks.forEach(c => {
      const d = c.device || 'Unknown';
      devices[d] = (devices[d] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        url: { ...url.toObject(), shortUrl: `${process.env.BASE_URL}/r/${url.shortCode}` },
        analytics: {
          totalClicks: url.totalClicks,
          lastVisited: url.lastVisited,
          recentHistory: url.clicks.slice(-10).reverse(),
          dailyClicks: Object.entries(dailyClicks).map(([date, count]) => ({ date, count })),
          browsers: Object.entries(browsers).map(([name, count]) => ({ name, count })),
          devices: Object.entries(devices).map(([name, count]) => ({ name, count }))
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/urls/:id - Update URL
router.put('/:id', protect, async (req, res) => {
  try {
    const url = await Url.findOne({ _id: req.params.id, user: req.user._id });
    if (!url) {
      return res.status(404).json({ success: false, message: 'URL not found' });
    }
    const { originalUrl, title, expiresAt } = req.body;
    if (originalUrl && !isValidUrl(originalUrl)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid URL' });
    }
    if (originalUrl) url.originalUrl = originalUrl;
    if (title !== undefined) url.title = title;
    if (expiresAt !== undefined) url.expiresAt = expiresAt;
    await url.save();
    res.json({ success: true, message: 'URL updated successfully', data: { ...url.toObject(), shortUrl: `${process.env.BASE_URL}/r/${url.shortCode}` } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/urls/:id - Delete URL
router.delete('/:id', protect, async (req, res) => {
  try {
    const url = await Url.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!url) {
      return res.status(404).json({ success: false, message: 'URL not found' });
    }
    res.json({ success: true, message: 'URL deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
