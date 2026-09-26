'use client';
import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import EntitySearchPicker from '@/components/EntitySearchPicker';
import Link from 'next/link';

const DOMAINS = {
  MACHINE_LEARNING: 'Machine Learning',
  DEEP_LEARNING: 'Deep Learning',
  COMPUTER_VISION: 'Computer Vision',
  NLP: 'NLP',
  LLM: 'LLM',
  GENERATIVE_AI: 'Generative AI',
  REINFORCEMENT_LEARNING: 'Reinforcement Learning',
  SCIENTIFIC_ML: 'Scientific ML',
  MLOPS: 'MLOps'
};

const STATUS = {
  IDEA: 'Idea',
  RESEARCH: 'Research',
  DEVELOPMENT: 'Development',
  TESTING: 'Testing',
  COMPLETED: 'Completed',
  DEPLOYED: 'Deployed',
  ARCHIVED: 'Archived'
};

const COMPLEXITY = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
  EXPERT: 'Expert'
};

const EVIDENCE_LEVELS = {
  NONE: { color: 'var(--text-muted)', bg: 'var(--surface-2)', label: 'None' },
  WEAK: { color: 'var(--red)', bg: 'var(--red-bg)', label: 'Weak' },
  BASIC: { color: 'var(--orange)', bg: 'var(--orange-bg)', label: 'Basic' },
  GOOD: { color: 'var(--yellow)', bg: 'var(--yellow-bg)', label: 'Good' },
  STRONG: { color: 'var(--green)', bg: 'var(--green-bg)', label: 'Strong' },
  EXCELLENT: { color: 'var(--blue)', bg: 'var(--blue-bg)', label: 'Excellent' }
};

