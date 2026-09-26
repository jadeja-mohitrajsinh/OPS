import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import GSoCContribution from '@/models/GSoCContribution';

export async function GET(request, { params }) {
  try {
    await clientPromise();
    const contribution = await GSoCContribution.findById(params.id)
      .populate('organization');
    if (!contribution) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: contribution });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await clientPromise();
    const body = await request.json();
    const contribution = await GSoCContribution.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );
    if (!contribution) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: contribution });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await clientPromise();
    const contribution = await GSoCContribution.findByIdAndDelete(params.id);
    if (!contribution) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: contribution });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
