import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Competitor from '@/models/Competitor';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const competitor = await Competitor.findById(params.id);
    if (!competitor) {
      return NextResponse.json({ success: false, error: 'Competitor not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: competitor });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const body = await request.json();
    const competitor = await Competitor.findByIdAndUpdate(params.id, body, { new: true, runValidators: true });
    if (!competitor) {
      return NextResponse.json({ success: false, error: 'Competitor not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: competitor });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const competitor = await Competitor.findByIdAndDelete(params.id);
    if (!competitor) {
      return NextResponse.json({ success: false, error: 'Competitor not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
