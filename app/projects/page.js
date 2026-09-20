'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';

const STATUS_ORDER = ['ACTIVE', 'PLANNED', 'BACKLOG', 'BLOCKED', 'REVIEW', 'DONE'];
const STATUS_COLORS = {
  ACTIVE: 'var(--green)',
  PLANNED: 'var(--blue)',
  BACKLOG: 'var(--text-muted)',
  BLOCKED: 'var(--red)',
  REVIEW: 'var(--purple)',
  DONE: 'var(--text-muted)',
};

const AREA_BADGES = {
  Academic: { color: 'var(--blue)', bg: 'var(--blue-bg)' },
  Entrepreneur: { color: 'var(--purple)', bg: 'var(--purple-bg)' },
  Personal: { color: 'var(--green)', bg: 'var(--green-bg)' },
  GATE: { color: 'var(--orange)', bg: 'var(--orange-bg)' },
  College: { color: 'var(--blue)', bg: 'var(--blue-bg)' },
  Forge: { color: 'var(--purple)', bg: 'var(--purple-bg)' },
  Learning: { color: 'var(--yellow)', bg: 'var(--yellow-bg)' },
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterArea, setFilterArea] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // New project form state
  const [newProject, setNewProject] = useState({
    name: '',
    objective: '',
    area: 'Forge',
    owner: 'Me',
    deadline: '',
    priority: 'P1',
    status: 'ACTIVE',
    tags: '',
  });

  async function loadProjects() {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (data.success) {
        setProjects(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!newProject.name.trim()) return;

    try {
      const payload = {
        ...newProject,
        tags: newProject.tags ? newProject.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setNewProject({
          name: '',
          objective: '',
          area: 'Forge',
          owner: 'Me',
          deadline: '',
          priority: 'P1',
          status: 'ACTIVE',
          tags: '',
        });
        loadProjects();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleUpdateStatus(id, newStatus) {
    try {
      await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      loadProjects();
    } catch (err) {
      console.error(err);
    }
  }

  const filtered = projects.filter(p => {
    if (filterArea !== 'ALL' && p.area !== filterArea) return false;
    if (filterStatus !== 'ALL' && p.status !== filterStatus) return false;
    return true;
  });

  const areas = ['ALL', 'Forge', 'GATE', 'College', 'Learning', 'Personal', 'Entrepreneur'];
  const activeCount = projects.filter(p => p.status === 'ACTIVE').length;
  const doneCount = projects.filter(p => p.status === 'DONE').length;

  return (
    <AppShell>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>Projects</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            High-level initiatives, milestones & delivery tracking
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          + New Project
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 20 }}>
        <div className="card" style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total</div>
          <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>{projects.length}</div>
        </div>
        <div className="card" style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: 11, color: 'var(--green)', textTransform: 'uppercase', fontWeight: 700 }}>Active</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--green)', marginTop: 4 }}>{activeCount}</div>
        </div>
        <div className="card" style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Completed</div>
          <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>{doneCount}</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 10, marginBottom: 16 }}>
        {areas.map(area => (
          <button
            key={area}
            onClick={() => setFilterArea(area)}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              whiteSpace: 'nowrap',
              border: 'none',
              cursor: 'pointer',
              background: filterArea === area ? 'var(--text)' : 'var(--surface-2)',
              color: filterArea === area ? 'var(--bg)' : 'var(--text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            {area}
          </button>
        ))}
      </div>

      {/* Projects List */}
      {loading ? (
        <div className="loading-state"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-title">No projects found</div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Create your first project or adjust filters</p>
          <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => setShowAddModal(true)}>+ Create Project</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(project => {
            const areaBadge = AREA_BADGES[project.area] || { color: 'var(--text-muted)', bg: 'var(--surface-2)' };
            const completedMilestones = (project.milestones || []).filter(m => m.status === 'DONE').length;
            const totalMilestones = (project.milestones || []).length;
            const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

            return (
              <div
                key={project._id}
                className="card"
                style={{
                  padding: 16,
                  borderLeft: `3px solid ${STATUS_COLORS[project.status] || 'var(--border)'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <Link
                        href={`/projects/${project._id}`}
                        style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', textDecoration: 'none' }}
                      >
                        {project.name}
                      </Link>
                      {project.area && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 12, background: areaBadge.bg, color: areaBadge.color }}>
                          {project.area}
                        </span>
                      )}
                      {project.priority && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 6, background: 'var(--surface-2)', color: project.priority === 'P0' ? 'var(--red)' : 'var(--text-secondary)' }}>
                          {project.priority}
                        </span>
                      )}
                    </div>
                    {project.objective && (
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4, margin: '4px 0 8px 0' }}>
                        {project.objective}
                      </p>
                    )}
                  </div>

                  <select
                    className="input select"
                    style={{ fontSize: 11, padding: '4px 8px', width: 'auto', flexShrink: 0 }}
                    value={project.status}
                    onChange={(e) => handleUpdateStatus(project._id, e.target.value)}
                  >
                    {STATUS_ORDER.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Progress bar if milestones exist */}
                {totalMilestones > 0 && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                      <span>Milestones: {completedMilestones}/{totalMilestones}</span>
                      <span>{progress}%</span>
                    </div>
                    <div style={{ width: '100%', height: 5, background: 'var(--surface-2)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${progress}%`, height: '100%', background: 'var(--green)', borderRadius: 3 }} />
                    </div>
                  </div>
                )}

                {/* Footer info: deadline, tags, link */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'var(--text-muted)', paddingTop: 6, borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: 6 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    {project.deadline && (
                      <span>📅 {new Date(project.deadline).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    )}
                    {project.owner && <span>👤 {project.owner}</span>}
                  </div>
                  <Link
                    href={`/projects/${project._id}`}
                    style={{ fontSize: 12, color: 'var(--blue)', textDecoration: 'none', fontWeight: 600 }}
                  >
                    Details & Milestones →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}>Create New Project</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="label">Project Name *</label>
                <input
                  className="input"
                  required
                  placeholder="e.g. Forge MVP Launch"
                  value={newProject.name}
                  onChange={e => setNewProject({ ...newProject, name: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Objective / Goal</label>
                <textarea
                  className="input textarea"
                  rows={2}
                  placeholder="What is the core target of this project?"
                  value={newProject.objective}
                  onChange={e => setNewProject({ ...newProject, objective: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label className="label">Area</label>
                  <select
                    className="input select"
                    value={newProject.area}
                    onChange={e => setNewProject({ ...newProject, area: e.target.value })}
                  >
                    <option value="Forge">Forge (Startup)</option>
                    <option value="GATE">GATE 2027</option>
                    <option value="College">College</option>
                    <option value="Learning">Learning & ML</option>
                    <option value="Personal">Personal</option>
                    <option value="Entrepreneur">Entrepreneur</option>
                  </select>
                </div>

                <div>
                  <label className="label">Priority</label>
                  <select
                    className="input select"
                    value={newProject.priority}
                    onChange={e => setNewProject({ ...newProject, priority: e.target.value })}
                  >
                    <option value="P0">P0 (Critical)</option>
                    <option value="P1">P1 (High)</option>
                    <option value="P2">P2 (Medium)</option>
                    <option value="P3">P3 (Low)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label className="label">Deadline</label>
                  <input
                    type="date"
                    className="input"
                    value={newProject.deadline}
                    onChange={e => setNewProject({ ...newProject, deadline: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label">Status</label>
                  <select
                    className="input select"
                    value={newProject.status}
                    onChange={e => setNewProject({ ...newProject, status: e.target.value })}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="PLANNED">Planned</option>
                    <option value="BACKLOG">Backlog</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Tags (comma separated)</label>
                <input
                  className="input"
                  placeholder="ai, launch, v1, backend"
                  value={newProject.tags}
                  onChange={e => setNewProject({ ...newProject, tags: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
