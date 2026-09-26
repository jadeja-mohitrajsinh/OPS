import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import GSoCExperiment from '@/models/GSoCExperiment';

export async function GET(request, { params }) {
  try {
    await clientPromise();
    const experiment = await GSoCExperiment.findById(params.id)
      .populate('project')
      .populate('relatedSkills');
    if (!experiment) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: experiment });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await clientPromise();
    const body = await request.json();
    const experiment = await GSoCExperiment.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );
    if (!experiment) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: experiment });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await clientPromise();
    const experiment = await GSoCExperiment.findByIdAndDelete(params.id);
    if (!experiment) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: experiment });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
