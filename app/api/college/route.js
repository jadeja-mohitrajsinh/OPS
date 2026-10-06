import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CollegeSubject from '@/models/CollegeSubject';
import { requireSession } from '@/lib/require-session';

export async function GET(request) {
  const { session, response } = await requireSession(request);
  if (response) return response;
  try {
    await dbConnect();
    const subjects = await CollegeSubject.find({ userId: session.userId }).sort({ name: 1 });
    return NextResponse.json({ success: true, data: subjects });
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
    const subject = await CollegeSubject.create({ ...body, userId: session.userId });
    return NextResponse.json({ success: true, data: subject }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
