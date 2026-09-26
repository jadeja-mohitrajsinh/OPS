import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import GSoCExperiment from '@/models/GSoCExperiment';

export async function GET(request) {
  try {
    await clientPromise();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    
    let query = {};
    if (search) {
      query = {
        $or: [
          { experimentId: { $regex: search, $options: 'i' } },
          { hypothesis: { $regex: search, $options: 'i' } },
          { model: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    const experiments = await GSoCExperiment.find(query)
      .populate('project', 'name domain')
      .populate('relatedSkills', 'name')
      .sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: experiments });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await clientPromise();
    const body = await request.json();
    const experiment = await GSoCExperiment.create(body);
    return NextResponse.json({ success: true, data: experiment }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
