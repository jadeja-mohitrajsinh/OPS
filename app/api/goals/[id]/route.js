import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Goal from '@/models/Goal';

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const body = await request.json();
    const goal = await Goal.findByIdAndUpdate(params.id, body, { new: true });
    return NextResponse.json({ success: true, data: goal });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    await Goal.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
