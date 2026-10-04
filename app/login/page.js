'use client';
import { useEffect, useState } from 'react';
import Logo from '@/components/Logo';

export default function LoginPage() {
  const [error, setError] = useState('');

  useEffect(() => {
    setError(new URLSearchParams(window.location.search).get('error') || '');
  }, []);

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
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ marginBottom: 12 }}>
            <Logo size="lg" />
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            Sign in with your primary Google account to access your workspace
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

        <a
          href="/api/auth/google/start?connectionType=primary_tasks"
          className="btn btn-primary"
          style={{ padding: '12px', fontSize: 14, fontWeight: 700, justifyContent: 'center', textDecoration: 'none' }}
        >
          Continue with Google →
        </a>

        <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
          Your primary account owns Google Tasks. Additional Gmail inboxes are connected later with separate consent.
        </div>
      </div>
    </div>
  );
}
