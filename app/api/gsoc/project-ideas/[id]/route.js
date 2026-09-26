import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import GSoCProjectIdea from '@/models/GSoCProjectIdea';

export async function GET(request, { params }) {
  try {
    await clientPromise();
    const idea = await GSoCProjectIdea.findById(params.id)
      .populate('organization')
      .populate('relatedSkills')
      .populate('relatedProjects')
      .populate('communityInteractions');
    if (!idea) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: idea });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await clientPromise();
    const body = await request.json();
    const idea = await GSoCProjectIdea.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );
    if (!idea) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: idea });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await clientPromise();
    const idea = await GSoCProjectIdea.findByIdAndDelete(params.id);
    if (!idea) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: idea });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
