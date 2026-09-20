'use client';
import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import Link from 'next/link';
import ReminderCenter from '@/components/ReminderCenter';

// ─── Helpers & Constants ──────────────────────────────────────────────────────
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DAILY_CAPACITY_HOURS = 8.0; // Standard daily available productive capacity

function formatDate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function fmt12(time24) {
  if (!time24) return '';
  const [h, m] = time24.split(':').map(Number);
  const p = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  return m ? `${displayH}:${String(m).padStart(2, '0')} ${p}` : `${displayH} ${p}`;
}

export default function CalendarPlanningPage() {
  const now = new Date();
  const todayStr = formatDate(now.getFullYear(), now.getMonth(), now.getDate());

  // Calendar View States
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'week' | 'upcoming'
  const [showDayInspector, setShowDayInspector] = useState(false);
  const [showReminderCenter, setShowReminderCenter] = useState(false);

  // Data
  const [meetings, setMeetings] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [gateSubjects, setGateSubjects] = useState([]);
  const [collegeSubjects, setCollegeSubjects] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Planned items storage per date { [dateStr]: [items] }
  const [plannedWork, setPlannedWork] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('ops_calendar_plans_v2');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return {};
  });

  // Today timeline items for syncing today's load
  const [todayTimeline, setTodayTimeline] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('ops_today_timeline_v2');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  // Save planned work
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ops_calendar_plans_v2', JSON.stringify(plannedWork));
    }
  }, [plannedWork]);

  // Load Data
  async function loadData() {
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
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // ── Workload Calculation Engine ─────────────────────────────────────────────
  function getDayWorkload(dateStr) {
    const isToday = dateStr === todayStr;

    // 1. Meetings on this day
    const dayMeetings = meetings.filter(m => m.date && m.date.slice(0, 10) === dateStr);
    const meetingHours = dayMeetings.reduce((acc, m) => acc + ((m.duration || 60) / 60), 0);

    // 2. Tasks due on this day
    const dayTasks = tasks.filter(t => t.deadline && t.deadline.slice(0, 10) === dateStr && !['CANCELLED'].includes(t.status));
    const taskHours = dayTasks.reduce((acc, t) => acc + (t.estimatedHours || 1.0), 0);

    // 3. Custom planned study/work blocks for this date
    const dayPlans = plannedWork[dateStr] || [];
    const planHours = dayPlans.reduce((acc, p) => acc + (p.hours || 1.0), 0);

    // 4. If today, take max with today timeline
    let totalHours = meetingHours + taskHours + planHours;
    if (isToday && todayTimeline.length > 0) {
      const todayTlHours = todayTimeline.reduce((acc, item) => acc + ((item.duration || 60) / 60), 0);
      totalHours = Math.max(totalHours, todayTlHours);
    }

    const loadPercentage = Math.min(100, Math.round((totalHours / DAILY_CAPACITY_HOURS) * 100));

    // Load category
    let status = 'light';
    let statusColor = '#10b981';
    let statusLabel = 'Light';
    if (totalHours > 8.5) {
      status = 'overloaded';
      statusColor = '#ef4444';
      statusLabel = 'Overloaded';
    } else if (totalHours >= 6.0) {
      status = 'busy';
      statusColor = '#f59e0b';
      statusLabel = 'Heavy';
    } else if (totalHours >= 3.5) {
      status = 'balanced';
      statusColor = '#3b82f6';
      statusLabel = 'Balanced';
    }

    return {
      dateStr,
      meetings: dayMeetings,
      tasks: dayTasks,
      plans: dayPlans,
      meetingCount: dayMeetings.length,
      taskCount: dayTasks.length,
      planCount: dayPlans.length,
      totalHours: Number(totalHours.toFixed(1)),
      loadPercentage,
      status,
      statusColor,
      statusLabel,
      availableHours: DAILY_CAPACITY_HOURS,
    };
  }

  // ── Month Calculations ──────────────────────────────────────────────────────
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();

  const calendarDays = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(formatDate(viewYear, viewMonth, d));
  }

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear(y => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewYear(y => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  const goToToday = () => {
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    setSelectedDate(todayStr);
  };

  // ── Week Calculations ───────────────────────────────────────────────────────
  const selectedDateObj = new Date(selectedDate);
  const dayOfWeek = selectedDateObj.getDay(); // 0 is Sun
  const startOfWeek = new Date(selectedDateObj);
  startOfWeek.setDate(selectedDateObj.getDate() - dayOfWeek);

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return formatDate(d.getFullYear(), d.getMonth(), d.getDate());
  });

  // Selected Day Workload Data
  const selectedWorkload = getDayWorkload(selectedDate);

  // ── Upcoming Deadlines & Meetings ───────────────────────────────────────────
  const upcomingDeadlines = tasks
    .filter(t => t.deadline && !['DONE', 'CANCELLED'].includes(t.status))
    .sort((a, b) => a.deadline.localeCompare(b.deadline));

  const upcomingMeetingsList = meetings
    .filter(m => m.date && m.date.slice(0, 10) >= todayStr)
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  // ── Study / Work Distribution Data ──────────────────────────────────────────
  const distributionData = [
    { label: 'GATE Study', hours: 14.5, color: '#3b82f6', icon: '🎓' },
    { label: 'College', hours: 12.0, color: '#f59e0b', icon: '🏛️' },
    { label: 'Startup / Forge', hours: 10.0, color: '#ec4899', icon: '⚡' },
    { label: 'Tasks & Projects', hours: 8.5, color: '#6366f1', icon: '✓' },
    { label: 'Meetings', hours: 4.0, color: '#2563eb', icon: '👥' },
    { label: 'Health & Habits', hours: 7.0, color: '#10b981', icon: '💪' },
  ];
  const totalWeeklyHours = distributionData.reduce((acc, d) => acc + d.hours, 0);

  return (
    <AppShell>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '16px 16px 90px 16px' }}>

        {/* ── HEADER & NAVIGATION CONTROLS ────────────────────────────────────── */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 20,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          padding: '16px 20px',
          borderRadius: 16,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: '1.2px',
                color: 'var(--blue)',
                textTransform: 'uppercase',
                background: 'var(--blue-bg)',
                padding: '2px 8px',
                borderRadius: 6,
              }}>
                PLANNING & OVERVIEW
              </span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                Workload & Distribution
              </span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--text)', marginTop: 4 }}>
              {MONTH_NAMES[viewMonth]} {viewYear}
            </div>
          </div>

          {/* Month / View Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', background: 'var(--surface-2)', borderRadius: 10, padding: 3, border: '1px solid var(--border)' }}>
              <button
                onClick={() => setViewMode('month')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 7,
                  border: 'none',
                  background: viewMode === 'month' ? 'var(--surface)' : 'transparent',
                  color: viewMode === 'month' ? 'var(--text)' : 'var(--text-muted)',
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: viewMode === 'month' ? '0 2px 6px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode('week')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 7,
                  border: 'none',
                  background: viewMode === 'week' ? 'var(--surface)' : 'transparent',
                  color: viewMode === 'week' ? 'var(--text)' : 'var(--text-muted)',
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: viewMode === 'week' ? '0 2px 6px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode('upcoming')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 7,
                  border: 'none',
                  background: viewMode === 'upcoming' ? 'var(--surface)' : 'transparent',
                  color: viewMode === 'upcoming' ? 'var(--text)' : 'var(--text-muted)',
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: viewMode === 'upcoming' ? '0 2px 6px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                Upcoming
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button
                onClick={prevMonth}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--surface-2)',
                  color: 'var(--text)',
                  fontSize: 14,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ←
              </button>
              <button
                onClick={goToToday}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--surface-2)',
                  color: 'var(--text)',
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--surface-2)',
                  color: 'var(--text)',
                  fontSize: 14,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                →
              </button>
            </div>

            <button
              onClick={() => setShowReminderCenter(true)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--surface-2)',
                color: 'var(--text)',
                fontSize: 14,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Reminders"
            >
              🔔
            </button>
          </div>
        </div>

        {/* ── VIEW 1: MONTHLY WORKLOAD HEATMAP ────────────────────────────────── */}
        {viewMode === 'month' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
            {/* Calendar Grid Container */}
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              padding: 16,
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            }}>
              {/* Day Labels */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 8, textAlign: 'center' }}>
                {DAY_LABELS.map(day => (
                  <div key={day} style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {day}
                  </div>
                ))}
              </div>

              {/* Day Cells */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
                {calendarDays.map((dateStr, idx) => {
                  if (!dateStr) {
                    return <div key={`empty_${idx}`} style={{ minHeight: 80, opacity: 0.2 }} />;
                  }

                  const dayNum = parseInt(dateStr.split('-')[2], 10);
                  const isToday = dateStr === todayStr;
                  const isSelected = dateStr === selectedDate;
                  const workload = getDayWorkload(dateStr);

                  return (
                    <div
                      key={dateStr}
                      onClick={() => {
                        setSelectedDate(dateStr);
                        setShowDayInspector(true);
                      }}
                      style={{
                        minHeight: 84,
                        padding: '6px 8px',
                        borderRadius: 12,
                        border: isSelected
                          ? '2px solid var(--blue)'
                          : isToday
                          ? '2px solid var(--purple)'
                          : '1px solid var(--border)',
                        background: isSelected
                          ? 'rgba(37,99,235,0.08)'
                          : isToday
                          ? 'rgba(99,102,241,0.05)'
                          : 'var(--surface-2)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {/* Top: Day number + Today indicator */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{
                          fontSize: 13,
                          fontWeight: isToday || isSelected ? 900 : 700,
                          color: isToday ? 'var(--purple)' : 'var(--text)',
                        }}>
                          {dayNum}
                        </span>
                        {isToday && (
                          <span style={{ fontSize: 9, fontWeight: 900, background: 'var(--purple)', color: '#fff', padding: '1px 4px', borderRadius: 4 }}>
                            TODAY
                          </span>
                        )}
                      </div>

                      {/* Middle: Workload metrics */}
                      <div style={{ marginTop: 4 }}>
                        {workload.totalHours > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <div style={{ fontSize: 11, fontWeight: 800, color: workload.statusColor }}>
                              {workload.totalHours}h planned
                            </div>
                            <div style={{ display: 'flex', gap: 4, fontSize: 10, color: 'var(--text-muted)' }}>
                              {workload.meetingCount > 0 && <span>{workload.meetingCount}👥</span>}
                              {workload.taskCount > 0 && <span>{workload.taskCount}✓</span>}
                            </div>
                          </div>
                        ) : (
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', opacity: 0.5 }}>
                            Free
                          </div>
                        )}
                      </div>

                      {/* Bottom: Capacity load progress bar */}
                      <div style={{ width: '100%', height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden', marginTop: 4 }}>
                        <div style={{
                          width: `${workload.loadPercentage}%`,
                          height: '100%',
                          background: workload.statusColor,
                          borderRadius: 2,
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Day Quick Card Summary */}
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              padding: '16px 20px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
            }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Selected Day Summary
                </div>
                <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--text)', marginTop: 2 }}>
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 800, color: selectedWorkload.statusColor }}>
                    {selectedWorkload.totalHours}h planned
                  </span>
                  <span>•</span>
                  <span>{selectedWorkload.meetingCount} meetings</span>
                  <span>•</span>
                  <span>{selectedWorkload.taskCount} tasks</span>
                  <span>•</span>
                  <span style={{ color: 'var(--text-muted)' }}>{selectedWorkload.loadPercentage}% of {DAILY_CAPACITY_HOURS}h capacity</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                {selectedDate === todayStr ? (
                  <Link
                    href="/today"
                    style={{
                      background: 'var(--purple)',
                      color: '#fff',
                      padding: '8px 16px',
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 800,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    Open in Today Timeline →
                  </Link>
                ) : (
                  <button
                    onClick={() => setShowDayInspector(true)}
                    style={{
                      background: 'var(--blue)',
                      color: '#fff',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    Inspect & Plan Day →
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── VIEW 2: WEEKLY PLANNER CARDS ────────────────────────────────────── */}
        {viewMode === 'week' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>
              Weekly Workload Summary & Capacity
            </div>

            {weekDates.map(dateStr => {
              const workload = getDayWorkload(dateStr);
              const dateObj = new Date(dateStr + 'T00:00:00');
              const isToday = dateStr === todayStr;

              return (
                <div
                  key={dateStr}
                  onClick={() => {
                    setSelectedDate(dateStr);
                    setShowDayInspector(true);
                  }}
                  style={{
                    background: 'var(--surface)',
                    border: isToday ? '2px solid var(--purple)' : '1px solid var(--border)',
                    borderRadius: 14,
                    padding: '14px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    cursor: 'pointer',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                  }}
                >
                  {/* Top: Day Title & Load Chip */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 15, fontWeight: 900, color: isToday ? 'var(--purple)' : 'var(--text)' }}>
                        {dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                      </span>
                      {isToday && (
                        <span style={{ fontSize: 10, fontWeight: 900, background: 'var(--purple)', color: '#fff', padding: '2px 6px', borderRadius: 4 }}>
                          TODAY
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: workload.statusColor,
                        background: 'var(--surface-2)',
                        padding: '3px 8px',
                        borderRadius: 6,
                        border: `1px solid ${workload.statusColor}30`,
                      }}>
                        {workload.totalHours}h planned · {workload.meetingCount} meetings · {workload.taskCount} tasks
                      </span>
                    </div>
                  </div>

                  {/* Load Capacity Bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                      <span>Estimated Planned vs Available Hours</span>
                      <span>{workload.totalHours}h / {workload.availableHours}h ({workload.loadPercentage}%)</span>
                    </div>
                    <div style={{ width: '100%', height: 6, background: 'var(--surface-2)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{
                        width: `${workload.loadPercentage}%`,
                        height: '100%',
                        background: workload.statusColor,
                        borderRadius: 3,
                      }} />
                    </div>
                  </div>

                  {/* Items Preview */}
                  {(workload.meetings.length > 0 || workload.tasks.length > 0) && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 2 }}>
                      {workload.meetings.map(m => (
                        <span key={m._id} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: 'rgba(37,99,235,0.1)', color: '#2563eb', fontWeight: 600 }}>
                          👥 {fmt12(m.time)} {m.title}
                        </span>
                      ))}
                      {workload.tasks.map(t => (
                        <span key={t._id} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: 'var(--surface-2)', color: 'var(--text-secondary)', fontWeight: 600 }}>
                          ✓ {t.title}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── VIEW 3: UPCOMING DEADLINES & MEETINGS ────────────────────────────── */}
        {viewMode === 'upcoming' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            {/* Upcoming Meetings Card */}
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              padding: 16,
            }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--text)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>👥 Upcoming Meetings</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>({upcomingMeetingsList.length})</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {upcomingMeetingsList.map(m => (
                  <div
                    key={m._id}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 10,
                      background: 'var(--surface-2)',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>{m.title}</span>
                      <span style={{ fontSize: 11, color: '#2563eb', fontWeight: 700 }}>{m.date?.slice(0, 10)} {fmt12(m.time)}</span>
                    </div>
                    {m.notes && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.notes}</div>}
                    {m.link && (
                      <a
                        href={m.link}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: '#2563eb',
                          textDecoration: 'none',
                          alignSelf: 'flex-start',
                          marginTop: 4,
                        }}
                      >
                        Join Call →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Tasks & Deadlines Card */}
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              padding: 16,
            }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--text)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>🎯 Upcoming Deadlines</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>({upcomingDeadlines.length})</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {upcomingDeadlines.map(t => (
                  <div
                    key={t._id}
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
                        {t.title}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        {t.project || 'General'} • Priority: {t.priority || 'P2'}
                      </div>
                    </div>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: 6,
                      background: t.deadline?.slice(0, 10) === todayStr ? 'rgba(239,68,68,0.12)' : 'var(--surface)',
                      color: t.deadline?.slice(0, 10) === todayStr ? '#ef4444' : 'var(--text-secondary)',
                      flexShrink: 0,
                    }}>
                      {t.deadline?.slice(0, 10)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── WORK & STUDY DISTRIBUTION BREAKDOWN ─────────────────────────────── */}
        <div style={{
          marginTop: 20,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: 20,
        }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--text)', marginBottom: 4 }}>
            📊 Work & Study Distribution
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
            Weekly targeted allocation across focus domains ({totalWeeklyHours}h total target)
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {distributionData.map(item => {
              const pct = Math.round((item.hours / totalWeeklyHours) * 100);
              return (
                <div
                  key={item.label}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 12,
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                      {item.icon} {item.label}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: item.color }}>
                      {item.hours}h ({pct}%)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: 6, background: 'var(--surface)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: item.color, borderRadius: 3 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── DAY INSPECTOR MODAL ─────────────────────────────────────────────── */}
        {showDayInspector && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(6px)',
              zIndex: 90,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
            }}
            onClick={() => setShowDayInspector(false)}
          >
            <div
              style={{
                width: '100%',
                maxWidth: 580,
                maxHeight: '85vh',
                background: 'var(--surface)',
                borderRadius: 20,
                border: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                overflow: 'hidden',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--surface-2)',
              }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--blue)', textTransform: 'uppercase' }}>
                    Day Planning Details
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--text)', marginTop: 2 }}>
                    {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
                <button
                  onClick={() => setShowDayInspector(false)}
                  style={{
                    background: 'var(--surface)',
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

              {/* Body */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Workload Summary Bar */}
                <div style={{
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: selectedWorkload.statusColor }}>
                      {selectedWorkload.totalHours}h Planned Workload
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      Capacity: {selectedWorkload.loadPercentage}% of {DAILY_CAPACITY_HOURS}h
                    </span>
                  </div>
                  <div style={{ width: '100%', height: 6, background: 'var(--surface)', borderRadius: 3, overflow: 'hidden', marginTop: 8 }}>
                    <div style={{ width: `${selectedWorkload.loadPercentage}%`, height: '100%', background: selectedWorkload.statusColor, borderRadius: 3 }} />
                  </div>
                </div>

                {/* Day's Meetings */}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
                    👥 Scheduled Meetings ({selectedWorkload.meetings.length})
                  </div>
                  {selectedWorkload.meetings.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {selectedWorkload.meetings.map(m => (
                        <div key={m._id} style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{m.title}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{fmt12(m.time)} • {m.duration || 60}m</div>
                          </div>
                          {m.link && <a href={m.link} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>Join →</a>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No meetings scheduled on this day.</div>
                  )}
                </div>

                {/* Day's Tasks Due */}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
                    ✓ Tasks Due ({selectedWorkload.tasks.length})
                  </div>
                  {selectedWorkload.tasks.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {selectedWorkload.tasks.map(t => (
                        <div key={t._id} style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{t.title}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.project || 'General'} • Priority: {t.priority || 'P2'}</div>
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>{t.status}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No tasks due on this day.</div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', background: 'var(--surface-2)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                {selectedDate === todayStr ? (
                  <Link
                    href="/today"
                    style={{
                      background: 'var(--purple)',
                      color: '#fff',
                      padding: '8px 16px',
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 800,
                      textDecoration: 'none',
                    }}
                  >
                    Execute in Today Timeline →
                  </Link>
                ) : (
                  <button
                    onClick={() => setShowDayInspector(false)}
                    style={{
                      background: 'var(--blue)',
                      color: '#fff',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    Done
                  </button>
                )}
              </div>
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
