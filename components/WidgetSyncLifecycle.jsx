'use client';

import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { refreshTasksWidget } from '@/lib/tasks-widget';

function isTaskMutation(input, init) {
  const url = typeof input === 'string' ? input : input?.url;
  if (!url) return false;
  const method = (init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
  return method !== 'GET' && new URL(url, window.location.origin).pathname.startsWith('/api/tasks');
}

export default function WidgetSyncLifecycle() {
  useEffect(() => {
    if (Capacitor.getPlatform() !== 'android') return undefined;
    let refreshTimer;
    const scheduleRefresh = () => {
      window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => { refreshTasksWidget(); }, 200);
    };
    const originalFetch = window.fetch.bind(window);
    window.fetch = async (input, init) => {
      const response = await originalFetch(input, init);
      if (response.ok && isTaskMutation(input, init)) scheduleRefresh();
      return response;
    };
    scheduleRefresh();
    window.addEventListener('online', scheduleRefresh);
    window.addEventListener('focus', scheduleRefresh);
    const visibilityChange = () => { if (document.visibilityState === 'visible') scheduleRefresh(); };
    document.addEventListener('visibilitychange', visibilityChange);
    let appListener;
    App.addListener('appStateChange', ({ isActive }) => { if (isActive) scheduleRefresh(); }).then(handle => { appListener = handle; });
    return () => {
      window.fetch = originalFetch;
      window.clearTimeout(refreshTimer);
      window.removeEventListener('online', scheduleRefresh);
      window.removeEventListener('focus', scheduleRefresh);
      document.removeEventListener('visibilitychange', visibilityChange);
      appListener?.remove();
    };
  }, []);
  return null;
}
