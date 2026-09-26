'use client';
import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import EntitySearchPicker from '@/components/EntitySearchPicker';
import Link from 'next/link';

const EVIDENCE_LEVELS = {
  NONE: { color: 'var(--text-muted)', bg: 'var(--surface-2)', label: 'None' },
  WEAK: { color: 'var(--red)', bg: 'var(--red-bg)', label: 'Weak' },
  BASIC: { color: 'var(--orange)', bg: 'var(--orange-bg)', label: 'Basic' },
  GOOD: { color: 'var(--yellow)', bg: 'var(--yellow-bg)', label: 'Good' },
  STRONG: { color: 'var(--green)', bg: 'var(--green-bg)', label: 'Strong' },
  EXCELLENT: { color: 'var(--blue)', bg: 'var(--blue-bg)', label: 'Excellent' }
};

const CATEGORIES = {
  PROGRAMMING: 'Programming',
  ML_FRAMEWORK: 'ML Framework',
  MATH: 'Mathematics',
  LIBRARY: 'Library',
  TOOL: 'Tool',
  DOMAIN: 'Domain'
};

const PRIORITIES = { P0: 'Critical', P1: 'High', P2: 'Medium', P3: 'Low' };

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

function SkillCard({ skill, onUpdate, onDelete }) {
  const config = EVIDENCE_LEVELS[skill.evidenceLevel?.level] || EVIDENCE_LEVELS.NONE;
  const priorityConfig = PRIORITIES[skill.priority] || PRIORITIES.P1;

  return (
    <div className="card card-hover" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{skill.name}</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className="tag">{CATEGORIES[skill.category]}</span>
            <span className="tag" style={{ color: skill.priority === 'P0' ? 'var(--red)' : 'var(--text-muted)' }}>
              {priorityConfig}
            </span>
          </div>
        </div>
        <EvidenceBadge level={skill.evidenceLevel?.level} />
      </div>

      {skill.evidenceLevel?.evidence && (
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
          <strong>Evidence:</strong> {skill.evidenceLevel.evidence}
        </div>
      )}

      {skill.evidenceLevel?.url && (
        <div style={{ fontSize: 12, color: 'var(--blue)', marginBottom: 8 }}>
          <a href={skill.evidenceLevel.url} target="_blank" rel="noopener noreferrer">🔗 Evidence URL</a>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          Gate: <strong>{skill.currentGate}</strong>
          {skill.targetLevel && ` · Target: ${skill.targetLevel}`}
          {skill.dueDate && (
            <span style={{ color: new Date(skill.dueDate) < new Date() ? 'var(--red)' : 'var(--text-muted)' }}>
              {` · Due: ${new Date(skill.dueDate).toLocaleDateString()}`}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button 
            onClick={() => onUpdate(skill)}
            className="btn btn-secondary btn-sm"
          >
            Update
          </button>
          <button 
            onClick={() => onDelete(skill._id)}
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

export default function SkillsPage() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [formData, setFormData] = useState({
    name: '',
    category: 'PROGRAMMING',
    evidenceLevel: 'NONE',
    evidence: '',
    url: '',
    priority: 'P1',
    targetLevel: 'STRONG',
    dueDate: '',
    relatedSkills: [],
    relatedProjects: [],
    relatedExperiments: [],
    relatedContributions: [],
    relatedCommunityInteractions: [],
    relatedDatasets: [],
    notes: ''
  });

  async function loadSkills() {
    try {
      const res = await fetch('/api/gsoc/skills');
      const json = await res.json();
      if (json.success) setSkills(json.data);
    } catch (e) {
      console.error('Failed to load skills:', e);
    }
    setLoading(false);
  }

  useEffect(() => { loadSkills(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const url = editingSkill ? `/api/gsoc/skills/${editingSkill._id}` : '/api/gsoc/skills';
      const method = editingSkill ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        evidenceLevel: {
          level: formData.evidenceLevel,
          evidence: formData.evidence,
          url: formData.url,
          dateAchieved: formData.evidenceLevel !== 'NONE' ? new Date() : null
        },
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
        setEditingSkill(null);
        setFormData({
          name: '',
          category: 'PROGRAMMING',
          evidenceLevel: 'NONE',
          evidence: '',
          url: '',
          priority: 'P1',
          targetLevel: 'STRONG',
          dueDate: '',
          relatedSkills: [],
          relatedProjects: [],
          relatedExperiments: [],
          relatedContributions: [],
          relatedCommunityInteractions: [],
          relatedDatasets: [],
          notes: ''
        });
        loadSkills();
      }
    } catch (e) {
      console.error('Failed to save skill:', e);
    }
  }

  function handleEdit(skill) {
    setEditingSkill(skill);
    setFormData({
      name: skill.name,
      category: skill.category,
      evidenceLevel: skill.evidenceLevel?.level || 'NONE',
      evidence: skill.evidenceLevel?.evidence || '',
      url: skill.evidenceLevel?.url || '',
      priority: skill.priority,
      targetLevel: skill.targetLevel,
      dueDate: skill.dueDate ? skill.dueDate.split('T')[0] : '',
      relatedSkills: skill.relatedSkills || [],
      relatedProjects: skill.relatedProjects || [],
      relatedExperiments: skill.relatedExperiments || [],
      relatedContributions: skill.relatedContributions || [],
      relatedCommunityInteractions: skill.relatedCommunityInteractions || [],
      relatedDatasets: skill.relatedDatasets || [],
      notes: skill.notes
    });
    setShowModal(true);
  }

  async function handleDelete(id) {
    if (!confirm('Delete this skill?')) return;
    try {
      await fetch(`/api/gsoc/skills/${id}`, { method: 'DELETE' });
      loadSkills();
    } catch (e) {
      console.error('Failed to delete skill:', e);
    }
  }

  const filteredSkills = filter === 'ALL' 
    ? skills 
    : skills.filter(s => s.category === filter);

  const categoryCounts = Object.keys(CATEGORIES).reduce((acc, cat) => {
    acc[cat] = skills.filter(s => s.category === cat).length;
    return acc;
  }, {});

  return (
    <AppShell>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Technical Skills</h1>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Track evidence for programming, ML frameworks, and technical skills
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
                All ({skills.length})
              </button>
              {Object.entries(CATEGORIES).map(([key, label]) => (
                <button
                  key={key}
                  className={`btn btn-sm ${filter === key ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFilter(key)}
                >
                  {label} ({categoryCounts[key] || 0})
                </button>
              ))}
            </div>
          </div>

          {/* Skills Grid */}
          {filteredSkills.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📚</div>
              <div className="empty-state-title">No skills tracked yet</div>
              <div className="empty-state-desc">Start by adding your first technical skill</div>
              <button 
                className="btn btn-primary btn-sm" 
                style={{ marginTop: 12 }}
                onClick={() => setShowModal(true)}
              >
                Add Skill
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
              {filteredSkills.map(skill => (
                <SkillCard 
                  key={skill._id} 
                  skill={skill} 
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
            onClick={() => { setShowModal(false); setEditingSkill(null); }}
          />
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editingSkill ? 'Update Skill' : 'Add Skill'}</div>
              <button 
                className="modal-close"
                onClick={() => { setShowModal(false); setEditingSkill(null); }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="label">Skill Name</label>
                <input
                  className="input"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Python, PyTorch, scikit-learn"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="label">Category</label>
                  <select
                    className="input select"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    {Object.entries(CATEGORIES).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Priority</label>
                  <select
                    className="input select"
                    value={formData.priority}
                    onChange={e => setFormData({...formData, priority: e.target.value})}
                  >
                    {Object.entries(PRIORITIES).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="label">Evidence Level</label>
                  <select
                    className="input select"
                    value={formData.evidenceLevel}
                    onChange={e => setFormData({...formData, evidenceLevel: e.target.value})}
                  >
                    {Object.entries(EVIDENCE_LEVELS).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Target Level</label>
                  <select
                    className="input select"
                    value={formData.targetLevel}
                    onChange={e => setFormData({...formData, targetLevel: e.target.value})}
                  >
                    {Object.entries(EVIDENCE_LEVELS).filter(([key]) => key !== 'NONE').map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="label">Evidence Description</label>
                <textarea
                  className="input textarea"
                  value={formData.evidence}
                  onChange={e => setFormData({...formData, evidence: e.target.value})}
                  placeholder="Describe the evidence for this skill level..."
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label className="label">Evidence URL</label>
                <input
                  className="input"
                  value={formData.url}
                  onChange={e => setFormData({...formData, url: e.target.value})}
                  placeholder="https://github.com/..."
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

              <EntitySearchPicker
                label="Related Skills"
                value={formData.relatedSkills}
                onChange={(ids) => setFormData({...formData, relatedSkills: ids})}
                allowedTypes={['SKILL']}
                placeholder="Search skills..."
                excludeIds={editingSkill ? [editingSkill._id] : []}
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
                  placeholder="Additional notes, learning resources, practice tasks..."
                  rows={2}
                />
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => { setShowModal(false); setEditingSkill(null); }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingSkill ? 'Update' : 'Add'} Skill
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </AppShell>
  );
}