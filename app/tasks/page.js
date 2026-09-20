'use client';
import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';

const AREAS = ['', 'Academic', 'Entrepreneur', 'Personal', 'GATE', 'College', 'Forge', 'Learning', 'Health', 'Communication'];
const PRIORITIES = ['P0', 'P1', 'P2', 'P3'];
const STATUSES = ['TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE', 'CANCELLED'];
const ENERGY = ['LOW', 'MEDIUM', 'HIGH'];

const PRIORITY_COLORS = { P0: 'var(--red)', P1: 'var(--orange)', P2: 'var(--blue)', P3: 'var(--text-muted)' };
const STATUS_COLORS = { TODO: 'var(--text-muted)', IN_PROGRESS: 'var(--blue)', BLOCKED: 'var(--orange)', DONE: 'var(--green)', CANCELLED: 'var(--text-muted)' };

function daysLeft(d) {
  if (!d) return null;
  const diff = Math.ceil((new Date(d) - new Date()) / 86400000);
  if (diff < 0) return { label: 'Overdue', color: 'var(--red)' };
  if (diff === 0) return { label: 'Today', color: 'var(--orange)' };
  if (diff <= 3) return { label: `${diff}d`, color: 'var(--orange)' };
  if (diff <= 7) return { label: `${diff}d`, color: 'var(--yellow)' };
  return { label: `${diff}d`, color: 'var(--text-muted)' };
}

