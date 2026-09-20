import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ForgeResearch from '@/models/ForgeResearch';

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const body = await request.json();
    const item = await ForgeResearch.findByIdAndUpdate(params.id, body, { new: true });
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    await ForgeResearch.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
