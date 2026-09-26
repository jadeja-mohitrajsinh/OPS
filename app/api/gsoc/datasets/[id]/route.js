import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import GSoCDataset from '@/models/GSoCDataset';

export async function GET(request, { params }) {
  try {
    await clientPromise();
    const dataset = await GSoCDataset.findById(params.id)
      .populate('relatedProjects')
      .populate('relatedExperiments');
    if (!dataset) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: dataset });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await clientPromise();
    const body = await request.json();
    const dataset = await GSoCDataset.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );
    if (!dataset) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: dataset });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await clientPromise();
    const dataset = await GSoCDataset.findByIdAndDelete(params.id);
    if (!dataset) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: dataset });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
