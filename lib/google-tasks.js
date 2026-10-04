import dbConnect from '@/lib/mongodb';
import { createGoogleClient } from '@/lib/google-oauth';
import { decryptJson, encryptJson } from '@/lib/oauth-crypto';
import OAuthConnection from '@/models/OAuthConnection';
import Task from '@/models/Task';
import User from '@/models/User';

const TASKS_BASE_URL = 'https://tasks.googleapis.com/tasks/v1';

async function primaryTasksConnection(userId) {
  await dbConnect();
  const [user, connection] = await Promise.all([
    User.findById(userId),
    OAuthConnection.findOne({ userId, connectionType: 'primary_tasks', status: 'active' }).select('+encryptedTokens'),
  ]);
  if (!user) throw new Error('User not found.');
  if (!connection) throw new Error('No active Google Tasks connection found. Please connect your Google account first.');
  if (!connection.encryptedTokens) throw new Error('Google Tasks connection exists but has no encrypted tokens. Please re-authenticate.');
  return { user, connection };
}

async function authorizedFetch(userId, path, options = {}) {
  const { connection } = await primaryTasksConnection(userId);
  let stored;
  try {
    stored = decryptJson(connection.encryptedTokens);
  } catch (error) {
    throw new Error(`Failed to decrypt Google tokens: ${error.message}. Please re-authenticate your Google account.`);
  }
  const client = createGoogleClient();
  client.setCredentials({ access_token: stored.accessToken, refresh_token: stored.refreshToken, expiry_date: stored.expiryDate });
  const accessToken = await client.getAccessToken();
  if (!accessToken.token) throw new Error('Unable to obtain a Google Tasks access token.');

  const refreshed = client.credentials;
  if (refreshed.access_token && (refreshed.access_token !== stored.accessToken || refreshed.expiry_date !== stored.expiryDate)) {
    connection.encryptedTokens = encryptJson({
      accessToken: refreshed.access_token,
      refreshToken: refreshed.refresh_token || stored.refreshToken,
      expiryDate: refreshed.expiry_date || null,
      tokenType: refreshed.token_type || stored.tokenType || 'Bearer',
    });
    await connection.save();
  }

  const response = await fetch(`${TASKS_BASE_URL}${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${accessToken.token}`, 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Google Tasks request failed (${response.status}): ${details.slice(0, 240)}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

function toGoogleTask(task) {
  return {
    title: task.name,
    notes: task.notes || '',
    due: task.deadline ? new Date(task.deadline).toISOString() : undefined,
    status: task.status === 'DONE' ? 'completed' : 'needsAction',
    completed: task.status === 'DONE' ? new Date(task.completedAt || Date.now()).toISOString() : undefined,
  };
}

export async function pushTaskToGoogle(userId, task) {
  const { user } = await primaryTasksConnection(userId);
  const taskListId = user.defaultGoogleTaskListId || '@default';
  const body = JSON.stringify(toGoogleTask(task));
  const remote = task.googleTaskId
    ? await authorizedFetch(userId, `/lists/${encodeURIComponent(task.googleTaskListId || taskListId)}/tasks/${encodeURIComponent(task.googleTaskId)}`, { method: 'PATCH', body, headers: task.googleEtag ? { 'If-Match': task.googleEtag } : {} })
    : await authorizedFetch(userId, `/lists/${encodeURIComponent(taskListId)}/tasks`, { method: 'POST', body });
  return { remote, taskListId };
}

export async function deleteTaskFromGoogle(userId, task) {
  if (!task.googleTaskId) return;
  const { user } = await primaryTasksConnection(userId);
  await authorizedFetch(userId, `/lists/${encodeURIComponent(task.googleTaskListId || user.defaultGoogleTaskListId || '@default')}/tasks/${encodeURIComponent(task.googleTaskId)}`, {
    method: 'DELETE',
    headers: task.googleEtag ? { 'If-Match': task.googleEtag } : {},
  });
}

export async function fetchTasksFromGoogle(userId, taskListId = null) {
  const { user } = await primaryTasksConnection(userId);
  const listId = taskListId || user.defaultGoogleTaskListId || '@default';
  const response = await authorizedFetch(userId, `/lists/${encodeURIComponent(listId)}/tasks`, {
    method: 'GET',
  });
  return response?.items || [];
}

function fromGoogleTask(googleTask, userId, taskListId) {
  return {
    name: googleTask.title || 'Untitled',
    notes: googleTask.notes || '',
    deadline: googleTask.due ? new Date(googleTask.due) : null,
    status: googleTask.status === 'completed' ? 'DONE' : 'TODO',
    completedAt: googleTask.completed ? new Date(googleTask.completed) : null,
    googleTaskId: googleTask.id,
    googleTaskListId: taskListId,
    googleEtag: googleTask.etag || '',
    syncState: 'synced',
    userId,
  };
}

export async function syncGoogleTasksToLocal(userId) {
  const { user } = await primaryTasksConnection(userId);
  const taskListId = user.defaultGoogleTaskListId || '@default';
  const googleTasks = await fetchTasksFromGoogle(userId, taskListId);
  
  const results = { added: 0, updated: 0, unchanged: 0 };
  
  for (const googleTask of googleTasks) {
    const existing = await Task.findOne({ userId, googleTaskId: googleTask.id });
    
    if (!existing) {
      // New task from Google - create locally
      await Task.create(fromGoogleTask(googleTask, userId, taskListId));
      results.added += 1;
    } else {
      // Existing task - check if it needs updating based on etag
      if (googleTask.etag && googleTask.etag !== existing.googleEtag) {
        // Update local task with Google's version
        const updatedData = fromGoogleTask(googleTask, userId, taskListId);
        Object.assign(existing, updatedData);
        await existing.save();
        results.updated += 1;
      } else {
        results.unchanged += 1;
      }
    }
  }
  
  return results;
}
