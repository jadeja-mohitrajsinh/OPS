import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import TodayTimeline from '@/models/TodayTimeline';
import { requireSession } from '@/lib/require-session';

function readDate(request) {
  return new URL(request.url).searchParams.get('date') || new Date().toISOString().slice(0, 10);
}

export async function GET(request) {
  const { session, response } = await requireSession(request);
  if (response) return response;

  try {
    await dbConnect();
    const timeline = await TodayTimeline.findOne({ userId: session.userId, date: readDate(request) }).lean();
    return NextResponse.json({ success: true, data: timeline?.items || [] });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  const { session, response } = await requireSession(request);
  if (response) return response;

  try {
    const body = await request.json();
    if (!Array.isArray(body.items)) {
      return NextResponse.json({ success: false, error: 'items must be an array' }, { status: 400 });
    }

    await dbConnect();
    const timeline = await TodayTimeline.findOneAndUpdate(
      { userId: session.userId, date: readDate(request) },
      { $set: { items: body.items } },
      { new: true, upsert: true, runValidators: true },
    );
    return NextResponse.json({ success: true, data: timeline.items });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
