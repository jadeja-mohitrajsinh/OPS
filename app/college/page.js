'use client';
import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import AppModal from '@/components/AppModal';

const STATUS_STAGES = ['NOT_STARTED', 'LEARNING', 'PRACTICED', 'REVISED', 'EXAM_READY'];
const STATUS_COLORS = { NOT_STARTED: 'var(--text-muted)', LEARNING: 'var(--blue)', PRACTICED: 'var(--orange)', REVISED: 'var(--purple)', EXAM_READY: 'var(--green)' };
const MID2_COLORS = { PENDING: 'var(--orange)', COMPLETED: 'var(--green)', NOT_SCHEDULED: 'var(--text-muted)' };

function SubjectCard({ subject, onUpdate, onDelete, onAddUnit }) {
  const [expanded, setExpanded] = useState(false);
  const [newAssignment, setNewAssignment] = useState('');
  const [assignmentDue, setAssignmentDue] = useState('');
  const [topicModal, setTopicModal] = useState(null);
  const [topicForm, setTopicForm] = useState({ title: '', notes: '' });
  const [topicDelete, setTopicDelete] = useState(null);
  const [topicSaving, setTopicSaving] = useState(false);
  const [topicError, setTopicError] = useState('');

  const totalUnits = subject.units?.length || 0;
  const doneUnits = subject.units?.filter(u => u.status === 'EXAM_READY').length || 0;
  const pendingAssignments = subject.assignments?.filter(a => a.status === 'PENDING').length || 0;

  async function updateStatus(status) {
    await fetch(`/api/college/${subject._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    onUpdate();
  }

  async function updateUnitStatus(unitIndex, status) {
    const units = (subject.units || []).map((u, index) => index === unitIndex ? { ...u, status } : u);
    await fetch(`/api/college/${subject._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ units }) });
    onUpdate();
  }

  async function updateMid2(status) {
    await fetch(`/api/college/${subject._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mid2Status: status }) });
    onUpdate();
  }

  async function updateVivaStatus(status) {
    await fetch(`/api/college/${subject._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ viva: { ...subject.viva, status } }) });
    onUpdate();
  }

  async function addAssignment() {
    if (!newAssignment.trim()) return;
    const assignments = [...(subject.assignments || []), { title: newAssignment, dueDate: assignmentDue || null, status: 'PENDING' }];
    await fetch(`/api/college/${subject._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assignments }) });
    setNewAssignment(''); setAssignmentDue('');
    onUpdate();
  }

  async function toggleAssignment(i) {
    const assignments = [...(subject.assignments || [])];
    assignments[i] = { ...assignments[i], status: assignments[i].status === 'SUBMITTED' ? 'PENDING' : 'SUBMITTED' };
    await fetch(`/api/college/${subject._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assignments }) });
    onUpdate();
  }

  async function saveTopic(event) {
    event.preventDefault();
    if (!topicModal || !topicForm.title.trim()) { setTopicError('Topic title is required.'); return; }
    setTopicSaving(true); setTopicError('');
    try {
      const units = (subject.units || []).map((unit, unitIndex) => {
        if (unitIndex !== topicModal.unitIndex) return unit;
        const topics = [...(unit.topics || [])];
        if (topicModal.topicIndex === null) topics.push({ title: topicForm.title.trim(), notes: topicForm.notes.trim(), completed: false });
        else topics[topicModal.topicIndex] = { ...topics[topicModal.topicIndex], title: topicForm.title.trim(), notes: topicForm.notes.trim() };
        return { ...unit, topics };
      });
      const response = await fetch(`/api/college/${subject._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ units }) });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Unable to save topic.');
      setTopicModal(null); setTopicForm({ title: '', notes: '' }); onUpdate();
    } catch (error) { setTopicError(error.message || 'Unable to save topic.'); } finally { setTopicSaving(false); }
  }

  async function toggleTopic(unitIndex, topicIndex) {
    const units = (subject.units || []).map((unit, currentUnitIndex) => currentUnitIndex === unitIndex ? { ...unit, topics: (unit.topics || []).map((topic, currentTopicIndex) => currentTopicIndex === topicIndex ? { ...topic, completed: !topic.completed } : topic) } : unit);
    await fetch(`/api/college/${subject._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ units }) });
    onUpdate();
  }

  async function deleteTopic() {
    if (!topicDelete) return;
    setTopicSaving(true); setTopicError('');
    try {
      const units = (subject.units || []).map((unit, unitIndex) => unitIndex === topicDelete.unitIndex ? { ...unit, topics: (unit.topics || []).filter((_, topicIndex) => topicIndex !== topicDelete.topicIndex) } : unit);
      const response = await fetch(`/api/college/${subject._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ units }) });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Unable to delete topic.');
      setTopicDelete(null); onUpdate();
    } catch (error) { setTopicError(error.message || 'Unable to delete topic.'); } finally { setTopicSaving(false); }
  }

  const pct = totalUnits > 0 ? Math.round((doneUnits / totalUnits) * 100) : 0;

  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>{subject.name}</h3>
            {subject.code && <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{subject.code}</span>}
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: 'var(--surface-2)', color: STATUS_COLORS[subject.status] }}>
              {subject.status?.replace('_', ' ')}
            </span>
          </div>

          {/* Status pipeline */}
          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 10 }}>
            {STATUS_STAGES.map(s => {
              const isActive = s === subject.status;
              const isDone = STATUS_STAGES.indexOf(s) < STATUS_STAGES.indexOf(subject.status);
              return (
                <button key={s} onClick={() => updateStatus(s)}
                  style={{ padding: '2px 8px', borderRadius: 20, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', border: 'none', cursor: 'pointer',
                    background: isActive ? STATUS_COLORS[s] : isDone ? 'var(--surface-2)' : 'var(--surface-2)',
                    color: isActive ? 'white' : isDone ? 'var(--text-muted)' : 'var(--text-muted)',
                    opacity: isDone ? 0.5 : 1 }}>
                  {s.replace('_', ' ')[0] + s.replace('_', ' ').slice(1).toLowerCase()}
                </button>
              );
            })}
          </div>

          {/* Progress */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
              <span>Units: {doneUnits}/{totalUnits} exam-ready</span>
              <span>{pct}%</span>
            </div>
            <div className="progress-bar"><div className="progress-fill progress-fill-blue" style={{ width: `${pct}%` }} /></div>
          </div>

          {/* Badges row */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Mid 2 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Mid 2:</span>
              {['PENDING', 'COMPLETED'].map(s => (
                <button key={s} onClick={() => updateMid2(s)}
                  style={{ padding: '1px 7px', borderRadius: 20, fontSize: 9, fontWeight: 700, border: 'none', cursor: 'pointer',
                    background: subject.mid2Status === s ? (s === 'COMPLETED' ? 'var(--green-bg)' : 'var(--orange-bg)') : 'var(--surface-2)',
                    color: subject.mid2Status === s ? (s === 'COMPLETED' ? 'var(--green)' : 'var(--orange)') : 'var(--text-muted)' }}>
                  {s}
                </button>
              ))}
            </div>

            {/* Viva */}
            {subject.viva && subject.viva.status !== 'NOT_APPLICABLE' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Viva:</span>
                {['NOT_SCHEDULED', 'COMPLETED'].map(s => (
                  <button key={s} onClick={() => updateVivaStatus(s)}
                    style={{ padding: '1px 7px', borderRadius: 20, fontSize: 9, fontWeight: 700, border: 'none', cursor: 'pointer',
                      background: subject.viva?.status === s ? (s === 'COMPLETED' ? 'var(--green-bg)' : 'var(--surface-2)') : 'var(--surface-2)',
                      color: subject.viva?.status === s ? (s === 'COMPLETED' ? 'var(--green)' : 'var(--text-muted)') : 'var(--text-muted)' }}>
                    {s === 'NOT_SCHEDULED' ? 'Pending' : 'Done'}
                  </button>
                ))}
              </div>
            )}

            {pendingAssignments > 0 && (
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--orange)' }}>📝 {pendingAssignments} assignments due</span>
            )}
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)', padding: '5px 8px' }} onClick={() => onDelete(subject)} title={`Delete ${subject.name}`}>Delete</button>
      </div>

      {/* Expand */}
      <button onClick={() => setExpanded(e => !e)} style={{ fontSize: 12, color: 'var(--blue)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
        {expanded ? '▼' : '▶'} {expanded ? 'Hide' : 'Show'} Details
      </button>

      {expanded && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
          {/* Units */}
          {subject.units?.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}><span>Units</span><button className="btn btn-ghost btn-sm" onClick={() => onAddUnit(subject)}>+ Add Unit</button></div>
              {subject.units.map((u, i) => (
                <div key={u._id || i} style={{ padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ flex: 1, minWidth: 0, fontSize: 13 }}>{u.name}</span>
                    <select value={u.status} onChange={e => updateUnitStatus(i, e.target.value)}
                      style={{ fontSize: 11, padding: '2px 6px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--surface)', color: STATUS_COLORS[u.status] }}>
                      {STATUS_STAGES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'grid', gap: 5, margin: '8px 0 0 4px' }}>
                    {(u.topics || []).map((topic, topicIndex) => (
                      <div key={topic._id || topicIndex} style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                        <button type="button" aria-label={`${topic.completed ? 'Mark incomplete' : 'Mark complete'}: ${topic.title}`} onClick={() => toggleTopic(i, topicIndex)} style={{ width: 18, height: 18, borderRadius: 5, flexShrink: 0, border: topic.completed ? 'none' : '1px solid var(--border)', background: topic.completed ? 'var(--green)' : 'var(--surface-2)', color: '#fff' }}>{topic.completed ? '✓' : ''}</button>
                        <span style={{ flex: 1, minWidth: 0, fontSize: 12, color: topic.completed ? 'var(--text-muted)' : 'var(--text)', textDecoration: topic.completed ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{topic.title}</span>
                        <button className="btn btn-ghost btn-sm" type="button" onClick={() => { setTopicError(''); setTopicForm({ title: topic.title, notes: topic.notes || '' }); setTopicModal({ unitIndex: i, topicIndex }); }}>Edit</button>
                        <button className="btn btn-ghost btn-sm" type="button" style={{ color: 'var(--red)' }} onClick={() => { setTopicError(''); setTopicDelete({ unitIndex: i, topicIndex, title: topic.title }); }}>Delete</button>
                      </div>
                    ))}
                    <button className="btn btn-ghost btn-sm" type="button" style={{ justifySelf: 'start', color: 'var(--blue)' }} onClick={() => { setTopicError(''); setTopicForm({ title: '', notes: '' }); setTopicModal({ unitIndex: i, topicIndex: null }); }}>+ Add Topic</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!subject.units?.length && <button className="btn btn-secondary btn-sm" onClick={() => onAddUnit(subject)}>+ Add first unit</button>}

          {/* Assignments */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>Assignments</div>
            {subject.assignments?.map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--border-subtle)', alignItems: 'center' }}>
                <button onClick={() => toggleAssignment(i)}
                  style={{ width: 16, height: 16, borderRadius: 4, border: a.status === 'SUBMITTED' ? 'none' : '1.5px solid var(--border)', background: a.status === 'SUBMITTED' ? 'var(--green)' : 'var(--surface-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {a.status === 'SUBMITTED' && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg>}
                </button>
                <span style={{ flex: 1, fontSize: 12, textDecoration: a.status === 'SUBMITTED' ? 'line-through' : 'none', color: a.status === 'SUBMITTED' ? 'var(--text-muted)' : 'var(--text)' }}>{a.title}</span>
                {a.dueDate && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(a.dueDate).toLocaleDateString()}</span>}
                <span style={{ fontSize: 10, fontWeight: 700, color: a.status === 'SUBMITTED' ? 'var(--green)' : 'var(--orange)' }}>{a.status}</span>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <input className="input" style={{ flex: 1, fontSize: 12, padding: '6px 10px' }} value={newAssignment} onChange={e => setNewAssignment(e.target.value)} placeholder="New assignment..." onKeyDown={e => e.key === 'Enter' && addAssignment()} />
              <input className="input" type="date" style={{ width: 130, fontSize: 12, padding: '6px 10px' }} value={assignmentDue} onChange={e => setAssignmentDue(e.target.value)} />
              <button className="btn btn-primary btn-sm" onClick={addAssignment}>Add</button>
            </div>
          </div>
        </div>
      )}
      <AppModal open={Boolean(topicModal)} onClose={() => !topicSaving && setTopicModal(null)} title={topicModal?.topicIndex === null ? 'Add topic' : 'Edit topic'} size="sm" footer={<><button className="btn btn-secondary" disabled={topicSaving} onClick={() => setTopicModal(null)}>Cancel</button><button className="btn btn-primary" type="submit" form={`topic-form-${subject._id}`} disabled={topicSaving}>{topicSaving ? 'Saving…' : 'Save topic'}</button></>}>
        <form id={`topic-form-${subject._id}`} onSubmit={saveTopic} style={{ display: 'grid', gap: 12 }}>
          <div><label className="label">Topic title *</label><input className="input" autoFocus value={topicForm.title} onChange={event => setTopicForm({ ...topicForm, title: event.target.value })} /></div>
          <div><label className="label">Notes</label><textarea className="input textarea" rows={3} value={topicForm.notes} onChange={event => setTopicForm({ ...topicForm, notes: event.target.value })} /></div>
          {topicError && <p role="alert" style={{ color: 'var(--red)', fontSize: 13 }}>{topicError}</p>}
        </form>
      </AppModal>
      <AppModal open={Boolean(topicDelete)} onClose={() => !topicSaving && setTopicDelete(null)} title="Delete topic?" size="sm" footer={<><button className="btn btn-secondary" disabled={topicSaving} onClick={() => setTopicDelete(null)}>Cancel</button><button className="btn btn-danger" disabled={topicSaving} onClick={deleteTopic}>{topicSaving ? 'Deleting…' : 'Delete'}</button></>}>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>Delete “{topicDelete?.title}”? This cannot be undone.</p>
        {topicError && <p role="alert" style={{ color: 'var(--red)', fontSize: 13, marginTop: 12 }}>{topicError}</p>}
      </AppModal>
    </div>
  );
}

export default function CollegePage() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [subjectForm, setSubjectForm] = useState({ name: '', code: '', semester: '', professor: '' });
  const [unitSubject, setUnitSubject] = useState(null);
  const [unitName, setUnitName] = useState('');
  const [deleteSubject, setDeleteSubject] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  async function load() {
    setLoading(true);
    const res = await fetch('/api/college');
    const data = await res.json();
    setSubjects(data.success ? data.data : []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function createSubject(event) {
    event.preventDefault();
    if (!subjectForm.name.trim()) { setFormError('Subject name is required.'); return; }
    setSaving(true); setFormError('');
    try {
      const response = await fetch('/api/college', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...subjectForm, name: subjectForm.name.trim(), units: [] }) });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Unable to create subject');
      setShowSubjectModal(false); setSubjectForm({ name: '', code: '', semester: '', professor: '' }); load();
    } catch (error) { setFormError(error.message || 'Unable to create subject'); } finally { setSaving(false); }
  }

  async function createUnit(event) {
    event.preventDefault();
    if (!unitSubject || !unitName.trim()) return;
    setSaving(true); setFormError('');
    try {
      const units = [...(unitSubject.units || []), { name: unitName.trim(), status: 'NOT_STARTED' }];
      const response = await fetch(`/api/college/${unitSubject._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ units }) });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Unable to add unit');
      setUnitSubject(null); setUnitName(''); load();
    } catch (error) { setFormError(error.message || 'Unable to add unit'); } finally { setSaving(false); }
  }

  async function removeSubject() {
    if (!deleteSubject) return;
    setSaving(true); setFormError('');
    try {
      const response = await fetch(`/api/college/${deleteSubject._id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Unable to delete subject');
      setSubjects(current => current.filter(subject => subject._id !== deleteSubject._id));
      setDeleteSubject(null);
    } catch (error) { setFormError(error.message || 'Unable to delete subject'); } finally { setSaving(false); }
  }

  const examReadyCount = subjects.filter(s => s.status === 'EXAM_READY').length;
  const pendingMid2 = subjects.filter(s => s.mid2Status === 'PENDING').length;
  const pendingViva = subjects.filter(s => s.viva?.status === 'NOT_SCHEDULED').length;
  const totalAssignments = subjects.reduce((a, s) => a + (s.assignments?.filter(x => x.status === 'PENDING').length || 0), 0);

  return (
    <AppShell>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}><div><h1 className="page-title">College</h1><p className="page-subtitle">Manage your subjects and syllabus</p></div><button className="btn btn-primary" onClick={() => { setFormError(''); setShowSubjectModal(true); }}>+ Add Subject</button></div>
      </div>

      {/* Status Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 20 }}>
        <div className="card" style={{ background: pendingMid2 > 0 ? 'var(--orange-bg)' : 'var(--green-bg)', border: 'none', textAlign: 'center', padding: '12px' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: pendingMid2 > 0 ? 'var(--orange)' : 'var(--green)' }}>{pendingMid2}</div>
          <div style={{ fontSize: 11, color: pendingMid2 > 0 ? 'var(--orange)' : 'var(--green)', fontWeight: 600 }}>Mid 2 Pending</div>
        </div>
        <div className="card" style={{ background: totalAssignments > 0 ? 'var(--red-bg)' : 'var(--green-bg)', border: 'none', textAlign: 'center', padding: '12px' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: totalAssignments > 0 ? 'var(--red)' : 'var(--green)' }}>{totalAssignments}</div>
          <div style={{ fontSize: 11, color: totalAssignments > 0 ? 'var(--red)' : 'var(--green)', fontWeight: 600 }}>Assignments Due</div>
        </div>
        <div className="card" style={{ background: 'var(--blue-bg)', border: 'none', textAlign: 'center', padding: '12px' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--blue)' }}>{pendingViva}</div>
          <div style={{ fontSize: 11, color: 'var(--blue)', fontWeight: 600 }}>Vivas Pending</div>
        </div>
        <div className="card" style={{ background: 'var(--green-bg)', border: 'none', textAlign: 'center', padding: '12px' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--green)' }}>{examReadyCount}</div>
          <div style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600 }}>Exam Ready</div>
        </div>
      </div>

      {/* Priority Context */}
      <div className="card" style={{ marginBottom: 20, background: 'var(--red-bg)', border: 'none' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>P0 — Current Focus</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Mid 2 exams and vivas are the top priority. Finish submissions before moving to GATE prep.</div>
      </div>

      {loading ? (
        <div className="loading-state"><div className="spinner" /></div>
      ) : subjects.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">🎓</div><div className="empty-state-title">No subjects yet</div><div className="empty-state-desc">Run seed to load subjects</div></div>
      ) : (
        subjects.map(s => <SubjectCard key={s._id} subject={s} onUpdate={load} onDelete={setDeleteSubject} onAddUnit={(subject) => { setFormError(''); setUnitSubject(subject); }} />)
      )}
      <AppModal open={showSubjectModal} onClose={() => !saving && setShowSubjectModal(false)} title="Add Subject" footer={<><button className="btn btn-secondary" disabled={saving} onClick={() => setShowSubjectModal(false)}>Cancel</button><button className="btn btn-primary" type="submit" form="subject-form" disabled={saving}>{saving ? 'Adding…' : 'Add Subject'}</button></>}><form id="subject-form" onSubmit={createSubject} style={{ display: 'grid', gap: 14 }}><div><label className="label">Subject Name *</label><input className="input" autoFocus value={subjectForm.name} onChange={e => setSubjectForm({ ...subjectForm, name: e.target.value })} /></div><div><label className="label">Subject Code</label><input className="input" value={subjectForm.code} onChange={e => setSubjectForm({ ...subjectForm, code: e.target.value })} /></div><div><label className="label">Semester</label><input className="input" value={subjectForm.semester} onChange={e => setSubjectForm({ ...subjectForm, semester: e.target.value })} /></div><div><label className="label">Professor</label><input className="input" value={subjectForm.professor} onChange={e => setSubjectForm({ ...subjectForm, professor: e.target.value })} /></div>{formError && <p style={{ color: 'var(--red)', fontSize: 13 }}>{formError}</p>}</form></AppModal>
      <AppModal open={Boolean(unitSubject)} onClose={() => !saving && setUnitSubject(null)} title="Add Unit" footer={<><button className="btn btn-secondary" disabled={saving} onClick={() => setUnitSubject(null)}>Cancel</button><button className="btn btn-primary" type="submit" form="unit-form" disabled={saving}>{saving ? 'Adding…' : 'Add Unit'}</button></>}><form id="unit-form" onSubmit={createUnit}><label className="label">Unit title *</label><input className="input" autoFocus value={unitName} onChange={e => setUnitName(e.target.value)} />{formError && <p style={{ color: 'var(--red)', fontSize: 13, marginTop: 12 }}>{formError}</p>}</form></AppModal>
      <AppModal open={Boolean(deleteSubject)} onClose={() => !saving && setDeleteSubject(null)} title="Delete subject?" footer={<><button className="btn btn-secondary" disabled={saving} onClick={() => setDeleteSubject(null)}>Cancel</button><button className="btn btn-danger" disabled={saving} onClick={removeSubject}>{saving ? 'Deleting…' : 'Delete'}</button></>}><p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>Delete “{deleteSubject?.name}”? Its units and assignments will be removed too.</p>{formError && <p style={{ color: 'var(--red)', fontSize: 13, marginTop: 12 }}>{formError}</p>}</AppModal>
    </AppShell>
  );
}
