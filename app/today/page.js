'use client';
import { useState, useEffect, useRef } from 'react';
import AppShell from '@/components/AppShell';
import Link from 'next/link';
import ReminderCenter from '@/components/ReminderCenter';
import { checkNotificationPermission, syncAllTodayReminders } from '@/lib/notifications';

const DEFAULT_SCHEDULE = [
  { id: 'sb_1', time: '06:00', label: 'Wake up / Morning', type: 'habit', color: '#8b5cf6' },
  { id: 'sb_2', time: '06:30', label: 'Exercise / Gym', type: 'health', color: '#10b981' },
  { id: 'sb_3', time: '08:00', label: 'GATE Study Block', type: 'gate', color: '#3b82f6' },
  { id: 'sb_4', time: '10:00', label: 'College / Classes', type: 'college', color: '#f59e0b' },
  { id: 'sb_5', time: '13:00', label: 'Lunch / Break', type: 'break', color: '#6b7280' },
  { id: 'sb_6', time: '14:00', label: 'Forge / Startup Work', type: 'forge', color: '#ec4899' },
  { id: 'sb_7', time: '17:00', label: 'Gym / Fitness', type: 'health', color: '#10b981' },
  { id: 'sb_8', time: '19:00', label: 'GATE / Deep Work', type: 'gate', color: '#3b82f6' },
  { id: 'sb_9', time: '21:00', label: 'Review / Reflect', type: 'review', color: '#ef4444' },
  { id: 'sb_10', time: '22:00', label: 'Reading / Wind down', type: 'personal', color: '#6366f1' },
];

const PRIORITY_COLORS = {
  P0: { text: 'P0', color: 'var(--red)', bg: 'var(--red-bg)' },
  P1: { text: 'P1', color: 'var(--orange)', bg: 'var(--orange-bg)' },
  P2: { text: 'P2', color: 'var(--blue)', bg: 'var(--blue-bg)' },
  P3: { text: 'P3', color: 'var(--text-muted)', bg: 'var(--surface-2)' },
};

