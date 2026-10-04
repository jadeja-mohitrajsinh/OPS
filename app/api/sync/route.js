import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { requireSession } from '@/lib/require-session';
import { deleteTaskFromGoogle, pushTaskToGoogle } from '@/lib/google-tasks';
import Task from '@/models/Task';

export const runtime = 'nodejs';

export async function POST(request) {
  const { session, response } = await requireSession(request);
  if (response) return response;
  try {
    await dbConnect();
    const pending = await Task.find({ userId: session.userId, syncState: { $in: ['local_only', 'pending', 'pending_delete', 'conflicted'] } }).sort({ updatedAt: 1 }).limit(100);
    const results = { synced: 0, failed: 0, failures: [] };
    for (const task of pending) {
      try {
        if (task.syncState === 'pending_delete') {
          await deleteTaskFromGoogle(session.userId, task);
          await task.deleteOne();
          results.synced += 1;
          continue;
        }
        const { remote, taskListId } = await pushTaskToGoogle(session.userId, task);
        task.googleTaskId = remote.id;
        task.googleTaskListId = taskListId;
        task.googleEtag = remote.etag || '';
        task.syncState = 'synced';
        await task.save();
        results.synced += 1;
      } catch (error) {
        task.syncState = 'conflicted';
        await task.save();
        results.failed += 1;
        results.failures.push({ taskId: String(task._id), message: error.message });
      }
    }
    return NextResponse.json({ success: results.failed === 0, data: results }, { status: results.failed ? 207 : 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
