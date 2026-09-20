import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Goal from '@/models/Goal';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe');
    let query = { status: 'ACTIVE' };
    if (timeframe) query.timeframe = timeframe;
    const goals = await Goal.find(query).sort({ timeframe: 1 });
    return NextResponse.json({ success: true, data: goals });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const goal = await Goal.create(body);
    return NextResponse.json({ success: true, data: goal }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
