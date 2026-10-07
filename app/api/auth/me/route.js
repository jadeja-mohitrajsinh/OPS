import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { requireSession } from '@/lib/require-session';
import User from '@/models/User';
import OAuthConnection from '@/models/OAuthConnection';

export async function GET(request) {
  const { session, response } = await requireSession(request);
  if (response) return response;
  try {
    await dbConnect();
    const [user, connections] = await Promise.all([
      User.findById(session.userId).lean(),
      OAuthConnection.find({ userId: session.userId, connectionType: 'connected_gmail', status: { $ne: 'removed' } }).select('-encryptedTokens -syncCursor').lean(),
    ]);
    if (!user) return NextResponse.json({ success: false, error: 'Session user no longer exists' }, { status: 401 });
    return NextResponse.json({ success: true, data: { user, connections } });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
