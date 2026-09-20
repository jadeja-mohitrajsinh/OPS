'use client';
import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import Link from 'next/link';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const DEFAULT_HOURS = Array.from({ length: 18 }, (_, i) => String(i + 6).padStart(2, '0') + ':00'); // 06:00 - 23:00
const ALL_HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0') + ':00'); // 00:00 - 23:00

const CATEGORIES = [
  { id: 'all', label: 'All Items' },
  { id: 'meetings', label: 'Meetings' },
  { id: 'study', label: 'Study & Academics' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'projects', label: 'Projects' },
];

const CATEGORY_STYLES = {
  meeting: { label: 'Meeting', border: 'var(--blue)', bg: 'var(--blue-bg)', text: 'var(--blue)' },
  gate: { label: 'GATE Study', border: 'var(--purple)', bg: 'var(--purple-bg)', text: 'var(--purple)' },
  college: { label: 'College', border: 'var(--orange)', bg: 'var(--orange-bg)', text: 'var(--orange)' },
  task: { label: 'Task', border: 'var(--text-secondary)', bg: 'var(--surface-2)', text: 'var(--text)' },
  project: { label: 'Project', border: 'var(--green)', bg: 'var(--green-bg)', text: 'var(--green)' },
  personal: { label: 'Personal', border: 'var(--text-muted)', bg: 'var(--surface-2)', text: 'var(--text-secondary)' },
};

