require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const urlRoutes = require('./routes/urls');
const Url = require('./models/Url');

const app = express();

// Security middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : '*',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});
app.use('/api/', limiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/urls', urlRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running', timestamp: new Date() });
});

// URL Redirect route
app.get('/r/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const url = await Url.findOne({
      $or: [{ shortCode: code }, { alias: code }],
      isActive: true
    });

    if (!url) {
      return res.status(404).send(`
        <html>
          <head><title>Link Not Found</title></head>
          <body style="font-family: sans-serif; text-align: center; padding: 60px;">
            <h1>🔗 Link Not Found</h1>
            <p>This short URL doesn't exist or has been removed.</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}">Go to LinkSnap</a>
          </body>
        </html>
      `);
    }

    // Check expiry
    if (url.expiresAt && new Date() > new Date(url.expiresAt)) {
      return res.status(410).send(`
        <html>
          <head><title>Link Expired</title></head>
          <body style="font-family: sans-serif; text-align: center; padding: 60px;">
            <h1>⏰ Link Expired</h1>
            <p>This short URL has expired.</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}">Go to LinkSnap</a>
          </body>
        </html>
      `);
    }

    // Record click analytics
    const ua = req.headers['user-agent'] || '';
    let browser = 'Unknown';
    let device = 'Desktop';
    if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
    else if (ua.includes('Edg')) browser = 'Edge';
    if (ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone')) device = 'Mobile';
    else if (ua.includes('Tablet') || ua.includes('iPad')) device = 'Tablet';

    url.clicks.push({
      timestamp: new Date(),
      ip: req.ip || req.connection.remoteAddress,
      userAgent: ua.substring(0, 200),
      browser,
      device,
      referer: req.headers.referer || null
    });
    url.totalClicks += 1;
    url.lastVisited = new Date();
    await url.save();

    return res.redirect(301, url.originalUrl);
  } catch (error) {
    console.error('Redirect error:', error);
    res.status(500).send('Server error');
  }
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Base URL: ${process.env.BASE_URL}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

module.exports = app;
