'use client';
import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import Link from 'next/link';

const RELATIONSHIPS = ['Team', 'Mentor', 'Investor', 'Friend', 'Professor', 'Classmate', 'Client', 'Other'];
const REL_COLORS = { Team: 'var(--blue)', Mentor: 'var(--purple)', Investor: 'var(--green)', Friend: 'var(--orange)', Professor: 'var(--yellow)', Classmate: 'var(--text-muted)', Client: 'var(--red)', Other: 'var(--text-muted)' };

function timeSince(d) {
  if (!d) return null;
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days/7)}w ago`;
  return `${Math.floor(days/30)}mo ago`;
}

function daysUntil(d) {
  if (!d) return null;
  const diff = Math.ceil((new Date(d) - Date.now()) / 86400000);
  if (diff < 0) return { label: 'Overdue', color: 'var(--red)' };
  if (diff === 0) return { label: 'Today', color: 'var(--orange)' };
  return { label: `In ${diff}d`, color: 'var(--text-muted)' };
}

function PersonForm({ onSave, onClose, initial = {} }) {
  const [form, setForm] = useState({
    name: '', role: '', organization: '', relationship: 'Other', email: '',
    phone: '', currentProject: '', notes: '', importantContext: '',
    nextInteraction: '', ...initial,
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    await onSave({ ...form, nextInteraction: form.nextInteraction || null, lastInteraction: initial.lastInteraction || null });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{initial._id ? 'Edit Person' : 'Add Person'}</h2>
          <button className="btn modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="label">Name *</label>
            <input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Full name" autoFocus required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="label">Role</label>
              <input className="input" value={form.role} onChange={e => set('role', e.target.value)} placeholder="Co-founder, Professor..." />
            </div>
            <div className="form-group">
              <label className="label">Relationship</label>
              <select className="input select" value={form.relationship} onChange={e => set('relationship', e.target.value)}>
                {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="label">Organization</label>
              <input className="input" value={form.organization} onChange={e => set('organization', e.target.value)} placeholder="Company / College" />
            </div>
            <div className="form-group">
              <label className="label">Current Project</label>
              <input className="input" value={form.currentProject} onChange={e => set('currentProject', e.target.value)} placeholder="Forge, College..." />
            </div>
          </div>
          <div className="form-group">
            <label className="label">Next Interaction Date</label>
            <input className="input" type="date" value={form.nextInteraction ? form.nextInteraction.slice(0,10) : ''} onChange={e => set('nextInteraction', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="label">Important Context</label>
            <textarea className="input textarea" value={form.importantContext} onChange={e => set('importantContext', e.target.value)} placeholder="Key things to remember about this person..." rows={2} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="label">Notes</label>
            <textarea className="input textarea" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="General notes..." rows={2} />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PersonCard({ person, onEdit }) {
  const ni = daysUntil(person.nextInteraction);
  const ls = timeSince(person.lastInteraction);
  const openCommits = (person.commitments || []).filter(c => c.type === 'THEY_OWE' && c.status === 'OPEN').length;
  const iOwe = (person.commitments || []).filter(c => c.type === 'I_OWE' && c.status === 'OPEN').length;

  return (
    <Link href={`/people/${person._id}`}>
      <div className="card card-hover" style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, flexShrink: 0 }}>
            {person.name[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{person.name}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: REL_COLORS[person.relationship] || 'var(--text-muted)', border: `1px solid ${REL_COLORS[person.relationship] || 'var(--border)'}`, padding: '1px 6px', borderRadius: 20 }}>{person.relationship}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {person.role && <span>{person.role}</span>}
              {person.organization && <span>{person.role ? ' · ' : ''}{person.organization}</span>}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
              {ls && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Last: {ls}</span>}
              {ni && <span style={{ fontSize: 11, fontWeight: 600, color: ni.color }}>Follow-up: {ni.label}</span>}
              {openCommits > 0 && <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--orange)' }}>⏳ {openCommits} waiting</span>}
              {iOwe > 0 && <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--blue)' }}>📤 {iOwe} I owe</span>}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function PeoplePage() {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [view, setView] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRelationship, setFilterRelationship] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  async function load() {
    setLoading(true);
    const res = await fetch('/api/people');
    const data = await res.json();
    setPeople(data.success ? data.data : []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('add')) setShowForm(true);
  }, []);

  async function handleSave(payload) {
    await fetch('/api/people', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    load();
  }

  const now = new Date();
  const views = {
    all: people,
    'contact': people.filter(p => p.nextInteraction && new Date(p.nextInteraction) <= now),
    'waiting': people.filter(p => (p.commitments || []).some(c => c.type === 'THEY_OWE' && c.status === 'OPEN')),
    'owe': people.filter(p => (p.commitments || []).some(c => c.type === 'I_OWE' && c.status === 'OPEN')),
  };

  // Apply search and filters
  let filtered = views[view] || people;
  
  // Search filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(p => 
      p.name?.toLowerCase().includes(query) ||
      p.role?.toLowerCase().includes(query) ||
      p.organization?.toLowerCase().includes(query) ||
      p.currentProject?.toLowerCase().includes(query) ||
      p.importantContext?.toLowerCase().includes(query) ||
      p.notes?.toLowerCase().includes(query)
    );
  }

  // Relationship filter
  if (filterRelationship !== 'all') {
    filtered = filtered.filter(p => p.relationship === filterRelationship);
  }

  // Sorting
  filtered = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name?.localeCompare(b.name) || 0;
      case 'lastInteraction':
        return new Date(b.lastInteraction || 0) - new Date(a.lastInteraction || 0);
      case 'nextInteraction':
        return new Date(a.nextInteraction || '9999-12-31') - new Date(b.nextInteraction || '9999-12-31');
      case 'relationship':
        return a.relationship?.localeCompare(b.relationship) || 0;
      default:
        return 0;
    }
  });

  const contactCount = views['contact'].length;
  const waitingCount = views['waiting'].length;

  return (
    <AppShell>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">People</h1>
          <p className="page-subtitle">{people.length} total{contactCount > 0 ? ` · ${contactCount} need contact` : ''}</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>+ Add</button>
      </div>

      <div className="tabs" style={{ marginBottom: 20 }}>
        <button className={`tab-btn ${view === 'all' ? 'active' : ''}`} onClick={() => setView('all')}>All</button>
        <button className={`tab-btn ${view === 'contact' ? 'active' : ''}`} onClick={() => setView('contact')}>
          Follow-up {contactCount > 0 && <span style={{ background: 'var(--red)', color: 'white', borderRadius: 10, fontSize: 10, padding: '1px 5px', marginLeft: 4 }}>{contactCount}</span>}
        </button>
        <button className={`tab-btn ${view === 'waiting' ? 'active' : ''}`} onClick={() => setView('waiting')}>Waiting</button>
        <button className={`tab-btn ${view === 'owe' ? 'active' : ''}`} onClick={() => setView('owe')}>I Owe</button>
      </div>

      {/* Search and Filter Bar */}
      <div style={{ 
        display: 'flex', 
        gap: 12, 
        marginBottom: 20, 
        flexWrap: 'wrap',
        alignItems: 'center' 
      }}>
        {/* Search Input */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <input
            className="input"
            type="text"
            placeholder="Search people..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        {/* Relationship Filter Dropdown */}
        <div style={{ minWidth: 150 }}>
          <select
            className="input select"
            value={filterRelationship}
            onChange={e => setFilterRelationship(e.target.value)}
            style={{ width: '100%' }}
          >
            <option value="all">All Relationships</option>
            {RELATIONSHIPS.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Sort Dropdown */}
        <div style={{ minWidth: 150 }}>
          <select
            className="input select"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{ width: '100%' }}
          >
            <option value="name">Sort by Name</option>
            <option value="lastInteraction">Sort by Last Contact</option>
            <option value="nextInteraction">Sort by Follow-up</option>
            <option value="relationship">Sort by Relationship</option>
          </select>
        </div>

        {/* Results Count */}
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>
          {filtered.length} of {people.length} people
        </div>
      </div>

      {loading ? (
        <div className="loading-state"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👤</div>
          <div className="empty-state-title">{view === 'all' ? 'No people yet' : `No one in ${view}`}</div>
          {view === 'all' && <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => setShowForm(true)}>Add Person</button>}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(p => <PersonCard key={p._id} person={p} />)}
        </div>
      )}

      {showForm && <PersonForm onSave={handleSave} onClose={() => setShowForm(false)} />}
    </AppShell>
  );
}
