'use client';
import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';

export default function ReviewsPage() {
  const [activeTab, setActiveTab] = useState('weekly'); // 'weekly', 'decisions', 'goals'
  const [reviews, setReviews] = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Decision modal / form
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [decisionForm, setDecisionForm] = useState({
    decision: '',
    context: '',
    optionsConsidered: '',
    reason: '',
    expectedResult: '',
    area: 'Forge',
  });

  // Goal modal / form
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalForm, setGoalForm] = useState({
    title: '',
    description: '',
    timeframe: '90_DAYS',
    area: 'Academic / GATE',
    milestones: '',
  });

  // Weekly review draft form
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    type: 'WEEKLY',
    weekStart: '2026-09-20',
    overallRating: 8,
    responses: {
      collegeCompleted: '',
      collegeOverdue: '',
      collegeNext: '',
      gateMastered: '',
      gateWeak: '',
      gateQuestions: '',
      forgeBuilt: '',
      forgeLearned: '',
      forgeDecision: '',
      peopleFollowUp: '',
      peopleWaiting: '',
      gymConsistency: '',
      sleep: '',
      voiceRecordings: '',
      commImprovement: '',
      wentWell: '',
      failed: '',
      shouldChange: '',
    },
    nextWeekOutcomes: [
      { title: '', priority: 'MUST' },
      { title: '', priority: 'MUST' },
      { title: '', priority: 'SHOULD' },
    ],
  });

  async function loadAll() {
    try {
      const [resRev, resDec, resGoal] = await Promise.all([
        fetch('/api/reviews').then(r => r.json()).catch(() => ({ data: [] })),
        fetch('/api/decisions').then(r => r.json()).catch(() => ({ data: [] })),
        fetch('/api/goals').then(r => r.json()).catch(() => ({ data: [] })),
      ]);
      setReviews(resRev.data || []);
      setDecisions(resDec.data || []);
      setGoals(resGoal.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleCreateDecision(e) {
    e.preventDefault();
    if (!decisionForm.decision.trim()) return;

    try {
      const payload = {
        ...decisionForm,
        optionsConsidered: decisionForm.optionsConsidered
          ? decisionForm.optionsConsidered.split('\n').filter(Boolean)
          : [],
      };
      await fetch('/api/decisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setShowDecisionModal(false);
      setDecisionForm({
        decision: '',
        context: '',
        optionsConsidered: '',
        reason: '',
        expectedResult: '',
        area: 'Forge',
      });
      loadAll();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleCreateGoal(e) {
    e.preventDefault();
    if (!goalForm.title.trim()) return;

    try {
      const milestonesList = goalForm.milestones
        ? goalForm.milestones.split('\n').filter(Boolean).map(t => ({ title: t, status: 'PENDING' }))
        : [];

      const payload = {
        title: goalForm.title,
        description: goalForm.description,
        timeframe: goalForm.timeframe,
        area: goalForm.area,
        milestones: milestonesList,
      };

      await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setShowGoalModal(false);
      setGoalForm({
        title: '',
        description: '',
        timeframe: '90_DAYS',
        area: 'Academic / GATE',
        milestones: '',
      });
      loadAll();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleCreateReview(e) {
    e.preventDefault();
    try {
      const payload = {
        ...reviewForm,
        nextWeekOutcomes: reviewForm.nextWeekOutcomes.filter(o => o.title.trim()),
      };
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setShowReviewModal(false);
      loadAll();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteDecision(id) {
    if (!confirm('Delete this decision log?')) return;
    try {
      await fetch(`/api/decisions/${id}`, { method: 'DELETE' });
      loadAll();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteGoal(id) {
    if (!confirm('Delete this goal?')) return;
    try {
      await fetch(`/api/goals/${id}`, { method: 'DELETE' });
      loadAll();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <AppShell>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>📋</span>
            <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>Reviews & Decisions OS</h1>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            Weekly loops, high-conviction decision register & long-term goals
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[
          { key: 'weekly', label: `Weekly Reviews (${reviews.length})` },
          { key: 'decisions', label: `Decisions Log (${decisions.length})` },
          { key: 'goals', label: `Long-term Goals (${goals.length})` },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              padding: '8px 16px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              background: activeTab === t.key ? 'var(--text)' : 'var(--surface-2)',
              color: activeTab === t.key ? 'var(--bg)' : 'var(--text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: WEEKLY REVIEWS */}
      {activeTab === 'weekly' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800 }}>Weekly Review & Alignment</h2>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Close feedback loops across Academics, GATE, Startup, and Health</p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowReviewModal(true)}>
              + New Weekly Review
            </button>
          </div>

          {reviews.length === 0 ? (
            <div className="card" style={{ padding: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📝</div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Ready for this week&apos;s review?</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '6px 0 16px 0' }}>
                Weekly reviews ensure you never drift off course for GATE 2027 or Forge startup milestones.
              </p>
              <button className="btn btn-primary" onClick={() => setShowReviewModal(true)}>
                Start Weekly Review
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {reviews.map(rev => (
                <div key={rev._id} className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>WEEK STARTING</span>
                      <h3 style={{ fontSize: 16, fontWeight: 800, marginTop: 2 }}>
                        {new Date(rev.weekStart || rev.createdAt).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </h3>
                    </div>
                    {rev.overallRating && (
                      <span style={{ fontSize: 12, fontWeight: 800, padding: '4px 10px', borderRadius: 12, background: 'var(--purple-bg)', color: 'var(--purple)' }}>
                        Week Rating: {rev.overallRating}/10
                      </span>
                    )}
                  </div>

                  {/* Highlights Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, fontSize: 12 }}>
                    {rev.responses?.wentWell && (
                      <div style={{ background: 'var(--green-bg)', padding: 10, borderRadius: 6 }}>
                        <strong style={{ color: 'var(--green)', display: 'block', marginBottom: 2 }}>✓ WENT WELL</strong>
                        <span>{rev.responses.wentWell}</span>
                      </div>
                    )}
                    {rev.responses?.failed && (
                      <div style={{ background: 'var(--red-bg)', padding: 10, borderRadius: 6 }}>
                        <strong style={{ color: 'var(--red)', display: 'block', marginBottom: 2 }}>⚠️ FAILED / MISSED</strong>
                        <span>{rev.responses.failed}</span>
                      </div>
                    )}
                    {rev.responses?.shouldChange && (
                      <div style={{ background: 'var(--surface-2)', padding: 10, borderRadius: 6 }}>
                        <strong style={{ color: 'var(--yellow)', display: 'block', marginBottom: 2 }}>⚡ ADJUSTMENT</strong>
                        <span>{rev.responses.shouldChange}</span>
                      </div>
                    )}
                  </div>

                  {/* Next Week Outcomes */}
                  {rev.nextWeekOutcomes?.length > 0 && (
                    <div style={{ paddingTop: 8, borderTop: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Next Week&apos;s Core Outcomes:</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>
                        {rev.nextWeekOutcomes.map((o, i) => (
                          <div key={i} style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 4, background: o.priority === 'MUST' ? 'var(--red-bg)' : 'var(--surface-2)', color: o.priority === 'MUST' ? 'var(--red)' : 'var(--text-secondary)' }}>
                              {o.priority}
                            </span>
                            <span>{o.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DECISIONS LOG */}
      {activeTab === 'decisions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800 }}>High-Conviction Decisions Register</h2>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Document the context and rationale to review outcomes later</p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowDecisionModal(true)}>
              + Log Decision
            </button>
          </div>

          {decisions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-title">No decisions logged</div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Log architecture choices, roadmap trade-offs, and strategic calls.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {decisions.map(d => (
                <div key={d._id} className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                    <div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: 'var(--surface-2)', color: 'var(--purple)' }}>
                          {d.area || 'General'}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {new Date(d.date || d.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <h3 style={{ fontSize: 16, fontWeight: 800 }}>{d.decision}</h3>
                    </div>
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)', fontSize: 11 }} onClick={() => handleDeleteDecision(d._id)}>
                      Delete
                    </button>
                  </div>

                  {d.context && (
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      <strong>Context:</strong> {d.context}
                    </div>
                  )}

                  {d.reason && (
                    <div style={{ fontSize: 12, background: 'var(--surface-2)', padding: '8px 10px', borderRadius: 6 }}>
                      <strong style={{ color: 'var(--yellow)', display: 'block', marginBottom: 2 }}>WHY THIS CHOICE:</strong>
                      <span>{d.reason}</span>
                    </div>
                  )}

                  {d.expectedResult && (
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      🎯 <strong>Expected Outcome:</strong> {d.expectedResult}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: LONG-TERM GOALS */}
      {activeTab === 'goals' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800 }}>Vision & Goal Horizon</h2>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>90-Day sprints, 1-Year targets & Multi-year vision</p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowGoalModal(true)}>
              + New Goal
            </button>
          </div>

          {goals.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-title">No goals defined</div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Add your 90-day GATE 2027 and Forge milestone goals.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
              {goals.map(g => {
                const totalM = (g.milestones || []).length;
                const doneM = (g.milestones || []).filter(m => m.status === 'DONE').length;
                const pct = totalM > 0 ? Math.round((doneM / totalM) * 100) : 0;

                return (
                  <div key={g._id} className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12 }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 10, background: 'var(--blue-bg)', color: 'var(--blue)' }}>
                          {g.timeframe.replace('_', ' ')}
                        </span>
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)', fontSize: 11 }} onClick={() => handleDeleteGoal(g._id)}>
                          ✕
                        </button>
                      </div>

                      <h3 style={{ fontSize: 16, fontWeight: 800 }}>{g.title}</h3>
                      {g.description && (
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.4 }}>
                          {g.description}
                        </p>
                      )}
                    </div>

                    {totalM > 0 && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                          <span>Milestones: {doneM}/{totalM}</span>
                          <span>{pct}%</span>
                        </div>
                        <div style={{ width: '100%', height: 5, background: 'var(--surface-2)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: 'var(--green)' }} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal: Weekly Review */}
      {showReviewModal && (
        <div className="modal-backdrop" onClick={() => setShowReviewModal(false)}>
          <div className="modal-card" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}>Weekly Review Check-in</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowReviewModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateReview} style={{ display: 'flex', flexDirection: 'column', gap: 14, maxHeight: '75vh', overflowY: 'auto', paddingRight: 4 }}>
              <div>
                <label className="label">Week Overall Rating (1-10)</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  className="input"
                  value={reviewForm.overallRating}
                  onChange={e => setReviewForm({ ...reviewForm, overallRating: Number(e.target.value) })}
                />
              </div>

              <div>
                <label className="label">What went exceptionally well this week?</label>
                <textarea
                  className="input textarea"
                  rows={2}
                  placeholder="Completed Discrete Math modules, executed 3 customer interviews..."
                  value={reviewForm.responses.wentWell}
                  onChange={e => setReviewForm({ ...reviewForm, responses: { ...reviewForm.responses, wentWell: e.target.value } })}
                />
              </div>

              <div>
                <label className="label">Where did execution fall short / slip?</label>
                <textarea
                  className="input textarea"
                  rows={2}
                  placeholder="Missed 2 gym days, fell behind on OS revision..."
                  value={reviewForm.responses.failed}
                  onChange={e => setReviewForm({ ...reviewForm, responses: { ...reviewForm.responses, failed: e.target.value } })}
                />
              </div>

              <div>
                <label className="label">What single system adjustment will you make?</label>
                <textarea
                  className="input textarea"
                  rows={2}
                  placeholder="Study first 2.5 hours before opening messaging apps..."
                  value={reviewForm.responses.shouldChange}
                  onChange={e => setReviewForm({ ...reviewForm, responses: { ...reviewForm.responses, shouldChange: e.target.value } })}
                />
              </div>

              <div>
                <label className="label">Next Week&apos;s Non-Negotiable #1 (MUST)</label>
                <input
                  className="input"
                  placeholder="Finish Algorithms Graph Theory & 40 PYQs"
                  value={reviewForm.nextWeekOutcomes[0].title}
                  onChange={e => {
                    const copy = [...reviewForm.nextWeekOutcomes];
                    copy[0].title = e.target.value;
                    setReviewForm({ ...reviewForm, nextWeekOutcomes: copy });
                  }}
                />
              </div>

              <div>
                <label className="label">Next Week&apos;s Non-Negotiable #2 (MUST)</label>
                <input
                  className="input"
                  placeholder="Complete Forge core API deployment"
                  value={reviewForm.nextWeekOutcomes[1].title}
                  onChange={e => {
                    const copy = [...reviewForm.nextWeekOutcomes];
                    copy[1].title = e.target.value;
                    setReviewForm({ ...reviewForm, nextWeekOutcomes: copy });
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowReviewModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Complete & Save Review</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Decision */}
      {showDecisionModal && (
        <div className="modal-backdrop" onClick={() => setShowDecisionModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}>Log Key Decision</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowDecisionModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateDecision} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label className="label">Decision *</label>
                <input
                  className="input"
                  required
                  placeholder="e.g. Pivot to Next.js App Router + MongoDB Atlas"
                  value={decisionForm.decision}
                  onChange={e => setDecisionForm({ ...decisionForm, decision: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Area</label>
                <select
                  className="input select"
                  value={decisionForm.area}
                  onChange={e => setDecisionForm({ ...decisionForm, area: e.target.value })}
                >
                  <option value="Forge">Forge (Startup)</option>
                  <option value="GATE">GATE 2027</option>
                  <option value="College">College</option>
                  <option value="Career">Career & ML</option>
                  <option value="Life">Life & Fitness</option>
                </select>
              </div>

              <div>
                <label className="label">Context & Alternatives Considered</label>
                <textarea
                  className="input textarea"
                  rows={2}
                  placeholder="Considered PostgreSQL vs MongoDB. Chose Mongo for document velocity..."
                  value={decisionForm.context}
                  onChange={e => setDecisionForm({ ...decisionForm, context: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Core Rationale (Why this choice?)</label>
                <textarea
                  className="input textarea"
                  rows={2}
                  placeholder="Key argument for why this maximizes throughput and clarity..."
                  value={decisionForm.reason}
                  onChange={e => setDecisionForm({ ...decisionForm, reason: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Expected Result</label>
                <input
                  className="input"
                  placeholder="Zero schema migration friction during v1 MVP development"
                  value={decisionForm.expectedResult}
                  onChange={e => setDecisionForm({ ...decisionForm, expectedResult: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowDecisionModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Decision</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Goal */}
      {showGoalModal && (
        <div className="modal-backdrop" onClick={() => setShowGoalModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}>Create Goal</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowGoalModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateGoal} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label className="label">Goal Title *</label>
                <input
                  className="input"
                  required
                  placeholder="e.g. Master GATE 2027 Core Subjects & Score AIR < 100"
                  value={goalForm.title}
                  onChange={e => setGoalForm({ ...goalForm, title: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label className="label">Timeframe</label>
                  <select
                    className="input select"
                    value={goalForm.timeframe}
                    onChange={e => setGoalForm({ ...goalForm, timeframe: e.target.value })}
                  >
                    <option value="90_DAYS">90 Days</option>
                    <option value="1_YEAR">1 Year</option>
                    <option value="3_YEARS">3 Years</option>
                    <option value="10_YEARS">10 Years</option>
                  </select>
                </div>

                <div>
                  <label className="label">Area</label>
                  <input
                    className="input"
                    placeholder="Academic / Startup"
                    value={goalForm.area}
                    onChange={e => setGoalForm({ ...goalForm, area: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="label">Description / Definition of Done</label>
                <textarea
                  className="input textarea"
                  rows={2}
                  placeholder="What does success look like when achieved?"
                  value={goalForm.description}
                  onChange={e => setGoalForm({ ...goalForm, description: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Milestones (one per line)</label>
                <textarea
                  className="input textarea"
                  rows={3}
                  placeholder="Complete Discrete Math & Algorithms&#10;Solve 500 PYQs&#10;Score > 65 on full-length mock"
                  value={goalForm.milestones}
                  onChange={e => setGoalForm({ ...goalForm, milestones: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowGoalModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Goal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