function formatDate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function CalendarPage() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(() => formatDate(today.getFullYear(), today.getMonth(), today.getDate()));
  const [showFullDay, setShowFullDay] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Data fetching states
  const [meetings, setMeetings] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [gateSubjects, setGateSubjects] = useState([]);
  const [collegeSubjects, setCollegeSubjects] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sidebar state
  const [sidebarTab, setSidebarTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Persisted schedule blocks per date: { [dateStr]: [blocks] }
  const [scheduledBlocks, setScheduledBlocks] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('ops_calendar_schedule_v3');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return {};
  });

  // Drag & drop state
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverHour, setDragOverHour] = useState(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null);
  const [modalData, setModalData] = useState({
    title: '',
    date: selectedDate,
    startTime: '09:00',
    endTime: '10:00',
    category: 'gate',
    notes: '',
  });

  // Live timer for current minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Save blocks to storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ops_calendar_schedule_v3', JSON.stringify(scheduledBlocks));
    }
  }, [scheduledBlocks]);

  // Load backend data
  async function loadData() {
    setLoading(true);
    try {
      const [mRes, tRes, gRes, cRes, pRes] = await Promise.all([
        fetch('/api/meetings').then(r => r.json()).catch(() => ({ success: false, data: [] })),
        fetch('/api/tasks').then(r => r.json()).catch(() => ({ success: false, data: [] })),
        fetch('/api/gate').then(r => r.json()).catch(() => ({ success: false, data: [] })),
        fetch('/api/college').then(r => r.json()).catch(() => ({ success: false, data: [] })),
        fetch('/api/projects').then(r => r.json()).catch(() => ({ success: false, data: [] })),
      ]);

      if (mRes.success) setMeetings(mRes.data || []);
      if (tRes.success) setTasks(tRes.data || []);
      if (gRes.success) setGateSubjects(gRes.data || []);
      if (cRes.success) setCollegeSubjects(cRes.data || []);
      if (pRes.success) setProjects(pRes.data || []);
    } catch (err) {
      console.error('Error loading calendar data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Calendar calculations
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();

  const calendarGrid = [];
  for (let i = 0; i < firstDay; i++) calendarGrid.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarGrid.push(d);

  function prevMonth() {
    if (viewMonth === 0) {
      setViewYear(y => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth(m => m - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewYear(y => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth(m => m + 1);
    }
  }

  function goToToday() {
    const t = new Date();
    setViewYear(t.getFullYear());
    setViewMonth(t.getMonth());
    setSelectedDate(formatDate(t.getFullYear(), t.getMonth(), t.getDate()));
  }

  // Selected date details
  const [selY, selM, selD] = selectedDate.split('-').map(Number);
  const selectedDateObject = new Date(selY, selM - 1, selD);
  const isToday = selectedDate === formatDate(today.getFullYear(), today.getMonth(), today.getDate());

  // Date events helper
  function getDateCounts(dateStr) {
    const mCount = meetings.filter(m => m.date && m.date.slice(0, 10) === dateStr).length;
    const tCount = tasks.filter(t => t.deadline && t.deadline.slice(0, 10) === dateStr && !['DONE', 'CANCELLED'].includes(t.status)).length;
    const bCount = (scheduledBlocks[dateStr] || []).length;
    return { meetings: mCount, tasks: tCount, blocks: bCount, total: mCount + tCount + bCount };
  }

  // Day items
  const dayMeetings = meetings.filter(m => m.date && m.date.slice(0, 10) === selectedDate);
  const dayTasks = tasks.filter(t => t.deadline && t.deadline.slice(0, 10) === selectedDate);
  const dayBlocks = scheduledBlocks[selectedDate] || [];

  // Drag & drop handlers
  function handleDragStart(e, item, category) {
    const payload = { ...item, category };
    setDraggedItem(payload);
    e.dataTransfer.setData('text/plain', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'copyMove';
  }

  function handleDragOver(e, hour) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (dragOverHour !== hour) setDragOverHour(hour);
  }

  function handleDragLeave(e, hour) {
    if (dragOverHour === hour) setDragOverHour(null);
  }

  function handleDrop(e, hour) {
    e.preventDefault();
    setDragOverHour(null);
    let item = draggedItem;
    if (!item) {
      try { item = JSON.parse(e.dataTransfer.getData('text/plain')); } catch {}
    }
    if (!item) return;

    const startH = parseInt(hour.split(':')[0], 10);
    const endH = String(Math.min(23, startH + 1)).padStart(2, '0') + ':00';

    const newBlock = {
      id: `blk_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title: item.title || item.name || 'Scheduled Slot',
      startTime: hour,
      endTime: endH,
      category: item.category || 'task',
      notes: item.notes || item.area || '',
      completed: false,
    };

    setScheduledBlocks(prev => {
      const current = prev[selectedDate] || [];
      return {
        ...prev,
        [selectedDate]: [...current, newBlock].sort((a, b) => a.startTime.localeCompare(b.startTime)),
      };
    });
    setDraggedItem(null);
  }

  // Modal actions
  function openAddModal(hour = '09:00') {
    const startH = parseInt(hour.split(':')[0], 10);
    const endH = String(Math.min(23, startH + 1)).padStart(2, '0') + ':00';
    setEditingBlock(null);
    setModalData({
      title: '',
      date: selectedDate,
      startTime: hour,
      endTime: endH,
      category: 'gate',
      notes: '',
    });
    setShowModal(true);
  }

  function openEditModal(block) {
    setEditingBlock(block);
    setModalData({
      title: block.title,
      date: selectedDate,
      startTime: block.startTime || '09:00',
      endTime: block.endTime || '10:00',
      category: block.category || 'task',
      notes: block.notes || '',
    });
    setShowModal(true);
  }

  function handleSaveModal(e) {
    e.preventDefault();
    if (!modalData.title.trim()) return;

    const targetDate = modalData.date || selectedDate;

    if (editingBlock) {
      setScheduledBlocks(prev => {
        const current = prev[targetDate] || [];
        return {
          ...prev,
          [targetDate]: current.map(b => b.id === editingBlock.id ? { ...b, ...modalData } : b).sort((a, b) => a.startTime.localeCompare(b.startTime)),
        };
      });
    } else {
      const newBlock = {
        id: `blk_${Date.now()}`,
        ...modalData,
        completed: false,
      };
      setScheduledBlocks(prev => {
        const current = prev[targetDate] || [];
        return {
          ...prev,
          [targetDate]: [...current, newBlock].sort((a, b) => a.startTime.localeCompare(b.startTime)),
        };
      });
    }
    setShowModal(false);
  }

  function handleDeleteBlock(blockId) {
    setScheduledBlocks(prev => {
      const current = prev[selectedDate] || [];
      return {
        ...prev,
        [selectedDate]: current.filter(b => b.id !== blockId),
      };
    });
  }

  function handleToggleBlock(blockId) {
    setScheduledBlocks(prev => {
      const current = prev[selectedDate] || [];
      return {
        ...prev,
        [selectedDate]: current.map(b => b.id === blockId ? { ...b, completed: !b.completed } : b),
      };
    });
  }

  // Filter sidebar items
  const q = searchQuery.toLowerCase().trim();
  const filteredMeetings = meetings.filter(m => !q || m.title?.toLowerCase().includes(q) || m.organization?.toLowerCase().includes(q));
  const filteredTasks = tasks.filter(t => !q || t.name?.toLowerCase().includes(q) || t.area?.toLowerCase().includes(q));
  const filteredGate = gateSubjects.filter(g => !q || g.name?.toLowerCase().includes(q) || g.code?.toLowerCase().includes(q));
  const filteredCollege = collegeSubjects.filter(c => !q || c.name?.toLowerCase().includes(q) || c.code?.toLowerCase().includes(q));
  const filteredProjects = projects.filter(p => !q || p.title?.toLowerCase().includes(q));

  const hoursToDisplay = showFullDay ? ALL_HOURS : DEFAULT_HOURS;
  const currentHourString = String(currentTime.getHours()).padStart(2, '0');
  const currentMinute = currentTime.getMinutes();

  return (
    <AppShell>
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title">Calendar</h1>
          <p className="page-subtitle">
            {selectedDateObject.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            {isToday && <span style={{ marginLeft: 8, color: 'var(--green)', fontWeight: 600 }}>• Today</span>}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn btn-secondary btn-sm" onClick={goToToday}>Today</button>
          <button className="btn btn-primary btn-sm" onClick={() => openAddModal('09:00')}>+ Add Event</button>
        </div>
      </div>

      {/* Main 3-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 320px', gap: 24, alignItems: 'start' }}>
        
        {/* LEFT COLUMN: Month Calendar & Day Picker */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: 16 }}>
            {/* Month Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>
              <div style={{ display: 'flex', gap: 4 }}>
                <button className="btn btn-ghost btn-sm" onClick={prevMonth} style={{ padding: '2px 8px' }}>‹</button>
                <button className="btn btn-ghost btn-sm" onClick={nextMonth} style={{ padding: '2px 8px' }}>›</button>
              </div>
            </div>

            {/* Weekday labels */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 6, textAlign: 'center' }}>
              {DAY_LABELS.map(d => (
                <div key={d} style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
              {calendarGrid.map((day, idx) => {
                if (!day) return <div key={`empty_${idx}`} style={{ height: 32 }} />;

                const cellKey = formatDate(viewYear, viewMonth, day);
                const isSelected = selectedDate === cellKey;
                const isCurrentToday = cellKey === formatDate(today.getFullYear(), today.getMonth(), today.getDate());
                const counts = getDateCounts(cellKey);

                return (
                  <button
                    key={`day_${day}`}
                    onClick={() => setSelectedDate(cellKey)}
                    style={{
                      height: 32,
                      borderRadius: 'var(--r-sm)',
                      border: isSelected ? '1px solid var(--accent)' : '1px solid transparent',
                      background: isSelected ? 'var(--surface-2)' : isCurrentToday ? 'var(--blue-bg)' : 'transparent',
                      color: isCurrentToday ? 'var(--blue)' : 'var(--text)',
                      fontWeight: isSelected || isCurrentToday ? 700 : 400,
                      fontSize: 12,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    <span>{day}</span>
                    {counts.total > 0 && (
                      <span
                        style={{
                          width: 4,
                          height: 4,
                          borderRadius: '50%',
                          background: counts.meetings > 0 ? 'var(--blue)' : counts.tasks > 0 ? 'var(--orange)' : 'var(--purple)',
                          position: 'absolute',
                          bottom: 2,
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Date Metric Card */}
          <div className="card" style={{ padding: 16 }}>
            <div className="section-label" style={{ marginBottom: 8 }}>Day Summary</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-secondary">Meetings</span>
                <strong>{dayMeetings.length}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-secondary">Tasks Due</span>
                <strong>{dayTasks.length}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-secondary">Scheduled Blocks</span>
                <strong>{dayBlocks.length}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Day Hours Timeline */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>
              Timeline ({selectedDateObject.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setShowFullDay(!showFullDay)}
              style={{ fontSize: 11 }}
            >
              {showFullDay ? 'Show 06:00 – 23:00' : 'Show 24 Hours'}
            </button>
          </div>

          {/* Hour by hour schedule */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative' }}>
            {hoursToDisplay.map(hour => {
              const hourPrefix = hour.slice(0, 2);
              const isOver = dragOverHour === hour;
              const isCurrentHour = isToday && currentHourString === hourPrefix;

              const matchedMeetings = dayMeetings.filter(m => m.startTime && m.startTime.slice(0, 2) === hourPrefix);
              const matchedBlocks = dayBlocks.filter(b => b.startTime && b.startTime.slice(0, 2) === hourPrefix);

              return (
                <div
                  key={hour}
                  onDragOver={e => handleDragOver(e, hour)}
                  onDragLeave={e => handleDragLeave(e, hour)}
                  onDrop={e => handleDrop(e, hour)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '56px 1fr',
                    borderTop: '1px solid var(--border-subtle)',
                    minHeight: 48,
                    position: 'relative',
                  }}
                >
                  {/* Time label */}
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', paddingTop: 6, fontVariantNumeric: 'tabular-nums' }}>
                    {hour}
                  </div>

                  {/* Hour slot content */}
                  <div
                    style={{
                      padding: '4px 8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                      background: isOver ? 'var(--blue-bg)' : 'transparent',
                      transition: 'background 0.1s ease',
                      position: 'relative',
                    }}
                  >
                    {/* Live line indicator for current minute */}
                    {isCurrentHour && (
                      <div
                        style={{
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          top: `${(currentMinute / 60) * 100}%`,
                          height: 1.5,
                          background: 'var(--red)',
                          zIndex: 5,
                        }}
                      />
                    )}

                    {/* Render Meetings from DB */}
                    {matchedMeetings.map(m => (
                      <Link key={`m_${m._id}`} href={`/meetings/${m._id}`}>
                        <div
                          style={{
                            background: 'var(--blue-bg)',
                            borderLeft: '3px solid var(--blue)',
                            borderRadius: 'var(--r-sm)',
                            padding: '6px 10px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--blue)' }}>{m.title}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                              {m.startTime}{m.endTime ? ` – ${m.endTime}` : ''} {m.location ? `· ${m.location}` : ''}
                            </div>
                          </div>
                          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--blue)', textTransform: 'uppercase' }}>
                            Meeting
                          </span>
                        </div>
                      </Link>
                    ))}

                    {/* Render Custom Scheduled Blocks */}
                    {matchedBlocks.map(block => {
                      const style = CATEGORY_STYLES[block.category] || CATEGORY_STYLES.task;
                      return (
                        <div
                          key={block.id}
                          style={{
                            background: style.bg,
                            borderLeft: `3px solid ${style.border}`,
                            borderRadius: 'var(--r-sm)',
                            padding: '6px 10px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            opacity: block.completed ? 0.6 : 1,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <input
                              type="checkbox"
                              checked={block.completed || false}
                              onChange={() => handleToggleBlock(block.id)}
                              style={{ cursor: 'pointer' }}
                            />
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600, textDecoration: block.completed ? 'line-through' : 'none' }}>
                                {block.title}
                              </div>
                              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                                {block.startTime} – {block.endTime} {block.notes ? `· ${block.notes}` : ''}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <button
                              onClick={() => openEditModal(block)}
                              className="btn btn-ghost btn-sm"
                              style={{ padding: '0 4px', fontSize: 11 }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteBlock(block.id)}
                              className="btn btn-ghost btn-sm"
                              style={{ padding: '0 4px', fontSize: 11 }}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Quick Add link when slot is empty */}
                    {matchedMeetings.length === 0 && matchedBlocks.length === 0 && (
                      <div
                        onClick={() => openAddModal(hour)}
                        style={{
                          height: '100%',
                          minHeight: 24,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          color: 'var(--text-muted)',
                          fontSize: 11,
                        }}
                      >
                        {isOver ? 'Drop to schedule' : ''}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Categorized Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card" style={{ padding: 16 }}>
            {/* Search & Tabs */}
            <div style={{ marginBottom: 12 }}>
              <input
                type="text"
                className="input"
                placeholder="Search items..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ fontSize: 13, marginBottom: 10 }}
              />

              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSidebarTab(cat.id)}
                    className={`btn btn-sm ${sidebarTab === cat.id ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: 11, padding: '3px 8px' }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                Loading items...
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: 'calc(100vh - 260px)', overflowY: 'auto' }}>
                
                {/* Meetings */}
                {(sidebarTab === 'all' || sidebarTab === 'meetings') && filteredMeetings.length > 0 && (
                  <div>
                    <div className="section-label" style={{ marginBottom: 6 }}>Meetings</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {filteredMeetings.map(m => (
                        <div
                          key={m._id}
                          draggable
                          onDragStart={e => handleDragStart(e, m, 'meeting')}
                          className="card card-hover"
                          style={{ padding: '8px 10px', cursor: 'grab', fontSize: 12, borderLeft: '3px solid var(--blue)' }}
                        >
                          <div style={{ fontWeight: 600 }}>{m.title}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                            {m.date ? m.date.slice(0, 10) : 'No date'} {m.startTime ? `· ${m.startTime}` : ''}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* GATE & College Study */}
                {(sidebarTab === 'all' || sidebarTab === 'study') && (filteredGate.length > 0 || filteredCollege.length > 0) && (
                  <div>
                    <div className="section-label" style={{ marginBottom: 6 }}>Study & Subjects</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {filteredGate.map(g => (
                        <div
                          key={g._id}
                          draggable
                          onDragStart={e => handleDragStart(e, { title: `GATE: ${g.name}` }, 'gate')}
                          className="card card-hover"
                          style={{ padding: '8px 10px', cursor: 'grab', fontSize: 12, borderLeft: '3px solid var(--purple)' }}
                        >
                          <div style={{ fontWeight: 600 }}>{g.code ? `[${g.code}] ` : ''}{g.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                            GATE Subject · {g.progress || 0}% covered
                          </div>
                        </div>
                      ))}

                      {filteredCollege.map(c => (
                        <div
                          key={c._id}
                          draggable
                          onDragStart={e => handleDragStart(e, { title: `College: ${c.name}` }, 'college')}
                          className="card card-hover"
                          style={{ padding: '8px 10px', cursor: 'grab', fontSize: 12, borderLeft: '3px solid var(--orange)' }}
                        >
                          <div style={{ fontWeight: 600 }}>{c.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                            College · {c.attendance || 0}% attendance
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tasks */}
                {(sidebarTab === 'all' || sidebarTab === 'tasks') && filteredTasks.length > 0 && (
                  <div>
                    <div className="section-label" style={{ marginBottom: 6 }}>Tasks & Deadlines</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {filteredTasks.map(t => (
                        <div
                          key={t._id}
                          draggable
                          onDragStart={e => handleDragStart(e, t, 'task')}
                          className="card card-hover"
                          style={{ padding: '8px 10px', cursor: 'grab', fontSize: 12 }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 600 }}>{t.name}</span>
                            <span style={{ fontSize: 10, fontWeight: 700, color: t.priority === 'P0' ? 'var(--red)' : 'var(--orange)' }}>
                              {t.priority}
                            </span>
                          </div>
                          {t.deadline && (
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                              Due: {t.deadline.slice(0, 10)} {t.estimatedDuration ? `· ${t.estimatedDuration}m` : ''}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects */}
                {(sidebarTab === 'all' || sidebarTab === 'projects') && filteredProjects.length > 0 && (
                  <div>
                    <div className="section-label" style={{ marginBottom: 6 }}>Projects</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {filteredProjects.map(p => (
                        <div
                          key={p._id}
                          draggable
                          onDragStart={e => handleDragStart(e, { title: `Project: ${p.title}` }, 'project')}
                          className="card card-hover"
                          style={{ padding: '8px 10px', cursor: 'grab', fontSize: 12, borderLeft: '3px solid var(--green)' }}
                        >
                          <div style={{ fontWeight: 600 }}>{p.title}</div>
                          {p.area && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{p.area}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Standard Modal for Adding/Editing Events */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">{editingBlock ? 'Edit Event' : 'Schedule Event'}</h2>
              <button className="btn modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveModal}>
              <div className="form-group">
                <label className="label">Title *</label>
                <input
                  className="input"
                  required
                  placeholder="Event or study block title..."
                  value={modalData.title}
                  onChange={e => setModalData({ ...modalData, title: e.target.value })}
                  autoFocus
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="label">Date</label>
                  <input
                    type="date"
                    className="input"
                    value={modalData.date}
                    onChange={e => setModalData({ ...modalData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="label">Category</label>
                  <select
                    className="input select"
                    value={modalData.category}
                    onChange={e => setModalData({ ...modalData, category: e.target.value })}
                  >
                    <option value="gate">GATE Study</option>
                    <option value="college">College</option>
                    <option value="meeting">Meeting</option>
                    <option value="task">Task / Work</option>
                    <option value="project">Project</option>
                    <option value="personal">Personal</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="label">Start Time</label>
                  <input
                    type="time"
                    className="input"
                    value={modalData.startTime}
                    onChange={e => setModalData({ ...modalData, startTime: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="label">End Time</label>
                  <input
                    type="time"
                    className="input"
                    value={modalData.endTime}
                    onChange={e => setModalData({ ...modalData, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="label">Notes</label>
                <input
                  className="input"
                  placeholder="Optional details or objectives..."
                  value={modalData.notes}
                  onChange={e => setModalData({ ...modalData, notes: e.target.value })}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
