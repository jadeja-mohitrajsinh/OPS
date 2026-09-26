import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import GSoCProposal from '@/models/GSoCProposal';

export async function GET() {
  try {
    await clientPromise();
    const proposals = await GSoCProposal.find({})
      .populate('organization', 'name')
      .populate('projectIdea', 'title')
      .sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: proposals });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await clientPromise();
    const body = await request.json();
    const proposal = await GSoCProposal.create(body);
    return NextResponse.json({ success: true, data: proposal }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
