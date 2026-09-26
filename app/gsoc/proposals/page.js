'use client';
import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import Link from 'next/link';

const SECTION_STATUS = {
  DRAFT: 'Draft',
  REVIEW: 'Review',
  COMPLETE: 'Complete'
};

const EVIDENCE_LEVELS = {
  NONE: { color: 'var(--text-muted)', bg: 'var(--surface-2)', label: 'None' },
  WEAK: { color: 'var(--red)', bg: 'var(--red-bg)', label: 'Weak' },
  BASIC: { color: 'var(--orange)', bg: 'var(--orange-bg)', label: 'Basic' },
  GOOD: { color: 'var(--yellow)', bg: 'var(--yellow-bg)', label: 'Good' },
  STRONG: { color: 'var(--green)', bg: 'var(--green-bg)', label: 'Strong' },
  EXCELLENT: { color: 'var(--blue)', bg: 'var(--blue-bg)', label: 'Excellent' }
};

const PROPOSAL_SECTIONS = [
  { id: 'title', name: 'Title', required: true },
  { id: 'abstract', name: 'Abstract', required: true },
  { id: 'aboutMe', name: 'About Me', required: true },
  { id: 'motivation', name: 'Motivation', required: true },
  { id: 'problemStatement', name: 'Problem Statement', required: true },
  { id: 'existingSystem', name: 'Existing System', required: true },
  { id: 'proposedSolution', name: 'Proposed Solution', required: true },
  { id: 'technicalApproach', name: 'Technical Approach', required: true },
  { id: 'architecture', name: 'Architecture', required: false },
  { id: 'deliverables', name: 'Deliverables', required: true },
  { id: 'milestones', name: 'Milestones', required: true },
  { id: 'timeline', name: 'Timeline', required: true },
  { id: 'testing', name: 'Testing', required: true },
  { id: 'risks', name: 'Risks', required: true },
  { id: 'communityInteraction', name: 'Community Interaction', required: true },
  { id: 'relatedContributions', name: 'Related Contributions', required: true },
  { id: 'priorExperience', name: 'Prior Experience', required: true },
  { id: 'references', name: 'References', required: false }
];

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