function TaskForm({ onSave, onClose, initial = {} }) {
  const [form, setForm] = useState({
    name: '', project: '', area: '', priority: 'P1',
    deadline: '', estimatedDuration: 30, energyLevel: 'MEDIUM',
    status: 'TODO', notes: '', tags: '', ...initial,
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    const payload = { ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [] };
    if (!payload.deadline) delete payload.deadline;
    await onSave(payload);
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{initial._id ? 'Edit Task' : 'New Task'}</h2>
          <button className="modal-close btn" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Task Name *</label>
            <input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="What needs to be done?" autoFocus required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="label">Priority</label>
              <select className="input select" value={form.priority} onChange={e => set('priority', e.target.value)}>
                <option value="P0">P0 — Critical</option>
                <option value="P1">P1 — Important</option>
                <option value="P2">P2 — Development</option>
                <option value="P3">P3 — Optional</option>
              </select>
            </div>
            <div className="form-group">
              <label className="label">Area</label>
              <select className="input select" value={form.area} onChange={e => set('area', e.target.value)}>
                {AREAS.map(a => <option key={a} value={a}>{a || '— None —'}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="label">Deadline</label>
              <input className="input" type="date" value={form.deadline ? form.deadline.slice(0,10) : ''} onChange={e => set('deadline', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Energy Level</label>
              <select className="input select" value={form.energyLevel} onChange={e => set('energyLevel', e.target.value)}>
                {ENERGY.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="label">Project</label>
              <input className="input" value={form.project} onChange={e => set('project', e.target.value)} placeholder="Project name" />
            </div>
            <div className="form-group">
              <label className="label">Est. Duration (min)</label>
              <input className="input" type="number" value={form.estimatedDuration} onChange={e => set('estimatedDuration', e.target.value)} min={5} />
            </div>
          </div>
          {initial._id && (
            <div className="form-group">
              <label className="label">Status</label>
              <select className="input select" value={form.status} onChange={e => set('status', e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
          )}
          {form.status === 'BLOCKED' && (
            <div className="form-group">
              <label className="label">Blocked Reason</label>
              <input className="input" value={form.blockedReason || ''} onChange={e => set('blockedReason', e.target.value)} placeholder="What's blocking this?" />
            </div>
          )}
          <div className="form-group">
            <label className="label">Notes</label>
            <textarea className="input textarea" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Additional notes..." rows={2} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="label">Tags (comma separated)</label>
            <input className="input" value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="gate, exam, urgent" />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Task</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TaskRow({ task, onToggle, onEdit, onDelete }) {
  const dl = daysLeft(task.deadline);
  const isDone = task.status === 'DONE';
  return (
    <div className={`card ${isDone ? '' : 'card-hover'}`} style={{ padding: '12px 16px', opacity: isDone ? 0.55 : 1 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        {/* Checkbox */}
        <button
          onClick={() => onToggle(task._id, task.status)}
          style={{
            width: 22, height: 22, borderRadius: 6,
            border: isDone ? 'none' : '1.5px solid var(--border)',
            background: isDone ? 'var(--green)' : 'var(--surface-2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, marginTop: 1, cursor: 'pointer', transition: 'all 0.15s'
          }}
        >
          {isDone && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg>}
        </button>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 500, textDecoration: isDone ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.name}</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 5, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: PRIORITY_COLORS[task.priority] || 'var(--text-muted)', background: 'transparent', border: `1px solid ${PRIORITY_COLORS[task.priority] || 'var(--border)'}`, borderRadius: 20, padding: '1px 7px' }}>{task.priority}</span>
            {task.area && <span className="tag">{task.area}</span>}
            {task.project && <span className="tag">{task.project}</span>}
            {dl && <span style={{ fontSize: 11, fontWeight: 600, color: dl.color }}>{dl.label}</span>}
            {task.status === 'BLOCKED' && <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--orange)' }}>🚧 Blocked</span>}
            {task.status === 'IN_PROGRESS' && <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--blue)' }}>▶ In Progress</span>}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          <button onClick={() => onEdit(task)} className="btn btn-ghost btn-sm btn-icon" title="Edit" style={{ width: 28, height: 28 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button onClick={() => onDelete(task._id)} className="btn btn-ghost btn-sm btn-icon" title="Delete" style={{ width: 28, height: 28, color: 'var(--text-muted)' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filterArea, setFilterArea] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState('active');

  async function load() {
    setLoading(true);
    let url = '/api/tasks?';
    if (filterArea) url += `area=${filterArea}&`;
    if (filterPriority) url += `priority=${filterPriority}&`;
    const res = await fetch(url);
    const data = await res.json();
    let list = data.success ? data.data : [];
    if (filterStatus === 'active') list = list.filter(t => !['DONE', 'CANCELLED'].includes(t.status));
    else if (filterStatus === 'done') list = list.filter(t => t.status === 'DONE');
    setTasks(list);
    setLoading(false);
  }

  useEffect(() => { load(); }, [filterArea, filterPriority, filterStatus]);

  // Check for ?add=1 in URL
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('add')) setShowForm(true);
  }, []);

  async function handleSave(payload) {
    if (editing) {
      await fetch(`/api/tasks/${editing._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    } else {
      await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    }
    setEditing(null);
    load();
  }

  async function handleToggle(id, currentStatus) {
    const newStatus = currentStatus === 'DONE' ? 'TODO' : 'DONE';
    await fetch(`/api/tasks/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) });
    load();
  }

  async function handleDelete(id) {
    if (!confirm('Delete this task?')) return;
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    load();
  }

  const groupedByPriority = PRIORITIES.reduce((acc, p) => {
    const group = tasks.filter(t => t.priority === p);
    if (group.length > 0) acc[p] = group;
    return acc;
  }, {});

  const PRIORITY_NAMES = { P0: '🔴 Critical', P1: '⚡ Important', P2: '📌 Development', P3: '🗂️ Optional' };

  return (
    <AppShell>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">{tasks.length} {filterStatus === 'active' ? 'active' : filterStatus}</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => { setEditing(null); setShowForm(true); }}>+ Add Task</button>
      </div>

      {/* Filters */}
      <div className="filter-row">
        {['active', 'done', 'all'].map(s => (
          <button key={s} className={`filter-chip ${filterStatus === s ? 'active' : ''}`} onClick={() => setFilterStatus(s)}>
            {s === 'active' ? 'Active' : s === 'done' ? '✓ Done' : 'All'}
          </button>
        ))}
        <div style={{ width: 1, background: 'var(--border)', margin: '0 4px', flexShrink: 0 }} />
        {PRIORITIES.map(p => (
          <button key={p} className={`filter-chip ${filterPriority === p ? 'active' : ''}`} onClick={() => setFilterPriority(filterPriority === p ? '' : p)}>
            {p}
          </button>
        ))}
        <div style={{ width: 1, background: 'var(--border)', margin: '0 4px', flexShrink: 0 }} />
        {AREAS.filter(Boolean).slice(0,5).map(a => (
          <button key={a} className={`filter-chip ${filterArea === a ? 'active' : ''}`} onClick={() => setFilterArea(filterArea === a ? '' : a)}>
            {a}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-state"><div className="spinner" /></div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✓</div>
          <div className="empty-state-title">No tasks here</div>
          <div className="empty-state-desc">Add your first task to get started</div>
          <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => setShowForm(true)}>Add Task</button>
        </div>
      ) : filterPriority ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tasks.map(t => <TaskRow key={t._id} task={t} onToggle={handleToggle} onEdit={t => { setEditing(t); setShowForm(true); }} onDelete={handleDelete} />)}
        </div>
      ) : (
        Object.entries(groupedByPriority).map(([p, group]) => (
          <div key={p} style={{ marginBottom: 24 }}>
            <div className="section-label" style={{ marginBottom: 8 }}>{PRIORITY_NAMES[p]} <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>({group.length})</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {group.map(t => <TaskRow key={t._id} task={t} onToggle={handleToggle} onEdit={t => { setEditing(t); setShowForm(true); }} onDelete={handleDelete} />)}
            </div>
          </div>
        ))
      )}

      {(showForm || editing) && (
        <TaskForm
          initial={editing || {}}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </AppShell>
  );
}
