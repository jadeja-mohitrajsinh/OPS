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

const READINESS_LEVELS = {
  LEVEL_0: 'Not Started',
  LEVEL_1: 'Learning',
  LEVEL_2: 'Building Evidence',
  LEVEL_3: 'Open Source Engagement',
  LEVEL_4: 'Organization Ready',
  LEVEL_5: 'Proposal Ready',
  LEVEL_6: 'Submission Ready'
};

function ProgressBar({ value, color = 'var(--accent)' }) {
  return (
    <div className="progress-bar">
      <div 
        className="progress-fill" 
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }}
      />
    </div>
  );
}

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

function ReadinessCard({ title, value, items, color }) {
  return (
    <div className="card" style={{ padding: '16px' }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
        {title}
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, color: color || 'var(--text)', marginBottom: '8px' }}>
        {value}%
      </div>
      <ProgressBar value={value} color={color} />
      {items && (
        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {items.map((item, i) => (
            <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
              <span>{item.label}</span>
              <span style={{ fontWeight: 600 }}>{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function GSoCPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const gsocDate = new Date('2027-03-01');
  const gsocDays = Math.ceil((gsocDate - now) / 86400000);

  async function loadGSoCData() {
    try {
      const res = await fetch('/api/gsoc/dashboard');
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (e) {
      console.error('Failed to load GSoC data:', e);
    }
    setLoading(false);
  }

  useEffect(() => { loadGSoCData(); }, []);

  const goal = data?.goal || {};
  const stats = data?.stats || {};

  return (
    <AppShell>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 4 }}>
          GSoC 2027 · AI/ML + Python
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.1 }}>
          Proposal Readiness Tracker
        </h1>
        <div style={{ marginTop: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
          Application deadline in <strong style={{ color: gsocDays < 90 ? 'var(--orange)' : 'var(--text)' }}>{gsocDays} days</strong>
          {goal.currentReadinessLevel && (
            <span> · Current Level: <strong>{READINESS_LEVELS[goal.currentReadinessLevel]}</strong></span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading-state"><div className="spinner" /></div>
      ) : (
        <>
          {/* Readiness Overview */}
          <div style={{ marginBottom: 28 }}>
            <div className="section-label">PROPOSAL READINESS OVERVIEW</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
              <ReadinessCard 
                title="Technical Foundation" 
                value={goal.technicalReadiness || 0} 
                color="var(--blue)"
                items={[
                  { label: 'Skills Tracked', value: stats.skillsCount || 0 },
                  { label: 'Strong Evidence', value: stats.strongSkills || 0 }
                ]}
              />
              <ReadinessCard 
                title="Project Evidence" 
                value={goal.projectEvidence || 0} 
                color="var(--green)"
                items={[
                  { label: 'ML Projects', value: stats.projectsCount || 0 },
                  { label: 'Experiments', value: stats.experimentsCount || 0 }
                ]}
              />
              <ReadinessCard 
                title="Open Source" 
                value={goal.openSourceReadiness || 0} 
                color="var(--purple)"
                items={[
                  { label: 'Organizations', value: stats.organizationsCount || 0 },
                  { label: 'Contributions', value: stats.contributionsCount || 0 }
                ]}
              />
              <ReadinessCard 
                title="Organization Knowledge" 
                value={goal.organizationReadiness || 0} 
                color="var(--orange)"
                items={[
                  { label: 'Target Orgs', value: stats.targetOrganizations || 0 },
                  { label: 'Community Interactions', value: stats.communityInteractions || 0 }
                ]}
              />
              <ReadinessCard 
                title="Community" 
                value={goal.communityReadiness || 0} 
                color="var(--yellow)"
                items={[
                  { label: 'Discussions', value: stats.discussionsCount || 0 },
                  { label: 'Network Strength', value: stats.networkStrength || 'Low' }
                ]}
              />
              <ReadinessCard 
                title="Proposal" 
                value={goal.proposalReadiness || 0} 
                color="var(--red)"
                items={[
                  { label: 'Sections Complete', value: stats.proposalSections || 0 },
                  { label: 'Evidence Linked', value: stats.evidenceLinked || 0 }
                ]}
              />
            </div>
          </div>

          {/* Current Gate Status */}
          <div style={{ marginBottom: 28 }}>
            <div className="section-label">CURRENT TIMELINE GATE</div>
            <div className="card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>Gate {goal.currentGate || 'L1'}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    {goal.currentGate === 'L1' ? 'Foundation & Learning' :
                     goal.currentGate === 'L2' ? 'Building Evidence' :
                     goal.currentGate === 'L3' ? 'Open Source Engagement' :
                     goal.currentGate === 'L4' ? 'Organization Fit' : 'Proposal Finalization'}
                  </div>
                </div>
                <EvidenceBadge level={goal.overallEvidenceLevel || 'NONE'} />
              </div>
              <ProgressBar value={(goal.currentGate === 'L1' ? 20 : goal.currentGate === 'L2' ? 40 : goal.currentGate === 'L3' ? 60 : goal.currentGate === 'L4' ? 80 : 100)} />
            </div>
          </div>

          {/* Quick Navigation */}
          <div style={{ marginBottom: 28 }}>
            <div className="section-label">QUICK ACCESS</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {[
                { href: '/gsoc/skills', label: 'Technical Skills', sub: `${stats.skillsCount || 0} tracked`, color: 'var(--blue)' },
                { href: '/gsoc/projects', label: 'ML Projects', sub: `${stats.projectsCount || 0} projects`, color: 'var(--green)' },
                { href: '/gsoc/experiments', label: 'Experiments', sub: `${stats.experimentsCount || 0} documented`, color: 'var(--yellow)' },
                { href: '/gsoc/datasets', label: 'Datasets', sub: 'ML datasets', color: 'var(--cyan)' },
                { href: '/gsoc/organizations', label: 'Organizations', sub: `${stats.organizationsCount || 0} targets`, color: 'var(--purple)' },
                { href: '/gsoc/contributions', label: 'Contributions', sub: `${stats.contributionsCount || 0} submissions`, color: 'var(--orange)' },
                { href: '/gsoc/community', label: 'Community', sub: `${stats.communityInteractions || 0} interactions`, color: 'var(--pink)' },
                { href: '/gsoc/project-ideas', label: 'Project Ideas', sub: 'GSoC ideas', color: 'var(--indigo)' },
                { href: '/gsoc/proposals', label: 'Proposals', sub: `${stats.proposalsCount || 0} drafts`, color: 'var(--red)' },
                { href: '/gsoc/evidence', label: 'Evidence Matrix', sub: 'All requirements', color: 'var(--teal)' },
                { href: '/gsoc/timeline', label: 'Timeline', sub: 'Your journey', color: 'var(--lime)' },
                { href: '/gsoc/submission-readiness', label: 'Submission Ready', sub: 'Check status', color: 'var(--emerald)' },
              ].map(item => (
                <Link key={item.href} href={item.href}>
                  <div className="card card-hover" style={{ padding: '16px', cursor: 'pointer' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: item.color }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{item.sub}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Missing Evidence */}
          {data?.missingEvidence && data.missingEvidence.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div className="section-label" style={{ color: 'var(--orange)' }}>⚠️ MISSING EVIDENCE</div>
              <div className="card" style={{ padding: '16px' }}>
                {data.missingEvidence.slice(0, 5).map((item, i) => (
                  <div key={i} style={{ 
                    padding: '12px 0', 
                    borderBottom: i < data.missingEvidence.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    display: 'flex',
                    gap: 12,
                    alignItems: 'flex-start'
                  }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--orange)', minWidth: 60 }}>
                      {item.priority}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{item.category}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{item.description}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>{item.action}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Proof of Work */}
          <div style={{ marginBottom: 28 }}>
            <div className="section-label">PROOF OF WORK</div>
            <div className="card" style={{ padding: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>GitHub</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>{stats.githubRepos || 0}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>repositories</div>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Open Source</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>{stats.mergedPRs || 0}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>merged PRs</div>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>ML Projects</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>{stats.mlProjects || 0}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>completed</div>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Experiments</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>{stats.totalExperiments || 0}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>documented</div>
                </div>
              </div>
            </div>
          </div>

          {/* Add Quick Actions */}
          <div>
            <div className="section-label">QUICK ACTIONS</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Link href="/gsoc/skills?add=1">
                <button className="btn btn-secondary btn-sm">+ Add Skill</button>
              </Link>
              <Link href="/gsoc/projects?add=1">
                <button className="btn btn-secondary btn-sm">+ Add Project</button>
              </Link>
              <Link href="/gsoc/organizations?add=1">
                <button className="btn btn-secondary btn-sm">+ Add Organization</button>
              </Link>
              <Link href="/gsoc/contributions?add=1">
                <button className="btn btn-secondary btn-sm">+ Log Contribution</button>
              </Link>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}