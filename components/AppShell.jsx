'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import ReminderCenter from '@/components/ReminderCenter';
import Logo from '@/components/Logo';

// ── Icons ───────────────────────────────────────────────────────────
function Icon({ name, size = 20 }) {
  const icons = {
    home: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>,
    today: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    calendar: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    tasks: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
    meetings: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
    people: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    projects: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="6" height="18" rx="1"/><rect x="9" y="3" width="6" height="12" rx="1"/><rect x="16" y="3" width="6" height="8" rx="1"/></svg>,
    gate: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
    college: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>,
    forge: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/></svg>,
    learning: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>,
    books: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
    life: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
    reviews: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg>,
    gsoc: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
    plus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    search: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    x: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    more: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>,
    check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg>,
    bell: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    sun: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
    moon: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  };
  return icons[name] || null;
}

// ── Nav Config ───────────────────────────────────────────────────────
const NAV_SECTIONS = [
  {
    label: 'Dashboard',
    items: [
      { href: '/', label: 'Home', icon: 'home' },
      { href: '/today', label: 'Today', icon: 'today' },
      { href: '/calendar', label: 'Calendar', icon: 'calendar' },
    ]
  },
  {
    label: 'Work',
    items: [
      { href: '/tasks', label: 'Tasks', icon: 'tasks' },
      { href: '/meetings', label: 'Meetings', icon: 'meetings' },
      { href: '/people', label: 'People', icon: 'people' },
      { href: '/projects', label: 'Projects', icon: 'projects' },
    ]
  },
  {
    label: 'GSoC 2027',
    items: [
      { href: '/gsoc', label: 'GSoC Tracker', icon: 'gsoc' },
    ]
  },
  {
    label: 'Academic',
    items: [
      { href: '/gate', label: 'GATE 2027', icon: 'gate' },
      { href: '/college', label: 'College', icon: 'college' },
    ]
  },
  {
    label: 'Startup',
    items: [
      { href: '/forge', label: 'Forge', icon: 'forge' },
    ]
  },
  {
    label: 'Growth',
    items: [
      { href: '/learning', label: 'Learning', icon: 'learning' },
      { href: '/books', label: 'Books', icon: 'books' },
      { href: '/life', label: 'Life', icon: 'life' },
      { href: '/reviews', label: 'Reviews', icon: 'reviews' },
    ]
  },
];

const BOTTOM_NAV = [
  { href: '/today', label: 'Today', icon: 'today' },
  { href: '/tasks', label: 'Tasks', icon: 'tasks' },
  { href: '/projects', label: 'Projects', icon: 'projects' },
];

const QUICK_ACTIONS = [
  { label: 'Task', icon: '✓', color: '#f2f2ef', href: '/tasks?add=1' },
  { label: 'Meeting', icon: '👥', color: '#eff6ff', href: '/meetings?add=1' },
  { label: 'Note', icon: '📝', color: '#f0fdf4', href: '/learning?add=note' },
  { label: 'Person', icon: '👤', color: '#f5f3ff', href: '/people?add=1' },
  { label: 'Deadline', icon: '🔴', color: '#fef2f2', href: '/tasks?add=deadline' },
  { label: 'Decision', icon: '⚡', color: '#fff7ed', href: '/reviews?add=decision' },
  { label: 'Follow-up', icon: '↩', color: '#fefce8', href: '/people?add=followup' },
];

