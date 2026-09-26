import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import GSoCCommunityInteraction from '@/models/GSoCCommunityInteraction';

export async function GET(request) {
  try {
    await clientPromise();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    
    let query = {};
    if (search) {
      query = {
        $or: [
          { topic: { $regex: search, $options: 'i' } },
          { platform: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    const interactions = await GSoCCommunityInteraction.find(query)
      .populate('organization', 'name')
      .populate('relatedProject', 'name')
      .populate('relatedProjectIdea', 'title')
      .sort({ date: -1 });
    return NextResponse.json({ success: true, data: interactions });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await clientPromise();
    const body = await request.json();
    const interaction = await GSoCCommunityInteraction.create(body);
    return NextResponse.json({ success: true, data: interaction }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
