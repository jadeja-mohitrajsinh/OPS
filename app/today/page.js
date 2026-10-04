'use client';
import { useState, useEffect, useRef } from 'react';
import AppShell from '@/components/AppShell';
import Link from 'next/link';
import ReminderCenter from '@/components/ReminderCenter';
import { checkNotificationPermission, syncAllTodayReminders } from '@/lib/notifications';

// ─── Constants & Color Schemes ───────────────────────────────────────────────
const HOURS = Array.from({ length: 19 }, (_, i) => {
  const h = i + 5; // 05:00 to 23:00
  return `${String(h).padStart(2, '0')}:00`;
});

const TYPE_CONFIG = {
  task:     { label: 'Task',     color: '#6366f1', bg: 'rgba(99,102,241,0.12)',  border: '#6366f1', icon: '✓' },
  meeting:  { label: 'Meeting',  color: '#2563eb', bg: 'rgba(37,99,235,0.12)',   border: '#2563eb', icon: '👥' },
  gate:     { label: 'GATE',     color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  border: '#3b82f6', icon: '🎓' },
  college:  { label: 'College',  color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: '#f59e0b', icon: '🏛️' },
  forge:    { label: 'Forge',    color: '#ec4899', bg: 'rgba(236,72,153,0.12)',  border: '#ec4899', icon: '⚡' },
  health:   { label: 'Training', color: '#ff4d43', bg: 'rgba(255,77,67,0.14)',   border: '#ff4d43', icon: '💪' },
  habit:    { label: 'Habit',    color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)',  border: '#8b5cf6', icon: '✨' },
  review:   { label: 'Review',   color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: '#ef4444', icon: '📊' },
  break:    { label: 'Break',    color: '#6b7280', bg: 'rgba(107,114,128,0.12)', border: '#6b7280', icon: '☕' },
  personal: { label: 'Personal', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)',  border: '#8b5cf6', icon: '📖' },
};

function fmt12(time24) {
  if (!time24) return '';
  const [h, m] = time24.split(':').map(Number);
  const p = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  return m ? `${displayH}:${String(m).padStart(2, '0')} ${p}` : `${displayH} ${p}`;
}

function todayStr() {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
}

