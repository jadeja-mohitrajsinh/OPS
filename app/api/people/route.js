import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Person from '@/models/Person';
import { requireSession } from '@/lib/require-session';

export async function GET(request) {
  const { session, response } = await requireSession(request);
  if (response) return response;
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const relationship = searchParams.get('relationship');
    const needsFollowUp = searchParams.get('needsFollowUp');

    let query = { userId: session.userId };
    if (relationship) query.relationship = relationship;
    if (needsFollowUp === 'true') {
      query.nextInteraction = { $lte: new Date() };
    }

    const people = await Person.find(query).sort({ lastInteraction: -1 });
    return NextResponse.json({ success: true, data: people });
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
    const person = await Person.create({ ...body, userId: session.userId });
    return NextResponse.json({ success: true, data: person }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