function ProjectCard({ project, onUpdate, onDelete }) {
  const completedChecklist = Object.values(project.qualityChecklist || {}).filter(Boolean).length;
  const totalChecklist = Object.keys(project.qualityChecklist || {}).length;
  const qualityPercent = totalChecklist > 0 ? Math.round((completedChecklist / totalChecklist) * 100) : 0;

  return (
    <div className="card card-hover" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{project.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{project.problem}</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className="tag">{DOMAINS[project.domain]}</span>
            <span className="tag">{STATUS[project.status]}</span>
            <span className="tag">{COMPLEXITY[project.complexity]}</span>
          </div>
        </div>
      </div>

      {/* Quality Checklist Progress */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Quality Checklist</span>
          <span style={{ fontSize: 11, fontWeight: 600 }}>{completedChecklist}/{totalChecklist}</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${qualityPercent}%`, background: qualityPercent >= 80 ? 'var(--green)' : qualityPercent >= 50 ? 'var(--yellow)' : 'var(--orange)' }}
          />
        </div>
      </div>

      {/* Links */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
        {project.repository && (
          <a href={project.repository} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--blue)' }}>
            🔗 GitHub
          </a>
        )}
        {project.demo && (
          <a href={project.demo} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--blue)' }}>
            🚀 Demo
          </a>
        )}
        {project.huggingFace && (
          <a href={project.huggingFace} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--blue)' }}>
            🤗 Hugging Face
          </a>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          Gate: <strong>{project.currentGate}</strong>
          {project.experiments?.length > 0 && ` · ${project.experiments.length} experiments`}
          {project.dueDate && (
            <span style={{ color: new Date(project.dueDate) < new Date() ? 'var(--red)' : 'var(--text-muted)' }}>
              {` · Due: ${new Date(project.dueDate).toLocaleDateString()}`}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button 
            onClick={() => onUpdate(project)}
            className="btn btn-secondary btn-sm"
          >
            Update
          </button>
          <button 
            onClick={() => onDelete(project._id)}
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

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [formData, setFormData] = useState({
    name: '',
    problem: '',
    domain: 'MACHINE_LEARNING',
    dataset: '',
    model: '',
    framework: '',
    repository: '',
    demo: '',
    huggingFace: '',
    kaggle: '',
    status: 'IDEA',
    complexity: 'BEGINNER',
    startDate: '',
    endDate: '',
    dueDate: '',
    relatedSkills: [],
    relatedProjects: [],
    relatedExperiments: [],
    relatedContributions: [],
    relatedCommunityInteractions: [],
    relatedDatasets: [],
    notes: ''
  });

  async function loadProjects() {
    try {
      const res = await fetch('/api/gsoc/projects');
      const json = await res.json();
      if (json.success) setProjects(json.data);
    } catch (e) {
      console.error('Failed to load projects:', e);
    }
    setLoading(false);
  }

  useEffect(() => { loadProjects(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const url = editingProject ? `/api/gsoc/projects/${editingProject._id}` : '/api/gsoc/projects';
      const method = editingProject ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate) : null,
        endDate: formData.endDate ? new Date(formData.endDate) : null,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
        relatedSkills: formData.relatedSkills || [],
        relatedProjects: formData.relatedProjects || [],
        relatedExperiments: formData.relatedExperiments || [],
        relatedContributions: formData.relatedContributions || [],
        relatedCommunityInteractions: formData.relatedCommunityInteractions || [],
        relatedDatasets: formData.relatedDatasets || [],
        qualityChecklist: {
          clearProblemStatement: false,
          datasetDocumented: false,
          baselineImplemented: false,
          modelImplemented: false,
          evaluationMetrics: false,
          experimentComparison: false,
          errorAnalysis: false,
          reproducibleEnvironment: false,
          tests: false,
          readme: false,
          resultsDocumented: false,
          githubRepository: false,
          demo: false
        }
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowModal(false);
        setEditingProject(null);
        setFormData({
          name: '',
          problem: '',
          domain: 'MACHINE_LEARNING',
          dataset: '',
          model: '',
          framework: '',
          repository: '',
          demo: '',
          huggingFace: '',
          kaggle: '',
          status: 'IDEA',
          complexity: 'BEGINNER',
          startDate: '',
          endDate: '',
          dueDate: '',
          relatedSkills: [],
          relatedProjects: [],
          relatedExperiments: [],
          relatedContributions: [],
          relatedCommunityInteractions: [],
          relatedDatasets: [],
          notes: ''
        });
        loadProjects();
      }
    } catch (e) {
      console.error('Failed to save project:', e);
    }
  }

  function handleEdit(project) {
    setEditingProject(project);
    setFormData({
      name: project.name,
      problem: project.problem,
      domain: project.domain,
      dataset: project.dataset,
      model: project.model,
      framework: project.framework,
      repository: project.repository,
      demo: project.demo,
      huggingFace: project.huggingFace,
      kaggle: project.kaggle,
      status: project.status,
      complexity: project.complexity,
      startDate: project.startDate ? project.startDate.split('T')[0] : '',
      endDate: project.endDate ? project.endDate.split('T')[0] : '',
      dueDate: project.dueDate ? project.dueDate.split('T')[0] : '',
      relatedSkills: project.relatedSkills || [],
      relatedProjects: project.relatedProjects || [],
      relatedExperiments: project.relatedExperiments || [],
      relatedContributions: project.relatedContributions || [],
      relatedCommunityInteractions: project.relatedCommunityInteractions || [],
      relatedDatasets: project.relatedDatasets || [],
      notes: project.notes
    });
    setShowModal(true);
  }

  async function handleDelete(id) {
    if (!confirm('Delete this project?')) return;
    try {
      await fetch(`/api/gsoc/projects/${id}`, { method: 'DELETE' });
      loadProjects();
    } catch (e) {
      console.error('Failed to delete project:', e);
    }
  }

  const filteredProjects = filter === 'ALL' 
    ? projects 
    : projects.filter(p => p.domain === filter);

  const domainCounts = Object.keys(DOMAINS).reduce((acc, domain) => {
    acc[domain] = projects.filter(p => p.domain === domain).length;
    return acc;
  }, {});

  return (
    <AppShell>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>ML/AI Projects</h1>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Track machine learning projects with quality checklists and evidence
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
                All ({projects.length})
              </button>
              {Object.entries(DOMAINS).map(([key, label]) => (
                <button
                  key={key}
                  className={`btn btn-sm ${filter === key ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFilter(key)}
                >
                  {label} ({domainCounts[key] || 0})
                </button>
              ))}
            </div>
          </div>

          {/* Projects Grid */}
          {filteredProjects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🤖</div>
              <div className="empty-state-title">No ML projects tracked yet</div>
              <div className="empty-state-desc">Start by adding your first ML/AI project</div>
              <button 
                className="btn btn-primary btn-sm" 
                style={{ marginTop: 12 }}
                onClick={() => setShowModal(true)}
              >
                Add Project
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 12 }}>
              {filteredProjects.map(project => (
                <ProjectCard 
                  key={project._id} 
                  project={project} 
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
            onClick={() => { setShowModal(false); setEditingProject(null); }}
          />
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editingProject ? 'Update Project' : 'Add Project'}</div>
              <button 
                className="modal-close"
                onClick={() => { setShowModal(false); setEditingProject(null); }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="label">Project Name</label>
                <input
                  className="input"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Image Classification with CNN"
                  required
                />
              </div>

              <div className="form-group">
                <label className="label">Problem Statement</label>
                <textarea
                  className="input textarea"
                  value={formData.problem}
                  onChange={e => setFormData({...formData, problem: e.target.value})}
                  placeholder="What problem does this project solve?"
                  rows={2}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="label">Domain</label>
                  <select
                    className="input select"
                    value={formData.domain}
                    onChange={e => setFormData({...formData, domain: e.target.value})}
                  >
                    {Object.entries(DOMAINS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Complexity</label>
                  <select
                    className="input select"
                    value={formData.complexity}
                    onChange={e => setFormData({...formData, complexity: e.target.value})}
                  >
                    {Object.entries(COMPLEXITY).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="label">Model/Technique</label>
                  <input
                    className="input"
                    value={formData.model}
                    onChange={e => setFormData({...formData, model: e.target.value})}
                    placeholder="e.g., ResNet, BERT, Random Forest"
                  />
                </div>
                <div className="form-group">
                  <label className="label">Framework</label>
                  <input
                    className="input"
                    value={formData.framework}
                    onChange={e => setFormData({...formData, framework: e.target.value})}
                    placeholder="e.g., PyTorch, TensorFlow, scikit-learn"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="label">Dataset</label>
                <input
                  className="input"
                  value={formData.dataset}
                  onChange={e => setFormData({...formData, dataset: e.target.value})}
                  placeholder="e.g., CIFAR-10, Custom dataset"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="label">GitHub Repository</label>
                  <input
                    className="input"
                    value={formData.repository}
                    onChange={e => setFormData({...formData, repository: e.target.value})}
                    placeholder="https://github.com/..."
                  />
                </div>
                <div className="form-group">
                  <label className="label">Demo URL</label>
                  <input
                    className="input"
                    value={formData.demo}
                    onChange={e => setFormData({...formData, demo: e.target.value})}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="label">Hugging Face</label>
                  <input
                    className="input"
                    value={formData.huggingFace}
                    onChange={e => setFormData({...formData, huggingFace: e.target.value})}
                    placeholder="https://huggingface.co/..."
                  />
                </div>
                <div className="form-group">
                  <label className="label">Kaggle</label>
                  <input
                    className="input"
                    value={formData.kaggle}
                    onChange={e => setFormData({...formData, kaggle: e.target.value})}
                    placeholder="https://kaggle.com/..."
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
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="label">Start Date</label>
                  <input
                    className="input"
                    value={formData.startDate}
                    onChange={e => setFormData({...formData, startDate: e.target.value})}
                    type="date"
                  />
                </div>
                <div className="form-group">
                  <label className="label">End Date</label>
                  <input
                    className="input"
                    value={formData.endDate}
                    onChange={e => setFormData({...formData, endDate: e.target.value})}
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
                excludeIds={editingProject ? [editingProject._id] : []}
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
                  placeholder="Additional notes, challenges, results..."
                  rows={2}
                />
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => { setShowModal(false); setEditingProject(null); }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProject ? 'Update' : 'Add'} Project
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </AppShell>
  );
}