'use client';
import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import Link from 'next/link';

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

export default function SubmissionReadinessPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      const res = await fetch('/api/gsoc/dashboard');
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (e) {
      console.error('Failed to load data:', e);
    }
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  const goal = data?.goal || {};
  const stats = data?.stats || {};
  const missingEvidence = data?.missingEvidence || [];

  // Determine overall submission readiness
  const readinessScore = (
    (goal.technicalReadiness || 0) +
    (goal.projectEvidence || 0) +
    (goal.openSourceReadiness || 0) +
    (goal.organizationReadiness || 0) +
    (goal.communityReadiness || 0) +
    (goal.proposalReadiness || 0)
  ) / 6;

  const canSubmit = readinessScore >= 75 && 
                   (stats.mergedPRs || 0) >= 2 &&
                   (stats.completedProjects || 0) >= 2 &&
                   (stats.proposalsCount || 0) >= 1;

  return (
    <AppShell>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>GSoC Submission Readiness</h1>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Would you submit your proposal today?
        </div>
      </div>

      {loading ? (
        <div className="loading-state"><div className="spinner" /></div>
      ) : (
        <>
          {/* Overall Verdict */}
          <div className="card" style={{ 
            padding: '24px', 
            marginBottom: 24,
            borderLeft: `4px solid ${canSubmit ? 'var(--green)' : 'var(--orange)'}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: canSubmit ? 'var(--green)' : 'var(--orange)' }}>
                  {canSubmit ? 'YES - Ready to Submit' : 'NOT YET - More Evidence Needed'}
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
                  Overall Readiness: <strong>{Math.round(readinessScore)}%</strong>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 48, fontWeight: 800, color: canSubmit ? 'var(--green)' : 'var(--orange)' }}>
                  {Math.round(readinessScore)}%
                </div>
              </div>
            </div>
            <ProgressBar value={readinessScore} color={canSubmit ? 'var(--green)' : 'var(--orange)'} />
          </div>

          {/* Readiness Breakdown */}
          <div style={{ marginBottom: 28 }}>
            <div className="section-label">READINESS BREAKDOWN</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
              <div className="card" style={{ padding: '16px' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>TECHNICAL FOUNDATION</div>
                <ProgressBar value={goal.technicalReadiness || 0} color="var(--blue)" />
                <div style={{ fontSize: 24, fontWeight: 800, marginTop: 8 }}>{goal.technicalReadiness || 0}%</div>
              </div>
              <div className="card" style={{ padding: '16px' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>PROJECT EVIDENCE</div>
                <ProgressBar value={goal.projectEvidence || 0} color="var(--green)" />
                <div style={{ fontSize: 24, fontWeight: 800, marginTop: 8 }}>{goal.projectEvidence || 0}%</div>
              </div>
              <div className="card" style={{ padding: '16px' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>OPEN SOURCE</div>
                <ProgressBar value={goal.openSourceReadiness || 0} color="var(--purple)" />
                <div style={{ fontSize: 24, fontWeight: 800, marginTop: 8 }}>{goal.openSourceReadiness || 0}%</div>
              </div>
              <div className="card" style={{ padding: '16px' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>ORGANIZATION KNOWLEDGE</div>
                <ProgressBar value={goal.organizationReadiness || 0} color="var(--orange)" />
                <div style={{ fontSize: 24, fontWeight: 800, marginTop: 8 }}>{goal.organizationReadiness || 0}%</div>
              </div>
              <div className="card" style={{ padding: '16px' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>COMMUNITY</div>
                <ProgressBar value={goal.communityReadiness || 0} color="var(--yellow)" />
                <div style={{ fontSize: 24, fontWeight: 800, marginTop: 8 }}>{goal.communityReadiness || 0}%</div>
              </div>
              <div className="card" style={{ padding: '16px' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>PROPOSAL</div>
                <ProgressBar value={goal.proposalReadiness || 0} color="var(--red)" />
                <div style={{ fontSize: 24, fontWeight: 800, marginTop: 8 }}>{goal.proposalReadiness || 0}%</div>
              </div>
            </div>
          </div>

          {/* Strong Evidence */}
          <div style={{ marginBottom: 28 }}>
            <div className="section-label" style={{ color: 'var(--green)' }}>✓ STRONG EVIDENCE</div>
            <div className="card" style={{ padding: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                {(goal.technicalReadiness || 0) >= 70 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20, color: 'var(--green)' }}>✓</span>
                    <span style={{ fontSize: 14 }}>Technical Foundation Strong</span>
                  </div>
                )}
                {(goal.projectEvidence || 0) >= 70 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20, color: 'var(--green)' }}>✓</span>
                    <span style={{ fontSize: 14 }}>Project Evidence Strong</span>
                  </div>
                )}
                {(stats.mergedPRs || 0) >= 2 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20, color: 'var(--green)' }}>✓</span>
                    <span style={{ fontSize: 14 }}>{stats.mergedPRs} Merged PRs</span>
                  </div>
                )}
                {(stats.completedProjects || 0) >= 2 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20, color: 'var(--green)' }}>✓</span>
                    <span style={{ fontSize: 14 }}>{stats.completedProjects} Completed Projects</span>
                  </div>
                )}
                {(goal.organizationReadiness || 0) >= 70 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20, color: 'var(--green)' }}>✓</span>
                    <span style={{ fontSize: 14 }}>Organization Knowledge Strong</span>
                  </div>
                )}
                {(stats.proposalsCount || 0) >= 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20, color: 'var(--green)' }}>✓</span>
                    <span style={{ fontSize: 14 }}>Proposal Draft Exists</span>
                  </div>
                )}
              </div>
              {((goal.technicalReadiness || 0) < 70 && (goal.projectEvidence || 0) < 70 && (stats.mergedPRs || 0) < 2 && (stats.completedProjects || 0) < 2) && (
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 12 }}>
                  No strong evidence yet. Focus on building the fundamentals.
                </div>
              )}
            </div>
          </div>

          {/* Missing Evidence */}
          <div style={{ marginBottom: 28 }}>
            <div className="section-label" style={{ color: 'var(--orange)' }}>⚠️ MISSING EVIDENCE</div>
            <div className="card" style={{ padding: '16px' }}>
              {missingEvidence.length === 0 ? (
                <div style={{ fontSize: 14, color: 'var(--green)' }}>
                  All critical evidence requirements met!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {missingEvidence.map((item, i) => (
                    <div key={i} style={{ 
                      padding: '12px', 
                      background: 'var(--surface-2)', 
                      borderRadius: 'var(--r-md)',
                      borderLeft: `3px solid ${item.priority === 'HIGH' ? 'var(--red)' : 'var(--orange)'}`
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{item.category}</span>
                        <span style={{ 
                          fontSize: 11, 
                          fontWeight: 600, 
                          padding: '2px 8px', 
                          borderRadius: 'var(--r-full)', 
                          background: item.priority === 'HIGH' ? 'var(--red-bg)' : 'var(--orange-bg)',
                          color: item.priority === 'HIGH' ? 'var(--red)' : 'var(--orange)'
                        }}>
                          {item.priority}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
                        {item.description}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--blue)' }}>
                        → {item.action}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Highest Priority Actions */}
          <div style={{ marginBottom: 28 }}>
            <div className="section-label">🎯 HIGHEST PRIORITY ACTIONS</div>
            <div className="card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {missingEvidence.slice(0, 3).map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ 
                      width: 24, 
                      height: 24, 
                      borderRadius: '50%', 
                      background: 'var(--accent)', 
                      color: 'var(--surface-1)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 700
                    }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{item.category}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.action}</div>
                    </div>
                  </div>
                ))}
                {missingEvidence.length === 0 && (
                  <div style={{ fontSize: 14, color: 'var(--green)' }}>
                    All high-priority actions completed!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Current Level */}
          <div style={{ marginBottom: 28 }}>
            <div className="section-label">CURRENT READINESS LEVEL</div>
            <div className="card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>
                    {READINESS_LEVELS[goal.currentReadinessLevel] || 'Not Started'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    Current Gate: <strong>{goal.currentGate || 'L1'}</strong>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Evidence Level</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: goal.overallEvidenceLevel === 'STRONG' || goal.overallEvidenceLevel === 'EXCELLENT' ? 'var(--green)' : 'var(--text)' }}>
                    {goal.overallEvidenceLevel || 'NONE'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="section-label">QUICK ACTIONS</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Link href="/gsoc/evidence">
                <button className="btn btn-secondary btn-sm">View Evidence Matrix</button>
              </Link>
              <Link href="/gsoc/missing-evidence">
                <button className="btn btn-secondary btn-sm">Analyze Missing Evidence</button>
              </Link>
              <Link href="/gsoc/proposals">
                <button className="btn btn-secondary btn-sm">Edit Proposal</button>
              </Link>
              <Link href="/gsoc/contributions">
                <button className="btn btn-secondary btn-sm">Log Contribution</button>
              </Link>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}
