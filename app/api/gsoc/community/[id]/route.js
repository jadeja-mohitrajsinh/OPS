import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import GSoCCommunityInteraction from '@/models/GSoCCommunityInteraction';

export async function GET(request, { params }) {
  try {
    await clientPromise();
    const interaction = await GSoCCommunityInteraction.findById(params.id)
      .populate('organization')
      .populate('relatedProject')
      .populate('relatedProjectIdea');
    if (!interaction) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: interaction });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await clientPromise();
    const body = await request.json();
    const interaction = await GSoCCommunityInteraction.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );
    if (!interaction) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: interaction });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await clientPromise();
    const interaction = await GSoCCommunityInteraction.findByIdAndDelete(params.id);
    if (!interaction) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: interaction });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
