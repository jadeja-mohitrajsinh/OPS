import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import { requireSession } from '@/lib/require-session';

export async function GET(request) {
  const { session, response } = await requireSession(request);
  if (response) return response;
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const area = searchParams.get('area');
    let query = { userId: session.userId };
    if (status) query.status = status;
    if (area) query.area = area;
    const projects = await Project.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: projects });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const { session, response } = await requireSession(request);
  if (response) return response;
  try {
    await dbConnect();
    const body = await request.json();
    delete body.userId;
    const project = await Project.create({ ...body, userId: session.userId });
    return NextResponse.json({ success: true, data: project }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
