'use client';

import { Capacitor, registerPlugin } from '@capacitor/core';

const OpsWidget = registerPlugin('OpsWidget');

export async function syncTasksWidget(tasks) {
  if (Capacitor.getPlatform() !== 'android') return;
  const minimized = tasks.map(task => ({
    id: task._id,
    title: task.name,
    completed: task.status === 'DONE' || task.status === 'CANCELLED',
    dueDate: task.deadline || '',
    area: task.area || '',
    projectId: task.project || '',
    updatedAt: task.updatedAt || '',
  }));
  try { await OpsWidget.syncTasks({ tasks: minimized }); } catch { /* Widget support must never break Tasks. */ }
}

export async function clearTasksWidget() {
  if (Capacitor.getPlatform() !== 'android') return;
  try { await OpsWidget.clearTasks(); } catch { /* Logging out must still work if the widget bridge is unavailable. */ }
}

export async function refreshTasksWidget() {
  if (Capacitor.getPlatform() !== 'android') return;
  try { await OpsWidget.refreshWidget(); } catch { /* Background widget refresh is best effort. */ }
}
