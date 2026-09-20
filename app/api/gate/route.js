import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import GateSubject from '@/models/GateSubject';

export async function GET() {
  try {
    await dbConnect();
    const subjects = await GateSubject.find({}).sort({ priority: 1 });
    return NextResponse.json({ success: true, data: subjects });
  } catch (error) {
    console.error('API /api/gate error:', error);
    return NextResponse.json({ success: false, error: error.message, stack: error.stack }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const subject = await GateSubject.create(body);
    return NextResponse.json({ success: true, data: subject }, { status: 201 });
  } catch (error) {
    console.error('API /api/gate POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
