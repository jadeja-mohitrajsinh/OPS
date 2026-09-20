import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CollegeSubject from '@/models/CollegeSubject';

export async function GET() {
  try {
    await dbConnect();
    const subjects = await CollegeSubject.find({}).sort({ name: 1 });
    return NextResponse.json({ success: true, data: subjects });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const subject = await CollegeSubject.create(body);
    return NextResponse.json({ success: true, data: subject }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
