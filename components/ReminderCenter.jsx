'use client';
import { useState, useEffect } from 'react';
import {
  checkNotificationPermission,
  requestNotificationPermission,
  syncAllTodayReminders,
  sendTestNotification,
  cancelAllReminders,
  getStoredScheduledReminders,
} from '@/lib/notifications';

export default function ReminderCenter({ isOpen, onClose, schedule = [], tasks = [], blockAssignments = {}, meetings = [] }) {
  const [permission, setPermission] = useState('prompt');
  const [scheduledReminders, setScheduledReminders] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  // Settings
  const [settings, setSettings] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ops_reminder_settings_v1');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return {
      notifyBlockPre: true,
      notifyBlockStart: true,
      notifyBlockEnd: true,
      notifyMeetings: true,
      notifyTasks: true,
    };
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ops_reminder_settings_v1', JSON.stringify(settings));
    }
  }, [settings]);

  async function updateStatus() {
    const perm = await checkNotificationPermission();
    setPermission(perm);
    setScheduledReminders(getStoredScheduledReminders());
  }

  useEffect(() => {
    if (isOpen) {
      updateStatus();
    }
  }, [isOpen]);

  async function handleRequestPermission() {
    const granted = await requestNotificationPermission();
    setPermission(granted ? 'granted' : 'denied');
    if (granted) {
      handleSync();
    }
  }

  async function handleSync() {
    setIsSyncing(true);
    setSyncMessage('');
    try {
      const res = await syncAllTodayReminders({
        schedule,
        tasks,
        blockAssignments,
        meetings,
        settings,
      });

      if (res.success) {
        setSyncMessage(`✓ Successfully scheduled ${res.count} reminders for today!`);
        setScheduledReminders(res.reminders || []);
      } else if (res.reason === 'permission_needed') {
        setSyncMessage('⚠️ Please grant notification permission first.');
      }
    } catch (err) {
      console.error(err);
      setSyncMessage('Failed to sync reminders.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncMessage(''), 4000);
    }
  }

  async function handleTest() {
    setIsTesting(true);
    try {
      await sendTestNotification();
      setSyncMessage('🔔 Test notification sent to your device!');
    } catch (err) {
      setSyncMessage(`Error: ${err.message}`);
    } finally {
      setIsTesting(false);
      setTimeout(() => setSyncMessage(''), 3500);
    }
  }

  async function handleClear() {
    if (!confirm('Cancel all pending reminders for today?')) return;
    await cancelAllReminders();
    setScheduledReminders([]);
    setSyncMessage('Cleared all pending reminders.');
    setTimeout(() => setSyncMessage(''), 3000);
  }

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: 580, maxHeight: '85vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>🔔</span>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}>Android & Timeline Reminders</h2>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Capacitor Local Notifications & Routine Transition Alerts
              </p>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        {/* Permission Status Banner */}
        <div style={{
          padding: '12px 14px',
          borderRadius: 8,
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: permission === 'granted' ? 'var(--green-bg)' : 'var(--orange-bg)',
          border: `1px solid ${permission === 'granted' ? 'rgba(26, 122, 62, 0.2)' : 'rgba(232, 102, 10, 0.2)'}`,
        }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: permission === 'granted' ? 'var(--green)' : 'var(--orange)' }}>
              {permission === 'granted' ? '✓ NOTIFICATIONS ACTIVE' : '⚠️ PERMISSION REQUIRED'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
              {permission === 'granted'
                ? 'Device notifications and exact alarms are authorized.'
                : 'Enable permissions to receive timeline, meeting, and task transition alerts on Android.'}
            </div>
          </div>

          {permission !== 'granted' && (
            <button className="btn btn-primary btn-sm" onClick={handleRequestPermission}>
              Enable Alerts
            </button>
          )}
        </div>

        {/* Sync & Action Controls */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            style={{ flex: '1 1 180px' }}
            disabled={isSyncing}
            onClick={handleSync}
          >
            {isSyncing ? 'Syncing...' : '⚡ Sync Today\'s Timeline'}
          </button>
          <button
            className="btn btn-secondary"
            disabled={isTesting}
            onClick={handleTest}
          >
            🔔 Test Alert
          </button>
          {scheduledReminders.length > 0 && (
            <button
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--red)', fontSize: 11 }}
              onClick={handleClear}
            >
              Clear All
            </button>
          )}
        </div>

        {syncMessage && (
          <div style={{
            fontSize: 12,
            fontWeight: 600,
            padding: '8px 12px',
            borderRadius: 6,
            marginBottom: 14,
            background: 'var(--surface-2)',
            color: 'var(--text)',
            textAlign: 'center'
          }}>
            {syncMessage}
          </div>
        )}

        {/* Reminder Settings Toggles */}
        <div style={{ background: 'var(--surface-2)', padding: 14, borderRadius: 8, marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text)', marginBottom: 10, letterSpacing: '0.4px' }}>
            NOTIFICATION TRIGGERS
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, cursor: 'pointer' }}>
              <span>⏳ 5-min warning before block starts</span>
              <input
                type="checkbox"
                checked={settings.notifyBlockPre}
                onChange={e => setSettings({ ...settings, notifyBlockPre: e.target.checked })}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, cursor: 'pointer' }}>
              <span>🎯 Block start focus alert with assigned MITs</span>
              <input
                type="checkbox"
                checked={settings.notifyBlockStart}
                onChange={e => setSettings({ ...settings, notifyBlockStart: e.target.checked })}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, cursor: 'pointer' }}>
              <span>⏰ Block end transition alert (&quot;Next up: X&quot;)</span>
              <input
                type="checkbox"
                checked={settings.notifyBlockEnd}
                onChange={e => setSettings({ ...settings, notifyBlockEnd: e.target.checked })}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, cursor: 'pointer' }}>
              <span>📅 Meetings (10-min warning + at start)</span>
              <input
                type="checkbox"
                checked={settings.notifyMeetings}
                onChange={e => setSettings({ ...settings, notifyMeetings: e.target.checked })}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, cursor: 'pointer' }}>
              <span>🔥 Urgent task deadlines (30m before)</span>
              <input
                type="checkbox"
                checked={settings.notifyTasks}
                onChange={e => setSettings({ ...settings, notifyTasks: e.target.checked })}
              />
            </label>
          </div>
        </div>

        {/* Queued Reminders List */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text)' }}>
              TODAY&apos;S SCHEDULED QUEUE ({scheduledReminders.length})
            </div>
          </div>

          {scheduledReminders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 18, color: 'var(--text-muted)', fontSize: 12, background: 'var(--surface)', borderRadius: 8, border: '1px dashed var(--border)' }}>
              No reminders queued yet. Click <strong>&quot;⚡ Sync Today&apos;s Timeline&quot;</strong> to schedule all upcoming blocks.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {scheduledReminders.map((r, i) => {
                const timeStr = r.scheduleAt ? new Date(r.scheduleAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                return (
                  <div
                    key={i}
                    style={{
                      padding: '10px 12px',
                      background: 'var(--surface)',
                      borderRadius: 6,
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: 8
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>
                        {r.title}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                        {r.body}
                      </div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--purple)', background: 'var(--purple-bg)', padding: '2px 6px', borderRadius: 4, flexShrink: 0 }}>
                      {timeStr}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Close footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
