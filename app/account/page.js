'use client';
import { useCallback, useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';

function AccountAvatar({ name }) {
  const initials = (name || 'O').split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase();
  return <div style={{ width: 48, height: 48, borderRadius: 16, display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg, var(--purple), #7c3aed)', color: '#fff', fontWeight: 900, letterSpacing: 0.5 }}>{initials}</div>;
}

export default function AccountPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Unable to load account details.');
      setProfile(data.data.user);
    } catch (error) {
      setMessage(error.message || 'Unable to load account details.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <AppShell>
      <div style={{ maxWidth: 980, margin: '0 auto', paddingBottom: 32 }}>
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7 }}><span style={{ color: 'var(--purple)', fontSize: 12, fontWeight: 900, letterSpacing: 1.2 }}>IDENTITY</span></div>
            <h1 className="page-title">Your account</h1>
            <p className="page-subtitle">Manage your account settings</p>
          </div>
        </div>

        {message && <div style={{ padding: '11px 14px', marginBottom: 18, border: '1px solid var(--border)', background: 'var(--surface-2)', borderRadius: 10, fontSize: 13, color: message.includes('Unable') || message.includes('Could not') ? 'var(--red)' : 'var(--text-secondary)' }}>{message}</div>}

        {loading ? <div className="loading-state"><div className="spinner" /></div> : <>
          <section className="card" style={{ padding: 22, marginBottom: 18, overflow: 'hidden', position: 'relative' }}>
            <div style={{ position: 'absolute', width: 260, height: 260, borderRadius: '50%', right: -120, top: -150, background: 'rgba(124,58,237,0.12)', pointerEvents: 'none' }} />
            <div style={{ display: 'flex', gap: 15, alignItems: 'center', position: 'relative' }}>
              <AccountAvatar name={profile?.displayName || profile?.primaryEmail} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 18, fontWeight: 850, overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile?.displayName || 'Primary account'}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile?.primaryEmail}</div>
              </div>
            </div>
          </section>

          <div style={{ display: 'flex', gap: 14, alignItems: 'center', justifyContent: 'space-between', padding: '18px 4px 0', flexWrap: 'wrap' }}><p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>Your account is managed through Google OAuth.</p><button className="btn btn-ghost btn-sm" onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); window.location.assign('/login'); }}>Sign out</button></div>
        </>}
      </div>
    </AppShell>
  );
}
