import Link from 'next/link';

export const metadata = {
  title: 'OPS — Private task management with Google',
  description: 'OPS is a personal task manager that syncs a primary Google Tasks account and optionally connects Gmail inbox metadata with separate consent.',
};

const featureStyle = { padding: 20, border: '1px solid var(--border)', borderRadius: 16, background: 'var(--surface)' };

export default function AboutPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text-primary)' }}>
      <nav style={{ maxWidth: 1120, margin: '0 auto', padding: '22px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong style={{ fontSize: 18, letterSpacing: '-0.03em' }}>OPS</strong>
        <Link href="/login" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>Sign in with Google</Link>
      </nav>
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '78px 24px 54px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', padding: '6px 11px', borderRadius: 99, background: 'var(--accent-bg)', color: 'var(--purple)', fontSize: 12, fontWeight: 850, letterSpacing: '.06em' }}>PERSONAL OPERATING SYSTEM</div>
        <h1 style={{ fontSize: 'clamp(38px, 7vw, 68px)', lineHeight: 1.04, letterSpacing: '-0.055em', margin: '22px 0 18px' }}>One task workspace.<br />Your inboxes, on your terms.</h1>
        <p style={{ maxWidth: 650, margin: '0 auto', color: 'var(--text-secondary)', fontSize: 18, lineHeight: 1.65 }}>OPS is a personal task-management application. It lets you manage tasks in one primary Google Tasks account and, only when you choose, connect Gmail inboxes as separate email sources.</p>
        <div style={{ marginTop: 28, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}><Link href="/login" className="btn btn-primary" style={{ textDecoration: 'none' }}>Get started with Google</Link><Link href="/privacy" className="btn btn-secondary" style={{ textDecoration: 'none' }}>Read our privacy policy</Link></div>
      </section>
      <section style={{ maxWidth: 1040, margin: '0 auto', padding: '0 24px 72px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(245px, 1fr))', gap: 14 }}>
        <article style={featureStyle}><div style={{ fontSize: 26 }}>✓</div><h2 style={{ fontSize: 17, margin: '12px 0 7px' }}>Primary Google Tasks account</h2><p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.65 }}>The account you use to sign in owns your OPS task workspace. Task reads and writes use that account&apos;s Google Tasks permission only.</p></article>
        <article style={featureStyle}><div style={{ fontSize: 26 }}>✉</div><h2 style={{ fontSize: 17, margin: '12px 0 7px' }}>Optional Gmail connections</h2><p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.65 }}>Each Gmail inbox is added through a separate Google consent flow. An inbox can be paused or disconnected without affecting your task workspace.</p></article>
        <article style={featureStyle}><div style={{ fontSize: 26 }}>⌁</div><h2 style={{ fontSize: 17, margin: '12px 0 7px' }}>Purpose-limited data use</h2><p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.65 }}>OPS uses authorized Google data only to provide task synchronization and the inbox features you explicitly enable. It does not sell or use Google data for advertising.</p></article>
      </section>
      <section style={{ borderTop: '1px solid var(--border)', maxWidth: 1040, margin: '0 auto', padding: '28px 24px 42px', display: 'flex', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap', color: 'var(--text-secondary)', fontSize: 13 }}>
        <span>OPS is operated at ops.mohitrajsinh.me.</span>
        <span style={{ display: 'flex', gap: 16 }}><Link href="/privacy" style={{ color: 'inherit' }}>Privacy Policy</Link><Link href="/terms" style={{ color: 'inherit' }}>Terms of Service</Link></span>
      </section>
    </main>
  );
}
