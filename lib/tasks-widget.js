'use client';

import { Capacitor, registerPlugin } from '@capacitor/core';

const TasksWidget = registerPlugin('TasksWidget');

export async function syncTasksWidget(tasks) {
  if (Capacitor.getPlatform() !== 'android') return;
  const minimized = tasks.map(task => ({
    id: task._id,
    title: task.name,
    completed: task.status === 'DONE' || task.status === 'CANCELLED',
    dueDate: task.deadline || '',
    projectId: task.project || '',
    updatedAt: task.updatedAt || '',
  }));
  try { await TasksWidget.sync({ tasks: minimized }); } catch { /* Widget support must never break Tasks. */ }
}
