import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import GateSubject from '@/models/GateSubject';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const subject = await GateSubject.findById(params.id);
    if (!subject) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: subject });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const body = await request.json();
    const subject = await GateSubject.findByIdAndUpdate(params.id, body, { new: true, runValidators: true });
    if (!subject) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: subject });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    await GateSubject.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
