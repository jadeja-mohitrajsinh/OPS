'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

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
    plus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    search: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    x: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    more: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>,
    check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg>,
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
  { href: '/', label: 'Home', icon: 'home' },
  { href: '/today', label: 'Today', icon: 'today' },
  { href: '/calendar', label: 'Calendar', icon: 'calendar' },
  { href: '/tasks', label: 'Tasks', icon: 'tasks' },
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
    task: '/tasks', meeting: '/meetings', person: '/people', project: '/projects',
    note: '/learning', decision: '/reviews', gate: '/gate', college: '/college', forge: '/forge', book: '/books',
  };

  const handleResult = (item) => {
    setOpen(false); setQ('');
    router.push(TYPE_ROUTES[item._type] || '/');
  };

  return (
    <div className="search-bar" ref={ref} style={{ marginBottom: 0 }}>
      <span className="search-icon"><Icon name="search" size={16} /></span>
      <input
        className="input search-input"
        placeholder="Search everything..."
        value={q}
        onChange={e => setQ(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        style={{ fontSize: 13, padding: '8px 12px 8px 36px' }}
      />
      {open && results.length > 0 && (
        <div className="search-results">
          {results.map((item, i) => (
            <div key={i} className="search-result-item" onClick={() => handleResult(item)}>
              <span className="search-result-type">{item._type}</span>
              <span className="search-result-name">{item.name || item.title || item.decision || item.problem}</span>
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

  const isActive = (href) => href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <div className="app-shell">
      {/* ── Side Nav (desktop) ── */}
      <nav className="side-nav">
        <div className="side-nav-header">
          <div className="side-nav-logo">OPS</div>
          <div className="side-nav-sub">Personal Operating System</div>
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
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>GATE in ~134 days</span>
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
        <Link href="/tasks" className={`nav-item ${isActive('/gate') || isActive('/college') || isActive('/forge') || isActive('/people') || isActive('/meetings') ? 'active' : ''}`} onClick={(e) => {
          // Open a simple more menu on mobile
        }}>
          <Icon name="more" size={22} />
          More
        </Link>
      </nav>
    </div>
  );
}
