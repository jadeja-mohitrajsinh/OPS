'use client';
import React, { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import Link from 'next/link';

const STATUS_COLORS = { SCHEDULED: 'var(--blue)', COMPLETED: 'var(--green)', CANCELLED: 'var(--red)', RESCHEDULED: 'var(--orange)' };
const STATUS_BG = { SCHEDULED: 'var(--blue-bg)', COMPLETED: 'var(--green-bg)', CANCELLED: 'var(--red-bg)', RESCHEDULED: 'var(--orange-bg)' };

function MeetingForm({ onSave, onClose, initial = {}, availablePeople = [] }) {
  const [form, setForm] = useState(() => {
    const baseForm = {
      title: '', date: '', startTime: '', endTime: '', location: '', isOnline: false,
      meetingLink: '', organization: '', project: '', purpose: '', agenda: '',
      status: 'SCHEDULED', followUpDate: '', followUpPerson: '',
      ...initial,
    };
    // Convert people to array if it's a string or single ObjectId
    baseForm.people = Array.isArray(baseForm.people) ? baseForm.people : (baseForm.people ? [baseForm.people] : []);
    return baseForm;
  });
  const [showPeopleDropdown, setShowPeopleDropdown] = useState(false);
  const [peopleSearch, setPeopleSearch] = useState('');
  const [showFollowUpDropdown, setShowFollowUpDropdown] = useState(false);
  const [followUpSearch, setFollowUpSearch] = useState('');
  const dropdownRef = React.useRef(null);
  const followUpDropdownRef = React.useRef(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowPeopleDropdown(false);
      }
      if (followUpDropdownRef.current && !followUpDropdownRef.current.contains(event.target)) {
        setShowFollowUpDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.date || !form.startTime) return;
    const payload = {
      ...form,
      people: form.people || [],
    };
    await onSave(payload);
    onClose();
  }

  const handleAddPerson = (person) => {
    if (!person) return;
    const personId = typeof person === 'object' ? person._id : person;
    if (personId && !form.people.includes(personId)) {
      setForm(f => ({ ...f, people: [...f.people, personId] }));
    }
    setPeopleSearch('');
    setShowPeopleDropdown(false);
  };

  const handleRemovePerson = (personId) => {
    setForm(f => ({ ...f, people: f.people.filter(p => p !== personId) }));
  };

  const filteredPeople = availablePeople.filter(p => 
    p.name.toLowerCase().includes(peopleSearch.toLowerCase()) ||
    (p.role && p.role.toLowerCase().includes(peopleSearch.toLowerCase())) ||
    (p.organization && p.organization.toLowerCase().includes(peopleSearch.toLowerCase()))
  );

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{initial._id ? 'Edit Meeting' : 'New Meeting'}</h2>
          <button className="btn modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Meeting Title *</label>
            <input className="input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="What is this meeting about?" autoFocus required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="label">Date *</label>
              <input className="input" type="date" value={form.date ? form.date.slice(0,10) : ''} onChange={e => set('date', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="label">Start Time *</label>
              <input className="input" type="time" value={form.startTime} onChange={e => set('startTime', e.target.value)} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="label">End Time</label>
              <input className="input" type="time" value={form.endTime} onChange={e => set('endTime', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Location</label>
              <input className="input" value={form.location} onChange={e => set('location', e.target.value)} placeholder="Room / Online" />
            </div>
          </div>
          <div className="form-group">
            <label className="label">People</label>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>Search and select from your contacts</div>
            <div style={{ position: 'relative' }}>
              {/* Selected People Tags */}
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 6, 
                marginBottom: 8,
                minHeight: form.people.length > 0 ? 'auto' : 0 
              }}>
                {form.people.map((personId, idx) => {
                  const person = availablePeople.find(p => p._id === personId);
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
          <div className="form-row">
            <div className="form-group">
              <label className="label">Organization / Project</label>
              <input className="input" value={form.organization} onChange={e => set('organization', e.target.value)} placeholder="Forge, College..." />
            </div>
            <div className="form-group">
              <label className="label">Status</label>
              <select className="input select" value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="SCHEDULED">Scheduled</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="RESCHEDULED">Rescheduled</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="label">Purpose</label>
            <input className="input" value={form.purpose} onChange={e => set('purpose', e.target.value)} placeholder="Why this meeting?" />
          </div>
          <div className="form-group">
            <label className="label">Agenda</label>
            <textarea className="input textarea" value={form.agenda} onChange={e => set('agenda', e.target.value)} placeholder="Topics to cover..." rows={3} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="label">Follow-up Date</label>
              <input className="input" type="date" value={form.followUpDate ? form.followUpDate.slice(0,10) : ''} onChange={e => set('followUpDate', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Follow-up With</label>
              <div style={{ position: 'relative' }} ref={followUpDropdownRef}>
                <input
                  className="input"
                  type="text"
                  placeholder="Select person..."
                  value={form.followUpPerson ? (availablePeople.find(p => p._id === form.followUpPerson)?.name || form.followUpPerson) : followUpSearch}
                  onChange={e => {
                    setFollowUpSearch(e.target.value);
                    setShowFollowUpDropdown(true);
                  }}
                  onFocus={() => setShowFollowUpDropdown(true)}
                  style={{ width: '100%' }}
                />
                
                {/* Follow-up Person Dropdown */}
                {showFollowUpDropdown && (
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
                    {availablePeople.filter(p => 
                      p.name.toLowerCase().includes(followUpSearch.toLowerCase()) ||
                      (p.role && p.role.toLowerCase().includes(followUpSearch.toLowerCase())) ||
                      (p.organization && p.organization.toLowerCase().includes(followUpSearch.toLowerCase()))
                    ).length > 0 ? (
                      availablePeople.filter(p => 
                        p.name.toLowerCase().includes(followUpSearch.toLowerCase()) ||
                        (p.role && p.role.toLowerCase().includes(followUpSearch.toLowerCase())) ||
                        (p.organization && p.organization.toLowerCase().includes(followUpSearch.toLowerCase()))
                      ).map(person => (
                        <div
                          key={person._id}
                          onClick={() => {
                            set('followUpPerson', person._id);
                            setFollowUpSearch('');
                            setShowFollowUpDropdown(false);
                          }}
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
                        {followUpSearch ? (
                          <div>
                            <div>No matching people found</div>
                            <button
                              type="button"
                              onClick={() => {
                                set('followUpPerson', followUpSearch);
                                setFollowUpSearch('');
                                setShowFollowUpDropdown(false);
                              }}
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
                              Add "{followUpSearch}" as custom
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
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Meeting</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MeetingCard({ meeting, onEdit, people }) {
  const date = new Date(meeting.date);
  const isPast = date < new Date();
  const isToday = date.toDateString() === new Date().toDateString();
  return (
    <div style={{ display: 'flex', gap: 0 }}>
      <Link href={`/meetings/${meeting._id}`} style={{ flex: 1, display: 'block' }}>
        <div className="card card-hover" style={{ padding: '14px 16px', opacity: isPast && meeting.status !== 'COMPLETED' ? 0.7 : 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ width: 42, height: 42, background: isToday ? 'var(--accent)' : 'var(--surface-2)', borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: isToday ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)', textTransform: 'uppercase' }}>{date.toLocaleString('default',{month:'short'})}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: isToday ? 'white' : 'var(--text)', lineHeight: 1 }}>{date.getDate()}</div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <span style={{ fontSize: 14, fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{meeting.title}</span>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: STATUS_BG[meeting.status], color: STATUS_COLORS[meeting.status], flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                  {meeting.status}
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {meeting.startTime}{meeting.endTime ? ` – ${meeting.endTime}` : ''}
                {Array.isArray(meeting.people) && meeting.people.length > 0 && (
                  <>
                    {' · '}
                    {meeting.people.slice(0, 3).map(pId => {
                      const person = people.find(p => p._id === pId);
                      return person ? person.name : pId;
                    }).join(', ')}
                    {meeting.people.length > 3 && ` +${meeting.people.length - 3}`}
                  </>
                )}
                {meeting.location && ` · ${meeting.location}`}
              </div>
              {meeting.purpose && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{meeting.purpose}</div>}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState([]);
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState('upcoming');

  async function load() {
    setLoading(true);
    const [mRes, pRes] = await Promise.all([
      fetch('/api/meetings').then(r => r.json()).catch(() => ({ success: false, data: [] })),
      fetch('/api/people').then(r => r.json()).catch(() => ({ success: false, data: [] })),
    ]);
    setMeetings(mRes.success ? mRes.data : []);
    setPeople(pRes.success ? pRes.data : []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('add')) setShowForm(true);
  }, []);

  async function handleSave(payload) {
    if (editing) {
      await fetch(`/api/meetings/${editing._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    } else {
      await fetch('/api/meetings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    }
    setEditing(null);
    load();
  }

  const now = new Date();
  const filtered = filter === 'upcoming'
    ? meetings.filter(m => new Date(m.date) >= now && m.status === 'SCHEDULED')
    : filter === 'completed'
    ? meetings.filter(m => m.status === 'COMPLETED')
    : meetings;

  const sorted = [...filtered].sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <AppShell>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">Meetings</h1>
          <p className="page-subtitle">{meetings.filter(m => new Date(m.date) >= now && m.status === 'SCHEDULED').length} upcoming</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => { setEditing(null); setShowForm(true); }}>+ Schedule</button>
      </div>

      <div className="tabs" style={{ marginBottom: 20 }}>
        {[['upcoming','Upcoming'],['completed','Completed'],['all','All']].map(([val,lbl]) => (
          <button key={val} className={`tab-btn ${filter === val ? 'active' : ''}`} onClick={() => setFilter(val)}>{lbl}</button>
        ))}
      </div>

      {loading ? (
        <div className="loading-state"><div className="spinner" /></div>
      ) : sorted.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <div className="empty-state-title">No meetings {filter}</div>
          <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => setShowForm(true)}>Schedule Meeting</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sorted.map(m => <MeetingCard key={m._id} meeting={m} onEdit={() => { setEditing(m); setShowForm(true); }} people={people} />)}
        </div>
      )}

      {(showForm || editing) && (
        <MeetingForm 
          initial={editing || {}} 
          availablePeople={people}
          onSave={handleSave} 
          onClose={() => { setShowForm(false); setEditing(null); }} 
        />
      )}
    </AppShell>
  );
}
