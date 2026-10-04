import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service | OPS',
  description: 'Terms of Service for OPS.',
};

const sectionStyle = { marginTop: 28 };

export default function TermsPage() {
  return (
    <main style={{ maxWidth: 820, margin: '0 auto', padding: '56px 24px 80px', color: 'var(--text-primary)', lineHeight: 1.7 }}>
      <Link href="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: 14 }}>← Back to OPS</Link>
      <h1 style={{ fontSize: 36, margin: '24px 0 8px' }}>Terms of Service</h1>
      <p style={{ color: 'var(--text-secondary)' }}>Effective date: October 4, 2026</p>
      <p>These Terms govern your use of OPS at <strong>ops.mohitrajsinh.me</strong>. By using OPS, you agree to these Terms and the <Link href="/privacy" style={{ color: 'var(--accent)' }}>Privacy Policy</Link>.</p>

      <section style={sectionStyle}>
        <h2>Service</h2>
        <p>OPS provides personal organization features, including task management and optional Google account integrations. You remain responsible for the information you add, the Google accounts you connect, and the actions you take through the service.</p>
      </section>

      <section style={sectionStyle}>
        <h2>Google integrations</h2>
        <p>Google access is optional and requires your explicit authorization. Your primary account is used for the OPS task workspace. Each connected Gmail account requires separate consent and may be disconnected independently. Your use of Google services remains subject to Google&apos;s applicable terms and policies.</p>
      </section>

      <section style={sectionStyle}>
        <h2>Acceptable use</h2>
        <p>Do not use OPS to violate law, infringe rights, bypass account security, access another person&apos;s data without authorization, interfere with the service, or attempt to reverse engineer, abuse, or overload its systems.</p>
      </section>

      <section style={sectionStyle}>
        <h2>Availability and changes</h2>
        <p>OPS may change, suspend, or discontinue features as the service evolves. We aim to operate it reliably, but do not guarantee uninterrupted or error-free availability. Keep independent copies of information that is important to you.</p>
      </section>

      <section style={sectionStyle}>
        <h2>Disclaimer and liability</h2>
        <p>OPS is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis to the extent permitted by law. It is not a substitute for professional, legal, financial, medical, or safety advice. To the extent permitted by law, the operator is not liable for indirect, incidental, special, consequential, or punitive damages arising from use of the service.</p>
      </section>

      <section style={sectionStyle}>
        <h2>Termination and contact</h2>
        <p>You may stop using OPS and revoke Google access at any time. We may suspend access for a breach of these Terms or to protect the service and its users. Questions about these Terms can be sent through <a href="https://mohitrajsinh.me" style={{ color: 'var(--accent)' }}>mohitrajsinh.me</a>.</p>
      </section>
    </main>
  );
}
