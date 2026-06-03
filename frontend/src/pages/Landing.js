import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', overflow: 'hidden' }}>
      {/* Background effects */}
      <div style={{ position: 'fixed', top: '-40%', left: '-20%', width: '80vw', height: '80vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-40%', right: '-20%', width: '80vw', height: '80vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,101,132,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ textAlign: 'center', maxWidth: 700, position: 'relative' }} className="fade-in">
        <div style={{ width: 72, height: 72, background: 'linear-gradient(135deg, var(--accent), var(--accent2))', borderRadius: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, marginBottom: 32 }}>🔗</div>
        <h1 style={{ fontSize: 56, fontWeight: 800, letterSpacing: '-2px', lineHeight: 1.1, marginBottom: 20 }}>
          Shorten URLs.<br />
          <span className="gradient-text">Track Everything.</span>
        </h1>
        <p style={{ fontSize: 18, color: 'var(--text-muted)', marginBottom: 40, lineHeight: 1.7 }}>
          LinkSnap helps you create short, memorable links and track clicks, devices, browsers, and visit history — all in real time.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" style={{ fontSize: 16, padding: '14px 32px' }} onClick={() => navigate('/signup')}>
            Get Started Free →
          </button>
          <button className="btn btn-ghost" style={{ fontSize: 16, padding: '14px 32px' }} onClick={() => navigate('/login')}>
            Sign In
          </button>
        </div>

        {/* Feature pills */}
        <div style={{ display: 'flex', gap: 12, marginTop: 60, justifyContent: 'center', flexWrap: 'wrap' }}>
          {['⚡ Instant shortening', '📊 Click analytics', '📱 QR codes', '🔐 Secure auth', '⏰ Link expiry', '✏️ Custom aliases'].map(f => (
            <span key={f} style={{ padding: '8px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
