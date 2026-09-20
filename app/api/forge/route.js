import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ForgeResearch from '@/models/ForgeResearch';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const area = searchParams.get('area');
    const status = searchParams.get('status');
    let query = {};
    if (area) query.area = area;
    if (status) query.status = status;
    const research = await ForgeResearch.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: research });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const item = await ForgeResearch.create(body);
    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