export default function TodayPage() {
  const [tasks, setTasks] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'timeline' | 'tasks'

  // Schedule blocks state (persisted)
  const [schedule, setSchedule] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('today_schedule_blocks_v1');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return DEFAULT_SCHEDULE;
  });

  // Block task assignments map: { [blockId]: [taskId, taskId] }
  const [blockAssignments, setBlockAssignments] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('today_block_assignments_v1');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return {};
  });

  // Drag & drop state
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverBlockId, setDragOverBlockId] = useState(null);

  // Edit / Add block modal
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showReminderCenter, setShowReminderCenter] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null);
  const [blockForm, setBlockForm] = useState({
    time: '15:00',
    label: '',
    type: 'forge',
    color: '#ec4899',
  });

  // Current time state for live NOW line
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('today_schedule_blocks_v1', JSON.stringify(schedule));
    }
  }, [schedule]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('today_block_assignments_v1', JSON.stringify(blockAssignments));
    }
  }, [blockAssignments]);

  async function loadData() {
    try {
      const [tRes, mRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/meetings?upcoming=true'),
      ]);
      const tData = await tRes.json();
      const mData = await mRes.json();
      const taskList = tData.success ? tData.data.filter(t => !['DONE', 'CANCELLED'].includes(t.status)) : [];
      
      const todayStart = new Date(); todayStart.setHours(0,0,0,0);
      const todayEnd = new Date(); todayEnd.setHours(23,59,59,999);
      const todayMeetings = mData.success ? mData.data.filter(m => {
        const d = new Date(m.date);
        return d >= todayStart && d <= todayEnd;
      }) : [];

      setTasks(taskList);
      setMeetings(todayMeetings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleToggleTask(id, currentStatus) {
    try {
      const nextStatus = currentStatus === 'DONE' ? 'TODO' : 'DONE';
      await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  }

  // --- Drag & Drop Handlers ---
  function handleDragStart(e, taskId) {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e, blockId) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverBlockId !== blockId) {
      setDragOverBlockId(blockId);
    }
  }

  function handleDragLeave(e, blockId) {
    if (dragOverBlockId === blockId) {
      setDragOverBlockId(null);
    }
  }

  function handleDrop(e, targetBlockId) {
    e.preventDefault();
    const taskId = draggedTaskId || e.dataTransfer.getData('text/plain');
    setDragOverBlockId(null);
    setDraggedTaskId(null);

    if (!taskId) return;

    // Remove taskId from any other block first
    const newAssignments = { ...blockAssignments };
    Object.keys(newAssignments).forEach(bId => {
      newAssignments[bId] = (newAssignments[bId] || []).filter(id => id !== taskId);
    });

    // If targetBlockId is provided (not unassigned pool), assign to block
    if (targetBlockId && targetBlockId !== 'unassigned') {
      newAssignments[targetBlockId] = [...(newAssignments[targetBlockId] || []), taskId];
    }

    setBlockAssignments(newAssignments);
  }

  function unassignTask(taskId) {
    const newAssignments = { ...blockAssignments };
    Object.keys(newAssignments).forEach(bId => {
      newAssignments[bId] = (newAssignments[bId] || []).filter(id => id !== taskId);
    });
    setBlockAssignments(newAssignments);
  }

  // --- Schedule Customization ---
  function handleSaveBlock(e) {
    e.preventDefault();
    if (!blockForm.label.trim()) return;

    if (editingBlock) {
      setSchedule(prev => prev.map(b => b.id === editingBlock.id ? { ...b, ...blockForm } : b));
    } else {
      const newBlock = {
        id: `sb_${Date.now()}`,
        ...blockForm,
      };
      // Insert in sorted time order
      const updated = [...schedule, newBlock].sort((a, b) => a.time.localeCompare(b.time));
      setSchedule(updated);
    }

    setShowBlockModal(false);
    setEditingBlock(null);
    setBlockForm({ time: '15:00', label: '', type: 'forge', color: '#ec4899' });
  }

  function handleDeleteBlock(id) {
    if (!confirm('Remove this time block?')) return;
    setSchedule(prev => prev.filter(b => b.id !== id));
    // Clear assignments for deleted block
    const newAssignments = { ...blockAssignments };
    delete newAssignments[id];
    setBlockAssignments(newAssignments);
  }

  function openEditBlock(block) {
    setEditingBlock(block);
    setBlockForm({
      time: block.time,
      label: block.label,
      type: block.type || 'forge',
      color: block.color || '#3b82f6',
    });
    setShowBlockModal(true);
  }

  function resetToDefaultSchedule() {
    if (!confirm('Reset schedule to default 06:00 - 22:00 template?')) return;
    setSchedule(DEFAULT_SCHEDULE);
    setBlockAssignments({});
  }

  // Compute assigned tasks map for fast lookup
  const assignedTaskIds = new Set(Object.values(blockAssignments).flat());
  const unassignedTasks = tasks.filter(t => !assignedTaskIds.has(t._id));

  // Determine current active block
  const currentHours = currentTime.getHours();
  const currentMins = currentTime.getMinutes();
  const currentTimeStr = `${String(currentHours).padStart(2, '0')}:${String(currentMins).padStart(2, '0')}`;

  const sortedSchedule = [...schedule].sort((a, b) => a.time.localeCompare(b.time));

  function isBlockCurrent(block, index) {
    const nextBlock = sortedSchedule[index + 1];
    if (!nextBlock) {
      return currentTimeStr >= block.time;
    }
    return currentTimeStr >= block.time && currentTimeStr < nextBlock.time;
  }

  return (
    <AppShell>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 24 }}>⚡</span>
            <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>Daily Focus & Timeblocker</h1>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            {currentTime.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} · Live Time: <strong style={{ color: 'var(--text)' }}>{currentTimeStr}</strong>
          </p>
        </div>

        {/* View toggles & Add custom block */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: 'var(--surface-2)', padding: 3, borderRadius: 8 }}>
            <button
              onClick={() => setViewMode('split')}
              style={{
                padding: '5px 12px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: viewMode === 'split' ? 'var(--text)' : 'transparent',
                color: viewMode === 'split' ? 'var(--bg)' : 'var(--text-secondary)',
              }}
            >
              Split View
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              style={{
                padding: '5px 12px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: viewMode === 'timeline' ? 'var(--text)' : 'transparent',
                color: viewMode === 'timeline' ? 'var(--bg)' : 'var(--text-secondary)',
              }}
            >
              Timeline Only
            </button>
            <button
              onClick={() => setViewMode('tasks')}
              style={{
                padding: '5px 12px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: viewMode === 'tasks' ? 'var(--text)' : 'transparent',
                color: viewMode === 'tasks' ? 'var(--bg)' : 'var(--text-secondary)',
              }}
            >
              Tasks Pool
            </button>
          </div>

          <button
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => setShowReminderCenter(true)}
          >
            <span>🔔</span> Reminders
          </button>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setEditingBlock(null);
              setBlockForm({ time: '15:00', label: '', type: 'forge', color: '#ec4899' });
              setShowBlockModal(true);
            }}
          >
            + Add Block
          </button>
        </div>
      </div>

      {/* Today's Meetings Banner */}
      {meetings.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>
            📅 Today&apos;s Scheduled Meetings
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 8 }}>
            {meetings.map(m => (
              <Link key={m._id} href={`/meetings/${m._id}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ padding: '10px 14px', borderLeft: '3px solid var(--blue)', background: 'var(--surface-2)' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{m.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    ⏰ {m.startTime}{m.endTime ? ` – ${m.endTime}` : ''} {m.location ? `· ${m.location}` : ''}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-state"><div className="spinner" /></div>
      ) : (
        /* Split View Layout */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: viewMode === 'split' ? 'minmax(300px, 1.1fr) minmax(320px, 1.4fr)' : '1fr',
            gap: 20,
            alignItems: 'start',
          }}
        >
          {/* LEFT PANEL: TASK POOL & MITs */}
          {(viewMode === 'split' || viewMode === 'tasks') && (
            <div
              onDragOver={e => handleDragOver(e, 'unassigned')}
              onDrop={e => handleDrop(e, 'unassigned')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                background: 'var(--surface)',
                borderRadius: 12,
                padding: 16,
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 800 }}>Tasks Backlog & Priorities</h2>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    Drag cards into the timeline slots on the right ➔
                  </p>
                </div>
                <Link href="/tasks?add=1">
                  <button className="btn btn-ghost btn-sm" style={{ fontSize: 12 }}>+ New Task</button>
                </Link>
              </div>

              {/* Unassigned Tasks Pool */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 200 }}>
                {unassignedTasks.length === 0 ? (
                  <div style={{ padding: 24, textAlign: 'center', border: '1.5px dashed var(--border)', borderRadius: 8, color: 'var(--text-muted)', fontSize: 13 }}>
                    All current tasks scheduled into timeblocks! 🎉<br />
                    <span style={{ fontSize: 11 }}>Drag assigned tasks back here to unschedule.</span>
                  </div>
                ) : (
                  unassignedTasks.map(task => {
                    const p = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.P1;
                    return (
                      <div
                        key={task._id}
                        draggable
                        onDragStart={e => handleDragStart(e, task._id)}
                        className="card"
                        style={{
                          padding: '12px 14px',
                          cursor: 'grab',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 6,
                          borderLeft: `3px solid ${p.color}`,
                          background: 'var(--surface-2)',
                          userSelect: 'none',
                          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <button
                              onClick={() => handleToggleTask(task._id, task.status)}
                              style={{
                                width: 18,
                                height: 18,
                                borderRadius: 4,
                                border: `1.5px solid ${p.color}`,
                                background: task.status === 'DONE' ? 'var(--green)' : 'transparent',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {task.status === 'DONE' && '✓'}
                            </button>
                            <span style={{ fontSize: 13, fontWeight: 600 }}>{task.name}</span>
                          </div>
                          <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: p.bg, color: p.color }}>
                            {p.text}
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', fontSize: 11, color: 'var(--text-muted)' }}>
                          {task.area && <span style={{ background: 'var(--surface-3)', padding: '1px 6px', borderRadius: 4 }}>{task.area}</span>}
                          {task.estimatedDuration && <span>⏱️ {task.estimatedDuration}m</span>}
                          {task.deadline && (
                            <span style={{ color: 'var(--orange)' }}>
                              📅 {new Date(task.deadline).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                          <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-muted)' }}>⋮⋮ drag</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* RIGHT PANEL: CUSTOMIZABLE 24H TIMELINE */}
          {(viewMode === 'split' || viewMode === 'timeline') && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                background: 'var(--surface)',
                borderRadius: 12,
                padding: 16,
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 800 }}>Customized Timeline</h2>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    Drop tasks directly into the targeted time slots below
                  </p>
                </div>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: 11, color: 'var(--text-muted)' }}
                  onClick={resetToDefaultSchedule}
                >
                  Reset Template
                </button>
              </div>

              {/* Timeline blocks */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {sortedSchedule.map((block, index) => {
                  const isCurrent = isBlockCurrent(block, index);
                  const isOver = dragOverBlockId === block.id;
                  const assignedIds = blockAssignments[block.id] || [];
                  const assignedTasksList = tasks.filter(t => assignedIds.includes(t._id));

                  return (
                    <div
                      key={block.id}
                      onDragOver={e => handleDragOver(e, block.id)}
                      onDragLeave={e => handleDragLeave(e, block.id)}
                      onDrop={e => handleDrop(e, block.id)}
                      style={{
                        position: 'relative',
                        padding: 12,
                        borderRadius: 10,
                        background: isOver
                          ? 'var(--surface-3)'
                          : isCurrent
                          ? 'var(--purple-bg)'
                          : 'var(--surface-2)',
                        border: isOver
                          ? '2px dashed var(--accent)'
                          : isCurrent
                          ? '1.5px solid var(--purple)'
                          : '1px solid var(--border-subtle)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {/* Block Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 800,
                              fontVariantNumeric: 'tabular-nums',
                              color: isCurrent ? 'var(--purple)' : 'var(--text)',
                              minWidth: 46,
                            }}
                          >
                            {block.time}
                          </span>
                          <div
                            style={{
                              width: 9,
                              height: 9,
                              borderRadius: '50%',
                              background: block.color || 'var(--blue)',
                            }}
                          />
                          <span style={{ fontSize: 14, fontWeight: isCurrent ? 800 : 600, color: 'var(--text)' }}>
                            {block.label}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {isCurrent && (
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 900,
                                background: 'var(--purple)',
                                color: '#fff',
                                padding: '2px 8px',
                                borderRadius: 10,
                                letterSpacing: '0.6px',
                              }}
                            >
                              NOW
                            </span>
                          )}
                          <button
                            onClick={() => openEditBlock(block)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}
                            title="Edit Block"
                          >
                            ✎
                          </button>
                          <button
                            onClick={() => handleDeleteBlock(block.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}
                            title="Delete Block"
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      {/* Drop Target & Assigned Tasks List */}
                      <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {assignedTasksList.length === 0 ? (
                          <div
                            style={{
                              fontSize: 12,
                              color: isOver ? 'var(--accent)' : 'var(--text-muted)',
                              padding: '6px 8px',
                              borderRadius: 6,
                              background: isOver ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                              border: isOver ? '1px dashed var(--accent)' : '1px dashed transparent',
                              textAlign: 'center',
                            }}
                          >
                            {isOver ? 'Drop task here to schedule' : '+ Drop tasks here'}
                          </div>
                        ) : (
                          assignedTasksList.map(task => {
                            const p = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.P1;
                            const isDone = task.status === 'DONE';

                            return (
                              <div
                                key={task._id}
                                draggable
                                onDragStart={e => handleDragStart(e, task._id)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '8px 10px',
                                  borderRadius: 6,
                                  background: 'var(--surface)',
                                  border: '1px solid var(--border)',
                                  gap: 8,
                                  cursor: 'grab',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                                  <button
                                    onClick={() => handleToggleTask(task._id, task.status)}
                                    style={{
                                      width: 18,
                                      height: 18,
                                      borderRadius: 4,
                                      border: isDone ? 'none' : `1.5px solid ${p.color}`,
                                      background: isDone ? 'var(--green)' : 'transparent',
                                      color: 'white',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: 10,
                                      fontWeight: 800,
                                    }}
                                  >
                                    {isDone && '✓'}
                                  </button>
                                  <span
                                    style={{
                                      fontSize: 13,
                                      fontWeight: 500,
                                      textDecoration: isDone ? 'line-through' : 'none',
                                      color: isDone ? 'var(--text-muted)' : 'var(--text)',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    {task.name}
                                  </span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                                  <span style={{ fontSize: 9, fontWeight: 800, padding: '1px 5px', borderRadius: 4, background: p.bg, color: p.color }}>
                                    {p.text}
                                  </span>
                                  <button
                                    onClick={() => unassignTask(task._id)}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: 'var(--text-muted)',
                                      cursor: 'pointer',
                                      fontSize: 12,
                                    }}
                                    title="Unschedule task"
                                  >
                                    ↩
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal: Add/Edit Custom Block */}
      {showBlockModal && (
        <div className="modal-backdrop" onClick={() => setShowBlockModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}>{editingBlock ? 'Edit Time Block' : 'Add Time Block'}</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowBlockModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveBlock} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 10 }}>
                <div>
                  <label className="label">Time (24h) *</label>
                  <input
                    type="time"
                    className="input"
                    required
                    value={blockForm.time}
                    onChange={e => setBlockForm({ ...blockForm, time: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Block Label *</label>
                  <input
                    className="input"
                    required
                    placeholder="e.g. Deep ML Coding / Customer Calls"
                    value={blockForm.label}
                    onChange={e => setBlockForm({ ...blockForm, label: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label className="label">Category</label>
                  <select
                    className="input select"
                    value={blockForm.type}
                    onChange={e => setBlockForm({ ...blockForm, type: e.target.value })}
                  >
                    <option value="gate">GATE Study</option>
                    <option value="forge">Forge / Startup</option>
                    <option value="college">College / Classes</option>
                    <option value="health">Gym / Fitness</option>
                    <option value="habit">Habit / Routine</option>
                    <option value="review">Review / Reflection</option>
                    <option value="break">Break / Lunch</option>
                    <option value="personal">Personal / Reading</option>
                  </select>
                </div>

                <div>
                  <label className="label">Color Accent</label>
                  <select
                    className="input select"
                    value={blockForm.color}
                    onChange={e => setBlockForm({ ...blockForm, color: e.target.value })}
                  >
                    <option value="#3b82f6">🔵 Blue (GATE / Study)</option>
                    <option value="#ec4899">🟣 Pink / Magenta (Forge / Startup)</option>
                    <option value="#10b981">🟢 Green (Fitness / Health)</option>
                    <option value="#f59e0b">🟡 Amber (College / Classes)</option>
                    <option value="#8b5cf6">🪻 Purple (Habits)</option>
                    <option value="#ef4444">🔴 Red (Review / Critical)</option>
                    <option value="#6b7280">⚪ Neutral (Break)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowBlockModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Block</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reminder Center Modal */}
      <ReminderCenter
        isOpen={showReminderCenter}
        onClose={() => setShowReminderCenter(false)}
        schedule={schedule}
        tasks={tasks}
        blockAssignments={blockAssignments}
        meetings={meetings}
      />
    </AppShell>
  );
}
