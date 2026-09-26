'use client';
import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import EntitySearchPicker from '@/components/EntitySearchPicker';
import Link from 'next/link';

const STATUS = {
  PLANNED: 'Planned',
  RUNNING: 'Running',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
  ARCHIVED: 'Archived'
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

function ExperimentCard({ experiment, onUpdate, onDelete }) {
  const statusConfig = {
    COMPLETED: { color: 'var(--green)', bg: 'var(--green-bg)' },
    RUNNING: { color: 'var(--blue)', bg: 'var(--blue-bg)' },
    PLANNED: { color: 'var(--text-muted)', bg: 'var(--surface-2)' },
    FAILED: { color: 'var(--red)', bg: 'var(--red-bg)' },
    ARCHIVED: { color: 'var(--text-muted)', bg: 'var(--surface-2)' }
  }[experiment.status] || { color: 'var(--text-muted)', bg: 'var(--surface-2)' };

  return (
    <div className="card card-hover" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{experiment.experimentId}</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{experiment.hypothesis}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
            {experiment.project?.name || 'No Project'}
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
              {STATUS[experiment.status]}
            </span>
            {experiment.model && <span className="tag">{experiment.model}</span>}
            {experiment.dataset && <span className="tag">{experiment.dataset}</span>}
          </div>
        </div>
        <EvidenceBadge level={experiment.evidenceLevel} />
      </div>

      {/* Metrics */}
      {experiment.evaluation?.validationScore && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Evaluation</div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Val: </span>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{experiment.evaluation.validationScore}</span>
            </div>
            {experiment.evaluation.testScore && (
              <div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Test: </span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{experiment.evaluation.testScore}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Links */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
        {experiment.notebook && (
          <a href={experiment.notebook} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--blue)' }}>
            📓 Notebook
          </a>
        )}
        {experiment.gitCommit && (
          <a href={experiment.gitCommit} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--blue)' }}>
            🔗 Commit
          </a>
        )}
      </div>

      {experiment.conclusion && (
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
          <strong>Conclusion:</strong> {experiment.conclusion.substring(0, 100)}
          {experiment.conclusion.length > 100 && '...'}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          Gate: <strong>{experiment.currentGate}</strong>
          {experiment.startDate && ` · ${new Date(experiment.startDate).toLocaleDateString()}`}
          {experiment.dueDate && (
            <span style={{ color: new Date(experiment.dueDate) < new Date() ? 'var(--red)' : 'var(--text-muted)' }}>
              {` · Due: ${new Date(experiment.dueDate).toLocaleDateString()}`}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button 
            onClick={() => onUpdate(experiment)}
            className="btn btn-secondary btn-sm"
          >
            Update
          </button>
          <button 
            onClick={() => onDelete(experiment._id)}
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

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExperiment, setEditingExperiment] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [formData, setFormData] = useState({
    experimentId: '',
    project: '',
    hypothesis: '',
    dataset: '',
    model: '',
    parameters: '',
    training: { epochs: '', batchSize: '', learningRate: '', optimizer: '', lossFunction: '' },
    evaluation: { metrics: '', validationScore: '', testScore: '' },
    results: '',
    comparison: '',
    failure: '',
    conclusion: '',
    gitCommit: '',
    notebook: '',
    status: 'PLANNED',
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

  async function loadExperiments() {
    try {
      const res = await fetch('/api/gsoc/experiments');
      const json = await res.json();
      if (json.success) setExperiments(json.data);
    } catch (e) {
      console.error('Failed to load experiments:', e);
    }
    setLoading(false);
  }

  useEffect(() => { loadExperiments(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const url = editingExperiment ? `/api/gsoc/experiments/${editingExperiment._id}` : '/api/gsoc/experiments';
      const method = editingExperiment ? 'PUT' : 'POST';
      
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
        parameters: formData.parameters ? JSON.parse(formData.parameters) : {},
        evaluation: {
          ...formData.evaluation,
          metrics: formData.evaluation.metrics ? JSON.parse(formData.evaluation.metrics) : {},
          validationScore: formData.evaluation.validationScore ? parseFloat(formData.evaluation.validationScore) : 0,
          testScore: formData.evaluation.testScore ? parseFloat(formData.evaluation.testScore) : 0
        },
        training: {
          epochs: formData.training.epochs ? parseInt(formData.training.epochs) : 0,
          batchSize: formData.training.batchSize ? parseInt(formData.training.batchSize) : 0,
          learningRate: formData.training.learningRate ? parseFloat(formData.training.learningRate) : 0,
          optimizer: formData.training.optimizer,
          lossFunction: formData.training.lossFunction
        }
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowModal(false);
        setEditingExperiment(null);
        setFormData({
          experimentId: '',
          project: '',
          hypothesis: '',
          dataset: '',
          model: '',
          parameters: '',
          training: { epochs: '', batchSize: '', learningRate: '', optimizer: '', lossFunction: '' },
          evaluation: { metrics: '', validationScore: '', testScore: '' },
          results: '',
          comparison: '',
          failure: '',
          conclusion: '',
          gitCommit: '',
          notebook: '',
          status: 'PLANNED',
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
        loadExperiments();
      }
    } catch (e) {
      console.error('Failed to save experiment:', e);
    }
  }

  function handleEdit(experiment) {
    setEditingExperiment(experiment);
    setFormData({
      experimentId: experiment.experimentId || '',
      project: experiment.project?._id || experiment.project || '',
      hypothesis: experiment.hypothesis || '',
      dataset: experiment.dataset || '',
      model: experiment.model || '',
      parameters: experiment.parameters ? JSON.stringify(experiment.parameters, null, 2) : '',
      training: {
        epochs: experiment.training?.epochs || '',
        batchSize: experiment.training?.batchSize || '',
        learningRate: experiment.training?.learningRate || '',
        optimizer: experiment.training?.optimizer || '',
        lossFunction: experiment.training?.lossFunction || ''
      },
      evaluation: {
        metrics: experiment.evaluation?.metrics ? JSON.stringify(experiment.evaluation.metrics, null, 2) : '',
        validationScore: experiment.evaluation?.validationScore || '',
        testScore: experiment.evaluation?.testScore || ''
      },
      results: experiment.results || '',
      comparison: experiment.comparison || '',
      failure: experiment.failure || '',
      conclusion: experiment.conclusion || '',
      gitCommit: experiment.gitCommit || '',
      notebook: experiment.notebook || '',
      status: experiment.status,
      startDate: experiment.startDate ? experiment.startDate.split('T')[0] : '',
      endDate: experiment.endDate ? experiment.endDate.split('T')[0] : '',
      dueDate: experiment.dueDate ? experiment.dueDate.split('T')[0] : '',
      relatedSkills: experiment.relatedSkills || [],
      relatedProjects: experiment.relatedProjects || [],
      relatedExperiments: experiment.relatedExperiments || [],
      relatedContributions: experiment.relatedContributions || [],
      relatedCommunityInteractions: experiment.relatedCommunityInteractions || [],
      relatedDatasets: experiment.relatedDatasets || [],
      notes: experiment.notes || ''
    });
    setShowModal(true);
  }

  async function handleDelete(id) {
    if (!confirm('Delete this experiment?')) return;
    try {
      await fetch(`/api/gsoc/experiments/${id}`, { method: 'DELETE' });
      loadExperiments();
    } catch (e) {
      console.error('Failed to delete experiment:', e);
    }
  }

  const filteredExperiments = filter === 'ALL' 
    ? experiments 
    : experiments.filter(e => e.status === filter);

  const statusCounts = Object.keys(STATUS).reduce((acc, status) => {
    acc[status] = experiments.filter(e => e.status === status).length;
    return acc;
  }, {});

  const completedCount = experiments.filter(e => e.status === 'COMPLETED').length;

  return (
    <AppShell>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>ML Experiments</h1>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Track hypotheses, configurations, and results for reproducible ML research
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
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>{experiments.length}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Experiments</div>
              </div>
              <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--green)' }}>{completedCount}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Completed</div>
              </div>
              <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--blue)' }}>{statusCounts.RUNNING || 0}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Running</div>
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
                All ({experiments.length})
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

          {/* Experiments Grid */}
          {filteredExperiments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🧪</div>
              <div className="empty-state-title">No experiments tracked yet</div>
              <div className="empty-state-desc">Start by logging your first ML experiment</div>
              <button 
                className="btn btn-primary btn-sm" 
                style={{ marginTop: 12 }}
                onClick={() => setShowModal(true)}
              >
                Add Experiment
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 12 }}>
              {filteredExperiments.map(experiment => (
                <ExperimentCard 
                  key={experiment._id} 
                  experiment={experiment} 
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
            onClick={() => { setShowModal(false); setEditingExperiment(null); }}
          />
          <div className="modal" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <div className="modal-title">{editingExperiment ? 'Update Experiment' : 'Add Experiment'}</div>
              <button 
                className="modal-close"
                onClick={() => { setShowModal(false); setEditingExperiment(null); }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="label">Experiment ID</label>
                  <input
                    className="input"
                    value={formData.experimentId}
                    onChange={e => setFormData({...formData, experimentId: e.target.value})}
                    placeholder="e.g., EXP-001"
                    required
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
              </div>

              <div className="form-group">
                <label className="label">Hypothesis</label>
                <textarea
                  className="input textarea"
                  value={formData.hypothesis}
                  onChange={e => setFormData({...formData, hypothesis: e.target.value})}
                  placeholder="What are you testing?"
                  rows={2}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="label">Dataset</label>
                  <input
                    className="input"
                    value={formData.dataset}
                    onChange={e => setFormData({...formData, dataset: e.target.value})}
                    placeholder="e.g., CIFAR-10"
                  />
                </div>
                <div className="form-group">
                  <label className="label">Model</label>
                  <input
                    className="input"
                    value={formData.model}
                    onChange={e => setFormData({...formData, model: e.target.value})}
                    placeholder="e.g., ResNet-50"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="label">Parameters (JSON)</label>
                <textarea
                  className="input textarea"
                  value={formData.parameters}
                  onChange={e => setFormData({...formData, parameters: e.target.value})}
                  placeholder='{"learning_rate": 0.001, "batch_size": 32}'
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="label">Epochs</label>
                  <input
                    className="input"
                    value={formData.training.epochs}
                    onChange={e => setFormData({...formData, training: {...formData.training, epochs: e.target.value}})}
                    type="number"
                  />
                </div>
                <div className="form-group">
                  <label className="label">Batch Size</label>
                  <input
                    className="input"
                    value={formData.training.batchSize}
                    onChange={e => setFormData({...formData, training: {...formData.training, batchSize: e.target.value}})}
                    type="number"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="label">Learning Rate</label>
                  <input
                    className="input"
                    value={formData.training.learningRate}
                    onChange={e => setFormData({...formData, training: {...formData.training, learningRate: e.target.value}})}
                    type="number"
                    step="0.0001"
                  />
                </div>
                <div className="form-group">
                  <label className="label">Optimizer</label>
                  <input
                    className="input"
                    value={formData.training.optimizer}
                    onChange={e => setFormData({...formData, training: {...formData.training, optimizer: e.target.value}})}
                    placeholder="e.g., Adam"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="label">Validation Score</label>
                  <input
                    className="input"
                    value={formData.evaluation.validationScore}
                    onChange={e => setFormData({...formData, evaluation: {...formData.evaluation, validationScore: e.target.value}})}
                    type="number"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label className="label">Test Score</label>
                  <input
                    className="input"
                    value={formData.evaluation.testScore}
                    onChange={e => setFormData({...formData, evaluation: {...formData.evaluation, testScore: e.target.value}})}
                    type="number"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="label">Conclusion</label>
                <textarea
                  className="input textarea"
                  value={formData.conclusion}
                  onChange={e => setFormData({...formData, conclusion: e.target.value})}
                  placeholder="What did you learn?"
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="label">Notebook URL</label>
                  <input
                    className="input"
                    value={formData.notebook}
                    onChange={e => setFormData({...formData, notebook: e.target.value})}
                    placeholder="https://..."
                  />
                </div>
                <div className="form-group">
                  <label className="label">Git Commit</label>
                  <input
                    className="input"
                    value={formData.gitCommit}
                    onChange={e => setFormData({...formData, gitCommit: e.target.value})}
                    placeholder="https://github.com/..."
                  />
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
              />

              <EntitySearchPicker
                label="Related Experiments"
                value={formData.relatedExperiments}
                onChange={(ids) => setFormData({...formData, relatedExperiments: ids})}
                allowedTypes={['EXPERIMENT']}
                placeholder="Search experiments..."
                excludeIds={editingExperiment ? [editingExperiment._id] : []}
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
                  placeholder="Additional notes..."
                  rows={2}
                />
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => { setShowModal(false); setEditingExperiment(null); }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingExperiment ? 'Update' : 'Add'} Experiment
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </AppShell>
  );
}
