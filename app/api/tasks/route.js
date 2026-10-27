import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import { sortByPriority } from '@/lib/priority';
import { requireSession } from '@/lib/require-session';
import retireLegacyTaskIndex from '@/lib/retire-legacy-task-index';

export async function GET(request) {
  const { session, response } = await requireSession(request);
  if (response) return response;
  try {
    await dbConnect();
    await retireLegacyTaskIndex(Task);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const area = searchParams.get('area');
    const priority = searchParams.get('priority');
    const today = searchParams.get('today');

    let query = { userId: session.userId, deletedAt: null };
    if (status) query.status = status;
    if (area) query.area = area;
    if (priority) query.priority = priority;
    if (today === 'true') {
      const start = new Date(); start.setHours(0,0,0,0);
      const end = new Date(); end.setHours(23,59,59,999);
      query.deadline = { $gte: start, $lte: end };
    }

    const tasks = await Task.find(query).sort({ createdAt: -1 });
    const sorted = sortByPriority(tasks.map(t => t.toObject()));
    return NextResponse.json({ success: true, data: sorted });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const { session, response } = await requireSession(request);
  if (response) return response;
  try {
    await dbConnect();
    await retireLegacyTaskIndex(Task);
    const body = await request.json();

    const items = Array.isArray(body) ? body : (Array.isArray(body?.tasks) ? body.tasks : null);
    if (items) {
      if (items.length === 0) {
        return NextResponse.json({ success: false, error: 'JSON array contains no tasks to import.' }, { status: 400 });
      }

      const VALID_AREAS = ['Academic', 'Entrepreneur', 'Personal', 'GATE', 'College', 'anyrise', 'Learning', 'Health', 'Communication', ''];
      const VALID_PRIORITIES = ['P0', 'P1', 'P2', 'P3'];
      const VALID_STATUSES = ['TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE', 'CANCELLED'];
      const VALID_ENERGY = ['LOW', 'MEDIUM', 'HIGH'];

      const sanitized = items.map((t, idx) => {
        if (!t || typeof t !== 'object') {
          throw new Error(`Task at index ${idx} is invalid.`);
        }
        const name = (typeof t.name === 'string' ? t.name : (t.title || '')).trim();
        if (!name) {
          throw new Error(`Task at index ${idx} is missing a required "name" field.`);
        }

        const priority = typeof t.priority === 'string' ? t.priority.toUpperCase().trim() : 'P1';
        const energyLevel = typeof t.energyLevel === 'string' ? t.energyLevel.toUpperCase().trim() : 'MEDIUM';
        const status = typeof t.status === 'string' ? t.status.toUpperCase().replace(/\s+/g, '_').trim() : 'TODO';

        const cleaned = {
          userId: session.userId,
          name,
          project: typeof t.project === 'string' ? t.project.trim() : '',
          area: VALID_AREAS.includes(t.area) ? t.area : '',
          priority: VALID_PRIORITIES.includes(priority) ? priority : 'P1',
          energyLevel: VALID_ENERGY.includes(energyLevel) ? energyLevel : 'MEDIUM',
          status: VALID_STATUSES.includes(status) ? status : 'TODO',
          estimatedDuration: typeof t.estimatedDuration === 'number' && t.estimatedDuration > 0 ? t.estimatedDuration : 30,
          tags: Array.isArray(t.tags) 
            ? t.tags.map(String).map(s => s.trim()).filter(Boolean) 
            : (typeof t.tags === 'string' ? t.tags.split(',').map(s => s.trim()).filter(Boolean) : []),
          notes: typeof t.notes === 'string' ? t.notes.trim() : '',
          blockedReason: typeof t.blockedReason === 'string' ? t.blockedReason.trim() : '',
          starred: Boolean(t.starred),
        };

        if (t.deadline) {
          const d = new Date(t.deadline);
          if (!isNaN(d.getTime())) cleaned.deadline = d;
        }

        return cleaned;
      });

      const created = await Task.insertMany(sanitized);
      return NextResponse.json({ success: true, count: created.length, data: created }, { status: 201 });
    }

    delete body.userId;
    const task = await Task.create({ ...body, userId: session.userId });
    return NextResponse.json({ success: true, data: task }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

