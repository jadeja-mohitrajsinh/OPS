import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Meeting from '@/models/Meeting';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const upcoming = searchParams.get('upcoming');

    let query = {};
    if (status) query.status = status;
    if (upcoming === 'true') {
      query.date = { $gte: new Date() };
    }

    const meetings = await Meeting.find(query).populate('people').populate('followUpPerson').sort({ date: upcoming === 'true' ? 1 : -1 });
    return NextResponse.json({ success: true, data: meetings });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    // Auto-create preparation checklist
    if (!body.preparationChecklist || body.preparationChecklist.length === 0) {
      body.preparationChecklist = [
        { item: 'Review previous notes', done: false },
        { item: "Review person's previous commitments", done: false },
        { item: 'Define desired outcome', done: false },
        { item: 'Prepare questions', done: false },
        { item: 'Prepare relevant documents', done: false },
      ];
    }
    const meeting = await Meeting.create(body);
    return NextResponse.json({ success: true, data: meeting }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
