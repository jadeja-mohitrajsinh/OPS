import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import GSoCDataset from '@/models/GSoCDataset';

export async function GET(request) {
  try {
    await clientPromise();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { domain: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    const datasets = await GSoCDataset.find(query)
      .populate('relatedProjects', 'name')
      .populate('relatedExperiments', 'experimentId')
      .sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: datasets });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await clientPromise();
    const body = await request.json();
    const dataset = await GSoCDataset.create(body);
    return NextResponse.json({ success: true, data: dataset }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
