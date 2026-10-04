import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { requireSession } from '@/lib/require-session';
import OAuthConnection from '@/models/OAuthConnection';

export async function GET(request) {
  const { session, response } = await requireSession(request);
  if (response) return response;
  try {
    await dbConnect();
    const connections = await OAuthConnection.find({ userId: session.userId, status: { $ne: 'removed' } })
      .select('-encryptedTokens -syncCursor')
      .sort({ connectionType: 1, email: 1 })
      .lean();
    return NextResponse.json({ success: true, data: connections });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