export default function TodayExecutionPage() {
  // ── State ───────────────────────────────────────────────────────────────────
  const [tasks, setTasks] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [gateSubjects, setGateSubjects] = useState([]);
  const [collegeSubjects, setCollegeSubjects] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Scheduled timeline items
  const [timelineItems, setTimelineItems] = useState([]);
  const [timelineReady, setTimelineReady] = useState(false);

  // Live Time
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(t);
  }, []);

  // Load the signed-in user's real schedule. There are intentionally no sample entries.
  useEffect(() => {
    let active = true;
    fetch(`/api/timeline?date=${todayStr()}`)
      .then(response => response.json())
      .then(data => {
        if (active && data.success) setTimelineItems(Array.isArray(data.data) ? data.data : []);
      })
      .catch(() => {})
      .finally(() => { if (active) setTimelineReady(true); });
    return () => { active = false; };
  }, []);

  // Persist every timeline mutation to MongoDB. The debounce avoids a request per drag frame.
  useEffect(() => {
    if (!timelineReady) return undefined;
    const saveTimer = setTimeout(() => {
      fetch(`/api/timeline?date=${todayStr()}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: timelineItems }),
      }).catch(() => {});
    }, 350);
    return () => clearTimeout(saveTimer);
  }, [timelineItems, timelineReady]);

  // UI States
  const [showReminderCenter, setShowReminderCenter] = useState(false);
  const [showNotepad, setShowNotepad] = useState(false);
  const [showScheduleDrawer, setShowScheduleDrawer] = useState(false);
  const [selectedHourForAdd, setSelectedHourForAdd] = useState('09:00');
  const [drawerSearch, setDrawerSearch] = useState('');
  const [drawerTab, setDrawerTab] = useState('all');

  // Keep the schedule picker dismissible with the same interaction on desktop and mobile.
  useEffect(() => {
    if (!showScheduleDrawer) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setShowScheduleDrawer(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showScheduleDrawer]);

  // Notepad State
  const [noteText, setNoteText] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('ops_today_quicknote') || '';
    return '';
  });
  const noteRef = useRef(null);
  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('ops_today_quicknote', noteText);
  }, [noteText]);
  useEffect(() => {
    if (showNotepad && noteRef.current) noteRef.current.focus();
  }, [showNotepad]);

  // Drag & Drop State
  const [draggedItemId, setDraggedItemId] = useState(null);
  const [draggedSidebarItem, setDraggedSidebarItem] = useState(null);
  const [dragOverHour, setDragOverHour] = useState(null);

  // Auto-scroll ref
  const nowMarkerRef = useRef(null);
  const timelineContainerRef = useRef(null);

  // ── Fetch Data ──────────────────────────────────────────────────────────────
  async function loadData() {
    try {
      const today = todayStr();
      const [tRes, mRes, gRes, cRes, pRes] = await Promise.all([
        fetch('/api/tasks').then(r => r.json()).catch(() => ({ success: false, data: [] })),
        fetch('/api/meetings?upcoming=true').then(r => r.json()).catch(() => ({ success: false, data: [] })),
        fetch('/api/gate').then(r => r.json()).catch(() => ({ success: false, data: [] })),
        fetch('/api/college').then(r => r.json()).catch(() => ({ success: false, data: [] })),
        fetch('/api/projects').then(r => r.json()).catch(() => ({ success: false, data: [] })),
      ]);

      if (tRes.success) setTasks(tRes.data || []);
      if (mRes.success) setMeetings((mRes.data || []).filter(m => m.date && m.date.slice(0, 10) === today));
      if (gRes.success) setGateSubjects(gRes.data || []);
      if (cRes.success) setCollegeSubjects(cRes.data || []);
      if (pRes.success) setProjects(pRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Scroll to NOW on load
  const scrollToNow = () => {
    if (nowMarkerRef.current) {
      nowMarkerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  useEffect(() => {
    if (!loading) {
      setTimeout(scrollToNow, 400);
    }
  }, [loading]);

  // ── Time Calculations ──────────────────────────────────────────────────────
  const currentH = currentTime.getHours();
  const currentM = currentTime.getMinutes();
  const currentMinutesTotal = currentH * 60 + currentM;
  const currentTimeStr = `${String(currentH).padStart(2, '0')}:${String(currentM).padStart(2, '0')}`;
  const displayTime = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const displayDate = currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  // ── Actions ─────────────────────────────────────────────────────────────────
  const handleToggleTaskComplete = async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'DONE' ? 'TODO' : 'DONE';
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
    setTimelineItems(prev => prev.map(item => item.taskId === taskId ? { ...item, completed: newStatus === 'DONE' } : item));

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const saveCompletedItemToCalendar = async (item) => {
    const date = todayStr();
    const response = await fetch(`/api/calendar-plans?date=${date}`);
    const payload = await response.json();
    if (!payload.success) throw new Error(payload.error || 'Could not load calendar plans.');
    const dayPlans = Array.isArray(payload.data?.[date]) ? payload.data[date] : [];
    if (dayPlans.some(plan => plan.timelineItemId === item.id)) return;
    const completedItem = {
      id: `cal_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timelineItemId: item.id,
      title: item.title,
      type: item.type,
      hours: (item.duration || 60) / 60,
      completed: true,
      completedAt: new Date().toISOString(),
      time: item.time,
      duration: item.duration,
    };
    const saveResponse = await fetch(`/api/calendar-plans?date=${date}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [...dayPlans, completedItem] }),
    });
    const saved = await saveResponse.json();
    if (!saved.success) throw new Error(saved.error || 'Could not save calendar plan.');
  };

  const handleToggleTimelineItem = (itemId) => {
    setTimelineItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const nextCompleted = !item.completed;
        if (item.taskId) {
          handleToggleTaskComplete(item.taskId, item.completed ? 'DONE' : 'TODO');
        }

        // Keep Calendar and Today in the same account-scoped data store.
        if (nextCompleted) {
          saveCompletedItemToCalendar(item).catch(error => console.error('Failed to save to calendar:', error));
        }

        return { ...item, completed: nextCompleted };
      }
      return item;
    }));
  };

  const handleDeleteTimelineItem = (itemId) => {
    setTimelineItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleAddItemToHour = (itemData, targetHour) => {
    const newItem = {
      id: `tl_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      time: targetHour || selectedHourForAdd || '09:00',
      duration: itemData.duration || 60,
      title: itemData.title || itemData.name || 'New Item',
      type: itemData.type || 'task',
      color: itemData.color || (TYPE_CONFIG[itemData.type]?.color || '#6366f1'),
      completed: itemData.status === 'DONE',
      taskId: itemData._id || itemData.taskId || null,
      notes: itemData.notes || itemData.description || '',
      link: itemData.link || null,
      attendees: itemData.attendees || null,
    };

    setTimelineItems(prev => [...prev, newItem].sort((a, b) => a.time.localeCompare(b.time)));
    setShowScheduleDrawer(false);
  };

  // ── Drag & Drop Handlers ────────────────────────────────────────────────────
  const handleDragStart = (e, itemId) => {
    setDraggedItemId(itemId);
    e.dataTransfer.setData('text/plain', itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleSidebarDragStart = (e, itemData) => {
    setDraggedSidebarItem(itemData);
    e.dataTransfer.setData('application/json', JSON.stringify(itemData));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e, hour) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = draggedSidebarItem ? 'copy' : 'move';
    if (dragOverHour !== hour) setDragOverHour(hour);
  };

  const handleDropOnHour = (e, targetHour) => {
    e.preventDefault();
    const itemId = draggedItemId || e.dataTransfer.getData('text/plain');
    const sidebarItemData = draggedSidebarItem || (() => {
      try {
        const data = e.dataTransfer.getData('application/json');
        return data ? JSON.parse(data) : null;
      } catch {
        return null;
      }
    })();
    
    setDragOverHour(null);
    setDraggedItemId(null);
    setDraggedSidebarItem(null);

    // Handle sidebar item drop (new item)
    if (sidebarItemData) {
      handleAddItemToHour(sidebarItemData, targetHour);
      return;
    }

    // Handle existing timeline item drop (move)
    if (!itemId) return;

    setTimelineItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, time: targetHour };
      }
      return item;
    }).sort((a, b) => a.time.localeCompare(b.time)));
  };

  // Quick prompt to add at specific hour
  const openScheduleAtHour = (hour) => {
    setSelectedHourForAdd(hour);
    setShowScheduleDrawer(true);
  };

  // ── Find Current Execution Item ─────────────────────────────────────────────
  const sortedItems = [...timelineItems].sort((a, b) => a.time.localeCompare(b.time));
  let currentActiveItem = null;

  for (let i = 0; i < sortedItems.length; i++) {
    const item = sortedItems[i];
    const [ih, im] = item.time.split(':').map(Number);
    const itemStartMin = ih * 60 + im;
    const itemEndMin = itemStartMin + (item.duration || 60);

    if (currentMinutesTotal >= itemStartMin && currentMinutesTotal < itemEndMin) {
      currentActiveItem = item;
      break;
    }
  }

  // Next upcoming meeting
  const upcomingMeetings = meetings
    .filter(m => {
      if (!m.time) return false;
      const [mh, mm] = m.time.split(':').map(Number);
      return (mh * 60 + mm) >= currentMinutesTotal - 30;
    })
    .sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  const nextMeeting = upcomingMeetings[0];

  // Drawer filtering
  const filteredTasks = tasks.filter(t => !['DONE', 'CANCELLED'].includes(t.status) && (drawerSearch ? t.title?.toLowerCase().includes(drawerSearch.toLowerCase()) : true));
  const filteredMeetings = meetings.filter(m => drawerSearch ? m.title?.toLowerCase().includes(drawerSearch.toLowerCase()) : true);
  const filteredGate = gateSubjects.filter(g => drawerSearch ? g.name?.toLowerCase().includes(drawerSearch.toLowerCase()) : true);
  const filteredCollege = collegeSubjects.filter(c => drawerSearch ? c.name?.toLowerCase().includes(drawerSearch.toLowerCase()) : true);
  const filteredProjects = projects.filter(p => drawerSearch ? p.name?.toLowerCase().includes(drawerSearch.toLowerCase()) : true);

  return (
    <AppShell>
      <div className="today-desktop">
        <div style={{ maxWidth: '100%', margin: '0 auto', padding: '0 0 80px 0', position: 'relative' }} className="today-main-content">
        
        {/* ── STICKY COMMAND HEADER ───────────────────────────────────────────── */}
        <div className="today-command-header" style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          margin: '0 0 16px 0',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          borderRadius: 12,
        }}>
          <div>
            <div className="today-date-row" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: '1px',
                color: 'var(--purple)',
                textTransform: 'uppercase',
                background: 'var(--purple-bg)',
                padding: '5px 10px',
                borderRadius: 6,
              }}>TODAY</span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
                {displayDate}
              </span>
            </div>

            <div className="today-time-row" style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
              <div style={{
                fontSize: 20,
                fontWeight: 800,
                color: 'var(--text)',
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.3px',
              }}>
                {displayTime}
              </div>
              {currentActiveItem ? (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  fontSize: 12,
                  fontWeight: 600,
                  color: currentActiveItem.color || 'var(--purple)',
                  background: 'var(--surface-2)',
                  padding: '4px 10px',
                  borderRadius: 18,
                  border: `1px solid ${currentActiveItem.color || 'var(--border)'}25`,
                  maxWidth: 260,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: currentActiveItem.color || 'var(--purple)', animation: 'pulse 2s infinite' }} />
                  {currentActiveItem.title}
                </div>
              ) : (
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>• Standby</span>
              )}
            </div>
          </div>

          {/* Quick Header Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={scrollToNow}
              title="Jump to NOW"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                background: 'rgba(239, 68, 68, 0.08)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: 7,
                padding: '6px 10px',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#ef4444' }} />
              NOW
            </button>

            <button
              onClick={() => setShowNotepad(true)}
              title="Quick Note"
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                borderRadius: 7,
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              📝
            </button>

            <button
              onClick={() => setShowReminderCenter(true)}
              title="Reminders"
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                borderRadius: 7,
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              🔔
            </button>

            <button
              onClick={() => openScheduleAtHour(currentTimeStr)}
              style={{
                background: 'var(--purple)',
                color: '#fff',
                border: 'none',
                borderRadius: 7,
                padding: '6px 12px',
                fontSize: 11,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              ＋ Add
            </button>
          </div>
        </div>

        {/* ── TODAY'S MEETINGS BANNER (if any) ────────────────────────────────── */}
        {nextMeeting && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(37,99,235,0.1) 0%, rgba(99,102,241,0.06) 100%)',
            border: '1px solid rgba(37,99,235,0.25)',
            borderRadius: 10,
            padding: '10px 14px',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <span style={{ fontSize: 16 }}>👥</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Upcoming Meeting</span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>• {fmt12(nextMeeting.time)}</span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>
                  {nextMeeting.title}
                </div>
              </div>
            </div>
            {nextMeeting.link && (
              <a
                href={nextMeeting.link}
                target="_blank"
                rel="noreferrer"
                style={{
                  background: '#2563eb',
                  color: '#fff',
                  borderRadius: 6,
                  padding: '6px 12px',
                  fontSize: 11,
                  fontWeight: 700,
                  textDecoration: 'none',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                }}
              >
                Join →
              </a>
            )}
          </div>
        )}

        {/* ── TIMELINE CONTAINER (ONLY INTERFACE) ─────────────────────────────── */}
        <div
          ref={timelineContainerRef}
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          }}
          className="timeline-container"
        >
          {/* Timeline Header Info */}
          <div style={{
            padding: '8px 12px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--surface-2)',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>
              📅 Daily Execution Timeline
            </div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 500 }}>
              Tap hour to schedule • Drag to move
            </div>
          </div>

          {/* Timeline Vertical Slots */}
          <div style={{ position: 'relative', padding: '2px 0' }}>
            {HOURS.map((hourStr) => {
              const hourNum = parseInt(hourStr.split(':')[0], 10);
              const isCurrentHour = currentH === hourNum;
              const isDragOver = dragOverHour === hourStr;

              // Items falling strictly within this hour
              const hourItems = timelineItems.filter(item => {
                const [ih] = item.time.split(':').map(Number);
                return ih === hourNum;
              });

              return (
                <div
                  key={hourStr}
                  onDragOver={(e) => handleDragOver(e, hourStr)}
                  onDrop={(e) => handleDropOnHour(e, hourStr)}
                  style={{
                    position: 'relative',
                    minHeight: 52,
                    display: 'flex',
                    borderBottom: '1px solid var(--border-subtle)',
                    background: isDragOver
                      ? 'rgba(99,102,241,0.06)'
                      : isCurrentHour
                      ? 'rgba(99,102,241,0.015)'
                      : 'transparent',
                    transition: 'background 0.15s ease',
                  }}
                >
                  {/* Left: Hour Label */}
                  <div className="timeline-hour-label" style={{
                    width: 72,
                    flexShrink: 0,
                    padding: '10px 12px 0 0',
                    textAlign: 'right',
                    fontSize: 11,
                    fontWeight: 600,
                    color: isCurrentHour ? 'var(--purple)' : 'var(--text-muted)',
                    fontVariantNumeric: 'tabular-nums',
                    borderRight: '1px solid var(--border-subtle)',
                    userSelect: 'none',
                    lineHeight: '1.4',
                  }}>
                    {fmt12(hourStr)}
                  </div>

                  {/* Right: Slot Contents & Drop/Tap Area */}
                  <div
                    onClick={(e) => {
                      if (e.target === e.currentTarget) {
                        openScheduleAtHour(hourStr);
                      }
                    }}
                    style={{
                      flex: 1,
                      position: 'relative',
                      padding: '8px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                      cursor: 'pointer',
                      minHeight: 52,
                    }}
                  >
                    {/* Render LIVE NOW indicator line inside current hour */}
                    {isCurrentHour && (
                      <div
                        ref={nowMarkerRef}
                        style={{
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          top: `${(currentM / 60) * 100}%`,
                          zIndex: 15,
                          pointerEvents: 'none',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <div style={{
                          position: 'absolute',
                          left: -2,
                          width: 5,
                          height: 5,
                          borderRadius: '50%',
                          background: '#ef4444',
                          boxShadow: '0 0 2px rgba(239, 68, 68, 0.25)',
                          border: '1.5px solid #fff',
                        }} />
                        <div style={{
                          flex: 1,
                          height: 1,
                          background: 'rgba(239, 68, 68, 0.35)',
                        }} />
                        <span style={{
                          background: 'rgba(239, 68, 68, 0.08)',
                          color: '#ef4444',
                          fontSize: 7,
                          fontWeight: 700,
                          padding: '1px 4px',
                          borderRadius: 3,
                          marginLeft: 4,
                          letterSpacing: '0.2px',
                        }}>
                          NOW
                        </span>
                      </div>
                    )}

                    {/* Scheduled Items in this hour */}
                    {hourItems.map(item => {
                      const typeCfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.task;
                      const isTraining = item.type === 'health';
                      return (
                        <div
                          key={item.id}
                          className="timeline-item-card"
                          draggable
                          onDragStart={(e) => handleDragStart(e, item.id)}
                          style={{
                            background: item.completed ? 'var(--surface-2)' : isTraining ? 'linear-gradient(100deg, rgba(255, 77, 67, 0.14), var(--surface))' : 'var(--surface)',
                            border: `1px solid ${item.completed ? 'var(--border-subtle)' : (item.color || typeCfg.border)}${isTraining ? '70' : '35'}`,
                            borderLeftWidth: 3,
                            borderRadius: 8,
                            padding: isTraining ? '10px 12px' : '8px 10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 8,
                            boxShadow: item.completed ? 'none' : '0 1px 3px rgba(0,0,0,0.03)',
                            opacity: item.completed ? 0.6 : 1,
                            cursor: 'grab',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flex: 1, minWidth: 0 }}>
                            {isTraining && (
                              <span style={{ width: 26, height: 26, display: 'grid', placeItems: 'center', borderRadius: 8, background: 'rgba(255, 77, 67, 0.18)', color: '#ff6b63', fontSize: 14, flexShrink: 0 }}>
                                💪
                              </span>
                            )}
                            {/* Checkbox */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleTimelineItem(item.id);
                              }}
                              style={{
                                width: 16,
                                height: 16,
                                borderRadius: 4,
                                border: `1.5px solid ${item.completed ? 'var(--green)' : 'var(--border)'}`,
                                background: item.completed ? 'var(--green)' : 'transparent',
                                color: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 10,
                                fontWeight: 900,
                                cursor: 'pointer',
                                flexShrink: 0,
                                transition: 'all 0.15s',
                              }}
                            >
                              {item.completed ? '✓' : ''}
                            </button>

                            {/* Title & metadata */}
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div style={{
                                fontSize: isTraining ? 12 : 11,
                                fontWeight: isTraining ? 800 : 600,
                                color: item.completed ? 'var(--text-muted)' : 'var(--text)',
                                textDecoration: item.completed ? 'line-through' : 'none',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}>
                                {item.title}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 1, fontSize: 9, color: 'var(--text-muted)', fontWeight: 500 }}>
                                {isTraining && <span style={{ color: '#ff6b63', fontWeight: 800, letterSpacing: '0.04em' }}>WORKOUT</span>}
                                <span>{fmt12(item.time)}</span>
                                {item.duration && <span>• {item.duration}m</span>}
                                {item.notes && <span>• {item.notes}</span>}
                              </div>
                            </div>
                          </div>

                          {/* Tag & Action Buttons */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                            <span style={{
                              fontSize: 8,
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              padding: '2px 5px',
                              borderRadius: 3,
                              background: typeCfg.bg,
                              color: item.color || typeCfg.color,
                              letterSpacing: '0.2px',
                            }}>
                              {typeCfg.label}
                            </span>

                            {item.link && (
                              <a
                                href={item.link}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  fontSize: 9,
                                  fontWeight: 700,
                                  color: '#2563eb',
                                  textDecoration: 'none',
                                  padding: '2px 5px',
                                  borderRadius: 3,
                                  background: 'rgba(37,99,235,0.08)',
                                }}
                              >
                                Join
                              </a>
                            )}

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTimelineItem(item.id);
                              }}
                              title="Remove from timeline"
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-muted)',
                                fontSize: 11,
                                cursor: 'pointer',
                                padding: '1px 2px',
                                borderRadius: 3,
                                opacity: 0.6,
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Interactive empty placeholder */}
                    {hourItems.length === 0 && (
                      <div
                        role="button"
                        tabIndex={0}
                        aria-label={`Schedule an item at ${fmt12(hourStr)}`}
                        onClick={() => openScheduleAtHour(hourStr)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            openScheduleAtHour(hourStr);
                          }
                        }}
                        style={{
                          height: '100%',
                          minHeight: 36,
                          display: 'flex',
                          alignItems: 'center',
                          color: 'var(--text-muted)',
                          fontSize: 10,
                          fontWeight: 500,
                          opacity: 0.5,
                          borderRadius: 6,
                          padding: '0 8px',
                          border: '1px dashed transparent',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        + Tap to schedule at {fmt12(hourStr)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        </div>

        {/* ── DESKTOP SCHEDULING RAIL ───────────────────────────────────────── */}
        <aside className="schedule-sidebar-desktop" aria-label="Drag items into the schedule">
          {/* Header */}
          <div className="schedule-rail-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <div className="schedule-rail-title" style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>
                Schedule at {fmt12(selectedHourForAdd)}
              </div>
              <div className="schedule-rail-subtitle" style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, marginTop: 3 }}>
                Select task, topic, or create custom item
              </div>
            </div>
            <div
              className="schedule-rail-drag-hint"
              style={{
                minWidth: 68,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 9,
                border: '1px solid var(--border)',
                background: 'var(--surface-2)',
                color: 'var(--red)',
                fontSize: 10,
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              DRAG →
            </div>
          </div>

          {/* Time selector pills */}
          <div className="schedule-drawer-time-chips" style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 6, marginBottom: 12 }}>
            {HOURS.map(h => (
              <button
                key={h}
                onClick={() => setSelectedHourForAdd(h)}
                style={{
                  padding: '4px 8px',
                  borderRadius: 5,
                  border: '1px solid var(--border)',
                  background: selectedHourForAdd === h ? 'var(--purple)' : 'var(--surface-2)',
                  color: selectedHourForAdd === h ? '#fff' : 'var(--text)',
                  fontSize: 10,
                  fontWeight: 600,
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                }}
              >
                {fmt12(h)}
              </button>
            ))}
          </div>

          {/* Search input */}
          <input
            type="text"
            placeholder="Search tasks, topics, projects..."
            value={drawerSearch}
            onChange={(e) => setDrawerSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--surface-2)',
              color: 'var(--text)',
              fontSize: 13,
              marginBottom: 12,
              outline: 'none',
            }}
          />

          {/* Tabs */}
          <div className="schedule-drawer-filters" style={{ display: 'flex', gap: 6, marginBottom: 12, overflowX: 'auto' }}>
            {['all', 'tasks', 'events', 'gate', 'college', 'projects'].map(tab => (
              <button
                key={tab}
                onClick={() => setDrawerTab(tab)}
                style={{
                  padding: '6px 11px',
                  borderRadius: 14,
                  border: drawerTab === tab ? '1px solid var(--purple)' : '1px solid var(--border)',
                  background: drawerTab === tab ? 'var(--purple)' : 'var(--surface-2)',
                  color: drawerTab === tab ? '#ffffff' : 'var(--text-muted)',
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Items List */}
          <div className="schedule-drawer-results" style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', gap: 8, paddingRight: 2 }}>
            {/* Custom quick task creator */}
            {drawerSearch && (
              <div
                draggable
                onDragStart={(e) => handleSidebarDragStart(e, { title: drawerSearch, type: 'task', duration: 60 })}
                style={{
                  padding: '8px 10px',
                  borderRadius: 6,
                  background: 'var(--purple-bg)',
                  border: '1px solid var(--purple)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'grab',
                }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--purple)' }}>
                    Add "{drawerSearch}"
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 }}>Custom session</div>
                </div>
                <button
                  onClick={() => handleAddItemToHour({ title: drawerSearch, type: 'task', duration: 60 }, selectedHourForAdd)}
                  style={{
                    background: 'var(--purple)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 5,
                    padding: '5px 8px',
                    fontSize: 10,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  ＋ Add
                </button>
              </div>
            )}

            {/* Tasks */}
            {(drawerTab === 'all' || drawerTab === 'tasks') && filteredTasks.map(task => (
              <div
                key={task._id}
                draggable
                onDragStart={(e) => handleSidebarDragStart(e, { ...task, type: 'task' })}
                style={{
                  padding: '8px 10px',
                  borderRadius: 6,
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  cursor: 'grab',
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <span title={task.title}>{task.title}</span>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500, marginTop: 2 }}>
                    {task.priority || 'P2'} • {task.project || 'General'}
                  </div>
                </div>
                <button
                  onClick={() => handleAddItemToHour({ ...task, type: 'task' }, selectedHourForAdd)}
                  style={{
                    background: 'var(--purple)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 5,
                    padding: '5px 8px',
                    fontSize: 10,
                    fontWeight: 700,
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  ＋ Add
                </button>
              </div>
            ))}

            {/* Meetings & events */}
            {(drawerTab === 'all' || drawerTab === 'events') && filteredMeetings.map(meeting => (
              <div
                key={meeting._id}
                draggable
                onDragStart={(e) => handleSidebarDragStart(e, { ...meeting, title: meeting.title, type: 'meeting', duration: meeting.duration || 60, color: '#ff5a52' })}
                style={{
                  padding: '8px 10px', borderRadius: 6, background: 'var(--surface-2)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, cursor: 'grab',
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <span title={meeting.title}>Event: {meeting.title}</span>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500, marginTop: 2 }}>
                    {meeting.time || meeting.startTime || 'Today'} • {meeting.people?.length || 0} attendees
                  </div>
                </div>
                <button onClick={() => handleAddItemToHour({ ...meeting, title: meeting.title, type: 'meeting', duration: meeting.duration || 60, color: '#ff5a52' }, selectedHourForAdd)} style={{ background: 'var(--red)', color: '#fff', border: 'none', borderRadius: 5, padding: '5px 8px', fontSize: 10, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
                  ＋ Add
                </button>
              </div>
            ))}

            {/* GATE */}
            {(drawerTab === 'all' || drawerTab === 'gate') && filteredGate.map(g => (
              <div
                key={g._id || g.name}
                draggable
                onDragStart={(e) => handleSidebarDragStart(e, { title: g.name, type: 'gate', duration: 90, color: '#3b82f6' })}
                style={{
                  padding: '8px 10px',
                  borderRadius: 6,
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  cursor: 'grab',
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <span title={g.name}>{g.name}</span>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500, marginTop: 2 }}>
                    {g.subject || 'GATE 2027'} • {g.progress || 0}% complete
                  </div>
                </div>
                <button
                  onClick={() => handleAddItemToHour({ title: g.name, type: 'gate', duration: 90, color: '#3b82f6' }, selectedHourForAdd)}
                  style={{
                    background: '#3b82f6',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 5,
                    padding: '5px 8px',
                    fontSize: 10,
                    fontWeight: 700,
                    cursor: 'pointer',
                    flexShrink: 0,
                    }}
                >
                  ＋ Add
                </button>
              </div>
            ))}

            {/* College */}
            {(drawerTab === 'all' || drawerTab === 'college') && filteredCollege.map(c => (
              <div
                key={c._id || c.name}
                draggable
                onDragStart={(e) => handleSidebarDragStart(e, { title: c.name, type: 'college', duration: 90, color: '#f59e0b' })}
                style={{
                  padding: '8px 10px',
                  borderRadius: 6,
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  cursor: 'grab',
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <span title={c.name}>{c.name}</span>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500, marginTop: 2 }}>
                    {c.code || 'Subject'} • {c.credits || 3} credits
                  </div>
                </div>
                <button
                  onClick={() => handleAddItemToHour({ title: c.name, type: 'college', duration: 90, color: '#f59e0b' }, selectedHourForAdd)}
                  style={{
                    background: '#f59e0b',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 5,
                    padding: '5px 8px',
                    fontSize: 10,
                    fontWeight: 700,
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  ＋ Add
                </button>
              </div>
            ))}

            {/* Projects */}
            {(drawerTab === 'all' || drawerTab === 'projects') && filteredProjects.map(p => (
              <div
                key={p._id}
                draggable
                onDragStart={(e) => handleSidebarDragStart(e, { title: `Work: ${p.name}`, type: 'forge', duration: 120, color: '#ec4899' })}
                style={{
                  padding: '8px 10px',
                  borderRadius: 6,
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  cursor: 'grab',
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <span title={p.name}>{p.name}</span>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500, marginTop: 2 }}>
                    {p.status || 'Active'} • {p.description || 'Sprint focus'}
                  </div>
                </div>
                <button
                  onClick={() => handleAddItemToHour({ title: `Work: ${p.name}`, type: 'forge', duration: 120, color: '#ec4899' }, selectedHourForAdd)}
                  style={{
                    background: '#ec4899',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 5,
                    padding: '5px 8px',
                    fontSize: 10,
                    fontWeight: 700,
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  ＋ Add
                </button>
              </div>
            ))}

            {!drawerSearch && filteredTasks.length === 0 && filteredMeetings.length === 0 && filteredGate.length === 0 && filteredCollege.length === 0 && filteredProjects.length === 0 && (
              <div className="schedule-empty-state">
                <span>Nothing ready to schedule</span>
                <small>Add a task, event, or project to see it here.</small>
              </div>
            )}
          </div>
        </aside>

        {/* ── MOBILE BOTTOM SHEET (Conditional on showScheduleDrawer) ─────────────────────────────────── */}
        {showScheduleDrawer && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(6px)',
              zIndex: 90,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
            }}
            onClick={() => setShowScheduleDrawer(false)}
            className="schedule-drawer-overlay-mobile"
          >
            <div
              style={{
                background: 'var(--surface)',
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                maxHeight: '85vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 -10px 40px rgba(0,0,0,0.3)',
                padding: '20px 20px calc(30px + env(safe-area-inset-bottom, 0px)) 20px',
              }}
              onClick={(e) => e.stopPropagation()}
              className="schedule-drawer-content-mobile"
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>
                    Schedule Item at {fmt12(selectedHourForAdd)}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Select any task, study topic, or create custom execution item
                  </div>
                </div>
                <button
                  onClick={() => setShowScheduleDrawer(false)}
                  style={{
                    background: 'var(--surface-2)',
                    border: 'none',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    fontSize: 16,
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Time selector pills */}
              <div className="schedule-drawer-time-chips" style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 10, marginBottom: 10 }}>
                {HOURS.map(h => (
                  <button
                    key={h}
                    onClick={() => setSelectedHourForAdd(h)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 8,
                      border: '1px solid var(--border)',
                      background: selectedHourForAdd === h ? 'var(--purple)' : 'var(--surface-2)',
                      color: selectedHourForAdd === h ? '#fff' : 'var(--text)',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    {fmt12(h)}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <input
                type="text"
                placeholder="Search tasks, study topics, projects..."
                value={drawerSearch}
                onChange={(e) => setDrawerSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  background: 'var(--surface-2)',
                  color: 'var(--text)',
                  fontSize: 14,
                  marginBottom: 12,
                  outline: 'none',
                }}
              />

              {/* Tabs */}
              <div className="schedule-drawer-filters" style={{ display: 'flex', gap: 6, marginBottom: 12, overflowX: 'auto' }}>
                {['all', 'tasks', 'gate', 'college', 'projects'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setDrawerTab(tab)}
                    style={{
                      padding: '5px 14px',
                      borderRadius: 20,
                      border: drawerTab === tab ? '1px solid var(--purple)' : '1px solid var(--border)',
                      background: drawerTab === tab ? 'var(--purple)' : 'var(--surface-2)',
                      color: drawerTab === tab ? '#ffffff' : 'var(--text-muted)',
                      fontSize: 12,
                      fontWeight: 800,
                      textTransform: 'capitalize',
                      cursor: 'pointer',
                      flexShrink: 0,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Items List */}
              <div className="schedule-drawer-results" style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {/* Custom quick task creator */}
                {drawerSearch && (
                  <div style={{
                    padding: '10px 12px',
                    borderRadius: 10,
                    background: 'var(--purple-bg)',
                    border: '1px solid var(--purple)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--purple)' }}>
                        Add "{drawerSearch}"
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Custom execution session</div>
                    </div>
                    <button
                      onClick={() => handleAddItemToHour({ title: drawerSearch, type: 'task', duration: 60 }, selectedHourForAdd)}
                      style={{
                        background: 'var(--purple)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '6px 12px',
                        fontSize: 12,
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      ＋ Schedule
                    </button>
                  </div>
                )}

                {/* Tasks */}
                {(drawerTab === 'all' || drawerTab === 'tasks') && filteredTasks.map(task => (
                  <div
                    key={task._id}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 10,
                      background: 'var(--surface-2)',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <span title={task.title}>{task.title}</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        {task.priority || 'P2'} • {task.project || 'General'}
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddItemToHour({ ...task, type: 'task' }, selectedHourForAdd)}
                      style={{
                        background: 'var(--purple)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '6px 12px',
                        fontSize: 12,
                        fontWeight: 800,
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      ＋ Schedule
                    </button>
                  </div>
                ))}

                {/* GATE */}
                {(drawerTab === 'all' || drawerTab === 'gate') && filteredGate.map(g => (
                  <div
                    key={g._id || g.name}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 10,
                      background: 'var(--surface-2)',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <span title={`GATE: ${g.name}`}>GATE: {g.name}</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        {g.code || 'Study Block'} • Weight: {g.weightage || 'High'}
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddItemToHour({ title: `GATE Study: ${g.name}`, type: 'gate', duration: 90, color: '#3b82f6' }, selectedHourForAdd)}
                      style={{
                        background: '#3b82f6',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '6px 12px',
                        fontSize: 12,
                        fontWeight: 800,
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      ＋ Schedule
                    </button>
                  </div>
                ))}

                {/* College */}
                {(drawerTab === 'all' || drawerTab === 'college') && filteredCollege.map(c => (
                  <div
                    key={c._id || c.name}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 10,
                      background: 'var(--surface-2)',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <span title={`College: ${c.name}`}>College: {c.name}</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        {c.code || 'Academic'} • Attendance: {c.attendance || '--'}%
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddItemToHour({ title: `College: ${c.name}`, type: 'college', duration: 60, color: '#f59e0b' }, selectedHourForAdd)}
                      style={{
                        background: '#f59e0b',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '6px 12px',
                        fontSize: 12,
                        fontWeight: 800,
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      ＋ Schedule
                    </button>
                  </div>
                ))}

                {/* Projects */}
                {(drawerTab === 'all' || drawerTab === 'projects') && filteredProjects.map(p => (
                  <div
                    key={p._id || p.name}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 10,
                      background: 'var(--surface-2)',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <span title={`Project: ${p.name}`}>Project: {p.name}</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        {p.status || 'Active'} • {p.description || 'Sprint focus'}
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddItemToHour({ title: `Work: ${p.name}`, type: 'forge', duration: 120, color: '#ec4899' }, selectedHourForAdd)}
                      style={{
                        background: '#ec4899',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '6px 12px',
                        fontSize: 12,
                        fontWeight: 800,
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      ＋ Schedule
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── QUICK NOTE OVERLAY ──────────────────────────────────────────────── */}
        {showNotepad && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}>
            <div style={{
              width: '100%',
              maxWidth: 600,
              height: '80vh',
              background: 'var(--surface)',
              borderRadius: 16,
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '14px 18px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--surface-2)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>📝</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)' }}>Today Quick Note</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Auto-saved instantly to local storage</div>
                  </div>
                </div>
                <button
                  onClick={() => setShowNotepad(false)}
                  style={{
                    background: 'var(--purple)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '6px 14px',
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Done
                </button>
              </div>

              <textarea
                ref={noteRef}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Jot down quick thoughts, scratchpad calculations, meeting notes, links..."
                style={{
                  flex: 1,
                  padding: 18,
                  background: 'transparent',
                  color: 'var(--text)',
                  fontSize: 14,
                  lineHeight: '1.6',
                  fontFamily: 'monospace',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                }}
              />
            </div>
          </div>
        )}

        {/* ── REMINDER CENTER MODAL ───────────────────────────────────────────── */}
        {showReminderCenter && (
          <ReminderCenter
            onClose={() => setShowReminderCenter(false)}
            tasks={tasks}
            meetings={meetings}
            gateTopics={gateSubjects}
          />
        )}
      </div>
    </AppShell>
  );
}
