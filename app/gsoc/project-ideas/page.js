'use client';
import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import Link from 'next/link';

const STATUS = {
  IDEA: 'Idea',
  RESEARCHING: 'Researching',
  DISCUSSING: 'Discussing',
  VALIDATED: 'Validated',
  PROPOSAL_CANDIDATE: 'Proposal Candidate',
  SELECTED_PROPOSAL: 'Selected Proposal',
  REJECTED: 'Rejected'
};

const DIFFICULTY = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced'
};

const EVIDENCE_LEVELS = {
  NONE: { color: 'var(--text-muted)', bg: 'var(--surface-2)', label: 'None' },
  WEAK: { color: 'var(--red)', bg: 'var(--red-bg)', label: 'Weak' },
  BASIC: { color: 'var(--orange)', bg: 'var(--orange-bg)', label: 'Basic' },
  GOOD: { color: 'var(--yellow)', bg: 'var(--yellow-bg)', label: 'Good' },
  STRONG: { color: 'var(--green)', bg: 'var(--green-bg)', label: 'Strong' },
  EXCELLENT: { color: 'var(--blue)', bg: 'var(--blue-bg)', label: 'Excellent' }
};

function EvidenceBadge({ level }) {
  const config = EVIDENCE_LEVELS[level] || EVIDENCE_LEVELS.NONE;
  return (
    <span style={{
      fontSize: 11,
      fontWeight: 600,
      padding: '2px 8px',
      borderRadius: 'var(--r-full)',
      background: config.bg,
      color: config.color
    }}>
      {config.label}
    </span>
  );
}

