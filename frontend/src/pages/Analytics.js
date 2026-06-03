import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { urlAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';

const COLORS = ['#6c63ff', '#ff6584', '#43e97b', '#f7971e', '#4facfe'];

export default function Analytics() {
  const [urls, setUrls] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [urlsLoading, setUrlsLoading] = useState(true);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const fetchUrls = async () => {
      try {
        const res = await urlAPI.getAll({ limit: 100 });
        setUrls(res.data.data);
        const paramId = searchParams.get('id');
        if (paramId) setSelectedId(paramId);
        else if (res.data.data.length > 0) setSelectedId(res.data.data[0]._id);
      } catch {}
      finally { setUrlsLoading(false); }
    };
    fetchUrls();
  }, [searchParams]);

  const fetchAnalytics = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await urlAPI.getAnalytics(id);
      setAnalytics(res.data.data);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (selectedId) fetchAnalytics(selectedId);
  }, [selectedId, fetchAnalytics]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
          <div style={{ color: 'var(--text-muted)' }}>{label}</div>
          <div style={{ color: 'var(--accent)', fontWeight: 700 }}>{payload[0].value} clicks</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content fade-in">
        <div className="page-header">
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Deep dive into your link performance</p>
        </div>

        {/* URL Selector */}
        <div className="card">
          <label className="form-label">Select a Link</label>
          {urlsLoading ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading links...</div>
          ) : (
            <select
              className="form-input"
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
            >
              {urls.map(url => (
                <option key={url._id} value={url._id}>
                  {url.title || url.originalUrl.substring(0, 60)} — /r/{url.shortCode}
                </option>
              ))}
            </select>
          )}
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            <span className="spinner" style={{ borderColor: 'rgba(108,99,255,0.3)', borderTopColor: 'var(--accent)', width: 40, height: 40, borderWidth: 3 }}></span>
            <div style={{ marginTop: 16 }}>Loading analytics...</div>
          </div>
        )}

        {!loading && analytics && (
          <>
            {/* Key metrics */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Total Clicks</div>
                <div className="stat-value">{analytics.analytics.totalClicks}</div>
                <div className="stat-icon">👆</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Last Visited</div>
                <div className="stat-value" style={{ fontSize: 16, paddingTop: 8 }}>
                  {analytics.analytics.lastVisited
                    ? new Date(analytics.analytics.lastVisited).toLocaleString()
                    : 'Never'}
                </div>
                <div className="stat-icon">🕐</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Link Created</div>
                <div className="stat-value" style={{ fontSize: 16, paddingTop: 8 }}>
                  {new Date(analytics.url.createdAt).toLocaleDateString()}
                </div>
                <div className="stat-icon">📅</div>
              </div>
            </div>

            {/* Daily clicks chart */}
            <div className="card">
              <h3 className="card-title">📈 Daily Clicks (Last 30 Days)</h3>
              <div className="chart-container" style={{ height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.analytics.dailyClicks} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                      tickFormatter={d => d.slice(5)}
                      interval={6}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6c63ff" stopOpacity={1} />
                        <stop offset="100%" stopColor="#6c63ff" stopOpacity={0.4} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Browser & Device charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
              <div className="card">
                <h3 className="card-title">🌐 By Browser</h3>
                {analytics.analytics.browsers.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No data yet</p>
                ) : (
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={analytics.analytics.browsers} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                          {analytics.analytics.browsers.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(val) => [`${val} clicks`]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
              <div className="card">
                <h3 className="card-title">📱 By Device</h3>
                {analytics.analytics.devices.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No data yet</p>
                ) : (
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={analytics.analytics.devices} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                          {analytics.analytics.devices.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(val) => [`${val} clicks`]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>

            {/* Recent visit history */}
            <div className="card">
              <h3 className="card-title">🕐 Recent Visit History</h3>
              {analytics.analytics.recentHistory.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No visits yet</p>
              ) : (
                <table className="url-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Browser</th>
                      <th>Device</th>
                      <th>Referer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.analytics.recentHistory.map((click, i) => (
                      <tr key={i}>
                        <td style={{ fontSize: 12, fontFamily: 'Space Mono' }}>
                          {new Date(click.timestamp).toLocaleString()}
                        </td>
                        <td><span className="badge badge-purple">{click.browser || 'Unknown'}</span></td>
                        <td><span className="badge badge-green">{click.device || 'Unknown'}</span></td>
                        <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{click.referer || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {!loading && !analytics && !urlsLoading && urls.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <div className="empty-title">No links to analyze</div>
            <div className="empty-desc">Create a short URL first to see analytics</div>
          </div>
        )}
      </main>
    </div>
  );
}
