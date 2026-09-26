'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import Link from 'next/link';

const PRIORITY_COLORS = { P0: 'var(--red)', P1: 'var(--orange)', P2: 'var(--blue)', P3: 'var(--text-muted)' };

export default function MeetingDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [meeting, setMeeting] = useState(null);
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('before');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const [showPeopleDropdown, setShowPeopleDropdown] = useState(false);
  const [peopleSearch, setPeopleSearch] = useState('');
  const dropdownRef = React.useRef(null);

  async function load() {
    const [mRes, pRes] = await Promise.all([
      fetch(`/api/meetings/${id}`).then(r => r.json()).catch(() => ({ success: false })),
      fetch('/api/people').then(r => r.json()).catch(() => ({ success: false, data: [] })),
    ]);
    if (mRes.success) {
      setMeeting(mRes.data);
      setForm(mRes.data);
    }
    if (pRes.success) {
      setPeople(pRes.data);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowPeopleDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-select tab based on meeting status
  useEffect(() => {
    if (!meeting) return;
    const isPast = new Date(meeting.date) < new Date();
    if (meeting.status === 'COMPLETED') setTab('after');
    else if (isPast) setTab('after');
    else setTab('before');
  }, [meeting]);

  async function save(updates) {
    setSaving(true);
    await fetch(`/api/meetings/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, ...updates }) });
    await load();
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm('Delete this meeting?')) return;
    await fetch(`/api/meetings/${id}`, { method: 'DELETE' });
    router.push('/meetings');
  }

  async function toggleChecklist(i) {
    const updated = [...(form.preparationChecklist || [])];
    updated[i] = { ...updated[i], done: !updated[i].done };
    await save({ preparationChecklist: updated });
  }

  async function addActionItem(task, owner, deadline, priority) {
    const items = [...(form.actionItems || []), { task, owner, deadline, priority, status: 'OPEN' }];
    await save({ actionItems: items });
  }

  async function toggleActionItem(i) {
    const items = [...(form.actionItems || [])];
    items[i] = { ...items[i], status: items[i].status === 'DONE' ? 'OPEN' : 'DONE' };
    await save({ actionItems: items });
  }

  async function addDecision(text) {
    if (!text.trim()) return;
    const decisions = [...(form.decisions || []), text.trim()];
    await save({ decisions });
  }

  const handleAddPerson = (person) => {
    if (!person) return;
    const personId = typeof person === 'object' ? person._id : person;
    if (personId && !form.people.includes(personId)) {
      const updatedPeople = [...(form.people || []), personId];
      save({ people: updatedPeople });
    }
    setPeopleSearch('');
    setShowPeopleDropdown(false);
  };

  const handleRemovePerson = (personId) => {
    const updatedPeople = (form.people || []).filter(p => p !== personId);
    save({ people: updatedPeople });
  };

  const filteredPeople = people.filter(p => 
    p.name.toLowerCase().includes(peopleSearch.toLowerCase()) ||
    (p.role && p.role.toLowerCase().includes(peopleSearch.toLowerCase())) ||
    (p.organization && p.organization.toLowerCase().includes(peopleSearch.toLowerCase()))
  );

  if (loading) return <AppShell><div className="loading-state"><div className="spinner" /></div></AppShell>;
  if (!meeting) return <AppShell><div className="empty-state"><div className="empty-state-title">Meeting not found</div><Link href="/meetings"><button className="btn btn-primary btn-sm">Back</button></Link></div></AppShell>;

  const date = new Date(meeting.date);
  const isToday = date.toDateString() === new Date().toDateString();
  const isPast = date < new Date();

  return (
    <AppShell>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link href="/meetings" style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15,18 9,12 15,6"/></svg> Meetings
          </Link>
          <h1 style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.3px' }}>{meeting.title}</h1>
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{date.toLocaleDateString('en-IN', { weekday: 'short', month: 'long', day: 'numeric' })}</span>
            <span style={{ color: 'var(--text-muted)' }}>·</span>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{meeting.startTime}{meeting.endTime ? ` – ${meeting.endTime}` : ''}</span>
            {meeting.location && <span style={{ fontSize: 12, background: 'var(--surface-2)', padding: '2px 8px', borderRadius: 20 }}>{meeting.location}</span>}
            {isToday && <span style={{ fontSize: 11, fontWeight: 700, background: 'var(--orange-bg)', color: 'var(--orange)', padding: '2px 8px', borderRadius: 20 }}>TODAY</span>}
          </div>
          {meeting.people?.length > 0 && (
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>With: {meeting.people.map(pId => {
              const person = people.find(p => p._id === pId);
              return person ? person.name : pId;
            }).join(', ')}</div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginLeft: 8 }}>
          <button onClick={handleDelete} className="btn btn-ghost btn-sm" style={{ color: 'var(--red)', fontSize: 12 }}>Delete</button>
          {meeting.status !== 'COMPLETED' && (
            <button onClick={() => save({ status: 'COMPLETED' })} className="btn btn-primary btn-sm">Mark Complete</button>
          )}
        </div>
      </div>

      {/* Lifecycle Tabs */}
      <div className="lifecycle-tabs">
        {[['before','Before'],['during','During'],['after','After']].map(([t,l]) => (
          <button key={t} className={`lifecycle-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{l}</button>
        ))}
      </div>

      {/* BEFORE */}
      {tab === 'before' && (
        <div>
          {/* Why / Purpose */}
          <div className="card" style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>Purpose</div>
            {meeting.purpose ? (
              <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{meeting.purpose}</div>
            ) : (
              <div style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>No purpose set. <button style={{ color: 'var(--blue)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>Add one →</button></div>
            )}
          </div>

          {/* Agenda */}
          {meeting.agenda && (
            <div className="card" style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>Agenda</div>
              <div style={{ fontSize: 14, whiteSpace: 'pre-wrap', color: 'var(--text-secondary)' }}>{meeting.agenda}</div>
            </div>
          )}

          {/* Prep Checklist */}
          <div className="card" style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>Preparation Checklist</div>
            {(meeting.preparationChecklist || []).map((item, i) => (
              <div key={i} className="checkbox-row" onClick={() => toggleChecklist(i)} style={{ cursor: 'pointer', padding: '8px 0' }}>
                <div className={`checkbox ${item.done ? 'checked' : ''}`} />
                <span style={{ fontSize: 13, textDecoration: item.done ? 'line-through' : 'none', color: item.done ? 'var(--text-muted)' : 'var(--text)' }}>{item.item}</span>
              </div>
            ))}
          </div>

          {/* Attendees */}
          <div className="card">
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>Attendees</div>
            
            {/* Selected People Tags */}
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 6, 
              marginBottom: 8 
            }}>
              {(form.people || []).map((personId, idx) => {
                const person = people.find(p => p._id === personId);
                const displayName = person ? person.name : personId;
                if (!displayName) return null;
                return (
                  <div key={idx} style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    borderRadius: 6,
                    padding: '4px 8px',
                    fontSize: 12,
                    fontWeight: 500,
                  }}>
                    <span>{displayName}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePerson(personId)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: 14,
                        padding: 0,
                        lineHeight: 1,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>

            {/* People Search Input */}
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <input
                className="input"
                type="text"
                placeholder="Add people..."
                value={peopleSearch}
                onChange={e => {
                  setPeopleSearch(e.target.value);
                  setShowPeopleDropdown(true);
                }}
                onFocus={() => setShowPeopleDropdown(true)}
                style={{ width: '100%' }}
              />
              
              {/* People Dropdown */}
              {showPeopleDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  marginTop: 4,
                  maxHeight: 200,
                  overflowY: 'auto',
                  zIndex: 100,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}>
                  {filteredPeople.length > 0 ? (
                    filteredPeople.map(person => (
                      <div
                        key={person._id}
                        onClick={() => handleAddPerson(person._id)}
                        style={{
                          padding: '8px 12px',
                          cursor: 'pointer',
                          borderBottom: '1px solid var(--border)',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{person.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {person.role && <span>{person.role}</span>}
                          {person.organization && person.role && <span> · </span>}
                          {person.organization && <span>{person.organization}</span>}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '12px', fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
                      {peopleSearch ? (
                        <div>
                          <div>No matching people found</div>
                          <button
                            type="button"
                            onClick={() => handleAddPerson(peopleSearch)}
                            style={{
                              marginTop: 8,
                              background: 'var(--accent)',
                              color: 'white',
                              border: 'none',
                              borderRadius: 4,
                              padding: '4px 12px',
                              fontSize: 11,
                              cursor: 'pointer',
                              fontWeight: 600,
                            }}
                          >
                            Add "{peopleSearch}" as custom
                          </button>
                        </div>
                      ) : 'Type to search people'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DURING */}
      {tab === 'during' && (
        <div>
          <NotesEditor
            label="Meeting Notes"
            value={form.notes || ''}
            onChange={v => setForm(f => ({ ...f, notes: v }))}
            onBlur={() => save({ notes: form.notes })}
            placeholder="Take notes during the meeting..."
          />

          {/* Decisions */}
          <div className="card" style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>Decisions</div>
            {(meeting.decisions || []).map((d, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--border-subtle)', fontSize: 13 }}>
                <span style={{ color: 'var(--green)', fontWeight: 700, flexShrink: 0 }}>✓</span>
                {d}
              </div>
            ))}
            <QuickInput placeholder="Add a decision..." onAdd={addDecision} />
          </div>

          {/* Action Items */}
          <div className="card">
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>Action Items</div>
            {(meeting.actionItems || []).map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border-subtle)', alignItems: 'flex-start' }}>
                <button onClick={() => toggleActionItem(i)} style={{ width: 18, height: 18, borderRadius: 5, border: item.status === 'DONE' ? 'none' : '1.5px solid var(--border)', background: item.status === 'DONE' ? 'var(--green)' : 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, marginTop: 1 }}>
                  {item.status === 'DONE' && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg>}
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, textDecoration: item.status === 'DONE' ? 'line-through' : 'none' }}>{item.task}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    {item.owner && <span>{item.owner}</span>}
                    {item.deadline && <span> · {new Date(item.deadline).toLocaleDateString()}</span>}
                    {item.priority && <span style={{ color: PRIORITY_COLORS[item.priority] }}> · {item.priority}</span>}
                  </div>
                </div>
              </div>
            ))}
            <AddActionItemForm onAdd={addActionItem} />
          </div>
        </div>
      )}

      {/* AFTER */}
      {tab === 'after' && (
        <div>
          {/* Notes summary */}
          {meeting.notes && (
            <div className="card" style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>Meeting Notes</div>
              <div style={{ fontSize: 13, whiteSpace: 'pre-wrap', color: 'var(--text-secondary)' }}>{meeting.notes}</div>
            </div>
          )}

          {/* Decisions */}
          {meeting.decisions?.length > 0 && (
            <div className="card" style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>Decisions Made</div>
              {meeting.decisions.map((d, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, padding: '6px 0', borderBottom: i < meeting.decisions.length - 1 ? '1px solid var(--border-subtle)' : 'none', fontSize: 13 }}>
                  <span style={{ color: 'var(--green)', fontWeight: 700 }}>✓</span> {d}
                </div>
              ))}
            </div>
          )}

          {/* Action Items */}
          {meeting.actionItems?.length > 0 && (
            <div className="card" style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>
                Action Items · {meeting.actionItems.filter(a => a.status === 'DONE').length}/{meeting.actionItems.length} done
              </div>
              {meeting.actionItems.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: i < meeting.actionItems.length - 1 ? '1px solid var(--border-subtle)' : 'none', alignItems: 'center' }}>
                  <button onClick={() => toggleActionItem(i)} style={{ width: 18, height: 18, borderRadius: 5, border: item.status === 'DONE' ? 'none' : '1.5px solid var(--border)', background: item.status === 'DONE' ? 'var(--green)' : 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                    {item.status === 'DONE' && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg>}
                  </button>
                  <span style={{ flex: 1, fontSize: 13, textDecoration: item.status === 'DONE' ? 'line-through' : 'none', color: item.status === 'DONE' ? 'var(--text-muted)' : 'var(--text)' }}>{item.task}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.owner}</span>
                  {item.priority && <span style={{ fontSize: 10, fontWeight: 700, color: PRIORITY_COLORS[item.priority] }}>{item.priority}</span>}
                </div>
              ))}
            </div>
          )}

          {/* Follow Up */}
          <div className="card">
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>Follow-up</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 140 }}>
                <label className="label">Follow-up Date</label>
                <input className="input" type="date" value={form.followUpDate ? form.followUpDate.slice(0,10) : ''} onChange={e => { setForm(f => ({ ...f, followUpDate: e.target.value })); }} onBlur={() => save({ followUpDate: form.followUpDate })} />
              </div>
              <div style={{ flex: 1, minWidth: 140 }}>
                <label className="label">Next Meeting Notes</label>
                <input className="input" value={form.nextMeetingNotes || ''} onChange={e => setForm(f => ({ ...f, nextMeetingNotes: e.target.value }))} onBlur={() => save({ nextMeetingNotes: form.nextMeetingNotes })} placeholder="Topics for next time" />
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

// ── Helper Components ────────────────────────────────────────────────
function NotesEditor({ label, value, onChange, onBlur, placeholder }) {
  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>{label}</div>
      <textarea
        className="input textarea"
        style={{ minHeight: 120, border: 'none', padding: '4px 0', fontSize: 13, resize: 'vertical', background: 'transparent' }}
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
      />
    </div>
  );
}

