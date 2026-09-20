'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import Link from 'next/link';

function timeSince(d) {
  if (!d) return 'Never';
  const days = Math.floor((Date.now() - new Date(d)) / 86400000);
  if (days === 0) return 'Today'; if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`; if (days < 30) return `${Math.floor(days/7)}w ago`;
  return `${Math.floor(days/30)}mo ago`;
}

export default function PersonDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({});
  const [newCommit, setNewCommit] = useState('');
  const [commitType, setCommitType] = useState('THEY_OWE');
  const [commitDue, setCommitDue] = useState('');
  const [editing, setEditing] = useState(false);

  async function load() {
    const res = await fetch(`/api/people/${id}`);
    const data = await res.json();
    if (data.success) { setPerson(data.data); setForm(data.data); }
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]);

  async function save(updates) {
    await fetch(`/api/people/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, ...updates }) });
    load();
  }

  async function addCommitment() {
    if (!newCommit.trim()) return;
    const commitments = [...(form.commitments || []), { description: newCommit, type: commitType, dueDate: commitDue || null, status: 'OPEN' }];
    await save({ commitments });
    setNewCommit(''); setCommitDue('');
  }

  async function toggleCommitment(i) {
    const commitments = [...(form.commitments || [])];
    commitments[i] = { ...commitments[i], status: commitments[i].status === 'DONE' ? 'OPEN' : 'DONE' };
    await save({ commitments });
  }

  async function handleDelete() {
    if (!confirm('Remove this person?')) return;
    await fetch(`/api/people/${id}`, { method: 'DELETE' });
    router.push('/people');
  }

  async function markInteracted() {
    await save({ lastInteraction: new Date().toISOString() });
  }

  if (loading) return <AppShell><div className="loading-state"><div className="spinner" /></div></AppShell>;
  if (!person) return <AppShell><div className="empty-state"><div className="empty-state-title">Person not found</div><Link href="/people"><button className="btn btn-primary btn-sm">Back</button></Link></div></AppShell>;

  const theyOwe = (person.commitments || []).filter(c => c.type === 'THEY_OWE');
  const iOwe = (person.commitments || []).filter(c => c.type === 'I_OWE');

  return (
    <AppShell>
      <Link href="/people" style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15,18 9,12 15,6"/></svg> People
      </Link>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 24 }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, flexShrink: 0 }}>
          {person.name[0]?.toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.3px' }}>{person.name}</h1>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
            {person.role}{person.organization ? ` · ${person.organization}` : ''}
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 600, background: 'var(--surface-2)', padding: '2px 8px', borderRadius: 20 }}>{person.relationship}</span>
            {person.currentProject && <span style={{ fontSize: 11, background: 'var(--blue-bg)', color: 'var(--blue)', padding: '2px 8px', borderRadius: 20 }}>{person.currentProject}</span>}
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Last: {timeSince(person.lastInteraction)}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          <button onClick={markInteracted} className="btn btn-secondary btn-sm">✓ Met</button>
          <button onClick={handleDelete} className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }}>Delete</button>
        </div>
      </div>

      {/* Important Context */}
      {person.importantContext && (
        <div className="card" style={{ marginBottom: 12, background: 'var(--yellow-bg)', border: 'none' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>⭐ Context</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{person.importantContext}</div>
        </div>
      )}

      {/* Next Interaction */}
      {person.nextInteraction && (
        <div className="card" style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>Next Follow-up</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: new Date(person.nextInteraction) <= new Date() ? 'var(--orange)' : 'var(--text)' }}>
            {new Date(person.nextInteraction).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
            {new Date(person.nextInteraction) <= new Date() ? ' · Due now!' : ''}
          </div>
        </div>
      )}

      {/* Commitments - They Owe */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--orange)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>⏳ They Owe Me</div>
        {theyOwe.length === 0 ? <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Nothing pending</div> : theyOwe.map((c, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, padding: '7px 0', borderBottom: '1px solid var(--border-subtle)', alignItems: 'center' }}>
            <button onClick={() => toggleCommitment(person.commitments.indexOf(c))} style={{ width: 18, height: 18, borderRadius: 5, border: c.status === 'DONE' ? 'none' : '1.5px solid var(--orange)', background: c.status === 'DONE' ? 'var(--green)' : 'var(--orange-bg)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {c.status === 'DONE' && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg>}
            </button>
            <span style={{ flex: 1, fontSize: 13, textDecoration: c.status === 'DONE' ? 'line-through' : 'none', color: c.status === 'DONE' ? 'var(--text-muted)' : 'var(--text)' }}>{c.description}</span>
            {c.dueDate && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(c.dueDate).toLocaleDateString()}</span>}
          </div>
        ))}
      </div>

      {/* Commitments - I Owe */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>📤 I Owe Them</div>
        {iOwe.length === 0 ? <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Nothing pending</div> : iOwe.map((c, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, padding: '7px 0', borderBottom: '1px solid var(--border-subtle)', alignItems: 'center' }}>
            <button onClick={() => toggleCommitment(person.commitments.indexOf(c))} style={{ width: 18, height: 18, borderRadius: 5, border: c.status === 'DONE' ? 'none' : '1.5px solid var(--blue)', background: c.status === 'DONE' ? 'var(--green)' : 'var(--blue-bg)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {c.status === 'DONE' && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg>}
            </button>
            <span style={{ flex: 1, fontSize: 13, textDecoration: c.status === 'DONE' ? 'line-through' : 'none', color: c.status === 'DONE' ? 'var(--text-muted)' : 'var(--text)' }}>{c.description}</span>
          </div>
        ))}
      </div>

      {/* Add Commitment */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>Add Commitment</div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          <button className={`filter-chip ${commitType === 'THEY_OWE' ? 'active' : ''}`} onClick={() => setCommitType('THEY_OWE')} style={{ flexShrink: 0 }}>They owe me</button>
          <button className={`filter-chip ${commitType === 'I_OWE' ? 'active' : ''}`} onClick={() => setCommitType('I_OWE')} style={{ flexShrink: 0 }}>I owe them</button>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="input" style={{ flex: 1, fontSize: 13 }} value={newCommit} onChange={e => setNewCommit(e.target.value)} placeholder="What's the commitment?" onKeyDown={e => e.key === 'Enter' && addCommitment()} />
          <input className="input" type="date" style={{ width: 130, fontSize: 12 }} value={commitDue} onChange={e => setCommitDue(e.target.value)} />
          <button className="btn btn-primary btn-sm" onClick={addCommitment}>Add</button>
        </div>
      </div>

      {/* Notes */}
      {person.notes && (
        <div className="card" style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>Notes</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{person.notes}</div>
        </div>
      )}

      {/* Edit Notes */}
      <div className="card">
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>Update Notes</div>
        <textarea className="input textarea" rows={3} defaultValue={person.notes} onBlur={e => save({ notes: e.target.value })} placeholder="Notes about this person..." />
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <div style={{ flex: 1 }}>
            <label className="label">Next Follow-up</label>
            <input className="input" type="date" defaultValue={person.nextInteraction ? person.nextInteraction.slice(0,10) : ''} onBlur={e => save({ nextInteraction: e.target.value })} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