function ProposalCard({ proposal, onUpdate, onDelete }) {
  const completedSections = proposal.sections?.filter(s => s.status === 'COMPLETE').length || 0;
  const totalSections = proposal.sections?.length || 0;
  const completionPercent = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;

  return (
    <div className="card card-hover" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{proposal.title || 'Untitled Proposal'}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
            {proposal.organization?.name || 'No Organization'}
            {proposal.projectIdea?.title && ` · ${proposal.projectIdea.title}`}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: completionPercent >= 80 ? 'var(--green)' : completionPercent >= 50 ? 'var(--yellow)' : 'var(--orange)' }}>
            {completionPercent}%
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Complete</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: 12 }}>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${completionPercent}%`, background: completionPercent >= 80 ? 'var(--green)' : completionPercent >= 50 ? 'var(--yellow)' : 'var(--orange)' }}
          />
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
          {completedSections}/{totalSections} sections complete
        </div>
      </div>

      {/* Section Status */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Key Sections</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['problemStatement', 'technicalApproach', 'deliverables', 'timeline', 'testing'].map(sectionId => {
            const section = proposal.sections?.find(s => s.id === sectionId);
            const status = section?.status || 'DRAFT';
            const statusConfig = {
              COMPLETE: { color: 'var(--green)', bg: 'var(--green-bg)' },
              REVIEW: { color: 'var(--yellow)', bg: 'var(--yellow-bg)' },
              DRAFT: { color: 'var(--text-muted)', bg: 'var(--surface-2)' }
            }[status];
            return (
              <span 
                key={sectionId}
                style={{ 
                  fontSize: 10, 
                  fontWeight: 600, 
                  padding: '2px 6px', 
                  borderRadius: 'var(--r-full)', 
                  background: statusConfig.bg, 
                  color: statusConfig.color 
                }}
              >
                {PROPOSAL_SECTIONS.find(s => s.id === sectionId)?.name?.substring(0, 3)}: {SECTION_STATUS[status]}
              </span>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {proposal.evidenceLinks?.length || 0} evidence links
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button 
            onClick={() => onUpdate(proposal)}
            className="btn btn-secondary btn-sm"
          >
            Edit
          </button>
          <button 
            onClick={() => onDelete(proposal._id)}
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

export default function ProposalsPage() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProposal, setEditingProposal] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    organization: '',
    projectIdea: '',
    sections: PROPOSAL_SECTIONS.map(s => ({
      id: s.id,
      name: s.name,
      content: '',
      status: 'DRAFT',
      evidenceLinks: []
    }))
  });

  async function loadProposals() {
    try {
      const res = await fetch('/api/gsoc/proposals');
      const json = await res.json();
      if (json.success) setProposals(json.data);
    } catch (e) {
      console.error('Failed to load proposals:', e);
    }
    setLoading(false);
  }

  useEffect(() => { loadProposals(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const url = editingProposal ? `/api/gsoc/proposals/${editingProposal._id}` : '/api/gsoc/proposals';
      const method = editingProposal ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setShowModal(false);
        setEditingProposal(null);
        setFormData({
          title: '',
          organization: '',
          projectIdea: '',
          sections: PROPOSAL_SECTIONS.map(s => ({
            id: s.id,
            name: s.name,
            content: '',
            status: 'DRAFT',
            evidenceLinks: []
          }))
        });
        loadProposals();
      }
    } catch (e) {
      console.error('Failed to save proposal:', e);
    }
  }

  function handleEdit(proposal) {
    setEditingProposal(proposal);
    setFormData({
      title: proposal.title || '',
      organization: proposal.organization?._id || proposal.organization || '',
      projectIdea: proposal.projectIdea?._id || proposal.projectIdea || '',
      sections: proposal.sections || PROPOSAL_SECTIONS.map(s => ({
        id: s.id,
        name: s.name,
        content: '',
        status: 'DRAFT',
        evidenceLinks: []
      }))
    });
    setShowModal(true);
  }

  async function handleDelete(id) {
    if (!confirm('Delete this proposal?')) return;
    try {
      await fetch(`/api/gsoc/proposals/${id}`, { method: 'DELETE' });
      loadProposals();
    } catch (e) {
      console.error('Failed to delete proposal:', e);
    }
  }

  function updateSection(sectionId, field, value) {
    setFormData({
      ...formData,
      sections: formData.sections.map(s => 
        s.id === sectionId ? { ...s, [field]: value } : s
      )
    });
  }

  return (
    <AppShell>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>GSoC Proposals</h1>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Draft and manage GSoC proposals with evidence linking
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
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>{proposals.length}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Proposals</div>
              </div>
              {proposals.length > 0 && (() => {
                const avgCompletion = Math.round(
                  proposals.reduce((acc, p) => {
                    const completed = p.sections?.filter(s => s.status === 'COMPLETE').length || 0;
                    const total = p.sections?.length || 1;
                    return acc + (completed / total) * 100;
                  }, 0) / proposals.length
                );
                return (
                  <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: avgCompletion >= 80 ? 'var(--green)' : 'var(--text)' }}>{avgCompletion}%</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Avg Completion</div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Proposals Grid */}
          {proposals.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <div className="empty-state-title">No proposals drafted yet</div>
              <div className="empty-state-desc">Start by creating your first GSoC proposal draft</div>
              <button 
                className="btn btn-primary btn-sm" 
                style={{ marginTop: 12 }}
                onClick={() => setShowModal(true)}
              >
                Create Proposal
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 12 }}>
              {proposals.map(proposal => (
                <ProposalCard 
                  key={proposal._id} 
                  proposal={proposal} 
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
            onClick={() => { setShowModal(false); setEditingProposal(null); setSelectedSection(null); }}
          />
          <div className="modal" style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <div className="modal-title">{editingProposal ? 'Edit Proposal' : 'Create Proposal'}</div>
              <button 
                className="modal-close"
                onClick={() => { setShowModal(false); setEditingProposal(null); setSelectedSection(null); }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="label">Proposal Title</label>
                <input
                  className="input"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Improving PyTorch DataLoader Performance"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="label">Organization</label>
                  <input
                    className="input"
                    value={formData.organization}
                    onChange={e => setFormData({...formData, organization: e.target.value})}
                    placeholder="Organization ID or name"
                  />
                </div>
                <div className="form-group">
                  <label className="label">Project Idea</label>
                  <input
                    className="input"
                    value={formData.projectIdea}
                    onChange={e => setFormData({...formData, projectIdea: e.target.value})}
                    placeholder="Project Idea ID"
                  />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div className="section-label">PROPOSAL SECTIONS</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {formData.sections.map(section => (
                    <div key={section.id} className="card" style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>
                          {section.name}
                          {PROPOSAL_SECTIONS.find(s => s.id === section.id)?.required && (
                            <span style={{ color: 'var(--red)', marginLeft: 4 }}>*</span>
                          )}
                        </div>
                        <select
                          className="input select"
                          style={{ fontSize: 11, padding: '4px 8px' }}
                          value={section.status}
                          onChange={(e) => updateSection(section.id, 'status', e.target.value)}
                        >
                          {Object.entries(SECTION_STATUS).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>
                      </div>
                      <textarea
                        className="input textarea"
                        value={section.content}
                        onChange={(e) => updateSection(section.id, 'content', e.target.value)}
                        placeholder={`Write your ${section.name.toLowerCase()} here...`}
                        rows={section.id === 'technicalApproach' || section.id === 'timeline' ? 6 : 3}
                      />
                      <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>
                        {section.evidenceLinks?.length || 0} evidence links
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => { setShowModal(false); setEditingProposal(null); setSelectedSection(null); }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProposal ? 'Update' : 'Create'} Proposal
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </AppShell>
  );
}
