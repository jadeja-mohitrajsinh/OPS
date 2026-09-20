import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Review from '@/models/Review';

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const body = await request.json();
    const review = await Review.findByIdAndUpdate(params.id, body, { new: true });
    return NextResponse.json({ success: true, data: review });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
