import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import { urlAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
 
export default function Dashboard() {
  const { user } = useAuth();
  const [form, setForm] = useState({ originalUrl: '', alias: '', title: '', expiresAt: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, totalClicks: 0, recentUrls: [] });
  const [createdUrl, setCreatedUrl] = useState(null);
  const [showQr, setShowQr] = useState(false);
  const [copyMsg, setCopyMsg] = useState('');
 
  const fetchStats = useCallback(async () => {
    try {
      const res = await urlAPI.getAll({ limit: 5 });
      const urls = res.data.data;
      const totalClicks = urls.reduce((sum, u) => sum + u.totalClicks, 0);
      setStats({ total: res.data.pagination.total, totalClicks, recentUrls: urls });
    } catch {}
  }, []);
 
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);
 
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.originalUrl) return setError('Please enter a URL');
    setLoading(true);
    try {
      const payload = { originalUrl: form.originalUrl };
      if (form.alias) payload.alias = form.alias;
      if (form.title) payload.title = form.title;
      if (form.expiresAt) payload.expiresAt = form.expiresAt;
      const res = await urlAPI.create(payload);
      setCreatedUrl(res.data.data);
      setSuccess('🎉 Short URL created successfully!');
      setForm({ originalUrl: '', alias: '', title: '', expiresAt: '' });
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create URL');
    } finally {
      setLoading(false);
    }
  };
 
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopyMsg('Copied!');
    setTimeout(() => setCopyMsg(''), 2000);
  };
 
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content fade-in">
        <div className="page-header">
          <h1 className="page-title">Good to see you, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋</h1>
          <p className="page-subtitle">Shorten, track, and manage your links all in one place</p>
        </div>
 
        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Links</div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-icon">🔗</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Clicks</div>
            <div className="stat-value">{stats.totalClicks}</div>
            <div className="stat-icon">👆</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Avg. Clicks</div>
            <div className="stat-value">{stats.total ? Math.round(stats.totalClicks / stats.total) : 0}</div>
            <div className="stat-icon">📈</div>
          </div>
        </div>
 
        {/* Create Form */}
        <div className="card">
          <h2 className="card-title">⚡ Create Short URL</h2>
          {error && <div className="error-msg">⚠️ {error}</div>}
          {success && <div className="success-msg">{success}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Destination URL *</label>
              <input
                className="form-input"
                type="text"
                name="originalUrl"
                placeholder="https://your-very-long-url.com/goes/here"
                value={form.originalUrl}
                onChange={handleChange}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Custom Alias (optional)</label>
                <input
                  className="form-input"
                  type="text"
                  name="alias"
                  placeholder="my-link"
                  value={form.alias}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Title (optional)</label>
                <input
                  className="form-input"
                  type="text"
                  name="title"
                  placeholder="My awesome link"
                  value={form.title}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Expiry Date (optional)</label>
              <input
                className="form-input"
                type="date"
                name="expiresAt"
                value={form.expiresAt}
                min={new Date().toISOString().split('T')[0]}
                onChange={handleChange}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner"></span> Creating...</> : '⚡ Shorten URL'}
            </button>
          </form>
 
          {createdUrl && (
            <div style={{ marginTop: 20, padding: 20, background: 'var(--surface2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Your short URL:</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'Space Mono', fontSize: 16, color: 'var(--accent)', wordBreak: 'break-all' }}>
                  {createdUrl.shortUrl}
                </span>
                <button className="btn btn-sm btn-ghost" onClick={() => copyToClipboard(createdUrl.shortUrl)}>📋 Copy</button>
                <button className="btn btn-sm btn-ghost" onClick={() => setShowQr(!showQr)}>📱 QR Code</button>
              </div>
              {showQr && (
                <div className="qr-container" style={{ marginTop: 12 }}>
                  <QRCodeSVG value={createdUrl.shortUrl} size={160} />
                </div>
              )}
            </div>
          )}
        </div>
 
        {/* Recent URLs */}
        <div className="card">
          <h2 className="card-title">🕐 Recent Links</h2>
          {stats.recentUrls.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔗</div>
              <div className="empty-title">No links yet</div>
              <div className="empty-desc">Create your first short URL above</div>
            </div>
          ) : (
            <table className="url-table">
              <thead>
                <tr>
                  <th>Original URL</th>
                  <th>Short URL</th>
                  <th>Clicks</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentUrls.map(url => (
                  <tr key={url._id}>
                    <td>
                      <div title={url.originalUrl} className="url-original">{url.title || url.originalUrl}</div>
                    </td>
                    <td>
                      <span className="url-short" onClick={() => copyToClipboard(url.shortUrl)}>
                        {url.shortUrl?.replace('http://localhost:5000', '')}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-purple">👆 {url.totalClicks}</span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'Space Mono' }}>
                      {new Date(url.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
 
        {copyMsg && <div className="copy-feedback">✅ {copyMsg}</div>}
      </main>
    </div>
  );
}
