import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | OPS',
  description: 'Privacy Policy for OPS.',
};

const sectionStyle = { marginTop: 28 };

export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 820, margin: '0 auto', padding: '56px 24px 80px', color: 'var(--text-primary)', lineHeight: 1.7 }}>
      <Link href="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: 14 }}>← Back to OPS</Link>
      <h1 style={{ fontSize: 36, margin: '24px 0 8px' }}>Privacy Policy</h1>
      <p style={{ color: 'var(--text-secondary)' }}>Effective date: October 4, 2026 · Applies to OPS at ops.mohitrajsinh.me</p>
      <p>OPS is a personal task-management service operated through <strong>ops.mohitrajsinh.me</strong>. This policy explains how OPS collects, uses, stores, shares, and deletes information when you sign in with Google or connect a Gmail inbox.</p>

      <section style={sectionStyle}>
        <h2>Information OPS processes</h2>
        <ul>
          <li><strong>Primary account identity (`openid`, `email`, and `profile`):</strong> your Google account subject identifier, email address, and profile name used to create and secure your OPS account.</li>
          <li><strong>Connected Gmail metadata (`https://www.googleapis.com/auth/gmail.metadata`):</strong> only when you explicitly add an inbox, message and thread identifiers, sender display value, subject, snippet, labels, received time, and importance/unread state. OPS does not request, store, or use Gmail attachments or full message bodies by default.</li>
          <li><strong>App data:</strong> tasks, preferences, task-to-email links, notification history, and security/audit events needed to operate the service.</li>
          <li><strong>Credentials:</strong> OAuth access and refresh tokens are stored encrypted and are used only to provide the Google integrations you authorize.</li>
        </ul>
      </section>

      <section style={sectionStyle}>
        <h2>How OPS uses Google user data</h2>
        <p>OPS uses Google user data solely to provide visible user-facing features: signing you in, showing approved connected-inbox metadata, and converting an email you select into a task. A connected Gmail account is separately authorized and can be disconnected independently.</p>
        <p>OPS does not sell Google user data, use it for advertising, build advertising profiles, determine creditworthiness, or train general or non-personalized AI/ML models. OPS does not allow people to read Google user data except when you choose to view it in OPS, when required to investigate a security incident or support issue with your approval, or when required by law.</p>
      </section>

      <section style={sectionStyle}>
        <h2>Sharing and service providers</h2>
        <p>OPS exchanges data with Google APIs only to deliver the functions you approve. Data may be processed by the hosting, database, and security providers used to operate OPS, solely to provide or secure OPS under their service agreements. OPS does not share, sell, rent, or transfer Google user data to other third parties for their independent use.</p>
      </section>

      <section style={sectionStyle}>
        <h2>Security and retention</h2>
        <p>OPS uses HTTPS in transit, encrypted OAuth credentials at rest, signed application sessions, account-scoped data access, and least-privilege OAuth scopes. OAuth credentials are retained only while their connection remains active. Account and task data are retained while you use OPS or until you request deletion, subject to legitimate security and legal obligations. You can disconnect a Gmail account at any time; its authorization and stored inbox metadata are deleted.</p>
      </section>

      <section style={sectionStyle}>
        <h2>Your choices</h2>
        <p>You may decline Gmail access and still use task management. You may revoke OPS access from your Google Account security settings, disconnect an inbox in OPS, or request access to or deletion of your OPS data. If Google access is revoked, the corresponding connection will stop synchronizing.</p>
      </section>

      <section style={sectionStyle}>
        <h2>Changes and contact</h2>
        <p>We may update this policy when OPS changes. Material changes will be reflected by updating the effective date and, where required, requesting renewed consent. For privacy requests or questions, contact the operator through <a href="https://mohitrajsinh.me" style={{ color: 'var(--accent)' }}>mohitrajsinh.me</a>.</p>
      </section>

      <section style={sectionStyle}>
        <h2>Google API Services User Data Policy</h2>
        <p>OPS&apos;s use and transfer of information received from Google APIs adheres to the <a href="https://developers.google.com/terms/api-services-user-data-policy" style={{ color: 'var(--accent)' }}>Google API Services User Data Policy</a>, including its Limited Use requirements.</p>
      </section>

      <p style={{ marginTop: 36, fontSize: 13, color: 'var(--text-muted)' }}>This policy applies to OPS and does not replace the privacy policies of Google or other third-party services.</p>
    </main>
  );
}
