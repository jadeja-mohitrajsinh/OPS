import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CalendarPlan from '@/models/CalendarPlan';
import { requireSession } from '@/lib/require-session';

function readDate(request) {
  return new URL(request.url).searchParams.get('date');
}

export async function GET(request) {
  const { session, response } = await requireSession(request);
  if (response) return response;
  try {
    await dbConnect();
    const date = readDate(request);
    const plans = await CalendarPlan.find(date ? { userId: session.userId, date } : { userId: session.userId }).lean();
    const data = plans.reduce((byDate, plan) => ({ ...byDate, [plan.date]: plan.items || [] }), {});
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  const { session, response } = await requireSession(request);
  if (response) return response;
  try {
    const date = readDate(request);
    const body = await request.json();
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Array.isArray(body.items)) {
      return NextResponse.json({ success: false, error: 'A YYYY-MM-DD date and items array are required.' }, { status: 400 });
    }
    await dbConnect();
    const plan = await CalendarPlan.findOneAndUpdate(
      { userId: session.userId, date },
      { $set: { items: body.items } },
      { new: true, upsert: true, runValidators: true },
    );
    return NextResponse.json({ success: true, data: plan.items });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
