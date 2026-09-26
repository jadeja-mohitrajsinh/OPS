'use client';
import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import EntitySearchPicker from '@/components/EntitySearchPicker';
import Link from 'next/link';

const DOMAINS = {
  COMPUTER_VISION: 'Computer Vision',
  NLP: 'NLP',
  TABULAR: 'Tabular',
  AUDIO: 'Audio',
  VIDEO: 'Video',
  TIME_SERIES: 'Time Series',
  GRAPH: 'Graph',
  RECOMMENDATION: 'Recommendation',
  OTHER: 'Other'
};

const STATUS = {
  DISCOVERED: 'Discovered',
  DOWNLOADED: 'Downloaded',
  EXPLORING: 'Exploring',
  READY: 'Ready',
  IN_USE: 'In Use',
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

function DatasetCard({ dataset, onUpdate, onDelete }) {
  const checklist = dataset.qualityChecklist || {};
  const completedItems = Object.values(checklist).filter(Boolean).length;
  const totalItems = Object.keys(checklist).length;
  const qualityPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className="card card-hover" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{dataset.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
            {dataset.description && dataset.description.substring(0, 80)}
            {dataset.description && dataset.description.length > 80 && '...'}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className="tag">{DOMAINS[dataset.domain]}</span>
            <span className="tag">{STATUS[dataset.status]}</span>
            {dataset.format && <span className="tag">{dataset.format}</span>}
          </div>
        </div>
        <EvidenceBadge level={dataset.evidenceLevel} />
      </div>

      {/* Quality Checklist Progress */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Quality Checklist</span>
          <span style={{ fontSize: 11, fontWeight: 600 }}>{completedItems}/{totalItems}</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${qualityPercent}%`, background: qualityPercent >= 80 ? 'var(--green)' : qualityPercent >= 50 ? 'var(--yellow)' : 'var(--orange)' }}
          />
        </div>
      </div>

      {/* Size Info */}
      {dataset.size && (dataset.size.samples > 0 || dataset.size.sizeMB > 0) && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Dataset Size</div>
          <div style={{ display: 'flex', gap: 16 }}>
            {dataset.size.samples > 0 && (
              <div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Samples: </span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{dataset.size.samples.toLocaleString()}</span>
              </div>
            )}
            {dataset.size.sizeMB > 0 && (
              <div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Size: </span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{dataset.size.sizeMB} MB</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Links */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
        {dataset.url && (
          <a href={dataset.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--blue)' }}>
            🔗 Source
          </a>
        )}
        {dataset.huggingFaceUrl && (
          <a href={dataset.huggingFaceUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--blue)' }}>
            🤗 Hugging Face
          </a>
        )}
        {dataset.kaggleUrl && (
          <a href={dataset.kaggleUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--blue)' }}>
            📊 Kaggle
          </a>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          Gate: <strong>{dataset.currentGate}</strong>
          {dataset.relatedProjects?.length > 0 && ` · ${dataset.relatedProjects.length} projects`}
          {dataset.dueDate && (
            <span style={{ color: new Date(dataset.dueDate) < new Date() ? 'var(--red)' : 'var(--text-muted)' }}>
              {` · Due: ${new Date(dataset.dueDate).toLocaleDateString()}`}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button 
            onClick={() => onUpdate(dataset)}
            className="btn btn-secondary btn-sm"
          >
            Update
          </button>
          <button 
            onClick={() => onDelete(dataset._id)}
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

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDataset, setEditingDataset] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    domain: 'TABULAR',
    source: '',
    url: '',
    huggingFaceUrl: '',
    kaggleUrl: '',
    size: { samples: '', features: '', sizeMB: '' },
    format: '',
    license: '',
    task: '',
    documentation: '',
    preprocessing: '',
    status: 'DISCOVERED',
    dueDate: '',
    relatedSkills: [],
    relatedProjects: [],
    relatedExperiments: [],
    relatedContributions: [],
    relatedCommunityInteractions: [],
    relatedDatasets: [],
    notes: ''
  });

  async function loadDatasets() {
    try {
      const res = await fetch('/api/gsoc/datasets');
      const json = await res.json();
      if (json.success) setDatasets(json.data);
    } catch (e) {
      console.error('Failed to load datasets:', e);
    }
    setLoading(false);
  }

  useEffect(() => { loadDatasets(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const url = editingDataset ? `/api/gsoc/datasets/${editingDataset._id}` : '/api/gsoc/datasets';
      const method = editingDataset ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
        relatedSkills: formData.relatedSkills || [],
        relatedProjects: formData.relatedProjects || [],
        relatedExperiments: formData.relatedExperiments || [],
        relatedContributions: formData.relatedContributions || [],
        relatedCommunityInteractions: formData.relatedCommunityInteractions || [],
        relatedDatasets: formData.relatedDatasets || [],
        size: {
          samples: formData.size.samples ? parseInt(formData.size.samples) : 0,
          features: formData.size.features ? parseInt(formData.size.features) : 0,
          sizeMB: formData.size.sizeMB ? parseFloat(formData.size.sizeMB) : 0
        },
        task: formData.task ? formData.task.split(',').map(s => s.trim()) : [],
        qualityChecklist: {
          documented: false,
          downloaded: false,
          explored: false,
          cleaned: false,
          preprocessed: false,
          validated: false,
          versionControlled: false
        }
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowModal(false);
        setEditingDataset(null);
        setFormData({
          name: '',
          description: '',
          domain: 'TABULAR',
          source: '',
          url: '',
          huggingFaceUrl: '',
          kaggleUrl: '',
          size: { samples: '', features: '', sizeMB: '' },
          format: '',
          license: '',
          task: '',
          documentation: '',
          preprocessing: '',
          status: 'DISCOVERED',
          dueDate: '',
          relatedSkills: [],
          relatedProjects: [],
          relatedExperiments: [],
          relatedContributions: [],
          relatedCommunityInteractions: [],
          relatedDatasets: [],
          notes: ''
        });
        loadDatasets();
      }
    } catch (e) {
      console.error('Failed to save dataset:', e);
    }
  }

  function handleEdit(dataset) {
    setEditingDataset(dataset);
    setFormData({
      name: dataset.name,
      description: dataset.description || '',
      domain: dataset.domain,
      source: dataset.source || '',
      url: dataset.url || '',
      huggingFaceUrl: dataset.huggingFaceUrl || '',
      kaggleUrl: dataset.kaggleUrl || '',
      size: {
        samples: dataset.size?.samples || '',
        features: dataset.size?.features || '',
        sizeMB: dataset.size?.sizeMB || ''
      },
      format: dataset.format || '',
      license: dataset.license || '',
      task: dataset.task?.join(', ') || '',
      documentation: dataset.documentation || '',
      preprocessing: dataset.preprocessing || '',
      status: dataset.status,
      dueDate: dataset.dueDate ? dataset.dueDate.split('T')[0] : '',
      relatedSkills: dataset.relatedSkills || [],
      relatedProjects: dataset.relatedProjects || [],
      relatedExperiments: dataset.relatedExperiments || [],
      relatedContributions: dataset.relatedContributions || [],
      relatedCommunityInteractions: dataset.relatedCommunityInteractions || [],
      relatedDatasets: dataset.relatedDatasets || [],
      notes: dataset.notes || ''
    });
    setShowModal(true);
  }

  async function handleDelete(id) {
    if (!confirm('Delete this dataset?')) return;
    try {
      await fetch(`/api/gsoc/datasets/${id}`, { method: 'DELETE' });
      loadDatasets();
    } catch (e) {
      console.error('Failed to delete dataset:', e);
    }
  }

  const filteredDatasets = filter === 'ALL' 
    ? datasets 
    : datasets.filter(d => d.domain === filter);

  const domainCounts = Object.keys(DOMAINS).reduce((acc, domain) => {
    acc[domain] = datasets.filter(d => d.domain === domain).length;
    return acc;
  }, {});

  return (
    <AppShell>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>ML Datasets</h1>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Track datasets with quality checklists and preprocessing documentation
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
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>{datasets.length}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Datasets</div>
              </div>
              <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--green)' }}>{datasets.filter(d => d.status === 'READY' || d.status === 'IN_USE').length}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Ready to Use</div>
              </div>
              <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--blue)' }}>{datasets.reduce((acc, d) => acc + (d.size?.samples || 0), 0).toLocaleString()}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Samples</div>
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
                All ({datasets.length})
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

          {/* Datasets Grid */}
          {filteredDatasets.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📊</div>
              <div className="empty-state-title">No datasets tracked yet</div>
              <div className="empty-state-desc">Start by adding your first ML dataset</div>
              <button 
                className="btn btn-primary btn-sm" 
                style={{ marginTop: 12 }}
                onClick={() => setShowModal(true)}
              >
                Add Dataset
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 12 }}>
              {filteredDatasets.map(dataset => (
                <DatasetCard 
                  key={dataset._id} 
                  dataset={dataset} 
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
            onClick={() => { setShowModal(false); setEditingDataset(null); }}
          />
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editingDataset ? 'Update Dataset' : 'Add Dataset'}</div>
              <button 
                className="modal-close"
                onClick={() => { setShowModal(false); setEditingDataset(null); }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="label">Dataset Name</label>
                <input
                  className="input"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., CIFAR-10, ImageNet"
                  required
                />
              </div>

              <div className="form-group">
                <label className="label">Description</label>
                <textarea
                  className="input textarea"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="What is this dataset used for?"
                  rows={2}
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
                <label className="label">Source</label>
                <input
                  className="input"
                  value={formData.source}
                  onChange={e => setFormData({...formData, source: e.target.value})}
                  placeholder="e.g., Kaggle, Hugging Face, Custom"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="label">URL</label>
                  <input
                    className="input"
                    value={formData.url}
                    onChange={e => setFormData({...formData, url: e.target.value})}
                    placeholder="https://..."
                  />
                </div>
                <div className="form-group">
                  <label className="label">Format</label>
                  <input
                    className="input"
                    value={formData.format}
                    onChange={e => setFormData({...formData, format: e.target.value})}
                    placeholder="e.g., CSV, JSON, TFRecord"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="label">Hugging Face URL</label>
                  <input
                    className="input"
                    value={formData.huggingFaceUrl}
                    onChange={e => setFormData({...formData, huggingFaceUrl: e.target.value})}
                    placeholder="https://huggingface.co/..."
                  />
                </div>
                <div className="form-group">
                  <label className="label">Kaggle URL</label>
                  <input
                    className="input"
                    value={formData.kaggleUrl}
                    onChange={e => setFormData({...formData, kaggleUrl: e.target.value})}
                    placeholder="https://kaggle.com/..."
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="label">Samples</label>
                  <input
                    className="input"
                    value={formData.size.samples}
                    onChange={e => setFormData({...formData, size: {...formData.size, samples: e.target.value}})}
                    type="number"
                  />
                </div>
                <div className="form-group">
                  <label className="label">Features</label>
                  <input
                    className="input"
                    value={formData.size.features}
                    onChange={e => setFormData({...formData, size: {...formData.size, features: e.target.value}})}
                    type="number"
                  />
                </div>
                <div className="form-group">
                  <label className="label">Size (MB)</label>
                  <input
                    className="input"
                    value={formData.size.sizeMB}
                    onChange={e => setFormData({...formData, size: {...formData.size, sizeMB: e.target.value}})}
                    type="number"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="label">License</label>
                  <input
                    className="input"
                    value={formData.license}
                    onChange={e => setFormData({...formData, license: e.target.value})}
                    placeholder="e.g., MIT, Apache 2.0"
                  />
                </div>
                <div className="form-group">
                  <label className="label">Tasks (comma-separated)</label>
                  <input
                    className="input"
                    value={formData.task}
                    onChange={e => setFormData({...formData, task: e.target.value})}
                    placeholder="e.g., classification, detection"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="label">Documentation</label>
                <textarea
                  className="input textarea"
                  value={formData.documentation}
                  onChange={e => setFormData({...formData, documentation: e.target.value})}
                  placeholder="Documentation about the dataset structure..."
                  rows={2}
                />
              </div>

              <div className="form-group">
                <label className="label">Preprocessing</label>
                <textarea
                  className="input textarea"
                  value={formData.preprocessing}
                  onChange={e => setFormData({...formData, preprocessing: e.target.value})}
                  placeholder="Preprocessing steps applied..."
                  rows={2}
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
                excludeIds={editingDataset ? [editingDataset._id] : []}
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
                  onClick={() => { setShowModal(false); setEditingDataset(null); }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingDataset ? 'Update' : 'Add'} Dataset
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </AppShell>
  );
}
