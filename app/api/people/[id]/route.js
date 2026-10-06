import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Person from '@/models/Person';
import { requireSession } from '@/lib/require-session';

export async function GET(request, { params }) {
  const { session, response } = await requireSession(request);
  if (response) return response;
  try {
    await dbConnect();
    const person = await Person.findOne({ _id: params.id, userId: session.userId });
    if (!person) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: person });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const { session, response } = await requireSession(request);
  if (response) return response;
  try {
    await dbConnect();
    const body = await request.json();
    delete body.userId;
    const person = await Person.findOneAndUpdate({ _id: params.id, userId: session.userId }, body, { new: true, runValidators: true });
    if (!person) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: person });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  const { session, response } = await requireSession(request);
  if (response) return response;
  try {
    await dbConnect();
    const person = await Person.findOneAndDelete({ _id: params.id, userId: session.userId });
    if (!person) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
