import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import GSoCProjectIdea from '@/models/GSoCProjectIdea';

export async function GET() {
  try {
    await clientPromise();
    const ideas = await GSoCProjectIdea.find({})
      .populate('organization', 'name')
      .populate('relatedSkills', 'name')
      .populate('relatedProjects', 'name')
      .populate('communityInteractions')
      .sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: ideas });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await clientPromise();
    const body = await request.json();
    const idea = await GSoCProjectIdea.create(body);
    return NextResponse.json({ success: true, data: idea }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
