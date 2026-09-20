import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import { sortByPriority } from '@/lib/priority';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const area = searchParams.get('area');
    const priority = searchParams.get('priority');
    const today = searchParams.get('today');

    let query = {};
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
  try {
    await dbConnect();
    const body = await request.json();
    const task = await Task.create(body);
    return NextResponse.json({ success: true, data: task }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
