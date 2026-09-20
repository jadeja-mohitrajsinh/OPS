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

export default function ForgePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArea, setSelectedArea] = useState('ALL');
  const [selectedStage, setSelectedStage] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [form, setForm] = useState({
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

  async function loadItems() {
    try {
      const res = await fetch('/api/forge');
      const data = await res.json();
      if (data.success) {
        setItems(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.problem.trim()) return;

    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };

      if (editingItem) {
        await fetch(`/api/forge/${editingItem._id}`, {
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

      setShowModal(false);
      setEditingItem(null);
      setForm({
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
      loadItems();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleStatusChange(id, status) {
    try {
      await fetch(`/api/forge/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      loadItems();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this research item?')) return;
    try {
      await fetch(`/api/forge/${id}`, { method: 'DELETE' });
      loadItems();
    } catch (err) {
      console.error(err);
    }
  }

  function openEdit(item) {
    setEditingItem(item);
    setForm({
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
    setShowModal(true);
  }

  const filtered = items.filter(item => {
    if (selectedArea !== 'ALL' && item.area !== selectedArea) return false;
    if (selectedStage !== 'ALL' && item.status !== selectedStage) return false;
    return true;
  });

  const researchCount = items.filter(i => i.status === 'RESEARCH').length;
  const insightCount = items.filter(i => i.status === 'INSIGHT').length;
  const actionCount = items.filter(i => i.status === 'ACTION').length;

  return (
    <AppShell>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>⚡</span>
            <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>Forge Hub</h1>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            Startup ideas, deep research, user discovery & engineering validation
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingItem(null);
            setForm({
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
            setShowModal(true);
          }}
        >
          + Log Research
        </button>
      </div>

      {/* KPI Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 20 }}>
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
      {loading ? (
        <div className="loading-state"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-title">No forge items found</div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Capture your hypothesis, discovery, or startup experiment.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map(item => (
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
                  <button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }} onClick={() => openEdit(item)}>
                    Edit
                  </button>
                  <button className="btn btn-ghost btn-sm" style={{ fontSize: 11, color: 'var(--red)' }} onClick={() => handleDelete(item._id)}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for create/edit */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}>{editingItem ? 'Edit Research Item' : 'New Research Item'}</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label className="label">Problem / Hypothesis *</label>
                <input
                  className="input"
                  required
                  placeholder="e.g. LLM fine-tuning latency on edge devices"
                  value={form.problem}
                  onChange={e => setForm({ ...form, problem: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Research Question</label>
                <input
                  className="input"
                  placeholder="What specifically needs validation?"
                  value={form.question}
                  onChange={e => setForm({ ...form, question: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label className="label">Area</label>
                  <select
                    className="input select"
                    value={form.area}
                    onChange={e => setForm({ ...form, area: e.target.value })}
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
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
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
                  value={form.finding}
                  onChange={e => setForm({ ...form, finding: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Insight</label>
                <textarea
                  className="input textarea"
                  rows={2}
                  placeholder="What non-obvious takeaway emerged?"
                  value={form.insight}
                  onChange={e => setForm({ ...form, insight: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label className="label">Decision Made</label>
                  <input
                    className="input"
                    placeholder="e.g. Use ONNX Runtime"
                    value={form.decision}
                    onChange={e => setForm({ ...form, decision: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label">Next Action</label>
                  <input
                    className="input"
                    placeholder="e.g. Build benchmark script"
                    value={form.nextAction}
                    onChange={e => setForm({ ...form, nextAction: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingItem ? 'Save Changes' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
