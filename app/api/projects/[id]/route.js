import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import { requireSession } from '@/lib/require-session';

export async function GET(request, { params }) {
  const { session, response } = await requireSession(request);
  if (response) return response;
  try {
    await dbConnect();
    const project = await Project.findOne({ _id: params.id, userId: session.userId });
    if (!project) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: project });
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
    delete body.userId;
    const project = await Project.findOneAndUpdate({ _id: params.id, userId: session.userId }, body, { new: true, runValidators: true });
    if (!project) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  const { session, response } = await requireSession(request);
  if (response) return response;
  try {
    await dbConnect();
    const project = await Project.findOneAndDelete({ _id: params.id, userId: session.userId });
    if (!project) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