function QuickInput({ placeholder, onAdd }) {
  const [val, setVal] = useState('');
  function submit() {
    if (!val.trim()) return;
    onAdd(val);
    setVal('');
  }
  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
      <input className="input" style={{ fontSize: 13, padding: '7px 10px' }} value={val} onChange={e => setVal(e.target.value)} placeholder={placeholder} onKeyDown={e => e.key === 'Enter' && submit()} />
      <button className="btn btn-primary btn-sm" onClick={submit}>Add</button>
    </div>
  );
}

function AddActionItemForm({ onAdd }) {
  const [task, setTask] = useState('');
  const [owner, setOwner] = useState('Me');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('P1');
  const [open, setOpen] = useState(false);

  function submit() {
    if (!task.trim()) return;
    onAdd(task, owner, deadline, priority);
    setTask(''); setOwner('Me'); setDeadline(''); setPriority('P1'); setOpen(false);
  }

  if (!open) return <button className="btn btn-ghost btn-sm" style={{ marginTop: 8, width: '100%', justifyContent: 'center' }} onClick={() => setOpen(true)}>+ Add Action Item</button>;

  return (
    <div style={{ marginTop: 10, padding: '10px', background: 'var(--surface-2)', borderRadius: 8 }}>
      <input className="input" style={{ fontSize: 13, marginBottom: 8 }} value={task} onChange={e => setTask(e.target.value)} placeholder="Task description..." autoFocus />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
        <input className="input" style={{ fontSize: 12 }} value={owner} onChange={e => setOwner(e.target.value)} placeholder="Owner" />
        <input className="input" style={{ fontSize: 12 }} type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <select className="input select" style={{ fontSize: 12, flex: 1 }} value={priority} onChange={e => setPriority(e.target.value)}>
          <option value="P0">P0</option><option value="P1">P1</option><option value="P2">P2</option><option value="P3">P3</option>
        </select>
        <button className="btn btn-primary btn-sm" onClick={submit}>Add</button>
        <button className="btn btn-secondary btn-sm" onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </div>
  );
}
