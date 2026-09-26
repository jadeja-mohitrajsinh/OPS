'use client';
import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import Link from 'next/link';

const EVIDENCE_LEVELS = {
  NONE: { color: 'var(--text-muted)', bg: 'var(--surface-2)', label: 'None' },
  WEAK: { color: 'var(--red)', bg: 'var(--red-bg)', label: 'Weak' },
  BASIC: { color: 'var(--orange)', bg: 'var(--orange-bg)', label: 'Basic' },
  GOOD: { color: 'var(--yellow)', bg: 'var(--yellow-bg)', label: 'Good' },
  STRONG: { color: 'var(--green)', bg: 'var(--green-bg)', label: 'Strong' },
  EXCELLENT: { color: 'var(--blue)', bg: 'var(--blue-bg)', label: 'Excellent' }
};

const REQUIREMENTS = [
  {
    category: 'Technical Skills',
    items: [
      { id: 'python', name: 'Python', description: 'Core programming language for ML' },
      { id: 'numpy', name: 'NumPy', description: 'Numerical computing library' },
      { id: 'pandas', name: 'Pandas', description: 'Data manipulation library' },
      { id: 'mathematics', name: 'Mathematics', description: 'Linear algebra, calculus, statistics' },
      { id: 'statistics', name: 'Statistics', description: 'Probability, hypothesis testing' },
      { id: 'ml', name: 'Machine Learning', description: 'ML algorithms and concepts' },
      { id: 'sklearn', name: 'scikit-learn', description: 'ML framework' },
      { id: 'pytorch', name: 'PyTorch', description: 'Deep learning framework' },
      { id: 'deeplearning', name: 'Deep Learning', description: 'Neural networks, architectures' },
      { id: 'nlp', name: 'NLP', description: 'Natural language processing' },
      { id: 'cv', name: 'Computer Vision', description: 'Image processing, CNNs' },
      { id: 'llm', name: 'LLM/Generative AI', description: 'Large language models' },
      { id: 'git', name: 'Git/GitHub', description: 'Version control' },
      { id: 'testing', name: 'Testing', description: 'Unit testing, test-driven development' }
    ]
  },
  {
    category: 'Project Evidence',
    items: [
      { id: 'ml_projects', name: 'ML Projects', description: 'Completed ML projects' },
      { id: 'complexity', name: 'Project Complexity', description: 'Non-trivial, substantial projects' },
      { id: 'github_repos', name: 'Public Repositories', description: 'GitHub repositories with code' },
      { id: 'ml_demos', name: 'ML Demos', description: 'Deployed or demo-able models' },
      { id: 'experiments', name: 'Experiments', description: 'Documented ML experiments' },
      { id: 'model_implementations', name: 'Model Implementations', description: 'Implemented ML models' },
      { id: 'evaluations', name: 'Evaluations', description: 'Model evaluation and metrics' },
      { id: 'documentation', name: 'Documentation', description: 'Project documentation' },
      { id: 'reproducibility', name: 'Reproducibility', description: 'Reproducible experiments' }
    ]
  },
  {
    category: 'Open Source',
    items: [
      { id: 'issues_investigated', name: 'Issues Investigated', description: 'GitHub issues investigated' },
      { id: 'issues_discussed', name: 'Issues Discussed', description: 'Participated in issue discussions' },
      { id: 'prs_submitted', name: 'PRs Submitted', description: 'Pull requests submitted' },
      { id: 'prs_merged', name: 'PRs Merged', description: 'Pull requests merged' },
      { id: 'code_reviews', name: 'Code Reviews', description: 'Participated in code reviews' },
      { id: 'doc_contributions', name: 'Documentation Contributions', description: 'Documentation improvements' },
      { id: 'bug_fixes', name: 'Bug Fixes', description: 'Fixed bugs in open source' },
      { id: 'feature_contributions', name: 'Feature Contributions', description: 'Added new features' },
      { id: 'org_count', name: 'Organizations Contributed', description: 'Number of organizations contributed to' }
    ]
  },
  {
    category: 'Organization Knowledge',
    items: [
      { id: 'repo_explored', name: 'Repository Explored', description: 'Explored organization repositories' },
      { id: 'doc_read', name: 'Documentation Read', description: 'Read organization documentation' },
      { id: 'architecture_understood', name: 'Architecture Understood', description: 'Understood codebase architecture' },
      { id: 'issues_investigated_org', name: 'Issues Investigated', description: 'Investigated organization issues' },
      { id: 'contribution_made', name: 'Contribution Made', description: 'Made at least one contribution' },
      { id: 'community_joined', name: 'Community Joined', description: 'Joined community channels' },
      { id: 'discussions_participated', name: 'Discussions Participated', description: 'Participated in discussions' },
      { id: 'project_ideas_researched', name: 'Project Ideas Researched', description: 'Researched GSoC project ideas' },
      { id: 'mentor_interaction', name: 'Mentor Interaction', description: 'Interacted with mentors/community' },
      { id: 'potential_project', name: 'Potential Project Identified', description: 'Identified a potential GSoC project' }
    ]
  },
  {
    category: 'Community Interaction',
    items: [
      { id: 'github_interactions', name: 'GitHub Interactions', description: 'GitHub discussions and comments' },
      { id: 'discord_slack', name: 'Discord/Slack', description: 'Real-time community chat' },
      { id: 'mailing_list', name: 'Mailing List', description: 'Email list participation' },
      { id: 'forum', name: 'Forum', description: 'Forum discussions' },
      { id: 'community_meetings', name: 'Community Meetings', description: 'Attended community meetings' },
      { id: 'issue_discussions', name: 'Issue Discussions', description: 'Technical issue discussions' },
      { id: 'pr_reviews', name: 'PR Reviews', description: 'Participated in PR reviews' }
    ]
  },
  {
    category: 'Proposal',
    items: [
      { id: 'problem_understanding', name: 'Problem Understanding', description: 'Clear problem statement' },
      { id: 'technical_approach', name: 'Technical Approach', description: 'Detailed technical solution' },
      { id: 'deliverables', name: 'Deliverables', description: 'Clear deliverables defined' },
      { id: 'timeline', name: 'Timeline', description: 'Realistic project timeline' },
      { id: 'risks', name: 'Risks', description: 'Risks identified and mitigated' },
      { id: 'testing_strategy', name: 'Testing Strategy', description: 'Testing approach defined' },
      { id: 'community_feedback', name: 'Community Feedback', description: 'Feedback from community' }
    ]
  }
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

function RequirementRow({ requirement, evidence, onClick }) {
  const evidenceLevel = evidence?.level || 'NONE';
  const statusColor = evidenceLevel === 'STRONG' || evidenceLevel === 'EXCELLENT' ? 'var(--green)' :
                     evidenceLevel === 'GOOD' ? 'var(--yellow)' :
                     evidenceLevel === 'BASIC' ? 'var(--orange)' :
                     evidenceLevel === 'WEAK' ? 'var(--red)' : 'var(--text-muted)';

  return (
    <div 
      className="card card-hover"
      style={{ 
        padding: '12px 16px', 
        cursor: 'pointer',
        borderLeft: `3px solid ${statusColor}`
      }}
      onClick={() => onClick(requirement)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{requirement.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{requirement.description}</div>
          {evidence?.description && (
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
              Evidence: {evidence.description.substring(0, 60)}
              {evidence.description.length > 60 && '...'}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {evidence?.url && (
            <a 
              href={evidence.url} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{ fontSize: 12, color: 'var(--blue)' }}
            >
              🔗
            </a>
          )}
          <EvidenceBadge level={evidenceLevel} />
        </div>
      </div>
    </div>
  );
}

export default function EvidencePage() {
  const [evidenceData, setEvidenceData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedRequirement, setSelectedRequirement] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    level: 'NONE',
    description: '',
    url: '',
    notes: '',
    missingAction: ''
  });

  async function loadEvidenceData() {
    try {
      const res = await fetch('/api/gsoc/evidence');
      const json = await res.json();
      if (json.success) setEvidenceData(json.data || {});
    } catch (e) {
      console.error('Failed to load evidence data:', e);
    }
    setLoading(false);
  }

  useEffect(() => { loadEvidenceData(); }, []);

  function handleRequirementClick(requirement) {
    setSelectedRequirement(requirement);
    const evidence = evidenceData[requirement.id] || {};
    setFormData({
      level: evidence.level || 'NONE',
      description: evidence.description || '',
      url: evidence.url || '',
      notes: evidence.notes || '',
      missingAction: evidence.missingAction || ''
    });
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const payload = {
        requirementId: selectedRequirement.id,
        ...formData
      };

      const res = await fetch('/api/gsoc/evidence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowModal(false);
        setSelectedRequirement(null);
        loadEvidenceData();
      }
    } catch (e) {
      console.error('Failed to save evidence:', e);
    }
  }

  // Calculate overall stats
  const totalRequirements = REQUIREMENTS.reduce((acc, cat) => acc + cat.items.length, 0);
  const strongEvidence = Object.values(evidenceData).filter(e => 
    e.level === 'STRONG' || e.level === 'EXCELLENT'
  ).length;
  const someEvidence = Object.values(evidenceData).filter(e => 
    e.level !== 'NONE'
  ).length;
  const noEvidence = totalRequirements - someEvidence;

  return (
    <AppShell>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Evidence Matrix</h1>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Track evidence for all GSoC proposal requirements
        </div>
      </div>

      {loading ? (
        <div className="loading-state"><div className="spinner" /></div>
      ) : (
        <>
          {/* Overview Stats */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <div className="card" style={{ padding: '16px' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Total Requirements</div>
                <div style={{ fontSize: 28, fontWeight: 800 }}>{totalRequirements}</div>
              </div>
              <div className="card" style={{ padding: '16px' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Strong Evidence</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--green)' }}>{strongEvidence}</div>
              </div>
              <div className="card" style={{ padding: '16px' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Some Evidence</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--yellow)' }}>{someEvidence}</div>
              </div>
              <div className="card" style={{ padding: '16px' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>No Evidence</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--red)' }}>{noEvidence}</div>
              </div>
            </div>
          </div>

          {/* Requirements by Category */}
          {REQUIREMENTS.map(category => (
            <div key={category.category} style={{ marginBottom: 28 }}>
              <div className="section-label">{category.category.toUpperCase()}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {category.items.map(requirement => (
                  <RequirementRow 
                    key={requirement.id} 
                    requirement={requirement} 
                    evidence={evidenceData[requirement.id]}
                    onClick={handleRequirementClick}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Legend */}
          <div className="card" style={{ padding: '16px', marginTop: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Evidence Levels</div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {Object.entries(EVIDENCE_LEVELS).map(([key, config]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ 
                    width: 12, 
                    height: 12, 
                    borderRadius: '50%', 
                    background: config.bg,
                    border: `1px solid ${config.color}`
                  }} />
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{config.label}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Modal */}
      {showModal && selectedRequirement && (
        <>
          <div 
            className="modal-overlay" 
            onClick={() => { setShowModal(false); setSelectedRequirement(null); }}
          />
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{selectedRequirement.name}</div>
              <button 
                className="modal-close"
                onClick={() => { setShowModal(false); setSelectedRequirement(null); }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{selectedRequirement.description}</div>
              </div>

              <div className="form-group">
                <label className="label">Evidence Level</label>
                <select
                  className="input select"
                  value={formData.level}
                  onChange={e => setFormData({...formData, level: e.target.value})}
                >
                  {Object.entries(EVIDENCE_LEVELS).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="label">Evidence Description</label>
                <textarea
                  className="input textarea"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe the evidence you have for this requirement..."
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label className="label">Evidence URL</label>
                <input
                  className="input"
                  value={formData.url}
                  onChange={e => setFormData({...formData, url: e.target.value})}
                  placeholder="https://github.com/... or other proof"
                />
              </div>

              <div className="form-group">
                <label className="label">Notes</label>
                <textarea
                  className="input textarea"
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  placeholder="Additional context..."
                  rows={2}
                />
              </div>

              <div className="form-group">
                <label className="label">Missing Action (if no evidence)</label>
                <textarea
                  className="input textarea"
                  value={formData.missingAction}
                  onChange={e => setFormData({...formData, missingAction: e.target.value})}
                  placeholder="What action would satisfy this requirement?"
                  rows={2}
                />
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => { setShowModal(false); setSelectedRequirement(null); }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Evidence
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </AppShell>
  );
}
