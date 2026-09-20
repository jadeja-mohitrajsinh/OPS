import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Competitor from '@/models/Competitor';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const threatLevel = searchParams.get('threatLevel');
    const status = searchParams.get('status');
    const q = searchParams.get('q');

    let query = {};
    if (category && category !== 'ALL') query.category = category;
    if (threatLevel && threatLevel !== 'ALL') query.threatLevel = threatLevel;
    if (status && status !== 'ALL') query.status = status;
    if (q) {
      const regex = new RegExp(q, 'i');
      query.$or = [
        { name: regex },
        { tagline: regex },
        { ourDifferentiator: regex },
        { tags: regex },
      ];
    }

    const competitors = await Competitor.find(query).sort({ threatLevel: 1, createdAt: -1 });
    return NextResponse.json({ success: true, data: competitors });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const competitor = await Competitor.create(body);
    return NextResponse.json({ success: true, data: competitor }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
