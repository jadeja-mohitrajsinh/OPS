import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import { requireSession } from '@/lib/require-session';

export async function GET(request, { params }) {
  const { session, response } = await requireSession(request);
  if (response) return response;
  try {
    await dbConnect();
    const task = await Task.findOne({ _id: params.id, userId: session.userId, deletedAt: null });
    if (!task) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const { session, response } = await requireSession(request);
  if (response) return response;
  try {
    await dbConnect();
    const body = await request.json();
    if (body.status === 'DONE' && !body.completedAt) {
      body.completedAt = new Date();
    }
    delete body.userId;
    delete body.googleTaskId;
    delete body.googleTaskListId;
    const task = await Task.findOneAndUpdate({ _id: params.id, userId: session.userId, deletedAt: null }, { ...body, syncState: 'pending' }, { new: true, runValidators: true });
    if (!task) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  const { session, response } = await requireSession(request);
  if (response) return response;
  try {
    await dbConnect();
    const task = await Task.findOneAndUpdate(
      { _id: params.id, userId: session.userId, deletedAt: null },
      { $set: { deletedAt: new Date(), syncState: 'pending_delete' } },
      { new: true },
    );
    if (!task) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
