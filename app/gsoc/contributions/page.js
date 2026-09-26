'use client';
import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import Link from 'next/link';

const CONTRIBUTION_TYPES = {
  BUG_FIX: 'Bug Fix',
  FEATURE: 'Feature',
  DOCUMENTATION: 'Documentation',
  TESTING: 'Testing',
  REFACTORING: 'Refactoring',
  PERFORMANCE: 'Performance',
  ML_MODEL: 'ML Model',
  DATASET: 'Dataset',
  RESEARCH: 'Research',
  TOOLING: 'Tooling'
};

const STATUS = {
  INVESTIGATING: 'Investigating',
  DISCUSSING: 'Discussing',
  WORKING: 'Working',
  PR_OPEN: 'PR Open',
  CHANGES_REQUESTED: 'Changes Requested',
  APPROVED: 'Approved',
  MERGED: 'Merged',
  CLOSED: 'Closed'
};

const RESULT = {
  SUCCESS: 'Success',
  PARTIAL: 'Partial',
  FAILED: 'Failed',
  ABANDONED: 'Abandoned'
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

function ContributionCard({ contribution, onUpdate, onDelete }) {
  const statusConfig = {
    MERGED: { color: 'var(--green)', bg: 'var(--green-bg)' },
    APPROVED: { color: 'var(--blue)', bg: 'var(--blue-bg)' },
    PR_OPEN: { color: 'var(--yellow)', bg: 'var(--yellow-bg)' },
    WORKING: { color: 'var(--orange)', bg: 'var(--orange-bg)' },
    INVESTIGATING: { color: 'var(--text-muted)', bg: 'var(--surface-2)' },
    DISCUSSING: { color: 'var(--text-muted)', bg: 'var(--surface-2)' },
    CHANGES_REQUESTED: { color: 'var(--red)', bg: 'var(--red-bg)' },
    CLOSED: { color: 'var(--text-muted)', bg: 'var(--surface-2)' }
  }[contribution.status] || { color: 'var(--text-muted)', bg: 'var(--surface-2)' };

  return (
    <div className="card card-hover" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{contribution.issueTitle}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
            {contribution.contributionType && CONTRIBUTION_TYPES[contribution.contributionType]}
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
              {STATUS[contribution.status]}
            </span>
            {contribution.result && (
              <span className="tag">{RESULT[contribution.result]}</span>
            )}
          </div>
        </div>
        <EvidenceBadge level={contribution.evidenceLevel} />
      </div>

      {/* Links */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
        {contribution.issueUrl && (
          <a href={contribution.issueUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--blue)' }}>
            🔗 Issue #{contribution.issueNumber}
          </a>
        )}
        {contribution.prUrl && (
          <a href={contribution.prUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--blue)' }}>
            🔗 Pull Request
          </a>
        )}
        {contribution.commitUrl && (
          <a href={contribution.commitUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--blue)' }}>
            🔗 Commit
          </a>
        )}
      </div>

      {contribution.whatILearned && (
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
          <strong>Learned:</strong> {contribution.whatILearned.substring(0, 100)}
          {contribution.whatILearned.length > 100 && '...'}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          Gate: <strong>{contribution.currentGate}</strong>
          {contribution.date && ` · ${new Date(contribution.date).toLocaleDateString()}`}
          {contribution.deadline && (
            <span style={{ color: new Date(contribution.deadline) < new Date() ? 'var(--red)' : 'var(--text-muted)' }}>
              {` · Deadline: ${new Date(contribution.deadline).toLocaleDateString()}`}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button 
            onClick={() => onUpdate(contribution)}
            className="btn btn-secondary btn-sm"
          >
            Update
          </button>
          <button 
            onClick={() => onDelete(contribution._id)}
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

export default function ContributionsPage() {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingContribution, setEditingContribution] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [formData, setFormData] = useState({
    organization: '',
    repository: '',
    issueNumber: '',
    issueUrl: '',
    issueTitle: '',
    contributionType: 'BUG_FIX',
    status: 'INVESTIGATING',
    prUrl: '',
    commitUrl: '',
    reviewStatus: 'PENDING',
    result: 'SUCCESS',
    whatILearned: '',
    notes: '',
    date: '',
    deadline: ''
  });

  async function loadContributions() {
    try {
      const res = await fetch('/api/gsoc/contributions');
      const json = await res.json();
      if (json.success) setContributions(json.data);
    } catch (e) {
      console.error('Failed to load contributions:', e);
    }
    setLoading(false);
  }

  useEffect(() => { loadContributions(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const url = editingContribution ? `/api/gsoc/contributions/${editingContribution._id}` : '/api/gsoc/contributions';
      const method = editingContribution ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        issueNumber: formData.issueNumber ? parseInt(formData.issueNumber) : null,
        date: formData.date || new Date(),
        deadline: formData.deadline ? new Date(formData.deadline) : null
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowModal(false);
        setEditingContribution(null);
        setFormData({
          organization: '',
          repository: '',
          issueNumber: '',
          issueUrl: '',
          issueTitle: '',
          contributionType: 'BUG_FIX',
          status: 'INVESTIGATING',
          prUrl: '',
          commitUrl: '',
          reviewStatus: 'PENDING',
          result: 'SUCCESS',
          whatILearned: '',
          notes: '',
          date: '',
          deadline: ''
        });
        loadContributions();
      }
    } catch (e) {
      console.error('Failed to save contribution:', e);
    }
  }

  function handleEdit(contribution) {
    setEditingContribution(contribution);
    setFormData({
      organization: contribution.organization || '',
      repository: contribution.repository || '',
      issueNumber: contribution.issueNumber || '',
      issueUrl: contribution.issueUrl || '',
      issueTitle: contribution.issueTitle || '',
      contributionType: contribution.contributionType,
      status: contribution.status,
      prUrl: contribution.prUrl || '',
      commitUrl: contribution.commitUrl || '',
      reviewStatus: contribution.reviewStatus,
      result: contribution.result,
      whatILearned: contribution.whatILearned || '',
      notes: contribution.notes,
      date: contribution.date ? contribution.date.split('T')[0] : '',
      deadline: contribution.deadline ? contribution.deadline.split('T')[0] : ''
    });
    setShowModal(true);
  }

  async function handleDelete(id) {
    if (!confirm('Delete this contribution?')) return;
    try {
      await fetch(`/api/gsoc/contributions/${id}`, { method: 'DELETE' });
      loadContributions();
    } catch (e) {
      console.error('Failed to delete contribution:', e);
    }
  }

  const filteredContributions = filter === 'ALL' 
    ? contributions 
    : contributions.filter(c => c.status === filter);

  const statusCounts = Object.keys(STATUS).reduce((acc, status) => {
    acc[status] = contributions.filter(c => c.status === status).length;
    return acc;
  }, {});

  const mergedCount = contributions.filter(c => c.status === 'MERGED').length;

  return (
    <AppShell>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Open Source Contributions</h1>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Track issues, pull requests, and contributions to target organizations
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
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--green)' }}>{mergedCount}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Merged PRs</div>
              </div>
              <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>{contributions.length}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Contributions</div>
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
                All ({contributions.length})
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

          {/* Contributions Grid */}
          {filteredContributions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔧</div>
              <div className="empty-state-title">No contributions tracked yet</div>
              <div className="empty-state-desc">Start by logging your first open source contribution</div>
              <button 
                className="btn btn-primary btn-sm" 
                style={{ marginTop: 12 }}
                onClick={() => setShowModal(true)}
              >
                Add Contribution
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 12 }}>
              {filteredContributions.map(contribution => (
                <ContributionCard 
                  key={contribution._id} 
                  contribution={contribution} 
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
            onClick={() => { setShowModal(false); setEditingContribution(null); }}
          />
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editingContribution ? 'Update Contribution' : 'Add Contribution'}</div>
              <button 
                className="modal-close"
                onClick={() => { setShowModal(false); setEditingContribution(null); }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="label">Issue Title</label>
                <input
                  className="input"
                  value={formData.issueTitle}
                  onChange={e => setFormData({...formData, issueTitle: e.target.value})}
                  placeholder="e.g., Fix memory leak in data loading"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="label">Issue Number</label>
                  <input
                    className="input"
                    value={formData.issueNumber}
                    onChange={e => setFormData({...formData, issueNumber: e.target.value})}
                    placeholder="e.g., 123"
                    type="number"
                  />
                </div>
                <div className="form-group">
                  <label className="label">Contribution Type</label>
                  <select
                    className="input select"
                    value={formData.contributionType}
                    onChange={e => setFormData({...formData, contributionType: e.target.value})}
                  >
                    {Object.entries(CONTRIBUTION_TYPES).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="label">Issue URL</label>
                  <input
                    className="input"
                    value={formData.issueUrl}
                    onChange={e => setFormData({...formData, issueUrl: e.target.value})}
                    placeholder="https://github.com/..."
                  />
                </div>
                <div className="form-group">
                  <label className="label">PR URL</label>
                  <input
                    className="input"
                    value={formData.prUrl}
                    onChange={e => setFormData({...formData, prUrl: e.target.value})}
                    placeholder="https://github.com/..."
                  />
                </div>
              </div>

              <div className="form-row">
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
                  <label className="label">Result</label>
                  <select
                    className="input select"
                    value={formData.result}
                    onChange={e => setFormData({...formData, result: e.target.value})}
                  >
                    {Object.entries(RESULT).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="label">Date</label>
                  <input
                    className="input"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    type="date"
                  />
                </div>
                <div className="form-group">
                  <label className="label">Deadline</label>
                  <input
                    className="input"
                    value={formData.deadline}
                    onChange={e => setFormData({...formData, deadline: e.target.value})}
                    type="date"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="label">Commit URL</label>
                <input
                  className="input"
                  value={formData.commitUrl}
                  onChange={e => setFormData({...formData, commitUrl: e.target.value})}
                  placeholder="https://github.com/..."
                />
              </div>

              <div className="form-group">
                <label className="label">What I Learned</label>
                <textarea
                  className="input textarea"
                  value={formData.whatILearned}
                  onChange={e => setFormData({...formData, whatILearned: e.target.value})}
                  placeholder="Key takeaways from this contribution..."
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label className="label">Notes</label>
                <textarea
                  className="input textarea"
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  placeholder="Additional notes, challenges, next steps..."
                  rows={2}
                />
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => { setShowModal(false); setEditingContribution(null); }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingContribution ? 'Update' : 'Add'} Contribution
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </AppShell>
  );
}