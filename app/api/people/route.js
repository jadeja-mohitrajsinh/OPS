import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Person from '@/models/Person';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const relationship = searchParams.get('relationship');
    const needsFollowUp = searchParams.get('needsFollowUp');

    let query = {};
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
  try {
    await dbConnect();
    const body = await request.json();
    const person = await Person.create(body);
    return NextResponse.json({ success: true, data: person }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
