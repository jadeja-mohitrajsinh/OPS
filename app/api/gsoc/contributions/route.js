import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import GSoCContribution from '@/models/GSoCContribution';

export async function GET() {
  try {
    await clientPromise();
    const contributions = await GSoCContribution.find({})
      .populate('organization', 'name')
      .sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: contributions });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await clientPromise();
    const body = await request.json();
    const contribution = await GSoCContribution.create(body);
    return NextResponse.json({ success: true, data: contribution }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
