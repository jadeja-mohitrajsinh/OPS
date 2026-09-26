'use client';
import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import Link from 'next/link';

const STATUS = {
  RESEARCHING: 'Researching',
  INTERESTED: 'Interested',
  ACTIVE: 'Active',
  PAUSED: 'Paused',
  NOT_TARGET: 'Not Target'
};

const RELEVANCE = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
  NONE: 'None'
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

function OrganizationCard({ organization, onUpdate, onDelete }) {
  const checklist = organization.readinessChecklist || {};
  const completedItems = Object.values(checklist).filter(Boolean).length;
  const totalItems = Object.keys(checklist).length;
  const readinessPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className="card card-hover" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{organization.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
            {organization.description && organization.description.substring(0, 100)}
            {organization.description && organization.description.length > 100 && '...'}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className="tag">{STATUS[organization.status]}</span>
            <span className="tag">AI/ML: {RELEVANCE[organization.aiMlRelevance]}</span>
            <span className="tag">Python: {RELEVANCE[organization.pythonRelevance]}</span>
          </div>
        </div>
        <EvidenceBadge level={organization.evidenceLevel} />
      </div>

      {/* Readiness Checklist Progress */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Readiness Checklist</span>
          <span style={{ fontSize: 11, fontWeight: 600 }}>{completedItems}/{totalItems}</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${readinessPercent}%`, background: readinessPercent >= 80 ? 'var(--green)' : readinessPercent >= 50 ? 'var(--yellow)' : 'var(--orange)' }}
          />
        </div>
      </div>

      {/* Links */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
        {organization.website && (
          <a href={organization.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--blue)' }}>
            🔗 Website
          </a>
        )}
        {organization.github && (
          <a href={organization.github} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--blue)' }}>
            🐙 GitHub
          </a>
        )}
        {organization.contributionGuide && (
          <a href={organization.contributionGuide} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--blue)' }}>
            📖 Contribution Guide
          </a>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          Gate: <strong>{organization.currentGate}</strong>
          {organization.contributions?.length > 0 && ` · ${organization.contributions.length} contributions`}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button 
            onClick={() => onUpdate(organization)}
            className="btn btn-secondary btn-sm"
          >
            Update
          </button>
          <button 
            onClick={() => onDelete(organization._id)}
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

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    github: '',
    aiMlRelevance: 'MEDIUM',
    pythonRelevance: 'MEDIUM',
    description: '',
    technologyStack: '',
    contributionGuide: '',
    communityChannels: '',
    status: 'RESEARCHING',
    notes: ''
  });

  async function loadOrganizations() {
    try {
      const res = await fetch('/api/gsoc/organizations');
      const json = await res.json();
      if (json.success) setOrganizations(json.data);
    } catch (e) {
      console.error('Failed to load organizations:', e);
    }
    setLoading(false);
  }

  useEffect(() => { loadOrganizations(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const url = editingOrg ? `/api/gsoc/organizations/${editingOrg._id}` : '/api/gsoc/organizations';
      const method = editingOrg ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        technologyStack: formData.technologyStack ? formData.technologyStack.split(',').map(s => s.trim()) : [],
        communityChannels: formData.communityChannels ? formData.communityChannels.split(',').map(s => s.trim()) : [],
        readinessChecklist: {
          readOrganizationWebsite: false,
          readContributionGuide: false,
          readPreviousGSoCProjects: false,
          readProjectIdeas: false,
          cloneRepository: false,
          runRepositoryLocally: false,
          understandArchitecture: false,
          readDocumentation: false,
          findBeginnerIssues: false,
          investigateIssue: false,
          participateInDiscussion: false,
          makeFirstContribution: false,
          makeMeaningfulContribution: false,
          understandPotentialGSoCProject: false,
          discussProjectWithCommunity: false
        }
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowModal(false);
        setEditingOrg(null);
        setFormData({
          name: '',
          website: '',
          github: '',
          aiMlRelevance: 'MEDIUM',
          pythonRelevance: 'MEDIUM',
          description: '',
          technologyStack: '',
          contributionGuide: '',
          communityChannels: '',
          status: 'RESEARCHING',
          notes: ''
        });
        loadOrganizations();
      }
    } catch (e) {
      console.error('Failed to save organization:', e);
    }
  }

  function handleEdit(organization) {
    setEditingOrg(organization);
    setFormData({
      name: organization.name,
      website: organization.website,
      github: organization.github,
      aiMlRelevance: organization.aiMlRelevance,
      pythonRelevance: organization.pythonRelevance,
      description: organization.description,
      technologyStack: organization.technologyStack?.join(', ') || '',
      contributionGuide: organization.contributionGuide,
      communityChannels: organization.communityChannels?.join(', ') || '',
      status: organization.status,
      notes: organization.notes
    });
    setShowModal(true);
  }

  async function handleDelete(id) {
    if (!confirm('Delete this organization?')) return;
    try {
      await fetch(`/api/gsoc/organizations/${id}`, { method: 'DELETE' });
      loadOrganizations();
    } catch (e) {
      console.error('Failed to delete organization:', e);
    }
  }

  const filteredOrganizations = filter === 'ALL' 
    ? organizations 
    : organizations.filter(o => o.status === filter);

  const statusCounts = Object.keys(STATUS).reduce((acc, status) => {
    acc[status] = organizations.filter(o => o.status === status).length;
    return acc;
  }, {});

  return (
    <AppShell>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Target Organizations</h1>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Track GSoC organizations with readiness checklists and engagement
        </div>
      </div>

      {loading ? (
        <div className="loading-state"><div className="spinner" /></div>
      ) : (
        <>
          {/* Filters */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button 
                className={`btn btn-sm ${filter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilter('ALL')}
              >
                All ({organizations.length})
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

          {/* Organizations Grid */}
          {filteredOrganizations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🏢</div>
              <div className="empty-state-title">No organizations tracked yet</div>
              <div className="empty-state-desc">Start by adding your first target GSoC organization</div>
              <button 
                className="btn btn-primary btn-sm" 
                style={{ marginTop: 12 }}
                onClick={() => setShowModal(true)}
              >
                Add Organization
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 12 }}>
              {filteredOrganizations.map(organization => (
                <OrganizationCard 
                  key={organization._id} 
                  organization={organization} 
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
            onClick={() => { setShowModal(false); setEditingOrg(null); }}
          />
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editingOrg ? 'Update Organization' : 'Add Organization'}</div>
              <button 
                className="modal-close"
                onClick={() => { setShowModal(false); setEditingOrg(null); }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="label">Organization Name</label>
                <input
                  className="input"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., TensorFlow, PyTorch, scikit-learn"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="label">Website</label>
                  <input
                    className="input"
                    value={formData.website}
                    onChange={e => setFormData({...formData, website: e.target.value})}
                    placeholder="https://..."
                  />
                </div>
                <div className="form-group">
                  <label className="label">GitHub</label>
                  <input
                    className="input"
                    value={formData.github}
                    onChange={e => setFormData({...formData, github: e.target.value})}
                    placeholder="https://github.com/..."
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="label">AI/ML Relevance</label>
                  <select
                    className="input select"
                    value={formData.aiMlRelevance}
                    onChange={e => setFormData({...formData, aiMlRelevance: e.target.value})}
                  >
                    {Object.entries(RELEVANCE).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Python Relevance</label>
                  <select
                    className="input select"
                    value={formData.pythonRelevance}
                    onChange={e => setFormData({...formData, pythonRelevance: e.target.value})}
                  >
                    {Object.entries(RELEVANCE).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="label">Description</label>
                <textarea
                  className="input textarea"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="What does this organization do? Why are you interested?"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label className="label">Technology Stack (comma-separated)</label>
                <input
                  className="input"
                  value={formData.technologyStack}
                  onChange={e => setFormData({...formData, technologyStack: e.target.value})}
                  placeholder="Python, PyTorch, TensorFlow, C++"
                />
              </div>

              <div className="form-group">
                <label className="label">Contribution Guide URL</label>
                <input
                  className="input"
                  value={formData.contributionGuide}
                  onChange={e => setFormData({...formData, contributionGuide: e.target.value})}
                  placeholder="https://..."
                />
              </div>

              <div className="form-group">
                <label className="label">Community Channels (comma-separated)</label>
                <input
                  className="input"
                  value={formData.communityChannels}
                  onChange={e => setFormData({...formData, communityChannels: e.target.value})}
                  placeholder="Discord, Slack, mailing list, forum"
                />
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

              <div className="form-group">
                <label className="label">Notes</label>
                <textarea
                  className="input textarea"
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  placeholder="Additional notes, contacts, project ideas..."
                  rows={2}
                />
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => { setShowModal(false); setEditingOrg(null); }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingOrg ? 'Update' : 'Add'} Organization
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </AppShell>
  );
}