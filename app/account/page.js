'use client';
import { useCallback, useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import AppModal from '@/components/AppModal';

function StatusPill({ status }) {
  const colors = {
    active: ['var(--green)', 'rgba(52, 211, 153, 0.13)'],
    paused: ['var(--orange)', 'rgba(251, 146, 60, 0.13)'],
    needs_reauth: ['var(--red)', 'rgba(248, 113, 113, 0.13)'],
  };
  const [color, background] = colors[status] || ['var(--text-muted)', 'var(--surface-2)'];
  return <span style={{ color, background, borderRadius: 999, padding: '4px 9px', fontSize: 11, fontWeight: 800, textTransform: 'capitalize' }}>{(status || 'unknown').replace('_', ' ')}</span>;
}

function AccountAvatar({ name }) {
  const initials = (name || 'O').split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase();
  return <div style={{ width: 48, height: 48, borderRadius: 16, display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg, var(--purple), #7c3aed)', color: '#fff', fontWeight: 900, letterSpacing: 0.5 }}>{initials}</div>;
}

export default function AccountPage() {
  const [profile, setProfile] = useState(null);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [busyId, setBusyId] = useState('');
  const [connectionPendingDisconnect, setConnectionPendingDisconnect] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Unable to load account details.');
      setProfile(data.data.user);
      setConnections(data.data.connections || []);
    } catch (error) {
      setMessage(error.message || 'Unable to load account details.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const primary = connections.find(connection => connection.connectionType === 'primary_tasks');
  const inboxes = connections.filter(connection => connection.connectionType === 'connected_gmail');

  async function updateInbox(connection, status) {
    setBusyId(connection._id);
    setMessage('');
    try {
      const response = await fetch(`/api/connections/${connection._id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Could not update inbox.');
      setMessage(status === 'paused' ? 'Inbox paused. No new metadata will be synchronized.' : 'Inbox resumed.');
      await load();
    } catch (error) {
      setMessage(error.message || 'Could not update inbox.');
    } finally {
      setBusyId('');
    }
  }

  async function disconnectInbox(connection) {
    setBusyId(connection._id);
    setMessage('');
    try {
      const response = await fetch(`/api/connections/${connection._id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Could not disconnect inbox.');
      setMessage(`${connection.email} was disconnected.`);
      await load();
      return true;
    } catch (error) {
      setMessage(error.message || 'Could not disconnect inbox.');
      return false;
    } finally {
      setBusyId('');
    }
  }

  return (
    <AppShell>
      <div style={{ maxWidth: 980, margin: '0 auto', paddingBottom: 32 }}>
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7 }}><span style={{ color: 'var(--purple)', fontSize: 12, fontWeight: 900, letterSpacing: 1.2 }}>IDENTITY & CONNECTIONS</span></div>
            <h1 className="page-title">Your account</h1>
            <p className="page-subtitle">One primary workspace. Separately authorized inboxes.</p>
          </div>
          <a href="/api/auth/google/start?connectionType=connected_gmail" className="btn btn-primary btn-sm" style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}>+ Connect Gmail</a>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}><StatusPill status={primary?.status || 'needs_reauth'} /><span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Primary Google Tasks workspace</span></div>
              </div>
            </div>
            {!primary && <div style={{ marginTop: 18, padding: 12, borderRadius: 10, background: 'rgba(251, 146, 60, 0.12)', color: 'var(--orange)', fontSize: 13 }}>Google Tasks needs to be connected before task sync can run. Sign out and sign in again to authorize it.</div>}
          </section>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 18 }}>
            <div className="card" style={{ padding: 18 }}><div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 800, letterSpacing: 0.8 }}>TASK OWNER</div><div style={{ fontSize: 16, fontWeight: 800, marginTop: 8 }}>{primary?.email || 'Not connected'}</div><div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 5 }}>All Google Tasks writes use this account only.</div></div>
            <div className="card" style={{ padding: 18 }}><div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 800, letterSpacing: 0.8 }}>CONNECTED INBOXES</div><div style={{ fontSize: 28, lineHeight: 1, fontWeight: 900, marginTop: 9 }}>{inboxes.length}</div><div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 7 }}>Each requires separate consent and can be removed independently.</div></div>
            <div className="card" style={{ padding: 18 }}><div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 800, letterSpacing: 0.8 }}>DATA BOUNDARY</div><div style={{ fontSize: 16, fontWeight: 800, marginTop: 8 }}>Scoped by account</div><div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 5 }}>Inbox access never grants task-owner access.</div></div>
          </div>

          <section className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '18px 20px', display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
              <div><h2 style={{ fontSize: 16, margin: 0 }}>Connected Gmail inboxes</h2><p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '4px 0 0' }}>Control each inbox without affecting your primary task workspace.</p></div>
              <a href="/api/auth/google/start?connectionType=connected_gmail" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}>Add inbox</a>
            </div>
            {inboxes.length === 0 ? <div style={{ padding: '34px 20px', textAlign: 'center' }}><div style={{ fontSize: 28 }}>✉️</div><div style={{ fontSize: 15, fontWeight: 800, marginTop: 8 }}>No inboxes connected</div><p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: '6px auto 14px', maxWidth: 400 }}>Connect a Gmail account to use it as an email source. It will never become the owner of your Google Tasks.</p><a href="/api/auth/google/start?connectionType=connected_gmail" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>Connect Gmail</a></div> : <div>{inboxes.map((connection, index) => <div key={connection._id} style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, borderTop: index ? '1px solid var(--border)' : 'none', flexWrap: 'wrap' }}><div style={{ width: 38, height: 38, borderRadius: 12, display: 'grid', placeItems: 'center', background: 'var(--surface-2)', fontSize: 18 }}>✉</div><div style={{ flex: 1, minWidth: 180 }}><div style={{ fontWeight: 750, fontSize: 14 }}>{connection.email}</div><div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 3 }}>{connection.lastSuccessfulSyncAt ? `Last synced ${new Date(connection.lastSuccessfulSyncAt).toLocaleString()}` : 'Ready for the first sync'}</div></div><StatusPill status={connection.status} /><div style={{ display: 'flex', gap: 7 }}><button className="btn btn-secondary btn-sm" disabled={busyId === connection._id} onClick={() => updateInbox(connection, connection.status === 'paused' ? 'active' : 'paused')}>{connection.status === 'paused' ? 'Resume' : 'Pause'}</button><button className="btn btn-ghost btn-sm" disabled={busyId === connection._id} style={{ color: 'var(--red)' }} onClick={() => setConnectionPendingDisconnect(connection)}>Disconnect</button></div></div>)}</div>}
          </section>

          <div style={{ display: 'flex', gap: 14, alignItems: 'center', justifyContent: 'space-between', padding: '18px 4px 0', flexWrap: 'wrap' }}><p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>OAuth credentials are encrypted. Removing an inbox deletes its stored authorization and inbox metadata.</p><button className="btn btn-ghost btn-sm" onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); window.location.assign('/login'); }}>Sign out</button></div>
        </>}
      <AppModal open={Boolean(connectionPendingDisconnect)} onClose={() => !busyId && setConnectionPendingDisconnect(null)} title="Disconnect inbox?" footer={<><button className="btn btn-secondary" disabled={Boolean(busyId)} onClick={() => setConnectionPendingDisconnect(null)}>Cancel</button><button className="btn btn-danger" disabled={Boolean(busyId)} onClick={async () => { if (await disconnectInbox(connectionPendingDisconnect)) setConnectionPendingDisconnect(null); }}>{busyId ? 'Disconnecting…' : 'Disconnect'}</button></>}>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>Disconnect “{connectionPendingDisconnect?.email}”? Its authorization and stored inbox metadata will be removed. Google Tasks already created remain available.</p>
      </AppModal>
      </div>
    </AppShell>
  );
}
