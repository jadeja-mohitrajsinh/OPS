'use client';
import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';

const NOTE_TYPES = ['all', 'note', 'idea', 'insight', 'reference'];
const TYPE_ICONS = {
  note: '📝',
  idea: '💡',
  insight: '⚡',
  reference: '📚',
};

const AREAS = ['ALL', 'Machine Learning', 'Systems & Coding', 'Algorithms', 'GATE 2027', 'Startup', 'Architecture'];

export default function LearningPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedArea, setSelectedArea] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  const [form, setForm] = useState({
    title: '',
    content: '',
    area: 'Machine Learning',
    project: '',
    type: 'note',
    tags: '',
    isPinned: false,
  });

  async function loadNotes() {
    try {
      const res = await fetch('/api/notes');
      const data = await res.json();
      if (data.success) {
        setNotes(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotes();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;

    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };

      if (editingNote) {
        await fetch(`/api/notes/${editingNote._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      setShowModal(false);
      setEditingNote(null);
      setForm({
        title: '',
        content: '',
        area: 'Machine Learning',
        project: '',
        type: 'note',
        tags: '',
        isPinned: false,
      });
      loadNotes();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleTogglePin(note) {
    try {
      await fetch(`/api/notes/${note._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: !note.isPinned }),
      });
      loadNotes();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this note?')) return;
    try {
      await fetch(`/api/notes/${id}`, { method: 'DELETE' });
      loadNotes();
    } catch (err) {
      console.error(err);
    }
  }

  function openEdit(note) {
    setEditingNote(note);
    setForm({
      title: note.title || '',
      content: note.content || '',
      area: note.area || 'Machine Learning',
      project: note.project || '',
      type: note.type || 'note',
      tags: (note.tags || []).join(', '),
      isPinned: !!note.isPinned,
    });
    setShowModal(true);
  }

  const filtered = notes.filter(n => {
    if (selectedType !== 'all' && n.type !== selectedType) return false;
    if (selectedArea !== 'ALL' && n.area !== selectedArea) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = n.title?.toLowerCase().includes(q);
      const matchContent = n.content?.toLowerCase().includes(q);
      const matchTags = (n.tags || []).some(t => t.toLowerCase().includes(q));
      if (!matchTitle && !matchContent && !matchTags) return false;
    }
    return true;
  }).sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  const noteCount = notes.filter(n => n.type === 'note').length;
  const ideaCount = notes.filter(n => n.type === 'idea').length;
  const insightCount = notes.filter(n => n.type === 'insight').length;

  return (
    <AppShell>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>🧠</span>
            <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>Learning & Knowledge Hub</h1>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            ML research, architecture breakdowns, algorithms & engineering insights
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingNote(null);
            setForm({
              title: '',
              content: '',
              area: 'Machine Learning',
              project: '',
              type: 'note',
              tags: '',
              isPinned: false,
            });
            setShowModal(true);
          }}
        >
          + New Note
        </button>
      </div>

      {/* KPI Counters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 20 }}>
        <div className="card" style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Knowledge</div>
          <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>{notes.length}</div>
        </div>
        <div className="card" style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: 11, color: 'var(--purple)', textTransform: 'uppercase', fontWeight: 700 }}>ML & Tech Notes</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--purple)', marginTop: 4 }}>{noteCount}</div>
        </div>
        <div className="card" style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: 11, color: 'var(--yellow)', textTransform: 'uppercase', fontWeight: 700 }}>Ideas & Insights</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--yellow)', marginTop: 4 }}>{ideaCount + insightCount}</div>
        </div>
      </div>

      {/* Search & Type filters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        <input
          className="input"
          placeholder="Search learning notes, papers, topics..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ fontSize: 13 }}
        />

        {/* Type pills */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          {NOTE_TYPES.map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              style={{
                padding: '5px 12px',
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                border: 'none',
                cursor: 'pointer',
                background: selectedType === type ? 'var(--text)' : 'var(--surface-2)',
                color: selectedType === type ? 'var(--bg)' : 'var(--text-secondary)',
              }}
            >
              {type === 'all' ? 'All Types' : `${TYPE_ICONS[type] || ''} ${type}`}
            </button>
          ))}
        </div>

        {/* Area chips */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6 }}>
          {AREAS.map(area => (
            <button
              key={area}
              onClick={() => setSelectedArea(area)}
              style={{
                padding: '4px 10px',
                borderRadius: 14,
                fontSize: 11,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: selectedArea === area ? 'var(--surface-3)' : 'transparent',
                color: selectedArea === area ? 'var(--text)' : 'var(--text-muted)',
              }}
            >
              {area}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="loading-state"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-title">No notes found</div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            Capture a paper summary, code snippet, or algorithm explanation.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
          {filtered.map(note => (
            <div
              key={note._id}
              className="card"
              style={{
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 10,
                position: 'relative',
                borderTop: note.isPinned ? '2px solid var(--yellow)' : undefined,
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14 }}>{TYPE_ICONS[note.type] || '📝'}</span>
                    {note.area && (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: 'var(--surface-2)', color: 'var(--blue)' }}>
                        {note.area}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleTogglePin(note)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: 13,
                      cursor: 'pointer',
                      opacity: note.isPinned ? 1 : 0.4,
                      color: note.isPinned ? 'var(--yellow)' : 'var(--text-muted)',
                    }}
                    title={note.isPinned ? 'Unpin' : 'Pin to top'}
                  >
                    📌
                  </button>
                </div>

                <h3 style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.3, marginBottom: 8 }}>
                  {note.title}
                </h3>

                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, whiteSpace: 'pre-wrap', maxHeight: 180, overflowY: 'auto' }}>
                  {note.content}
                </div>
              </div>

              {/* Footer */}
              <div style={{ paddingTop: 10, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {(note.tags || []).map((t, i) => (
                    <span key={i} style={{ fontSize: 10, color: 'var(--text-muted)' }}>#{t}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }} onClick={() => openEdit(note)}>
                    Edit
                  </button>
                  <button className="btn btn-ghost btn-sm" style={{ fontSize: 11, color: 'var(--red)' }} onClick={() => handleDelete(note._id)}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}>{editingNote ? 'Edit Note' : 'Create Learning Note'}</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label className="label">Title *</label>
                <input
                  className="input"
                  required
                  placeholder="e.g. Attention Mechanism & FlashAttention V2"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label className="label">Type</label>
                  <select
                    className="input select"
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value })}
                  >
                    <option value="note">📝 Note</option>
                    <option value="idea">💡 Idea</option>
                    <option value="insight">⚡ Insight</option>
                    <option value="reference">📚 Reference / Cheatsheet</option>
                  </select>
                </div>

                <div>
                  <label className="label">Area</label>
                  <select
                    className="input select"
                    value={form.area}
                    onChange={e => setForm({ ...form, area: e.target.value })}
                  >
                    {AREAS.filter(a => a !== 'ALL').map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Content / Notes</label>
                <textarea
                  className="input textarea"
                  rows={6}
                  placeholder="Key concepts, mathematical formulation, code snippets, takeaways..."
                  value={form.content}
                  onChange={e => setForm({ ...form, content: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Tags (comma separated)</label>
                <input
                  className="input"
                  placeholder="transformers, pytorch, cuda, fastai"
                  value={form.tags}
                  onChange={e => setForm({ ...form, tags: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  id="pinNote"
                  checked={form.isPinned}
                  onChange={e => setForm({ ...form, isPinned: e.target.checked })}
                />
                <label htmlFor="pinNote" style={{ fontSize: 13, cursor: 'pointer' }}>Pin note to top</label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingNote ? 'Save Changes' : 'Save Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
