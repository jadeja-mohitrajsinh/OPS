'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        router.push('/');
        router.refresh();
      } else {
        setError(data.error || 'Invalid password');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
        padding: 20,
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: 400,
          padding: 32,
          borderRadius: 16,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
              margin: '0 auto 16px',
            }}
          >
            🔒
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.5px' }}>OPS</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            Enter your master password to access your dashboard
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              background: 'var(--red-bg)',
              color: 'var(--red)',
              fontSize: 13,
              fontWeight: 600,
              textAlign: 'center',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="label">Master Password</label>
            <input
              type="password"
              className="input"
              style={{ fontSize: 14, padding: '12px 14px' }}
              placeholder="Enter password..."
              autoFocus
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ padding: '12px', fontSize: 14, fontWeight: 700, justifyContent: 'center' }}
            disabled={loading}
          >
            {loading ? 'Unlocking...' : 'Unlock OS →'}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)' }}>
          Default password: <code style={{ background: 'var(--surface-2)', padding: '2px 6px', borderRadius: 4 }}>admin123</code> (customizable in <code>.env.local</code>)
        </div>
      </div>
    </div>
  );
}
