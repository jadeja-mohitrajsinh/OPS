import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import GSoCProposal from '@/models/GSoCProposal';

export async function GET(request, { params }) {
  try {
    await clientPromise();
    const proposal = await GSoCProposal.findById(params.id)
      .populate('organization')
      .populate('projectIdea');
    if (!proposal) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: proposal });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await clientPromise();
    const body = await request.json();
    const proposal = await GSoCProposal.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );
    if (!proposal) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: proposal });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await clientPromise();
    const proposal = await GSoCProposal.findByIdAndDelete(params.id);
    if (!proposal) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: proposal });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
