import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Decision from '@/models/Decision';

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const body = await request.json();
    const decision = await Decision.findByIdAndUpdate(params.id, body, { new: true });
    return NextResponse.json({ success: true, data: decision });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    await Decision.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
