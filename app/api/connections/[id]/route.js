import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { requireSession } from '@/lib/require-session';
import OAuthConnection from '@/models/OAuthConnection';
import EmailMessage from '@/models/EmailMessage';
import EmailTaskLink from '@/models/EmailTaskLink';
import Task from '@/models/Task';

export async function PATCH(request, { params }) {
  const { session, response } = await requireSession(request);
  if (response) return response;
  try {
    const { status } = await request.json();
    if (!['active', 'paused'].includes(status)) return NextResponse.json({ success: false, error: 'Only active or paused status is allowed.' }, { status: 400 });
    await dbConnect();
    const connection = await OAuthConnection.findOneAndUpdate(
      { _id: params.id, userId: session.userId, connectionType: 'connected_gmail' },
      { $set: { status } },
      { new: true },
    ).select('-encryptedTokens -syncCursor');
    if (!connection) return NextResponse.json({ success: false, error: 'Connected Gmail account not found.' }, { status: 404 });
    return NextResponse.json({ success: true, data: connection });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  const { session, response } = await requireSession(request);
  if (response) return response;
  try {
    await dbConnect();
    const connection = await OAuthConnection.findOne({ _id: params.id, userId: session.userId, connectionType: 'connected_gmail' });
    if (!connection) return NextResponse.json({ success: false, error: 'Connected Gmail account not found.' }, { status: 404 });
    const links = await EmailTaskLink.find({ userId: session.userId, sourceAccountId: connection._id }).select('_id taskId');
    await Promise.all([
      OAuthConnection.updateOne({ _id: connection._id }, { $set: { status: 'removed', encryptedTokens: null, syncCursor: '', watchExpiresAt: null } }),
      EmailMessage.deleteMany({ userId: session.userId, sourceAccountId: connection._id }),
      EmailTaskLink.deleteMany({ userId: session.userId, sourceAccountId: connection._id }),
      Task.updateMany({ userId: session.userId, sourceEmailLinkId: { $in: links.map(link => link._id) } }, { $set: { sourceEmailLinkId: null } }),
    ]);
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