// ── Global Search ───────────────────────────────────────────────────
function GlobalSearch() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const ref = useRef(null);

  useEffect(() => {
    if (q.length < 2) { setResults([]); setOpen(false); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        if (data.success) { setResults(data.data); setOpen(true); }
      } catch {}
    }, 300);
    return () => clearTimeout(timer);
  }, [q]);

  useEffect(() => {
    function handleClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const TYPE_ROUTES = {
    task: '/tasks',
    person: '/people',
    meeting: '/meetings',
    gate_topic: '/gate',
    college_subject: '/college',
    project: '/projects',
    book: '/books',
    learning_note: '/learning',
    habit: '/life',
    weekly_review: '/reviews',
    gsoc_skill: '/gsoc/skills',
    gsoc_project: '/gsoc/projects',
    gsoc_organization: '/gsoc/organizations',
    gsoc_contribution: '/gsoc/contributions',
    gsoc_experiment: '/gsoc/experiments',
    gsoc_proposal: '/gsoc/proposals',
  };

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-md)',
        padding: '6px 10px',
      }}>
        <Icon name="search" size={15} />
        <input
          type="text"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search everything... (Ctrl+K)"
          style={{
            border: 'none',
            background: 'transparent',
            fontSize: 13,
            width: '100%',
            color: 'var(--text)',
          }}
        />
        {q && (
          <button onClick={() => { setQ(''); setOpen(false); }} style={{ color: 'var(--text-muted)' }}>
            <Icon name="x" size={13} />
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-md)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 100,
          maxHeight: 320,
          overflowY: 'auto',
        }}>
          {results.map(r => (
            <div
              key={`${r.type}-${r._id}`}
              onClick={() => {
                const route = TYPE_ROUTES[r.type] || '/';
                router.push(route);
                setOpen(false);
                setQ('');
              }}
              style={{
                padding: '8px 12px',
                borderBottom: '1px solid var(--border-subtle)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              className="search-item"
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>
                  {r.title || r.name || r.topic}
                </div>
                {r.preview && (
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    {r.preview.slice(0, 60)}
                  </div>
                )}
              </div>
              <span style={{
                fontSize: 10,
                color: 'var(--text-muted)',
                background: 'var(--surface-2)',
                padding: '2px 6px',
                borderRadius: 'var(--r-sm)',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}>
                {r.type}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Shell ───────────────────────────────────────────────────────────
export default function AppShell({ children, overdueBadge = 0 }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [showReminders, setShowReminders] = useState(false);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const saved = localStorage.getItem('ops_theme') || 'dark';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  // Sync theme on every route change to prevent theme loss during navigation
  useEffect(() => {
    const saved = localStorage.getItem('ops_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
  }, [pathname]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('ops_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const isActive = (href) => href === '/' ? pathname === '/' : pathname.startsWith(href);

  const MORE_ITEMS = [
    { href: '/', label: 'Home', icon: 'home', emoji: '🏠' },
    { href: '/calendar', label: 'Calendar', icon: 'calendar', emoji: '📅' },
    { href: '/meetings', label: 'Meetings', icon: 'meetings', emoji: '👥' },
    { href: '/people', label: 'People', icon: 'people', emoji: '👤' },
    { href: '/gsoc', label: 'GSoC Tracker', icon: 'gsoc', emoji: '🎯' },
    { href: '/forge', label: 'Forge', icon: 'forge', emoji: '⚡' },
    { href: '/gate', label: 'GATE 2027', icon: 'gate', emoji: '🎓' },
    { href: '/college', label: 'College', icon: 'college', emoji: '🏫' },
    { href: '/learning', label: 'Learning', icon: 'learning', emoji: '📖' },
    { href: '/books', label: 'Books', icon: 'books', emoji: '📚' },
    { href: '/life', label: 'Life', icon: 'life', emoji: '❤️' },
    { href: '/reviews', label: 'Reviews', icon: 'reviews', emoji: '📋' },
  ];

  return (
    <div className="app-shell">
      {/* ── Side Nav (desktop) ── */}
      <nav className="side-nav">
        <div className="side-nav-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Logo size="md" />
            </Link>
            <button
              onClick={toggleTheme}
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                width: 30,
                height: 30,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text)',
                cursor: 'pointer',
              }}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={15} />
            </button>
          </div>
          <div style={{ marginTop: 12 }}>
            <GlobalSearch />
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {NAV_SECTIONS.map(section => (
            <div key={section.label} className="side-nav-section">
              <div className="side-nav-section-label">{section.label}</div>
              {section.items.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`side-nav-item ${isActive(item.href) ? 'active' : ''}`}
                >
                  <Icon name={item.icon} size={16} />
                  {item.label}
                  {item.label === 'Tasks' && overdueBadge > 0 && (
                    <span className="nav-badge">{overdueBadge}</span>
                  )}
                </Link>
              ))}
            </div>
          ))}
        </div>

        {/* Desktop Add Button */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={() => setMenuOpen(o => !o)}
            style={{
              width: '100%',
              background: 'var(--purple)',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '12px',
              fontSize: 14,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Icon name="plus" size={18} />
            Quick Add
          </button>
        </div>
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={() => setShowReminders(true)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--purple)',
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
            title="Open Reminder Center"
          >
            <Icon name="bell" size={14} /> Alerts
          </button>
          <button
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' });
              router.push('/login');
              router.refresh();
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: 11,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
            title="Lock / Logout"
          >
            🔒 Lock
          </button>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <main className="main-content">
        {children}
      </main>

      {/* ── FAB ── */}
      <button className="fab" onClick={() => setMenuOpen(o => !o)} aria-label="Add">
        <span style={{ transform: menuOpen ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s', display: 'block', lineHeight: 1 }}>
          <Icon name="plus" size={24} />
        </span>
      </button>

      {/* ── Quick Menu ── */}
      {menuOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 50 }} onClick={() => setMenuOpen(false)} />
          <div className="quick-menu">
            {QUICK_ACTIONS.map(action => (
              <Link
                key={action.label}
                href={action.href}
                className="quick-menu-item"
                onClick={() => setMenuOpen(false)}
              >
                <span className="quick-menu-icon" style={{ background: action.color }}>{action.icon}</span>
                {action.label}
              </Link>
            ))}
          </div>
        </>
      )}

      {/* ── Bottom Nav (mobile) ── */}
      <nav className="bottom-nav">
        {BOTTOM_NAV.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
          >
            <Icon name={item.icon} size={22} />
            {item.label}
          </Link>
        ))}
        <button
          className={`nav-item ${MORE_ITEMS.some(i => isActive(i.href)) ? 'active' : ''}`}
          onClick={() => setMoreMenuOpen(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', font: 'inherit' }}
        >
          <Icon name="more" size={22} />
          More
        </button>
      </nav>

      {/* ── More Menu Overlay (mobile) ── */}
      {moreMenuOpen && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            onClick={() => setMoreMenuOpen(false)}
          />
          <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 201,
            background: 'var(--surface)',
            borderRadius: '20px 20px 0 0',
            padding: '20px 16px calc(32px + env(safe-area-inset-bottom, 0px))',
            boxShadow: '0 -8px 40px rgba(0,0,0,0.3)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>More & Preferences</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={toggleTheme}
                  style={{
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    borderRadius: 20,
                    padding: '6px 12px',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    color: 'var(--text)',
                  }}
                >
                  <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={14} />
                  <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
                </button>
                <button
                  onClick={() => setMoreMenuOpen(false)}
                  style={{ background: 'var(--surface-2)', border: 'none', borderRadius: 20, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)' }}
                >
                  ✕
                </button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {MORE_ITEMS.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreMenuOpen(false)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    padding: '12px 8px',
                    borderRadius: 12,
                    background: isActive(item.href) ? 'var(--accent-bg)' : 'var(--surface-2)',
                    textDecoration: 'none',
                    color: isActive(item.href) ? 'var(--purple)' : 'var(--text)',
                    border: isActive(item.href) ? '1px solid var(--purple)' : '1px solid transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ fontSize: 22 }}>{item.emoji}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, textAlign: 'center', lineHeight: 1.2 }}>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── Global Reminder Center Modal ── */}
      <ReminderCenter isOpen={showReminders} onClose={() => setShowReminders(false)} />
    </div>
  );
}
