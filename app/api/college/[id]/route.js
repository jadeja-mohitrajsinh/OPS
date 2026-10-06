import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CollegeSubject from '@/models/CollegeSubject';
import { requireSession } from '@/lib/require-session';

export async function GET(request, { params }) {
  const { session, response } = await requireSession(request);
  if (response) return response;
  try {
    await dbConnect();
    const subject = await CollegeSubject.findOne({ _id: params.id, userId: session.userId });
    if (!subject) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: subject });
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
    const subject = await CollegeSubject.findOneAndUpdate({ _id: params.id, userId: session.userId }, body, { new: true, runValidators: true });
    if (!subject) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: subject });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  const { session, response } = await requireSession(request);
  if (response) return response;
  try {
    await dbConnect();
    const subject = await CollegeSubject.findOneAndDelete({ _id: params.id, userId: session.userId });
    if (!subject) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
