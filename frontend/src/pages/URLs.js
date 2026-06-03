import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import { urlAPI } from '../services/api';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
 
export default function URLs() {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copyMsg, setCopyMsg] = useState('');
  const [editModal, setEditModal] = useState(null);
  const [qrModal, setQrModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editForm, setEditForm] = useState({ originalUrl: '', title: '', expiresAt: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
 
  const fetchUrls = useCallback(async () => {
    setLoading(true);
    try {
      const res = await urlAPI.getAll({ limit: 100 });
      setUrls(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);
 
  useEffect(() => { fetchUrls(); }, [fetchUrls]);
 
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopyMsg('Copied!');
    setTimeout(() => setCopyMsg(''), 2000);
  };
 
  const handleDelete = async (id) => {
    try {
      await urlAPI.delete(id);
      setUrls(prev => prev.filter(u => u._id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      alert('Failed to delete URL');
    }
  };
 
  const openEdit = (url) => {
    setEditModal(url);
    setEditForm({
      originalUrl: url.originalUrl,
      title: url.title || '',
      expiresAt: url.expiresAt ? new Date(url.expiresAt).toISOString().split('T')[0] : ''
    });
    setEditError('');
  };
 
  const handleEdit = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditLoading(true);
    try {
      const res = await urlAPI.update(editModal._id, editForm);
      setUrls(prev => prev.map(u => u._id === editModal._id ? { ...res.data.data } : u));
      setEditModal(null);
    } catch (err) {
      setEditError(err.response?.data?.message || 'Update failed');
    } finally {
      setEditLoading(false);
    }
  };
 
  const isExpired = (url) => url.expiresAt && new Date() > new Date(url.expiresAt);
 
  const filteredUrls = urls.filter(url =>
    (url.title || url.originalUrl || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    url.shortCode.toLowerCase().includes(searchTerm.toLowerCase())
  );
 
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content fade-in">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">My Links</h1>
            <p className="page-subtitle">{urls.length} total links</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>⚡ Create New</button>
        </div>
 
        <div className="card" style={{ padding: '16px 24px' }}>
          <input
            className="form-input"
            placeholder="🔍 Search links by title, URL, or short code..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
 
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
              <span className="spinner" style={{ borderColor: 'rgba(108,99,255,0.3)', borderTopColor: 'var(--accent)', width: 32, height: 32, borderWidth: 3 }}></span>
              <div style={{ marginTop: 12 }}>Loading links...</div>
            </div>
          ) : filteredUrls.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔗</div>
              <div className="empty-title">{searchTerm ? 'No results found' : 'No links yet'}</div>
              <div className="empty-desc">{searchTerm ? 'Try a different search term' : 'Create your first short URL from the dashboard'}</div>
            </div>
          ) : (
            <table className="url-table">
              <thead>
                <tr>
                  <th>Link</th>
                  <th>Short URL</th>
                  <th>Clicks</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUrls.map(url => (
                  <tr key={url._id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{url.title || 'Untitled'}</div>
                      <div className="url-original" title={url.originalUrl}>{url.originalUrl}</div>
                    </td>
                    <td>
                      <span className="url-short" onClick={() => copyToClipboard(url.shortUrl)} title="Click to copy">
                        /r/{url.shortCode}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-purple">👆 {url.totalClicks}</span>
                    </td>
                    <td>
                      {isExpired(url) ? (
                        <span className="badge badge-red">⏰ Expired</span>
                      ) : url.expiresAt ? (
                        <span className="badge badge-green">✅ Active (expires)</span>
                      ) : (
                        <span className="badge badge-green">✅ Active</span>
                      )}
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'Space Mono' }}>
                      {new Date(url.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="btn btn-icon" title="Copy" onClick={() => copyToClipboard(url.shortUrl)}>📋</button>
                        <button className="btn btn-icon" title="QR Code" onClick={() => setQrModal(url)}>📱</button>
                        <button className="btn btn-icon" title="Analytics" onClick={() => navigate(`/analytics?id=${url._id}`)}>📊</button>
                        <button className="btn btn-icon" title="Edit" onClick={() => openEdit(url)}>✏️</button>
                        <button className="btn btn-icon" style={{ color: 'var(--accent2)' }} title="Delete" onClick={() => setDeleteConfirm(url)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
 
        {/* Edit Modal */}
        {editModal && (
          <div className="modal-overlay" onClick={() => setEditModal(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title">✏️ Edit Link</div>
                <button className="modal-close" onClick={() => setEditModal(null)}>×</button>
              </div>
              {editError && <div className="error-msg">⚠️ {editError}</div>}
              <form onSubmit={handleEdit}>
                <div className="form-group">
                  <label className="form-label">Destination URL</label>
                  <input className="form-input" type="text" value={editForm.originalUrl}
                    onChange={e => setEditForm({ ...editForm, originalUrl: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input className="form-input" type="text" value={editForm.title}
                    onChange={e => setEditForm({ ...editForm, title: e.target.value })} placeholder="Optional title" />
                </div>
                <div className="form-group">
                  <label className="form-label">Expiry Date</label>
                  <input className="form-input" type="date" value={editForm.expiresAt}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setEditForm({ ...editForm, expiresAt: e.target.value })} />
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button type="submit" className="btn btn-primary" disabled={editLoading}>
                    {editLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => setEditModal(null)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
 
        {/* QR Modal */}
        {qrModal && (
          <div className="modal-overlay" onClick={() => setQrModal(null)}>
            <div className="modal" style={{ maxWidth: 360, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title">📱 QR Code</div>
                <button className="modal-close" onClick={() => setQrModal(null)}>×</button>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                Scan to visit: <strong style={{ color: 'var(--accent)' }}>{qrModal.shortUrl?.replace('http://localhost:5000', '')}</strong>
              </p>
              <div className="qr-container">
                <QRCodeSVG value={qrModal.shortUrl || ''} size={200} />
              </div>
              <button className="btn btn-ghost" style={{ marginTop: 16 }} onClick={() => setQrModal(null)}>Close</button>
            </div>
          </div>
        )}
 
        {/* Delete Confirm */}
        {deleteConfirm && (
          <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
            <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
              <div style={{ textAlign: 'center', padding: '8px 0 24px' }}>
                <div style={{ fontSize: 48 }}>🗑️</div>
                <h3 style={{ margin: '16px 0 8px', fontSize: 20 }}>Delete this link?</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                  This action cannot be undone. All analytics data for this link will also be deleted.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={() => handleDelete(deleteConfirm._id)}>
                  Yes, Delete
                </button>
                <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setDeleteConfirm(null)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
 
        {copyMsg && <div className="copy-feedback">✅ {copyMsg}</div>}
      </main>
    </div>
  );
}
 