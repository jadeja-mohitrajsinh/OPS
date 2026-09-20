'use client';
import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import Link from 'next/link';

const STATUS_COLORS = { SCHEDULED: 'var(--blue)', COMPLETED: 'var(--green)', CANCELLED: 'var(--red)', RESCHEDULED: 'var(--orange)' };
const STATUS_BG = { SCHEDULED: 'var(--blue-bg)', COMPLETED: 'var(--green-bg)', CANCELLED: 'var(--red-bg)', RESCHEDULED: 'var(--orange-bg)' };

function MeetingForm({ onSave, onClose, initial = {} }) {
  const [form, setForm] = useState({
    title: '', date: '', startTime: '', endTime: '', location: '', isOnline: false,
    meetingLink: '', people: '', organization: '', project: '', purpose: '', agenda: '',
    status: 'SCHEDULED', ...initial,
    people: Array.isArray(initial.people) ? initial.people.join(', ') : (initial.people || ''),
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.date || !form.startTime) return;
    const payload = {
      ...form,
      people: form.people ? form.people.split(',').map(p => p.trim()).filter(Boolean) : [],
    };
    await onSave(payload);
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{initial._id ? 'Edit Meeting' : 'New Meeting'}</h2>
          <button className="btn modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Meeting Title *</label>
            <input className="input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="What is this meeting about?" autoFocus required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="label">Date *</label>
              <input className="input" type="date" value={form.date ? form.date.slice(0,10) : ''} onChange={e => set('date', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="label">Start Time *</label>
              <input className="input" type="time" value={form.startTime} onChange={e => set('startTime', e.target.value)} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="label">End Time</label>
              <input className="input" type="time" value={form.endTime} onChange={e => set('endTime', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Location</label>
              <input className="input" value={form.location} onChange={e => set('location', e.target.value)} placeholder="Room / Online" />
            </div>
          </div>
          <div className="form-group">
            <label className="label">People (comma separated)</label>
            <input className="input" value={form.people} onChange={e => set('people', e.target.value)} placeholder="John, Sarah, Team..." />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="label">Organization / Project</label>
              <input className="input" value={form.organization} onChange={e => set('organization', e.target.value)} placeholder="Forge, College..." />
            </div>
            <div className="form-group">
              <label className="label">Status</label>
              <select className="input select" value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="SCHEDULED">Scheduled</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="RESCHEDULED">Rescheduled</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="label">Purpose</label>
            <input className="input" value={form.purpose} onChange={e => set('purpose', e.target.value)} placeholder="Why this meeting?" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="label">Agenda</label>
            <textarea className="input textarea" value={form.agenda} onChange={e => set('agenda', e.target.value)} placeholder="Topics to cover..." rows={3} />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Meeting</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MeetingCard({ meeting, onEdit }) {
  const date = new Date(meeting.date);
  const isPast = date < new Date();
  const isToday = date.toDateString() === new Date().toDateString();
  return (
    <div style={{ display: 'flex', gap: 0 }}>
      <Link href={`/meetings/${meeting._id}`} style={{ flex: 1, display: 'block' }}>
        <div className="card card-hover" style={{ padding: '14px 16px', opacity: isPast && meeting.status !== 'COMPLETED' ? 0.7 : 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ width: 42, height: 42, background: isToday ? 'var(--accent)' : 'var(--surface-2)', borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: isToday ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)', textTransform: 'uppercase' }}>{date.toLocaleString('default',{month:'short'})}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: isToday ? 'white' : 'var(--text)', lineHeight: 1 }}>{date.getDate()}</div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <span style={{ fontSize: 14, fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{meeting.title}</span>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: STATUS_BG[meeting.status], color: STATUS_COLORS[meeting.status], flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                  {meeting.status}
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {meeting.startTime}{meeting.endTime ? ` – ${meeting.endTime}` : ''}
                {meeting.people?.length > 0 && ` · ${meeting.people.slice(0,3).join(', ')}`}
                {meeting.location && ` · ${meeting.location}`}
              </div>
              {meeting.purpose && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{meeting.purpose}</div>}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState('upcoming');

  async function load() {
    setLoading(true);
    const res = await fetch('/api/meetings');
    const data = await res.json();
    setMeetings(data.success ? data.data : []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('add')) setShowForm(true);
  }, []);

  async function handleSave(payload) {
    if (editing) {
      await fetch(`/api/meetings/${editing._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    } else {
      await fetch('/api/meetings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    }
    setEditing(null);
    load();
  }

  const now = new Date();
  const filtered = filter === 'upcoming'
    ? meetings.filter(m => new Date(m.date) >= now && m.status === 'SCHEDULED')
    : filter === 'completed'
    ? meetings.filter(m => m.status === 'COMPLETED')
    : meetings;

  const sorted = [...filtered].sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <AppShell>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">Meetings</h1>
          <p className="page-subtitle">{meetings.filter(m => new Date(m.date) >= now && m.status === 'SCHEDULED').length} upcoming</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => { setEditing(null); setShowForm(true); }}>+ Schedule</button>
      </div>

      <div className="tabs" style={{ marginBottom: 20 }}>
        {[['upcoming','Upcoming'],['completed','Completed'],['all','All']].map(([val,lbl]) => (
          <button key={val} className={`tab-btn ${filter === val ? 'active' : ''}`} onClick={() => setFilter(val)}>{lbl}</button>
        ))}
      </div>

      {loading ? (
        <div className="loading-state"><div className="spinner" /></div>
      ) : sorted.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <div className="empty-state-title">No meetings {filter}</div>
          <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => setShowForm(true)}>Schedule Meeting</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sorted.map(m => <MeetingCard key={m._id} meeting={m} onEdit={() => { setEditing(m); setShowForm(true); }} />)}
        </div>
      )}

      {(showForm || editing) && (
        <MeetingForm initial={editing || {}} onSave={handleSave} onClose={() => { setShowForm(false); setEditing(null); }} />
      )}
    </AppShell>
  );
}