function IdeaCard({ idea, onUpdate, onDelete }) {
  const statusConfig = {
    SELECTED_PROPOSAL: { color: 'var(--green)', bg: 'var(--green-bg)' },
    PROPOSAL_CANDIDATE: { color: 'var(--blue)', bg: 'var(--blue-bg)' },
    VALIDATED: { color: 'var(--yellow)', bg: 'var(--yellow-bg)' },
    DISCUSSING: { color: 'var(--orange)', bg: 'var(--orange-bg)' },
    RESEARCHING: { color: 'var(--text-muted)', bg: 'var(--surface-2)' },
    IDEA: { color: 'var(--text-muted)', bg: 'var(--surface-2)' },
    REJECTED: { color: 'var(--red)', bg: 'var(--red-bg)' }
  }[idea.status] || { color: 'var(--text-muted)', bg: 'var(--surface-2)' };

  return (
    <div className="card card-hover" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{idea.title}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
            {idea.organization?.name || 'No Organization'}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ 
              fontSize: 11, 
              fontWeight: 600, 
              padding: '2px 8px', 
              borderRadius: 'var(--r-full)', 
              background: statusConfig.bg, 
              color: statusConfig.color 
            }}>
              {STATUS[idea.status]}
            </span>
            <span className="tag">{DIFFICULTY[idea.difficulty]}</span>
            {idea.priority && <span className="tag" style={{ color: idea.priority === 'P0' ? 'var(--red)' : 'var(--text-muted)' }}>{idea.priority}</span>}
          </div>
        </div>
        <EvidenceBadge level={idea.evidenceLevel} />
      </div>

      {idea.problem && (
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
          <strong>Problem:</strong> {idea.problem.substring(0, 100)}
          {idea.problem.length > 100 && '...'}
        </div>
      )}

      {idea.proposedSolution && (
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
          <strong>Solution:</strong> {idea.proposedSolution.substring(0, 100)}
          {idea.proposedSolution.length > 100 && '...'}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
        {idea.relatedSkills?.length > 0 && (
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {idea.relatedSkills.length} skills
          </span>
        )}
        {idea.relatedProjects?.length > 0 && (
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {idea.relatedProjects.length} projects
          </span>
        )}
        {idea.communityInteractions?.length > 0 && (
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {idea.communityInteractions.length} interactions
          </span>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          Gate: <strong>{idea.currentGate}</strong>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button 
            onClick={() => onUpdate(idea)}
            className="btn btn-secondary btn-sm"
          >
            Update
          </button>
          <button 
            onClick={() => onDelete(idea._id)}
            className="btn btn-ghost btn-sm"
            style={{ color: 'var(--red)' }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProjectIdeasPage() {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingIdea, setEditingIdea] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [formData, setFormData] = useState({
    title: '',
    problem: '',
    existingSystem: '',
    proposedSolution: '',
    technicalApproach: '',
    expectedDeliverables: '',
    timeline: '',
    risks: '',
    dependencies: '',
    difficulty: 'INTERMEDIATE',
    organization: '',
    status: 'IDEA',
    priority: 'P1',
    notes: ''
  });

  async function loadIdeas() {
    try {
      const res = await fetch('/api/gsoc/project-ideas');
      const json = await res.json();
      if (json.success) setIdeas(json.data);
    } catch (e) {
      console.error('Failed to load ideas:', e);
    }
    setLoading(false);
  }

  useEffect(() => { loadIdeas(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const url = editingIdea ? `/api/gsoc/project-ideas/${editingIdea._id}` : '/api/gsoc/project-ideas';
      const method = editingIdea ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        expectedDeliverables: formData.expectedDeliverables ? formData.expectedDeliverables.split(',').map(s => s.trim()) : [],
        risks: formData.risks ? formData.risks.split(',').map(s => s.trim()) : [],
        dependencies: formData.dependencies ? formData.dependencies.split(',').map(s => s.trim()) : []
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowModal(false);
        setEditingIdea(null);
        setFormData({
          title: '',
          problem: '',
          existingSystem: '',
          proposedSolution: '',
          technicalApproach: '',
          expectedDeliverables: '',
          timeline: '',
          risks: '',
          dependencies: '',
          difficulty: 'INTERMEDIATE',
          organization: '',
          status: 'IDEA',
          priority: 'P1',
          notes: ''
        });
        loadIdeas();
      }
    } catch (e) {
      console.error('Failed to save idea:', e);
    }
  }

  function handleEdit(idea) {
    setEditingIdea(idea);
    setFormData({
      title: idea.title,
      problem: idea.problem || '',
      existingSystem: idea.existingSystem || '',
      proposedSolution: idea.proposedSolution || '',
      technicalApproach: idea.technicalApproach || '',
      expectedDeliverables: idea.expectedDeliverables?.join(', ') || '',
      timeline: idea.timeline || '',
      risks: idea.risks?.join(', ') || '',
      dependencies: idea.dependencies?.join(', ') || '',
      difficulty: idea.difficulty,
      organization: idea.organization?._id || idea.organization || '',
      status: idea.status,
      priority: idea.priority,
      notes: idea.notes || ''
    });
    setShowModal(true);
  }

  async function handleDelete(id) {
    if (!confirm('Delete this project idea?')) return;
    try {
      await fetch(`/api/gsoc/project-ideas/${id}`, { method: 'DELETE' });
      loadIdeas();
    } catch (e) {
      console.error('Failed to delete idea:', e);
    }
  }

  const filteredIdeas = filter === 'ALL' 
    ? ideas 
    : ideas.filter(i => i.status === filter);

  const statusCounts = Object.keys(STATUS).reduce((acc, status) => {
    acc[status] = ideas.filter(i => i.status === status).length;
    return acc;
  }, {});

  return (
    <AppShell>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>GSoC Project Ideas</h1>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Track potential GSoC projects from idea to selected proposal
        </div>
      </div>

      {loading ? (
        <div className="loading-state"><div className="spinner" /></div>
      ) : (
        <>
          {/* Stats */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>{ideas.length}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Ideas</div>
              </div>
              <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--green)' }}>{statusCounts.SELECTED_PROPOSAL || 0}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Selected</div>
              </div>
              <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--blue)' }}>{statusCounts.PROPOSAL_CANDIDATE || 0}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Candidates</div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button 
                className={`btn btn-sm ${filter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilter('ALL')}
              >
                All ({ideas.length})
              </button>
              {Object.entries(STATUS).map(([key, label]) => (
                <button
                  key={key}
                  className={`btn btn-sm ${filter === key ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFilter(key)}
                >
                  {label} ({statusCounts[key] || 0})
                </button>
              ))}
            </div>
          </div>

          {/* Ideas Grid */}
          {filteredIdeas.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">💡</div>
              <div className="empty-state-title">No project ideas tracked yet</div>
              <div className="empty-state-desc">Start by adding your first GSoC project idea</div>
              <button 
                className="btn btn-primary btn-sm" 
                style={{ marginTop: 12 }}
                onClick={() => setShowModal(true)}
              >
                Add Idea
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 12 }}>
              {filteredIdeas.map(idea => (
                <IdeaCard 
                  key={idea._id} 
                  idea={idea} 
                  onUpdate={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          {/* Add Button */}
          <button 
            className="fab" 
            onClick={() => setShowModal(true)}
            style={{ position: 'fixed', bottom: 'calc(var(--bottom-nav-h) + 16px)', right: 20 }}
          >
            <span style={{ fontSize: 24 }}>+</span>
          </button>
        </>
      )}

      {/* Modal */}
      {showModal && (
        <>
          <div 
            className="modal-overlay" 
            onClick={() => { setShowModal(false); setEditingIdea(null); }}
          />
          <div className="modal" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <div className="modal-title">{editingIdea ? 'Update Project Idea' : 'Add Project Idea'}</div>
              <button 
                className="modal-close"
                onClick={() => { setShowModal(false); setEditingIdea(null); }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="label">Title</label>
                <input
                  className="input"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Improve PyTorch DataLoader performance"
                  required
                />
              </div>

              <div className="form-group">
                <label className="label">Problem</label>
                <textarea
                  className="input textarea"
                  value={formData.problem}
                  onChange={e => setFormData({...formData, problem: e.target.value})}
                  placeholder="What problem does this project solve?"
                  rows={3}
                  required
                />
              </div>

              <div className="form-group">
                <label className="label">Existing System</label>
                <textarea
                  className="input textarea"
                  value={formData.existingSystem}
                  onChange={e => setFormData({...formData, existingSystem: e.target.value})}
                  placeholder="How is this currently solved?"
                  rows={2}
                />
              </div>

              <div className="form-group">
                <label className="label">Proposed Solution</label>
                <textarea
                  className="input textarea"
                  value={formData.proposedSolution}
                  onChange={e => setFormData({...formData, proposedSolution: e.target.value})}
                  placeholder="Your proposed approach"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label className="label">Technical Approach</label>
                <textarea
                  className="input textarea"
                  value={formData.technicalApproach}
                  onChange={e => setFormData({...formData, technicalApproach: e.target.value})}
                  placeholder="Technical details of your approach"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label className="label">Expected Deliverables (comma-separated)</label>
                <input
                  className="input"
                  value={formData.expectedDeliverables}
                  onChange={e => setFormData({...formData, expectedDeliverables: e.target.value})}
                  placeholder="e.g., Code, Documentation, Tests"
                />
              </div>

              <div className="form-group">
                <label className="label">Timeline</label>
                <textarea
                  className="input textarea"
                  value={formData.timeline}
                  onChange={e => setFormData({...formData, timeline: e.target.value})}
                  placeholder="High-level timeline for the project"
                  rows={2}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="label">Difficulty</label>
                  <select
                    className="input select"
                    value={formData.difficulty}
                    onChange={e => setFormData({...formData, difficulty: e.target.value})}
                  >
                    {Object.entries(DIFFICULTY).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Status</label>
                  <select
                    className="input select"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                  >
                    {Object.entries(STATUS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="label">Risks (comma-separated)</label>
                <input
                  className="input"
                  value={formData.risks}
                  onChange={e => setFormData({...formData, risks: e.target.value})}
                  placeholder="e.g., API changes, Time constraints"
                />
              </div>

              <div className="form-group">
                <label className="label">Dependencies (comma-separated)</label>
                <input
                  className="input"
                  value={formData.dependencies}
                  onChange={e => setFormData({...formData, dependencies: e.target.value})}
                  placeholder="e.g., Library updates, Mentor availability"
                />
              </div>

              <div className="form-group">
                <label className="label">Priority</label>
                <select
                  className="input select"
                  value={formData.priority}
                  onChange={e => setFormData({...formData, priority: e.target.value})}
                >
                  <option value="P0">P0 - Critical</option>
                  <option value="P1">P1 - High</option>
                  <option value="P2">P2 - Medium</option>
                  <option value="P3">P3 - Low</option>
                </select>
              </div>

              <div className="form-group">
                <label className="label">Notes</label>
                <textarea
                  className="input textarea"
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  placeholder="Additional notes..."
                  rows={2}
                />
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => { setShowModal(false); setEditingIdea(null); }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingIdea ? 'Update' : 'Add'} Idea
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </AppShell>
  );
}
