'use client';
import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';

const PIPELINE_STAGES = ['LEARN', 'UNDERSTAND', 'PRACTICE', 'PYQS', 'REVISE', 'TEST', 'MASTERED'];
const STAGE_COLORS = {
  LEARN: 'var(--text-muted)',
  UNDERSTAND: 'var(--blue)',
  PRACTICE: 'var(--orange)',
  PYQS: 'var(--purple)',
  REVISE: 'var(--yellow)',
  TEST: 'var(--red)',
  MASTERED: 'var(--green)',
};

const GATE_DATE = new Date('2027-02-01');
const daysToGate = Math.max(0, Math.ceil((GATE_DATE - new Date()) / 86400000));

function TopicRow({ topic, onUpdateStage, onToggleWeak }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 10,
        padding: '10px 0',
        borderBottom: '1px solid var(--border-subtle)',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ flex: 1, minWidth: 160 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{topic.name}</div>
        {topic.isWeak && (
          <div style={{ fontSize: 10, color: 'var(--red)', fontWeight: 800, marginTop: 2 }}>
            ⚠ WEAK AREA — REVISION REQUIRED
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center' }}>
        {PIPELINE_STAGES.map(s => {
          const isActive = s === topic.status;
          const isDone = PIPELINE_STAGES.indexOf(s) < PIPELINE_STAGES.indexOf(topic.status);
          return (
            <button
              key={s}
              onClick={() => onUpdateStage(topic._id || topic.name, s)}
              title={s}
              style={{
                padding: '3px 8px',
                borderRadius: 14,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.3px',
                textTransform: 'uppercase',
                cursor: 'pointer',
                border: 'none',
                background: isActive ? STAGE_COLORS[s] : isDone ? 'var(--green-bg)' : 'var(--surface-2)',
                color: isActive ? '#fff' : isDone ? 'var(--green)' : 'var(--text-muted)',
                opacity: isDone ? 0.7 : 1,
                transition: 'all 0.15s ease',
              }}
            >
              {s === 'MASTERED' ? '★ Mastered' : s}
            </button>
          );
        })}

        <button
          onClick={() => onToggleWeak(topic._id || topic.name)}
          title="Toggle Weak Area"
          style={{
            padding: '3px 8px',
            borderRadius: 14,
            fontSize: 10,
            fontWeight: 800,
            background: topic.isWeak ? 'var(--red-bg)' : 'var(--surface-2)',
            color: topic.isWeak ? 'var(--red)' : 'var(--text-muted)',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {topic.isWeak ? '⚠ Weak' : 'Flag Weak'}
        </button>
      </div>
    </div>
  );
}

function SubjectCard({ subject, onUpdateSubject }) {
  const [expanded, setExpanded] = useState(false);
  const total = subject.topics?.length || 0;
  const mastered = subject.topics?.filter(t => t.status === 'MASTERED').length || 0;
  const weak = subject.topics?.filter(t => t.isWeak).length || 0;
  const pct = total > 0 ? Math.round((mastered / total) * 100) : 0;

  async function updateTopicStage(topicIdOrName, newStage) {
    const topics = (subject.topics || []).map(t =>
      (t._id === topicIdOrName || t.name === topicIdOrName) ? { ...t, status: newStage } : t
    );
    await fetch(`/api/gate/${subject._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topics }),
    });
    onUpdateSubject();
  }

  async function toggleWeak(topicIdOrName) {
    const topics = (subject.topics || []).map(t =>
      (t._id === topicIdOrName || t.name === topicIdOrName) ? { ...t, isWeak: !t.isWeak } : t
    );
    await fetch(`/api/gate/${subject._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topics }),
    });
    onUpdateSubject();
  }

  async function updateField(field, val) {
    await fetch(`/api/gate/${subject._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: Number(val) || 0 }),
    });
    onUpdateSubject();
  }

  return (
    <div className="card" style={{ marginBottom: 14, padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: 16, fontWeight: 800 }}>{subject.name}</h3>
            {weak > 0 && (
              <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--red)', background: 'var(--red-bg)', padding: '2px 8px', borderRadius: 10 }}>
                ⚠ {weak} weak topics
              </span>
            )}
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
              <span>{mastered}/{total} topics mastered</span>
              <strong style={{ color: pct === 100 ? 'var(--green)' : 'inherit' }}>{pct}%</strong>
            </div>
            <div style={{ width: '100%', height: 6, background: 'var(--surface-2)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? 'var(--green)' : 'var(--blue)', transition: 'width 0.3s ease' }} />
            </div>
          </div>

          {/* Questions & PYQs counters */}
          <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-secondary)', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>Questions Solved:</span>
              <input
                type="number"
                className="input"
                style={{ width: 65, padding: '2px 6px', fontSize: 11 }}
                defaultValue={subject.questionsAttempted || 0}
                onBlur={e => updateField('questionsAttempted', e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>PYQs Solved:</span>
              <input
                type="number"
                className="input"
                style={{ width: 65, padding: '2px 6px', fontSize: 11 }}
                defaultValue={subject.pyqsCompleted || 0}
                onBlur={e => updateField('pyqsCompleted', e.target.value)}
              />
            </div>
          </div>
        </div>

        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setExpanded(!expanded)}
          style={{ alignSelf: 'flex-start' }}
        >
          {expanded ? 'Hide Topics ▲' : `View ${total} Topics ▼`}
        </button>
      </div>

      {/* Expanded Topics List */}
      {expanded && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
            IIT Madras DA Micro-Topics Pipeline
          </div>
          {subject.topics?.map((topic, idx) => (
            <TopicRow
              key={topic._id || idx}
              topic={topic}
              onUpdateStage={updateTopicStage}
              onToggleWeak={toggleWeak}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function GatePage() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  async function loadSubjects() {
    try {
      const res = await fetch('/api/gate');
      const data = await res.json();
      if (data.success) {
        setSubjects(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSubjects();
  }, []);

  async function handleSyncSyllabus() {
    if (!confirm('Sync full official IIT Madras GATE 2027 DA syllabus (7 Sections & micro-topics)?')) return;
    setSyncing(true);
    try {
      await fetch('/api/seed?force=true', { method: 'POST' });
      await loadSubjects();
    } catch (err) {
      console.error(err);
    } finally {
      setSyncing(false);
    }
  }

  const allTopics = subjects.flatMap(s => s.topics || []);
  const masteredTopics = allTopics.filter(t => t.status === 'MASTERED').length;
  const weakTopics = allTopics.filter(t => t.isWeak).length;
  const totalQuestions = subjects.reduce((acc, s) => acc + (s.questionsAttempted || 0), 0);
  const totalPYQs = subjects.reduce((acc, s) => acc + (s.pyqsCompleted || 0), 0);
  const overallPct = allTopics.length > 0 ? Math.round((masteredTopics / allTopics.length) * 100) : 0;

  return (
    <AppShell>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 24 }}>🎯</span>
            <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>
              GATE 2027 — DA (Data Science & AI)
            </h1>
            <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 12, background: 'var(--purple-bg)', color: 'var(--purple)' }}>
              IIT Madras · Organizing Institute
            </span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            Official 7-Section curriculum tracker, PYQ counter & mastery pipeline
          </p>
        </div>

        <button
          className="btn btn-secondary btn-sm"
          onClick={handleSyncSyllabus}
          disabled={syncing}
        >
          {syncing ? 'Syncing Syllabus...' : '🔄 Sync IIT Madras Syllabus'}
        </button>
      </div>

      {/* Countdown & High-Level KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 20 }}>
        <div className="card" style={{ padding: '12px 14px', borderLeft: '3px solid var(--orange)' }}>
          <div style={{ fontSize: 11, color: 'var(--orange)', textTransform: 'uppercase', fontWeight: 800 }}>Days to Exam</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--orange)', marginTop: 4 }}>{daysToGate}d</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>February 2027</div>
        </div>

        <div className="card" style={{ padding: '12px 14px', borderLeft: '3px solid var(--green)' }}>
          <div style={{ fontSize: 11, color: 'var(--green)', textTransform: 'uppercase', fontWeight: 800 }}>Syllabus Mastered</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--green)', marginTop: 4 }}>{overallPct}%</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{masteredTopics}/{allTopics.length} Topics</div>
        </div>

        <div className="card" style={{ padding: '12px 14px', borderLeft: '3px solid var(--blue)' }}>
          <div style={{ fontSize: 11, color: 'var(--blue)', textTransform: 'uppercase', fontWeight: 800 }}>Total Practice</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--blue)', marginTop: 4 }}>{totalQuestions + totalPYQs}</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{totalPYQs} PYQs solved</div>
        </div>

        <div className="card" style={{ padding: '12px 14px', borderLeft: '3px solid var(--red)' }}>
          <div style={{ fontSize: 11, color: 'var(--red)', textTransform: 'uppercase', fontWeight: 800 }}>Weak Areas</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--red)', marginTop: 4 }}>{weakTopics}</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Require revision</div>
        </div>
      </div>

      {/* 7 Sections Overview */}
      {loading ? (
        <div className="loading-state"><div className="spinner" /></div>
      ) : subjects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-title">No GATE subjects found</div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            Click below to load the complete 7-Section IIT Madras syllabus.
          </p>
          <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={handleSyncSyllabus}>
            Load IIT Madras DA Syllabus
          </button>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 12 }}>
            Official IIT Madras 7 Sections
          </div>
          {subjects.map(subject => (
            <SubjectCard
              key={subject._id}
              subject={subject}
              onUpdateSubject={loadSubjects}
            />
          ))}
        </div>
      )}
    </AppShell>
  );
}
