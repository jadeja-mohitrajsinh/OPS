'use client';
import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import Link from 'next/link';

const PRIORITY_LABELS = { P0: { text: 'P0', cls: 'badge-p0' }, P1: { text: 'P1', cls: 'badge-p1' }, P2: { text: 'P2', cls: 'badge-p2' }, P3: { text: 'P3', cls: 'badge-p3' } };

function daysLeft(d) {
  if (!d) return null;
  const diff = Math.ceil((new Date(d) - new Date()) / 86400000);
  if (diff < 0) return 'Overdue';
  if (diff === 0) return 'Due today';
  if (diff === 1) return 'Due tomorrow';
  return `${diff}d left`;
}

function PriorityBadge({ priority }) {
  const cfg = PRIORITY_LABELS[priority] || PRIORITY_LABELS.P3;
  return <span className={`badge ${cfg.cls}`}>{cfg.text}</span>;
}

function MITCard({ task, rank, onComplete }) {
  const dl = daysLeft(task.deadline);
  const isOverdue = dl === 'Overdue';
  const isToday = dl === 'Due today';
  return (
    <div className="card" style={{ borderLeft: `3px solid ${rank === 1 ? 'var(--accent)' : 'var(--border)'}`, padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <button
          onClick={() => onComplete(task._id)}
          style={{
            width: 22, height: 22, borderRadius: 6, border: '1.5px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, marginTop: 1, background: 'var(--surface-2)', cursor: 'pointer',
            transition: 'all 0.15s'
          }}
          title="Mark done"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg>
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}>{task.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
            <PriorityBadge priority={task.priority} />
            {task.area && <span className="tag">{task.area}</span>}
            {dl && (
              <span style={{ fontSize: 11, fontWeight: 600, color: isOverdue ? 'var(--red)' : isToday ? 'var(--orange)' : 'var(--text-muted)' }}>
                {isOverdue ? '🔴 ' : isToday ? '🟠 ' : ''}{dl}
              </span>
            )}
          </div>
        </div>
        <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--border)', marginLeft: 4, flexShrink: 0 }}>#{rank}</span>
      </div>
    </div>
  );
}

function MeetingCard({ meeting }) {
  const date = new Date(meeting.date);
  const isToday = date.toDateString() === new Date().toDateString();
  return (
    <Link href={`/meetings/${meeting._id}`}>
      <div className="card card-hover" style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--surface-2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{date.toLocaleString('default', { month: 'short' })}</div>
            <div style={{ fontSize: 16, fontWeight: 800, lineHeight: 1 }}>{date.getDate()}</div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{meeting.title}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              {meeting.startTime}{meeting.endTime ? ` – ${meeting.endTime}` : ''} {isToday ? '· Today' : ''}
              {meeting.people?.length > 0 ? ` · ${meeting.people.join(', ')}` : ''}
            </div>
          </div>
          {isToday && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--orange)', flexShrink: 0 }} />}
        </div>
      </div>
    </Link>
  );
}

function WaitingItem({ item }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', minWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.personName}</span>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><polyline points="9,18 15,12 9,6"/></svg>
      <span style={{ fontSize: 13, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.description}</span>
    </div>
  );
}

function DeadlineRow({ task }) {
  const dl = daysLeft(task.deadline);
  const isOverdue = dl === 'Overdue';
  const isToday = dl === 'Due today';
  const isSoon = task.deadline && Math.ceil((new Date(task.deadline) - new Date()) / 86400000) <= 3;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <span style={{ fontSize: 13, color: isOverdue || isToday ? 'var(--red)' : isSoon ? 'var(--orange)' : 'var(--yellow)' }}>
        {isOverdue ? '🔴' : isToday || isSoon ? '🟠' : '🟡'}
      </span>
      <span style={{ flex: 1, fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.name}</span>
      <span style={{ fontSize: 11, fontWeight: 600, color: isOverdue ? 'var(--red)' : isSoon ? 'var(--orange)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>{dl}</span>
      <PriorityBadge priority={task.priority} />
    </div>
  );
}

export default function HomePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // GATE countdown
  const gateDate = new Date('2027-02-01');
  const gateDays = Math.ceil((gateDate - now) / 86400000);

  async function loadDashboard() {
    try {
      const res = await fetch('/api/dashboard');
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { loadDashboard(); }, []);

  async function handleComplete(id) {
    await fetch(`/api/tasks/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'DONE' }) });
    loadDashboard();
  }

  // Seed on first load
  useEffect(() => {
    fetch('/api/seed', { method: 'POST' }).catch(() => {});
  }, []);

  const stats = data?.stats || {};
  const mits = data?.mits || [];
  const overdueTasks = data?.overdueTasks || [];
  const upcomingDeadlines = data?.upcomingDeadlines || [];
  const upcomingMeetings = data?.upcomingMeetings || [];
  const waitingFor = data?.waitingFor || [];
  const blockedTasks = data?.blockedTasks || [];

  return (
    <AppShell overdueBadge={stats.overdue || 0}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 4 }}>{dateStr}</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.1 }}>Good afternoon, Mohit.</h1>
        <div style={{ marginTop: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
          GATE 2027 in <strong style={{ color: gateDays < 90 ? 'var(--orange)' : 'var(--text)' }}>{gateDays} days</strong>
          {stats.completedToday > 0 && ` · ${stats.completedToday} done today`}
          {stats.overdue > 0 && <span style={{ color: 'var(--red)' }}> · {stats.overdue} overdue</span>}
        </div>
      </div>

      {loading ? (
        <div className="loading-state"><div className="spinner" /></div>
      ) : (
        <>
          {/* Stats Row */}
          <div className="stats-row">
            <div className="stat-card"><div className="stat-value">{stats.totalActive || 0}</div><div className="stat-label">Active</div></div>
            <div className="stat-card"><div className="stat-value" style={{ color: 'var(--green)' }}>{stats.completedToday || 0}</div><div className="stat-label">Done Today</div></div>
            <div className="stat-card"><div className="stat-value" style={{ color: stats.overdue > 0 ? 'var(--red)' : 'var(--text)' }}>{stats.overdue || 0}</div><div className="stat-label">Overdue</div></div>
            <div className="stat-card"><div className="stat-value" style={{ color: stats.blocked > 0 ? 'var(--orange)' : 'var(--text)' }}>{stats.blocked || 0}</div><div className="stat-label">Blocked</div></div>
          </div>

          {/* MITs */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <div className="section-label">🔴 Most Important Tasks</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>These 3 things matter today</div>
              </div>
              <Link href="/tasks?add=1" className="btn btn-secondary btn-sm">+ Add</Link>
            </div>
            {mits.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '28px 16px', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>✓</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>No tasks yet</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>Add your first task to get started</div>
                <Link href="/tasks?add=1"><button className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>Add Task</button></Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {mits.map((t, i) => <MITCard key={t._id} task={t} rank={i + 1} onComplete={handleComplete} />)}
              </div>
            )}
          </div>

          {/* Overdue */}
          {overdueTasks.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div className="section-label" style={{ color: 'var(--red)' }}>🔴 Overdue</div>
              <div className="card" style={{ padding: '4px 16px' }}>
                {overdueTasks.slice(0, 5).map(t => <DeadlineRow key={t._id} task={t} />)}
              </div>
            </div>
          )}

          {/* Next Meeting */}
          {upcomingMeetings.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div className="section-label">📅 Upcoming Meetings</div>
                <Link href="/meetings" className="btn btn-ghost btn-sm">View all</Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {upcomingMeetings.slice(0, 3).map(m => <MeetingCard key={m._id} meeting={m} />)}
              </div>
            </div>
          )}

          {/* Upcoming Deadlines */}
          {upcomingDeadlines.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div className="section-label">⚡ Upcoming Deadlines</div>
                <Link href="/tasks" className="btn btn-ghost btn-sm">View all</Link>
              </div>
              <div className="card" style={{ padding: '4px 16px' }}>
                {upcomingDeadlines.slice(0, 5).map(t => <DeadlineRow key={t._id} task={t} />)}
              </div>
            </div>
          )}

          {/* Waiting For */}
          {waitingFor.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div className="section-label">⏳ Waiting For</div>
                <Link href="/people" className="btn btn-ghost btn-sm">View all</Link>
              </div>
              <div className="card" style={{ padding: '4px 16px' }}>
                {waitingFor.slice(0, 5).map((w, i) => <WaitingItem key={i} item={w} />)}
              </div>
            </div>
          )}

          {/* Blocked */}
          {blockedTasks.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div className="section-label" style={{ color: 'var(--orange)' }}>🚧 Blocked</div>
              <div className="card" style={{ padding: '4px 16px' }}>
                {blockedTasks.slice(0, 3).map(t => (
                  <div key={t._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: 13, flex: 1, fontWeight: 500 }}>{t.name}</span>
                    {t.blockedReason && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.blockedReason}</span>}
                    <PriorityBadge priority={t.priority} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Nav */}
          <div style={{ marginBottom: 28 }}>
            <div className="section-label">Quick Access</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {[
                { href: '/gate', label: 'GATE 2027', sub: `${gateDays}d left`, bg: '#f5f3ff', color: '#6d28d9' },
                { href: '/college', label: 'College', sub: 'Mid 2 upcoming', bg: '#eff6ff', color: '#1a5fbe' },
                { href: '/forge', label: 'Forge', sub: 'Startup OS', bg: '#fff7ed', color: '#e8660a' },
                { href: '/meetings', label: 'Meetings', sub: `${upcomingMeetings.length} upcoming`, bg: '#f0fdf4', color: '#1a7a3e' },
                { href: '/people', label: 'People', sub: 'CRM', bg: '#fefce8', color: '#c9920a' },
                { href: '/reviews', label: 'Review', sub: 'Weekly CEO', bg: '#fef2f2', color: '#d93025' },
              ].map(item => (
                <Link key={item.href} href={item.href}>
                  <div className="card" style={{ background: item.bg, border: 'none', padding: '12px 12px', textAlign: 'center', cursor: 'pointer' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: item.color }}>{item.label}</div>
                    <div style={{ fontSize: 10, color: item.color, opacity: 0.7, marginTop: 2 }}>{item.sub}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}
