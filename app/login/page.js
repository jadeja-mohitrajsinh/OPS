'use client';
import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import Logo from '@/components/Logo';
import { NativeGoogleSignIn } from '@/lib/native-google-sign-in';
import { refreshTasksWidget } from '@/lib/tasks-widget';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [nativeSigningIn, setNativeSigningIn] = useState(false);
  const isAndroidApp = Capacitor.getPlatform() === 'android';

  useEffect(() => {
    setError(new URLSearchParams(window.location.search).get('error') || '');
  }, []);

  async function continueWithNativeGoogle() {
    setNativeSigningIn(true);
    setError('');
    try {
      const configResponse = await fetch('/api/auth/google/native', { credentials: 'include' });
      const config = await configResponse.json();
      if (!configResponse.ok || !config.success || !config.data?.clientId) {
        throw new Error(config.error || 'Google Sign-In is not configured for this Android app.');
      }
      const credential = await NativeGoogleSignIn.signIn({ serverClientId: config.data.clientId });
      const response = await fetch('/api/auth/google/native', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ idToken: credential.idToken }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Google Sign-In could not be completed.');
      // Persist the HttpOnly session cookie before replacing the WebView URL.
      // Without this flush, Android can drop a just-issued session on process
      // death and the widget cannot authenticate after a restart.
      await NativeGoogleSignIn.persistWebSession();
      await refreshTasksWidget();
      window.location.assign('/tasks');
    } catch (nativeError) {
      setError(nativeError?.message || 'Google Sign-In was cancelled or could not be completed.');
    } finally {
      setNativeSigningIn(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
        padding: 20,
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: 400,
          padding: 32,
          borderRadius: 16,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ marginBottom: 12 }}>
            <Logo size="lg" />
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            Sign in with your primary Google account to access your workspace
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              background: 'var(--red-bg)',
              color: 'var(--red)',
              fontSize: 13,
              fontWeight: 600,
              textAlign: 'center',
            }}
          >
            {error}
          </div>
        )}

        {isAndroidApp ? (
          <button
            type="button"
            className="btn btn-primary"
            disabled={nativeSigningIn}
            onClick={continueWithNativeGoogle}
            style={{ padding: '12px', fontSize: 14, fontWeight: 700, justifyContent: 'center' }}
          >
            {nativeSigningIn ? 'Opening Google accounts…' : 'Continue with Google'}
          </button>
        ) : (
          <a
            href="/api/auth/google/start?connectionType=primary_tasks"
            className="btn btn-primary"
            style={{ padding: '12px', fontSize: 14, fontWeight: 700, justifyContent: 'center', textDecoration: 'none' }}
          >
            Continue with Google →
          </a>
        )}

        <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
          Your Google identity signs you in. Google Tasks and additional Gmail inboxes require separate consent when you choose to connect them.
        </div>
      </div>
    </div>
  );
}
