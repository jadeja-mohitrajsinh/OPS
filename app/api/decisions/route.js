import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Decision from '@/models/Decision';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const area = searchParams.get('area');
    let query = {};
    if (area) query.area = area;
    const decisions = await Decision.find(query).sort({ date: -1 });
    return NextResponse.json({ success: true, data: decisions });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const decision = await Decision.create(body);
    return NextResponse.json({ success: true, data: decision }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
