'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AppShell from '@/components/AppShell';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newMilestone, setNewMilestone] = useState({ title: '', dueDate: '' });
  const [newDecision, setNewDecision] = useState('');
  const [newRisk, setNewRisk] = useState('');
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesContent, setNotesContent] = useState('');

  async function loadProject() {
    try {
      const res = await fetch(`/api/projects/${id}`);
      const data = await res.json();
      if (data.success) {
        setProject(data.data);
        setNotesContent(data.data.notes || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProject();
  }, [id]);

  async function updateProject(updates) {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success) {
        setProject(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      router.push('/projects');
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAddMilestone(e) {
    e.preventDefault();
    if (!newMilestone.title.trim()) return;
    const updated = [...(project.milestones || []), { title: newMilestone.title, dueDate: newMilestone.dueDate || null, status: 'PENDING' }];
    await updateProject({ milestones: updated });
    setNewMilestone({ title: '', dueDate: '' });
  }

  async function handleToggleMilestone(index) {
    const updated = [...(project.milestones || [])];
    updated[index].status = updated[index].status === 'DONE' ? 'PENDING' : 'DONE';
    await updateProject({ milestones: updated });
  }

  async function handleDeleteMilestone(index) {
    const updated = (project.milestones || []).filter((_, i) => i !== index);
    await updateProject({ milestones: updated });
  }

  async function handleAddDecision(e) {
    e.preventDefault();
    if (!newDecision.trim()) return;
    const updated = [...(project.decisions || []), newDecision.trim()];
    await updateProject({ decisions: updated });
    setNewDecision('');
  }

  async function handleAddRisk(e) {
    e.preventDefault();
    if (!newRisk.trim()) return;
    const updated = [...(project.risks || []), newRisk.trim()];
    await updateProject({ risks: updated });
    setNewRisk('');
  }

  if (loading) {
    return <AppShell><div className="loading-state"><div className="spinner" /></div></AppShell>;
  }

  if (!project) {
    return (
      <AppShell>
        <div className="empty-state">
          <div className="empty-state-title">Project not found</div>
          <Link href="/projects"><button className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>Back to Projects</button></Link>
        </div>
      </AppShell>
    );
  }

  const completedMilestones = (project.milestones || []).filter(m => m.status === 'DONE').length;
  const totalMilestones = (project.milestones || []).length;
  const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  return (
    <AppShell>
      {/* Back & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Link href="/projects" style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
          ← Back to Projects
        </Link>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={handleDelete} style={{ color: 'var(--red)' }}>
            Delete
          </button>
        </div>
      </div>

      {/* Project Header Card */}
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 22, fontWeight: 800 }}>{project.name}</h1>
              {project.area && (
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 12, background: 'var(--surface-2)', color: 'var(--text-secondary)' }}>
                  {project.area}
                </span>
              )}
            </div>
            {project.objective && (
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.5 }}>
                {project.objective}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select
              className="input select"
              style={{ fontSize: 12, padding: '6px 10px' }}
              value={project.status}
              onChange={e => updateProject({ status: e.target.value })}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="PLANNED">PLANNED</option>
              <option value="BACKLOG">BACKLOG</option>
              <option value="BLOCKED">BLOCKED</option>
              <option value="REVIEW">REVIEW</option>
              <option value="DONE">DONE</option>
            </select>
          </div>
        </div>

        {/* Metadata grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-subtle)', fontSize: 12 }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Priority:</span>{' '}
            <strong style={{ color: project.priority === 'P0' ? 'var(--red)' : 'inherit' }}>{project.priority || 'P1'}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Owner:</span>{' '}
            <strong>{project.owner || 'Me'}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Deadline:</span>{' '}
            <strong>{project.deadline ? new Date(project.deadline).toLocaleDateString('en-IN') : 'No deadline'}</strong>
          </div>
        </div>
      </div>

      {/* Milestones Section */}
      <div className="card" style={{ padding: 18, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>Milestones & Roadmap</h2>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{completedMilestones}/{totalMilestones} done ({progress}%)</span>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', height: 6, background: 'var(--surface-2)', borderRadius: 4, overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'var(--green)', transition: 'width 0.3s ease' }} />
        </div>

        {/* Milestones List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          {(project.milestones || []).length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>No milestones set yet.</div>
          ) : (
            project.milestones.map((m, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: 6,
                  background: 'var(--surface-2)',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                  <button
                    onClick={() => handleToggleMilestone(idx)}
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 4,
                      border: m.status === 'DONE' ? 'none' : '1.5px solid var(--border)',
                      background: m.status === 'DONE' ? 'var(--green)' : 'transparent',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: 10,
                      fontWeight: 800,
                    }}
                  >
                    {m.status === 'DONE' ? '✓' : ''}
                  </button>
                  <span style={{ fontSize: 13, textDecoration: m.status === 'DONE' ? 'line-through' : 'none', color: m.status === 'DONE' ? 'var(--text-muted)' : 'var(--text)' }}>
                    {m.title}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {m.dueDate && (
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {new Date(m.dueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                  <button
                    onClick={() => handleDeleteMilestone(idx)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Milestone Form */}
        <form onSubmit={handleAddMilestone} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            className="input"
            style={{ flex: 2, minWidth: 160, fontSize: 13 }}
            placeholder="New milestone..."
            value={newMilestone.title}
            onChange={e => setNewMilestone({ ...newMilestone, title: e.target.value })}
          />
          <input
            type="date"
            className="input"
            style={{ flex: 1, minWidth: 120, fontSize: 12 }}
            value={newMilestone.dueDate}
            onChange={e => setNewMilestone({ ...newMilestone, dueDate: e.target.value })}
          />
          <button type="submit" className="btn btn-primary btn-sm">Add</button>
        </form>
      </div>

      {/* Decisions & Risks 2-column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 20 }}>
        {/* Decisions */}
        <div className="card" style={{ padding: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>⚡ Key Decisions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
            {(project.decisions || []).length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No logged decisions yet.</div>
            ) : (
              project.decisions.map((d, i) => (
                <div key={i} style={{ fontSize: 13, padding: '6px 8px', background: 'var(--surface-2)', borderRadius: 6, display: 'flex', gap: 6 }}>
                  <span style={{ color: 'var(--yellow)', fontWeight: 700 }}>•</span> {d}
                </div>
              ))
            )}
          </div>
          <form onSubmit={handleAddDecision} style={{ display: 'flex', gap: 6 }}>
            <input
              className="input"
              style={{ fontSize: 12 }}
              placeholder="Log decision..."
              value={newDecision}
              onChange={e => setNewDecision(e.target.value)}
            />
            <button type="submit" className="btn btn-secondary btn-sm">Log</button>
          </form>
        </div>

        {/* Risks */}
        <div className="card" style={{ padding: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>⚠️ Risks & Blockers</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
            {(project.risks || []).length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No active risks logged.</div>
            ) : (
              project.risks.map((r, i) => (
                <div key={i} style={{ fontSize: 13, padding: '6px 8px', background: 'var(--surface-2)', borderRadius: 6, display: 'flex', gap: 6, color: 'var(--red)' }}>
                  <span>⚠</span> <span style={{ color: 'var(--text)' }}>{r}</span>
                </div>
              ))
            )}
          </div>
          <form onSubmit={handleAddRisk} style={{ display: 'flex', gap: 6 }}>
            <input
              className="input"
              style={{ fontSize: 12 }}
              placeholder="Log risk/blocker..."
              value={newRisk}
              onChange={e => setNewRisk(e.target.value)}
            />
            <button type="submit" className="btn btn-secondary btn-sm">Add</button>
          </form>
        </div>
      </div>

      {/* Notes / Documentation Section */}
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700 }}>Project Notes & Architecture</h2>
          <button
            className="btn btn-ghost btn-sm"
            onClick={async () => {
              if (editingNotes) {
                await updateProject({ notes: notesContent });
              }
              setEditingNotes(!editingNotes);
            }}
          >
            {editingNotes ? 'Save Notes' : 'Edit'}
          </button>
        </div>

        {editingNotes ? (
          <textarea
            className="input textarea"
            rows={6}
            style={{ width: '100%', fontSize: 13, lineHeight: 1.5 }}
            value={notesContent}
            onChange={e => setNotesContent(e.target.value)}
            placeholder="Write project notes, architecture ideas, technical specifications..."
          />
        ) : (
          <div style={{ fontSize: 13, color: notesContent ? 'var(--text)' : 'var(--text-muted)', whiteSpace: 'pre-wrap', lineHeight: 1.6, minHeight: 60, padding: 8, background: 'var(--surface-2)', borderRadius: 6 }}>
            {notesContent || 'No notes documented yet. Click Edit to add specs or notes.'}
          </div>
        )}
      </div>
    </AppShell>
  );
}
