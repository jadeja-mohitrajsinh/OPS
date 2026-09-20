'use client';
import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';

const STAGES = ['RESEARCH', 'INSIGHT', 'DECISION', 'ACTION', 'DONE'];
const STAGE_COLORS = {
  RESEARCH: 'var(--blue)',
  INSIGHT: 'var(--purple)',
  DECISION: 'var(--yellow)',
  ACTION: 'var(--orange)',
  DONE: 'var(--green)',
};

const AREAS = ['ALL', 'Product', 'AI_ML', 'Engineering', 'Users', 'Competitors', 'Experiments', 'Business', 'UX_UI', 'Marketing'];

const COMPETITOR_CATEGORIES = ['ALL', 'DIRECT', 'INDIRECT', 'ASPIRATIONAL', 'ADJACENT', 'POTENTIAL'];
const THREAT_LEVELS = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'WATCHING'];

const THREAT_COLORS = {
  CRITICAL: { bg: '#fee2e2', color: '#991b1b', border: '#f87171' },
  HIGH: { bg: '#ffedd5', color: '#9a3412', border: '#fb923c' },
  MEDIUM: { bg: '#fef9c3', color: '#854d0e', border: '#facc15' },
  LOW: { bg: '#dcfce7', color: '#166534', border: '#4ade80' },
  WATCHING: { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' },
};

const CATEGORY_COLORS = {
  DIRECT: 'var(--red)',
  INDIRECT: 'var(--purple)',
  ASPIRATIONAL: 'var(--blue)',
  ADJACENT: 'var(--orange)',
  POTENTIAL: 'var(--text-secondary)',
};

const DEFAULT_FEATURE_KEYS = [
  'Local-First & Offline',
  'Agentic Execution Loops',
  'Realtime Latency & Speed',
  'Codebase Deep Context',
  'Privacy & Zero Data Leak',
  'Pricing & Self-Hostable',
  'Multi-Modal Reasoning',
  'Academic & Startup Workflow'
];

export default function ForgePage() {
  const [activeTab, setActiveTab] = useState('research'); // 'research' | 'competitors' | 'matrix' | 'positioning'

  // Research State
  const [items, setItems] = useState([]);
  const [loadingResearch, setLoadingResearch] = useState(true);
  const [selectedArea, setSelectedArea] = useState('ALL');
  const [selectedStage, setSelectedStage] = useState('ALL');
  const [showResearchModal, setShowResearchModal] = useState(false);
  const [editingResearchItem, setEditingResearchItem] = useState(null);

  const [researchForm, setResearchForm] = useState({
    problem: '',
    question: '',
    source: '',
    finding: '',
    insight: '',
    decision: '',
    nextAction: '',
    area: 'Product',
    status: 'RESEARCH',
    tags: '',
  });

  // Competitors State
  const [competitors, setCompetitors] = useState([]);
  const [loadingCompetitors, setLoadingCompetitors] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedThreat, setSelectedThreat] = useState('ALL');
  const [competitorSearch, setCompetitorSearch] = useState('');
  const [showCompetitorModal, setShowCompetitorModal] = useState(false);
  const [editingCompetitor, setEditingCompetitor] = useState(null);
  const [expandedCompetitorId, setExpandedCompetitorId] = useState(null);

  const [competitorForm, setCompetitorForm] = useState({
    name: '',
    tagline: '',
    website: '',
    category: 'DIRECT',
    threatLevel: 'MEDIUM',
    status: 'ACTIVE',
    pricingModel: '',
    targetAudience: '',
    keyFeatures: '',
    strengths: '',
    weaknesses: '',
    ourDifferentiator: '',
    marketShareNotes: '',
    swotStrengths: '',
    swotWeaknesses: '',
    swotOpportunities: '',
    swotThreats: '',
    notes: '',
    tags: '',
  });

  // Data Fetching
  async function loadResearch() {
    try {
      const res = await fetch('/api/forge');
      const data = await res.json();
      if (data.success) {
        setItems(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingResearch(false);
    }
  }

  async function loadCompetitors() {
    try {
      const res = await fetch('/api/competitors');
      const data = await res.json();
      if (data.success) {
        setCompetitors(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCompetitors(false);
    }
  }

  useEffect(() => {
    loadResearch();
    loadCompetitors();
  }, []);

  // Research Handlers
  async function handleResearchSubmit(e) {
    e.preventDefault();
    if (!researchForm.problem.trim()) return;

    try {
      const payload = {
        ...researchForm,
        tags: researchForm.tags ? researchForm.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };

      if (editingResearchItem) {
        await fetch(`/api/forge/${editingResearchItem._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/forge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      setShowResearchModal(false);
      setEditingResearchItem(null);
      resetResearchForm();
      loadResearch();
    } catch (err) {
      console.error(err);
    }
  }

  function resetResearchForm() {
    setResearchForm({
      problem: '',
      question: '',
      source: '',
      finding: '',
      insight: '',
      decision: '',
      nextAction: '',
      area: 'Product',
      status: 'RESEARCH',
      tags: '',
    });
  }

  async function handleStatusChange(id, status) {
    try {
      await fetch(`/api/forge/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      loadResearch();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleResearchDelete(id) {
    if (!confirm('Delete this research item?')) return;
    try {
      await fetch(`/api/forge/${id}`, { method: 'DELETE' });
      loadResearch();
    } catch (err) {
      console.error(err);
    }
  }

  function openEditResearch(item) {
    setEditingResearchItem(item);
    setResearchForm({
      problem: item.problem || '',
      question: item.question || '',
      source: item.source || '',
      finding: item.finding || '',
      insight: item.insight || '',
      decision: item.decision || '',
      nextAction: item.nextAction || '',
      area: item.area || 'Product',
      status: item.status || 'RESEARCH',
      tags: (item.tags || []).join(', '),
    });
    setShowResearchModal(true);
  }

  // Competitor Handlers
  async function handleCompetitorSubmit(e) {
    e.preventDefault();
    if (!competitorForm.name.trim()) return;

    try {
      const payload = {
        name: competitorForm.name.trim(),
        tagline: competitorForm.tagline.trim(),
        website: competitorForm.website.trim(),
        category: competitorForm.category,
        threatLevel: competitorForm.threatLevel,
        status: competitorForm.status,
        pricingModel: competitorForm.pricingModel.trim(),
        targetAudience: competitorForm.targetAudience.trim(),
        ourDifferentiator: competitorForm.ourDifferentiator.trim(),
        marketShareNotes: competitorForm.marketShareNotes.trim(),
        notes: competitorForm.notes.trim(),
        keyFeatures: competitorForm.keyFeatures ? competitorForm.keyFeatures.split('\n').map(s => s.trim()).filter(Boolean) : [],
        strengths: competitorForm.strengths ? competitorForm.strengths.split('\n').map(s => s.trim()).filter(Boolean) : [],
        weaknesses: competitorForm.weaknesses ? competitorForm.weaknesses.split('\n').map(s => s.trim()).filter(Boolean) : [],
        tags: competitorForm.tags ? competitorForm.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        swot: {
          strengths: competitorForm.swotStrengths.trim(),
          weaknesses: competitorForm.swotWeaknesses.trim(),
          opportunities: competitorForm.swotOpportunities.trim(),
          threats: competitorForm.swotThreats.trim(),
        }
      };

      if (editingCompetitor) {
        await fetch(`/api/competitors/${editingCompetitor._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/competitors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      setShowCompetitorModal(false);
      setEditingCompetitor(null);
      resetCompetitorForm();
      loadCompetitors();
    } catch (err) {
      console.error(err);
    }
  }

  function resetCompetitorForm() {
    setCompetitorForm({
      name: '',
      tagline: '',
      website: '',
      category: 'DIRECT',
      threatLevel: 'MEDIUM',
      status: 'ACTIVE',
      pricingModel: '',
      targetAudience: '',
      keyFeatures: '',
      strengths: '',
      weaknesses: '',
      ourDifferentiator: '',
      marketShareNotes: '',
      swotStrengths: '',
      swotWeaknesses: '',
      swotOpportunities: '',
      swotThreats: '',
      notes: '',
      tags: '',
    });
  }

  function openEditCompetitor(comp) {
    setEditingCompetitor(comp);
    setCompetitorForm({
      name: comp.name || '',
      tagline: comp.tagline || '',
      website: comp.website || '',
      category: comp.category || 'DIRECT',
      threatLevel: comp.threatLevel || 'MEDIUM',
      status: comp.status || 'ACTIVE',
      pricingModel: comp.pricingModel || '',
      targetAudience: comp.targetAudience || '',
      keyFeatures: (comp.keyFeatures || []).join('\n'),
      strengths: (comp.strengths || []).join('\n'),
      weaknesses: (comp.weaknesses || []).join('\n'),
      ourDifferentiator: comp.ourDifferentiator || '',
      marketShareNotes: comp.marketShareNotes || '',
      swotStrengths: comp.swot?.strengths || '',
      swotWeaknesses: comp.swot?.weaknesses || '',
      swotOpportunities: comp.swot?.opportunities || '',
      swotThreats: comp.swot?.threats || '',
      notes: comp.notes || '',
      tags: (comp.tags || []).join(', '),
    });
    setShowCompetitorModal(true);
  }

  async function handleCompetitorDelete(id) {
    if (!confirm('Delete this competitor profile?')) return;
    try {
      await fetch(`/api/competitors/${id}`, { method: 'DELETE' });
      loadCompetitors();
    } catch (err) {
      console.error(err);
    }
  }

  function convertWeaknessToHypothesis(compName, weakness) {
    setActiveTab('research');
    setEditingResearchItem(null);
    setResearchForm({
      problem: `Exploit ${compName} weakness: ${weakness}`,
      question: `How can our solution solve "${weakness}" 10x better than ${compName}?`,
      source: `Competitor Analysis (${compName})`,
      finding: '',
      insight: `${compName} currently falls short on this dimension. Key opportunity for our product positioning.`,
      decision: '',
      nextAction: 'Build prototype / benchmark validating our solution.',
      area: 'Competitors',
      status: 'RESEARCH',
      tags: `competitors, ${compName.toLowerCase().replace(/\s+/g, '-')}, differentiator`,
    });
    setShowResearchModal(true);
  }

  // Filtered Lists
  const filteredResearch = items.filter(item => {
    if (selectedArea !== 'ALL' && item.area !== selectedArea) return false;
    if (selectedStage !== 'ALL' && item.status !== selectedStage) return false;
    return true;
  });

  const filteredCompetitors = competitors.filter(comp => {
    if (selectedCategory !== 'ALL' && comp.category !== selectedCategory) return false;
    if (selectedThreat !== 'ALL' && comp.threatLevel !== selectedThreat) return false;
    if (competitorSearch.trim()) {
      const q = competitorSearch.toLowerCase();
      const matchName = comp.name?.toLowerCase().includes(q);
      const matchTagline = comp.tagline?.toLowerCase().includes(q);
      const matchDiff = comp.ourDifferentiator?.toLowerCase().includes(q);
      const matchWeak = (comp.weaknesses || []).some(w => w.toLowerCase().includes(q));
      if (!matchName && !matchTagline && !matchDiff && !matchWeak) return false;
    }
    return true;
  });

  // KPIs
  const researchCount = items.filter(i => i.status === 'RESEARCH').length;
  const insightCount = items.filter(i => i.status === 'INSIGHT').length;
  const actionCount = items.filter(i => i.status === 'ACTION').length;

  const criticalThreatCount = competitors.filter(c => c.threatLevel === 'CRITICAL').length;
  const highThreatCount = competitors.filter(c => c.threatLevel === 'HIGH').length;
  const directCompCount = competitors.filter(c => c.category === 'DIRECT').length;

  return (
    <AppShell>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 24 }}>⚡</span>
            <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>Forge Hub</h1>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 12, background: 'var(--surface-2)', color: 'var(--purple)' }}>
              VENTURE OS
            </span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            Hypothesis validation, competitor teardowns, battle matrices & unfair advantage positioning
          </p>
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {activeTab === 'research' ? (
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditingResearchItem(null);
                resetResearchForm();
                setShowResearchModal(true);
              }}
            >
              + Log Research
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditingCompetitor(null);
                resetCompetitorForm();
                setShowCompetitorModal(true);
              }}
            >
              + Add Competitor
            </button>
          )}
        </div>
      </div>

      {/* Main Mode Navigation Tabs */}
      <div style={{ display: 'flex', gap: 6, borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 20, overflowX: 'auto' }}>
        <button
          onClick={() => setActiveTab('research')}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: activeTab === 'research' ? 'var(--text)' : 'var(--surface-2)',
            color: activeTab === 'research' ? 'var(--bg)' : 'var(--text-secondary)',
            transition: 'all 0.15s ease'
          }}
        >
          <span>⚡</span> Research & Discovery ({items.length})
        </button>

        <button
          onClick={() => setActiveTab('competitors')}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: activeTab === 'competitors' ? 'var(--text)' : 'var(--surface-2)',
            color: activeTab === 'competitors' ? 'var(--bg)' : 'var(--text-secondary)',
            transition: 'all 0.15s ease'
          }}
        >
          <span>⚔️</span> Competitor Intel ({competitors.length})
        </button>

        <button
          onClick={() => setActiveTab('matrix')}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: activeTab === 'matrix' ? 'var(--text)' : 'var(--surface-2)',
            color: activeTab === 'matrix' ? 'var(--bg)' : 'var(--text-secondary)',
            transition: 'all 0.15s ease'
          }}
        >
          <span>📊</span> Feature Battle Matrix
        </button>

        <button
          onClick={() => setActiveTab('positioning')}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: activeTab === 'positioning' ? 'var(--text)' : 'var(--surface-2)',
            color: activeTab === 'positioning' ? 'var(--bg)' : 'var(--text-secondary)',
            transition: 'all 0.15s ease'
          }}
        >
          <span>🎯</span> Market Whitespace & Moat
        </button>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 1: RESEARCH & DISCOVERY */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'research' && (
        <div>
          {/* KPI Overview */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 16 }}>
            <div className="card" style={{ padding: '12px 14px' }}>
              <div style={{ fontSize: 11, color: 'var(--blue)', textTransform: 'uppercase', fontWeight: 700 }}>In Research</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--blue)', marginTop: 4 }}>{researchCount}</div>
            </div>
            <div className="card" style={{ padding: '12px 14px' }}>
              <div style={{ fontSize: 11, color: 'var(--purple)', textTransform: 'uppercase', fontWeight: 700 }}>Key Insights</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--purple)', marginTop: 4 }}>{insightCount}</div>
            </div>
            <div className="card" style={{ padding: '12px 14px' }}>
              <div style={{ fontSize: 11, color: 'var(--orange)', textTransform: 'uppercase', fontWeight: 700 }}>Action Required</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--orange)', marginTop: 4 }}>{actionCount}</div>
            </div>
            <div className="card" style={{ padding: '12px 14px' }}>
              <div style={{ fontSize: 11, color: 'var(--green)', textTransform: 'uppercase', fontWeight: 700 }}>Validated / Done</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--green)', marginTop: 4 }}>
                {items.filter(i => i.status === 'DONE').length}
              </div>
            </div>
          </div>

          {/* Stage Filter tabs */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6, marginBottom: 10 }}>
            <button
              onClick={() => setSelectedStage('ALL')}
              style={{
                padding: '5px 12px',
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: selectedStage === 'ALL' ? 'var(--text)' : 'var(--surface-2)',
                color: selectedStage === 'ALL' ? 'var(--bg)' : 'var(--text-secondary)',
              }}
            >
              ALL STAGES ({items.length})
            </button>
            {STAGES.map(stage => (
              <button
                key={stage}
                onClick={() => setSelectedStage(stage)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  background: selectedStage === stage ? STAGE_COLORS[stage] : 'var(--surface-2)',
                  color: selectedStage === stage ? '#fff' : 'var(--text-secondary)',
                }}
              >
                {stage} ({items.filter(i => i.status === stage).length})
              </button>
            ))}
          </div>

          {/* Area Chips */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 10, marginBottom: 16 }}>
            {AREAS.map(area => (
              <button
                key={area}
                onClick={() => setSelectedArea(area)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 14,
                  fontSize: 11,
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  background: selectedArea === area ? 'var(--surface-3)' : 'transparent',
                  color: selectedArea === area ? 'var(--text)' : 'var(--text-muted)',
                }}
              >
                {area}
              </button>
            ))}
          </div>

          {/* Items list */}
          {loadingResearch ? (
            <div className="loading-state"><div className="spinner" /></div>
          ) : filteredResearch.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-title">No forge research items found</div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Capture your hypothesis, discovery, or startup experiment.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {filteredResearch.map(item => (
                <div
                  key={item._id}
                  className="card"
                  style={{
                    padding: 16,
                    borderLeft: `3px solid ${STAGE_COLORS[item.status] || 'var(--border)'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  {/* Top Row: Area, Problem & Stage Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
                        {item.area && (
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: 'var(--surface-2)', color: 'var(--purple)' }}>
                            {item.area}
                          </span>
                        )}
                        {item.source && (
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>via {item.source}</span>
                        )}
                      </div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
                        {item.problem}
                      </h3>
                    </div>

                    <select
                      className="input select"
                      style={{ fontSize: 11, padding: '4px 8px', width: 'auto', flexShrink: 0 }}
                      value={item.status}
                      onChange={e => handleStatusChange(item._id, e.target.value)}
                    >
                      {STAGES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  {/* Research Question */}
                  {item.question && (
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontStyle: 'italic', background: 'var(--surface-2)', padding: '6px 10px', borderRadius: 6 }}>
                      Q: {item.question}
                    </div>
                  )}

                  {/* Findings & Insight */}
                  {(item.finding || item.insight) && (
                    <div style={{ display: 'grid', gridTemplateColumns: item.finding && item.insight ? '1fr 1fr' : '1fr', gap: 10 }}>
                      {item.finding && (
                        <div style={{ fontSize: 12, background: 'var(--surface-2)', padding: 8, borderRadius: 6 }}>
                          <span style={{ fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>FINDING</span>
                          <span style={{ color: 'var(--text)' }}>{item.finding}</span>
                        </div>
                      )}
                      {item.insight && (
                        <div style={{ fontSize: 12, background: 'var(--purple-bg)', padding: 8, borderRadius: 6 }}>
                          <span style={{ fontWeight: 700, color: 'var(--purple)', display: 'block', marginBottom: 2 }}>INSIGHT</span>
                          <span style={{ color: 'var(--text)' }}>{item.insight}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action / Decision Row */}
                  {(item.decision || item.nextAction) && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 4 }}>
                      {item.decision && (
                        <div style={{ fontSize: 12, display: 'flex', gap: 6, alignItems: 'center' }}>
                          <span style={{ color: 'var(--yellow)', fontWeight: 800 }}>⚡ DECISION:</span>
                          <span>{item.decision}</span>
                        </div>
                      )}
                      {item.nextAction && (
                        <div style={{ fontSize: 12, display: 'flex', gap: 6, alignItems: 'center' }}>
                          <span style={{ color: 'var(--orange)', fontWeight: 800 }}>➔ NEXT ACTION:</span>
                          <span>{item.nextAction}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tags and footer actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, paddingTop: 8, borderTop: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {(item.tags || []).map((t, i) => (
                        <span key={i} style={{ fontSize: 10, color: 'var(--text-muted)' }}>#{t}</span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }} onClick={() => openEditResearch(item)}>
                        Edit
                      </button>
                      <button className="btn btn-ghost btn-sm" style={{ fontSize: 11, color: 'var(--red)' }} onClick={() => handleResearchDelete(item._id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 2: COMPETITOR INTELLIGENCE */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'competitors' && (
        <div>
          {/* Competitor KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 16 }}>
            <div className="card" style={{ padding: '12px 14px' }}>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Tracked Rivals</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginTop: 4 }}>{competitors.length}</div>
            </div>
            <div className="card" style={{ padding: '12px 14px' }}>
              <div style={{ fontSize: 11, color: 'var(--red)', textTransform: 'uppercase', fontWeight: 700 }}>Direct Rivals</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--red)', marginTop: 4 }}>{directCompCount}</div>
            </div>
            <div className="card" style={{ padding: '12px 14px' }}>
              <div style={{ fontSize: 11, color: '#b91c1c', textTransform: 'uppercase', fontWeight: 700 }}>High / Critical Threat</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#b91c1c', marginTop: 4 }}>{criticalThreatCount + highThreatCount}</div>
            </div>
            <div className="card" style={{ padding: '12px 14px' }}>
              <div style={{ fontSize: 11, color: 'var(--purple)', textTransform: 'uppercase', fontWeight: 700 }}>Aspirational Benchmarks</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--purple)', marginTop: 4 }}>
                {competitors.filter(c => c.category === 'ASPIRATIONAL').length}
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
            <input
              className="input"
              style={{ flex: '1 1 200px', fontSize: 13 }}
              placeholder="🔍 Search competitors, differentiators, weaknesses..."
              value={competitorSearch}
              onChange={e => setCompetitorSearch(e.target.value)}
            />

            {/* Category Filter */}
            <select
              className="input select"
              style={{ width: 'auto', fontSize: 12 }}
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
            >
              {COMPETITOR_CATEGORIES.map(c => (
                <option key={c} value={c}>{c === 'ALL' ? 'All Categories' : c}</option>
              ))}
            </select>

            {/* Threat Level Filter */}
            <select
              className="input select"
              style={{ width: 'auto', fontSize: 12 }}
              value={selectedThreat}
              onChange={e => setSelectedThreat(e.target.value)}
            >
              {THREAT_LEVELS.map(t => (
                <option key={t} value={t}>{t === 'ALL' ? 'All Threats' : `${t} Threat`}</option>
              ))}
            </select>
          </div>

          {/* Competitor Cards List */}
          {loadingCompetitors ? (
            <div className="loading-state"><div className="spinner" /></div>
          ) : filteredCompetitors.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-title">No competitors found</div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                Map rival products, spot vulnerabilities, and solidify your unfair advantage.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {filteredCompetitors.map(comp => {
                const threatStyle = THREAT_COLORS[comp.threatLevel] || THREAT_COLORS.MEDIUM;
                const isExpanded = expandedCompetitorId === comp._id;

                return (
                  <div
                    key={comp._id}
                    className="card"
                    style={{
                      padding: 18,
                      borderTop: `3px solid ${threatStyle.border}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                    }}
                  >
                    {/* Header Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                          <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>
                            {comp.name}
                          </h3>

                          {comp.category && (
                            <span style={{
                              fontSize: 10,
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: 12,
                              background: 'var(--surface-2)',
                              color: CATEGORY_COLORS[comp.category] || 'var(--text)'
                            }}>
                              {comp.category}
                            </span>
                          )}

                          <span style={{
                            fontSize: 10,
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: 12,
                            background: threatStyle.bg,
                            color: threatStyle.color,
                            border: `1px solid ${threatStyle.border}`
                          }}>
                            {comp.threatLevel} THREAT
                          </span>

                          {comp.status && (
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                              • {comp.status}
                            </span>
                          )}
                        </div>

                        {comp.tagline && (
                          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                            {comp.tagline}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {comp.website && (
                          <a
                            href={comp.website.startsWith('http') ? comp.website : `https://${comp.website}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-ghost btn-sm"
                            style={{ fontSize: 11, textDecoration: 'none' }}
                          >
                            🔗 Website
                          </a>
                        )}
                        <button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }} onClick={() => openEditCompetitor(comp)}>
                          Edit
                        </button>
                        <button className="btn btn-ghost btn-sm" style={{ fontSize: 11, color: 'var(--red)' }} onClick={() => handleCompetitorDelete(comp._id)}>
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Differentiator / Moat Highlight */}
                    {comp.ourDifferentiator && (
                      <div style={{
                        background: 'linear-gradient(135deg, rgba(109, 40, 217, 0.08) 0%, rgba(26, 95, 190, 0.08) 100%)',
                        border: '1px solid rgba(109, 40, 217, 0.25)',
                        padding: '10px 14px',
                        borderRadius: 8,
                        display: 'flex',
                        gap: 10,
                        alignItems: 'flex-start'
                      }}>
                        <span style={{ fontSize: 16 }}>🛡️</span>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--purple)', letterSpacing: '0.5px' }}>
                            OUR UNFAIR ADVANTAGE / MOAT
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginTop: 2 }}>
                            {comp.ourDifferentiator}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Strengths vs Weaknesses Comparison Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
                      {/* Competitor Strengths */}
                      <div style={{ background: 'var(--surface-2)', padding: '10px 12px', borderRadius: 8 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span>💪</span> THEIR STRENGTHS
                        </div>
                        {(!comp.strengths || comp.strengths.length === 0) ? (
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>None recorded</div>
                        ) : (
                          <ul style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {comp.strengths.map((st, i) => (
                              <li key={i} style={{ fontSize: 12, color: 'var(--text)', display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                                <span style={{ color: 'var(--green)', fontWeight: 800 }}>✓</span>
                                <span>{st}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Competitor Weaknesses / Gaps */}
                      <div style={{ background: 'var(--red-bg)', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(217, 48, 37, 0.15)' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--red)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span>⚠️</span> THEIR WEAKNESSES & VULNERABILITIES
                        </div>
                        {(!comp.weaknesses || comp.weaknesses.length === 0) ? (
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>None recorded</div>
                        ) : (
                          <ul style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {comp.weaknesses.map((wk, i) => (
                              <li key={i} style={{ fontSize: 12, color: 'var(--text)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
                                <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                                  <span style={{ color: 'var(--red)', fontWeight: 800 }}>✕</span>
                                  <span>{wk}</span>
                                </div>
                                <button
                                  title="Turn into a Forge hypothesis"
                                  onClick={() => convertWeaknessToHypothesis(comp.name, wk)}
                                  style={{
                                    fontSize: 10,
                                    fontWeight: 700,
                                    color: 'var(--purple)',
                                    background: 'var(--purple-bg)',
                                    border: '1px solid var(--purple)',
                                    padding: '2px 6px',
                                    borderRadius: 4,
                                    cursor: 'pointer',
                                    flexShrink: 0
                                  }}
                                >
                                  + Exploit
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>

                    {/* Metadata bar: Pricing, ICP, Market notes */}
                    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 12, color: 'var(--text-secondary)', background: 'var(--surface-2)', padding: '8px 12px', borderRadius: 6 }}>
                      {comp.pricingModel && (
                        <div><strong style={{ color: 'var(--text)' }}>Pricing:</strong> {comp.pricingModel}</div>
                      )}
                      {comp.targetAudience && (
                        <div><strong style={{ color: 'var(--text)' }}>ICP:</strong> {comp.targetAudience}</div>
                      )}
                      {comp.marketShareNotes && (
                        <div><strong style={{ color: 'var(--text)' }}>Traction:</strong> {comp.marketShareNotes}</div>
                      )}
                    </div>

                    {/* Toggle Detailed SWOT and Notes */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 6, borderTop: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {(comp.tags || []).map((t, i) => (
                          <span key={i} style={{ fontSize: 10, color: 'var(--text-muted)' }}>#{t}</span>
                        ))}
                      </div>

                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ fontSize: 11, color: 'var(--blue)' }}
                        onClick={() => setExpandedCompetitorId(isExpanded ? null : comp._id)}
                      >
                        {isExpanded ? '▲ Hide Teardown & SWOT' : '▼ View SWOT & Battle Details'}
                      </button>
                    </div>

                    {/* Expanded SWOT Matrix */}
                    {isExpanded && (
                      <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 10, padding: 12, background: 'var(--surface-2)', borderRadius: 8 }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text)', letterSpacing: '0.5px' }}>
                          STRATEGIC SWOT ANALYSIS
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          <div style={{ background: 'var(--surface)', padding: 8, borderRadius: 6 }}>
                            <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--green)' }}>STRENGTHS (THEIR MOAT)</span>
                            <p style={{ fontSize: 12, marginTop: 4 }}>{comp.swot?.strengths || 'N/A'}</p>
                          </div>
                          <div style={{ background: 'var(--surface)', padding: 8, borderRadius: 6 }}>
                            <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--red)' }}>WEAKNESSES (OUR TARGET)</span>
                            <p style={{ fontSize: 12, marginTop: 4 }}>{comp.swot?.weaknesses || 'N/A'}</p>
                          </div>
                          <div style={{ background: 'var(--surface)', padding: 8, borderRadius: 6 }}>
                            <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--blue)' }}>OPPORTUNITIES (MARKET GAPS)</span>
                            <p style={{ fontSize: 12, marginTop: 4 }}>{comp.swot?.opportunities || 'N/A'}</p>
                          </div>
                          <div style={{ background: 'var(--surface)', padding: 8, borderRadius: 6 }}>
                            <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--orange)' }}>THREATS (THEIR EXPANSION)</span>
                            <p style={{ fontSize: 12, marginTop: 4 }}>{comp.swot?.threats || 'N/A'}</p>
                          </div>
                        </div>

                        {comp.notes && (
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)', background: 'var(--surface)', padding: 8, borderRadius: 6 }}>
                            <strong style={{ color: 'var(--text)' }}>Intel Log:</strong> {comp.notes}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 3: FEATURE BATTLE MATRIX */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'matrix' && (
        <div>
          <div className="card" style={{ padding: 16, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 800 }}>⚔️ Feature Battle Matrix</h2>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                  Direct capability comparison: Our Solution vs Rival Landscape
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8, fontSize: 11, fontWeight: 600 }}>
                <span style={{ color: 'var(--purple)', display: 'flex', alignItems: 'center', gap: 4 }}>⭐ Superior</span>
                <span style={{ color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 4 }}>✅ Supported</span>
                <span style={{ color: 'var(--orange)', display: 'flex', alignItems: 'center', gap: 4 }}>⚠️ Partial</span>
                <span style={{ color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 4 }}>❌ Missing</span>
              </div>
            </div>

            {competitors.length === 0 ? (
              <div className="empty-state">
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Add competitors to view the comparison battle matrix.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)' }}>
                      <th style={{ padding: '10px 12px', color: 'var(--text-secondary)', fontWeight: 700, minWidth: 180 }}>Feature / Dimension</th>
                      <th style={{
                        padding: '10px 12px',
                        fontWeight: 800,
                        color: '#fff',
                        background: 'linear-gradient(135deg, #6d28d9 0%, #4338ca 100%)',
                        borderRadius: '6px 6px 0 0',
                        minWidth: 160,
                        textAlign: 'center'
                      }}>
                        ⚡ OUR SOLUTION
                      </th>
                      {competitors.map(comp => (
                        <th key={comp._id} style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--text)', minWidth: 140, textAlign: 'center' }}>
                          {comp.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DEFAULT_FEATURE_KEYS.map((feature, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)', background: idx % 2 === 0 ? 'transparent' : 'var(--surface-2)' }}>
                        <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text)' }}>
                          {feature}
                        </td>
                        {/* Our Solution Column */}
                        <td style={{
                          padding: '12px',
                          textAlign: 'center',
                          fontWeight: 700,
                          color: 'var(--purple)',
                          background: 'rgba(109, 40, 217, 0.05)',
                          borderLeft: '1px solid rgba(109, 40, 217, 0.2)',
                          borderRight: '1px solid rgba(109, 40, 217, 0.2)'
                        }}>
                          ⭐ Superior (Full Local)
                        </td>
                        {/* Competitors Columns */}
                        {competitors.map(comp => {
                          const specificScore = comp.featureScores?.find(f => f.feature.toLowerCase().includes(feature.toLowerCase().slice(0, 5)));
                          const support = specificScore?.competitorSupport || (idx % 3 === 0 ? 'PARTIAL' : idx % 2 === 0 ? 'YES' : 'NO');

                          let badgeColor = 'var(--text)';
                          let icon = '✅';
                          let label = 'Supported';

                          if (support === 'SUPERIOR') {
                            badgeColor = 'var(--purple)';
                            icon = '⭐';
                            label = 'Superior';
                          } else if (support === 'PARTIAL') {
                            badgeColor = 'var(--orange)';
                            icon = '⚠️';
                            label = 'Partial';
                          } else if (support === 'NO') {
                            badgeColor = 'var(--red)';
                            icon = '❌';
                            label = 'No';
                          }

                          return (
                            <td key={comp._id} style={{ padding: '12px', textAlign: 'center' }}>
                              <span style={{ color: badgeColor, fontWeight: 600, fontSize: 11 }}>
                                {icon} {label}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 4: MARKET WHITESPACE & MOAT POSITIONING */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'positioning' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* 2x2 Positioning Map */}
          <div className="card" style={{ padding: 18 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>🎯 2x2 Strategic Positioning Matrix</h2>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>
              Market axis: Local Privacy & Cost (Y-Axis) vs Operational Depth & Speed (X-Axis)
            </p>

            <div style={{
              position: 'relative',
              height: 340,
              background: 'var(--surface-2)',
              borderRadius: 12,
              border: '1px solid var(--border)',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gridTemplateRows: '1fr 1fr',
              gap: 2,
              padding: 24,
              overflow: 'hidden'
            }}>
              {/* Center crosshairs */}
              <div style={{ position: 'absolute', top: '50%', left: 20, right: 20, height: 1, background: 'var(--border)' }} />
              <div style={{ position: 'absolute', left: '50%', top: 20, bottom: 20, width: 1, background: 'var(--border)' }} />

              {/* Quadrant Labels */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', opacity: 0.7 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>Niche / Specialized</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-end', opacity: 0.9 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--purple)', background: 'var(--purple-bg)', padding: '2px 8px', borderRadius: 4 }}>
                  ★ THE WINNING MOAT (High Speed + Zero Lock-in)
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', opacity: 0.7 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>Legacy / Manual Tools</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-end', opacity: 0.7 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue)' }}>High Cloud-Cost Giants</span>
              </div>

              {/* Our Solution Star Pin */}
              <div style={{
                position: 'absolute',
                top: '25%',
                right: '25%',
                background: 'linear-gradient(135deg, #6d28d9, #4338ca)',
                color: '#fff',
                padding: '6px 12px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 800,
                boxShadow: '0 4px 14px rgba(109, 40, 217, 0.4)',
                transform: 'translate(50%, -50%)',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <span>⚡</span> OPS / Forge
              </div>

              {/* Competitor Pins */}
              {competitors.slice(0, 5).map((comp, i) => {
                const positions = [
                  { top: '65%', right: '30%' },
                  { top: '40%', right: '70%' },
                  { top: '75%', right: '65%' },
                  { top: '30%', right: '80%' },
                  { top: '80%', right: '20%' },
                ];
                const pos = positions[i % positions.length];

                return (
                  <div
                    key={comp._id}
                    style={{
                      position: 'absolute',
                      top: pos.top,
                      right: pos.right,
                      background: 'var(--surface)',
                      color: 'var(--text)',
                      border: '1px solid var(--border)',
                      padding: '4px 10px',
                      borderRadius: 14,
                      fontSize: 11,
                      fontWeight: 700,
                      transform: 'translate(50%, -50%)',
                      zIndex: 5,
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    {comp.name}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Whitespace Breakdown */}
          <div className="card" style={{ padding: 18 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 8 }}>💡 Exploitable Market Whitespace</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
              <div style={{ background: 'var(--surface-2)', padding: 12, borderRadius: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--purple)', marginBottom: 4 }}>1. All-in-One Execution OS</div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  Competitors build isolated tools (issues only or chat only). Forge unifies venture hypotheses with academic mastery and daily life rituals.
                </p>
              </div>

              <div style={{ background: 'var(--surface-2)', padding: 12, borderRadius: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--blue)', marginBottom: 4 }}>2. Zero Telemetry & Local Execution</div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  Enterprise teams and technical solo operators demand local file safety without cloud vendor lock-in or recurring seat fees.
                </p>
              </div>

              <div style={{ background: 'var(--surface-2)', padding: 12, borderRadius: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--green)', marginBottom: 4 }}>3. Deterministic Feedback Loops</div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  Bridge unstructured LLM outputs to verifiable next actions, test suites, and MIT prioritization.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL: CREATE / EDIT RESEARCH ITEM */}
      {/* ───────────────────────────────────────────────────────────── */}
      {showResearchModal && (
        <div className="modal-backdrop" onClick={() => setShowResearchModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}>{editingResearchItem ? 'Edit Research Item' : 'New Research Item'}</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowResearchModal(false)}>✕</button>
            </div>
            <form onSubmit={handleResearchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label className="label">Problem / Hypothesis *</label>
                <input
                  className="input"
                  required
                  placeholder="e.g. LLM fine-tuning latency on edge devices"
                  value={researchForm.problem}
                  onChange={e => setResearchForm({ ...researchForm, problem: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Research Question</label>
                <input
                  className="input"
                  placeholder="What specifically needs validation?"
                  value={researchForm.question}
                  onChange={e => setResearchForm({ ...researchForm, question: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label className="label">Area</label>
                  <select
                    className="input select"
                    value={researchForm.area}
                    onChange={e => setResearchForm({ ...researchForm, area: e.target.value })}
                  >
                    {AREAS.filter(a => a !== 'ALL').map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Stage</label>
                  <select
                    className="input select"
                    value={researchForm.status}
                    onChange={e => setResearchForm({ ...researchForm, status: e.target.value })}
                  >
                    {STAGES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Findings / Data</label>
                <textarea
                  className="input textarea"
                  rows={2}
                  placeholder="What did tests or papers show?"
                  value={researchForm.finding}
                  onChange={e => setResearchForm({ ...researchForm, finding: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Insight</label>
                <textarea
                  className="input textarea"
                  rows={2}
                  placeholder="What non-obvious takeaway emerged?"
                  value={researchForm.insight}
                  onChange={e => setResearchForm({ ...researchForm, insight: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label className="label">Decision Made</label>
                  <input
                    className="input"
                    placeholder="e.g. Use ONNX Runtime"
                    value={researchForm.decision}
                    onChange={e => setResearchForm({ ...researchForm, decision: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label">Next Action</label>
                  <input
                    className="input"
                    placeholder="e.g. Build benchmark script"
                    value={researchForm.nextAction}
                    onChange={e => setResearchForm({ ...researchForm, nextAction: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="label">Tags (comma-separated)</label>
                <input
                  className="input"
                  placeholder="ai, edge, latency"
                  value={researchForm.tags}
                  onChange={e => setResearchForm({ ...researchForm, tags: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowResearchModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingResearchItem ? 'Save Changes' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL: CREATE / EDIT COMPETITOR */}
      {/* ───────────────────────────────────────────────────────────── */}
      {showCompetitorModal && (
        <div className="modal-backdrop" onClick={() => setShowCompetitorModal(false)}>
          <div className="modal-card" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}>{editingCompetitor ? 'Edit Competitor Profile' : 'Add New Competitor'}</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowCompetitorModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCompetitorSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '75vh', overflowY: 'auto', paddingRight: 4 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label className="label">Competitor Name *</label>
                  <input
                    className="input"
                    required
                    placeholder="e.g. Cursor, Linear"
                    value={competitorForm.name}
                    onChange={e => setCompetitorForm({ ...competitorForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Website</label>
                  <input
                    className="input"
                    placeholder="https://example.com"
                    value={competitorForm.website}
                    onChange={e => setCompetitorForm({ ...competitorForm, website: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="label">Tagline / Positioning</label>
                <input
                  className="input"
                  placeholder="e.g. The AI-first Code Editor"
                  value={competitorForm.tagline}
                  onChange={e => setCompetitorForm({ ...competitorForm, tagline: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <div>
                  <label className="label">Category</label>
                  <select
                    className="input select"
                    value={competitorForm.category}
                    onChange={e => setCompetitorForm({ ...competitorForm, category: e.target.value })}
                  >
                    {COMPETITOR_CATEGORIES.filter(c => c !== 'ALL').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Threat Level</label>
                  <select
                    className="input select"
                    value={competitorForm.threatLevel}
                    onChange={e => setCompetitorForm({ ...competitorForm, threatLevel: e.target.value })}
                  >
                    {THREAT_LEVELS.filter(t => t !== 'ALL').map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Status</label>
                  <select
                    className="input select"
                    value={competitorForm.status}
                    onChange={e => setCompetitorForm({ ...competitorForm, status: e.target.value })}
                  >
                    {['ACTIVE', 'DOMINANT', 'EMERGING', 'DECLINING', 'ACQUIRED'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Our Differentiator / Unfair Advantage 🛡️</label>
                <textarea
                  className="input textarea"
                  rows={2}
                  placeholder="Why our product wins against them (e.g. 100% local privacy, zero lock-in)..."
                  value={competitorForm.ourDifferentiator}
                  onChange={e => setCompetitorForm({ ...competitorForm, ourDifferentiator: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label className="label">Their Strengths (1 per line)</label>
                  <textarea
                    className="input textarea"
                    rows={3}
                    placeholder="Tight IDE integration&#10;Fast autocomplete&#10;Brand mindshare"
                    value={competitorForm.strengths}
                    onChange={e => setCompetitorForm({ ...competitorForm, strengths: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label">Their Weaknesses / Gaps (1 per line)</label>
                  <textarea
                    className="input textarea"
                    rows={3}
                    placeholder="Closed source&#10;Telemetry privacy risk&#10;Rate limits"
                    value={competitorForm.weaknesses}
                    onChange={e => setCompetitorForm({ ...competitorForm, weaknesses: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label className="label">Pricing Model</label>
                  <input
                    className="input"
                    placeholder="e.g. Freemium ($20/mo Pro)"
                    value={competitorForm.pricingModel}
                    onChange={e => setCompetitorForm({ ...competitorForm, pricingModel: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Target Audience (ICP)</label>
                  <input
                    className="input"
                    placeholder="e.g. AI Engineers, Indie Hackers"
                    value={competitorForm.targetAudience}
                    onChange={e => setCompetitorForm({ ...competitorForm, targetAudience: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="label">Traction / Funding / Notes</label>
                <input
                  className="input"
                  placeholder="e.g. $100M raised, 50k DAU"
                  value={competitorForm.marketShareNotes}
                  onChange={e => setCompetitorForm({ ...competitorForm, marketShareNotes: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Tags (comma-separated)</label>
                <input
                  className="input"
                  placeholder="ai, ide, developer-tools"
                  value={competitorForm.tags}
                  onChange={e => setCompetitorForm({ ...competitorForm, tags: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCompetitorModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCompetitor ? 'Save Competitor' : 'Add Competitor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
