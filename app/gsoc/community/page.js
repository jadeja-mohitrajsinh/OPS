'use client';
import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import EntitySearchPicker from '@/components/EntitySearchPicker';
import Link from 'next/link';

const PLATFORMS = {
  GITHUB: 'GitHub',
  DISCORD: 'Discord',
  SLACK: 'Slack',
  MAILING_LIST: 'Mailing List',
  FORUM: 'Forum',
  COMMUNITY_MEETING: 'Community Meeting',
  ISSUE_DISCUSSION: 'Issue Discussion',
  PR_REVIEW: 'PR Review'
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

function InteractionCard({ interaction, onUpdate, onDelete }) {
  return (
    <div className="card card-hover" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{interaction.topic}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
            {interaction.organization?.name || 'No Organization'}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className="tag">{PLATFORMS[interaction.platform]}</span>
            {interaction.personOrRole && <span className="tag">{interaction.personOrRole}</span>}
          </div>
        </div>
        <EvidenceBadge level={interaction.evidenceLevel} />
      </div>

      {interaction.question && (
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
          <strong>Q:</strong> {interaction.question.substring(0, 100)}
          {interaction.question.length > 100 && '...'}
        </div>
      )}

      {interaction.response && (
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
          <strong>A:</strong> {interaction.response.substring(0, 100)}
          {interaction.response.length > 100 && '...'}
        </div>
      )}

      {interaction.url && (
        <div style={{ marginBottom: 12 }}>
          <a href={interaction.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--blue)' }}>
            🔗 View Discussion
          </a>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          Gate: <strong>{interaction.currentGate}</strong>
          {interaction.date && ` · ${new Date(interaction.date).toLocaleDateString()}`}
          {interaction.dueDate && (
            <span style={{ color: new Date(interaction.dueDate) < new Date() ? 'var(--red)' : 'var(--text-muted)' }}>
              {` · Due: ${new Date(interaction.dueDate).toLocaleDateString()}`}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button 
            onClick={() => onUpdate(interaction)}
            className="btn btn-secondary btn-sm"
          >
            Update
          </button>
          <button 
            onClick={() => onDelete(interaction._id)}
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

export default function CommunityPage() {
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingInteraction, setEditingInteraction] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [formData, setFormData] = useState({
    organization: '',
    platform: 'GITHUB',
    date: '',
    dueDate: '',
    personOrRole: '',
    topic: '',
    question: '',
    response: '',
    outcome: '',
    url: '',
    relatedSkills: [],
    relatedProjects: [],
    relatedExperiments: [],
    relatedContributions: [],
    relatedCommunityInteractions: [],
    relatedDatasets: [],
    notes: ''
  });

  async function loadInteractions() {
    try {
      const res = await fetch('/api/gsoc/community');
      const json = await res.json();
      if (json.success) setInteractions(json.data);
    } catch (e) {
      console.error('Failed to load interactions:', e);
    }
    setLoading(false);
  }

  useEffect(() => { loadInteractions(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const url = editingInteraction ? `/api/gsoc/community/${editingInteraction._id}` : '/api/gsoc/community';
      const method = editingInteraction ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        date: formData.date || new Date(),
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
        relatedSkills: formData.relatedSkills || [],
        relatedProjects: formData.relatedProjects || [],
        relatedExperiments: formData.relatedExperiments || [],
        relatedContributions: formData.relatedContributions || [],
        relatedCommunityInteractions: formData.relatedCommunityInteractions || [],
        relatedDatasets: formData.relatedDatasets || []
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowModal(false);
        setEditingInteraction(null);
        setFormData({
          organization: '',
          platform: 'GITHUB',
          date: '',
          dueDate: '',
          personOrRole: '',
          topic: '',
          question: '',
          response: '',
          outcome: '',
          url: '',
          relatedSkills: [],
          relatedProjects: [],
          relatedExperiments: [],
          relatedContributions: [],
          relatedCommunityInteractions: [],
          relatedDatasets: [],
          notes: ''
        });
        loadInteractions();
      }
    } catch (e) {
      console.error('Failed to save interaction:', e);
    }
  }

  function handleEdit(interaction) {
    setEditingInteraction(interaction);
    setFormData({
      organization: interaction.organization?._id || interaction.organization || '',
      platform: interaction.platform,
      date: interaction.date ? interaction.date.split('T')[0] : '',
      dueDate: interaction.dueDate ? interaction.dueDate.split('T')[0] : '',
      personOrRole: interaction.personOrRole || '',
      topic: interaction.topic || '',
      question: interaction.question || '',
      response: interaction.response || '',
      outcome: interaction.outcome || '',
      url: interaction.url || '',
      relatedSkills: interaction.relatedSkills || [],
      relatedProjects: interaction.relatedProjects || [],
      relatedExperiments: interaction.relatedExperiments || [],
      relatedContributions: interaction.relatedContributions || [],
      relatedCommunityInteractions: interaction.relatedCommunityInteractions || [],
      relatedDatasets: interaction.relatedDatasets || [],
      notes: interaction.notes || ''
    });
    setShowModal(true);
  }

  async function handleDelete(id) {
    if (!confirm('Delete this interaction?')) return;
    try {
      await fetch(`/api/gsoc/community/${id}`, { method: 'DELETE' });
      loadInteractions();
    } catch (e) {
      console.error('Failed to delete interaction:', e);
    }
  }

  const filteredInteractions = filter === 'ALL' 
    ? interactions 
    : interactions.filter(i => i.platform === filter);

  const platformCounts = Object.keys(PLATFORMS).reduce((acc, platform) => {
    acc[platform] = interactions.filter(i => i.platform === platform).length;
    return acc;
  }, {});

  return (
    <AppShell>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Community Interactions</h1>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Track discussions, questions, and engagement with target organizations
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
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>{interactions.length}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Interactions</div>
              </div>
              <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--green)' }}>{platformCounts.GITHUB || 0}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>GitHub</div>
              </div>
              <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--blue)' }}>{platformCounts.DISCORD || 0}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Discord</div>
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
                All ({interactions.length})
              </button>
              {Object.entries(PLATFORMS).map(([key, label]) => (
                <button
                  key={key}
                  className={`btn btn-sm ${filter === key ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFilter(key)}
                >
                  {label} ({platformCounts[key] || 0})
                </button>
              ))}
            </div>
          </div>

          {/* Interactions Grid */}
          {filteredInteractions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">💬</div>
              <div className="empty-state-title">No community interactions tracked yet</div>
              <div className="empty-state-desc">Start by logging your first community engagement</div>
              <button 
                className="btn btn-primary btn-sm" 
                style={{ marginTop: 12 }}
                onClick={() => setShowModal(true)}
              >
                Add Interaction
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 12 }}>
              {filteredInteractions.map(interaction => (
                <InteractionCard 
                  key={interaction._id} 
                  interaction={interaction} 
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
            onClick={() => { setShowModal(false); setEditingInteraction(null); }}
          />
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editingInteraction ? 'Update Interaction' : 'Add Interaction'}</div>
              <button 
                className="modal-close"
                onClick={() => { setShowModal(false); setEditingInteraction(null); }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="label">Topic</label>
                <input
                  className="input"
                  value={formData.topic}
                  onChange={e => setFormData({...formData, topic: e.target.value})}
                  placeholder="e.g., Project idea discussion"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="label">Platform</label>
                  <select
                    className="input select"
                    value={formData.platform}
                    onChange={e => setFormData({...formData, platform: e.target.value})}
                  >
                    {Object.entries(PLATFORMS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
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
                  <label className="label">Due Date</label>
                  <input
                    className="input"
                    value={formData.dueDate}
                    onChange={e => setFormData({...formData, dueDate: e.target.value})}
                    type="date"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="label">Person/Role</label>
                <input
                  className="input"
                  value={formData.personOrRole}
                  onChange={e => setFormData({...formData, personOrRole: e.target.value})}
                  placeholder="e.g., @maintainer, Project Lead"
                />
              </div>

              <div className="form-group">
                <label className="label">Question</label>
                <textarea
                  className="input textarea"
                  value={formData.question}
                  onChange={e => setFormData({...formData, question: e.target.value})}
                  placeholder="What did you ask or discuss?"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label className="label">Response</label>
                <textarea
                  className="input textarea"
                  value={formData.response}
                  onChange={e => setFormData({...formData, response: e.target.value})}
                  placeholder="What was the response or outcome?"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label className="label">Outcome</label>
                <input
                  className="input"
                  value={formData.outcome}
                  onChange={e => setFormData({...formData, outcome: e.target.value})}
                  placeholder="e.g., Got clarification, Next steps identified"
                />
              </div>

              <div className="form-group">
                <label className="label">URL</label>
                <input
                  className="input"
                  value={formData.url}
                  onChange={e => setFormData({...formData, url: e.target.value})}
                  placeholder="https://github.com/... or Discord link"
                />
              </div>

              <EntitySearchPicker
                label="Related Skills"
                value={formData.relatedSkills}
                onChange={(ids) => setFormData({...formData, relatedSkills: ids})}
                allowedTypes={['SKILL']}
                placeholder="Search skills..."
              />

              <EntitySearchPicker
                label="Related Projects"
                value={formData.relatedProjects}
                onChange={(ids) => setFormData({...formData, relatedProjects: ids})}
                allowedTypes={['PROJECT']}
                placeholder="Search projects..."
              />

              <EntitySearchPicker
                label="Related Experiments"
                value={formData.relatedExperiments}
                onChange={(ids) => setFormData({...formData, relatedExperiments: ids})}
                allowedTypes={['EXPERIMENT']}
                placeholder="Search experiments..."
              />

              <EntitySearchPicker
                label="Related Contributions"
                value={formData.relatedContributions}
                onChange={(ids) => setFormData({...formData, relatedContributions: ids})}
                allowedTypes={['CONTRIBUTION']}
                placeholder="Search contributions..."
              />

              <EntitySearchPicker
                label="Related Community Interactions"
                value={formData.relatedCommunityInteractions}
                onChange={(ids) => setFormData({...formData, relatedCommunityInteractions: ids})}
                allowedTypes={['COMMUNITY']}
                placeholder="Search community interactions..."
                excludeIds={editingInteraction ? [editingInteraction._id] : []}
              />

              <EntitySearchPicker
                label="Related Datasets"
                value={formData.relatedDatasets}
                onChange={(ids) => setFormData({...formData, relatedDatasets: ids})}
                allowedTypes={['DATASET']}
                placeholder="Search datasets..."
              />

              <div className="form-group">
                <label className="label">Notes</label>
                <textarea
                  className="input textarea"
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  placeholder="Additional context, follow-ups..."
                  rows={2}
                />
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => { setShowModal(false); setEditingInteraction(null); }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingInteraction ? 'Update' : 'Add'} Interaction
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </AppShell>
  );
}
