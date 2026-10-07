import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import dbConnect from '@/lib/mongodb';
import { createAuthorizationUrl, createPkcePair } from '@/lib/google-oauth';
import { requireSession } from '@/lib/require-session';
import OAuthState from '@/models/OAuthState';

export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const connectionType = searchParams.get('connectionType');
    if (!['primary_identity', 'connected_gmail'].includes(connectionType)) {
      return NextResponse.json({ success: false, error: 'connectionType must be primary_identity or connected_gmail.' }, { status: 400 });
    }

    const { session, response } = await requireSession(request);
    if (connectionType === 'connected_gmail' && response) return response;
    // A signed-in user may refresh the Google identity linked to their profile.

    const { verifier, challenge } = createPkcePair();
    const state = randomUUID();
    await dbConnect();
    await OAuthState.create({
      state,
      connectionType,
      userId: session?.userId || null,
      codeVerifier: verifier,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
    return NextResponse.redirect(createAuthorizationUrl({ connectionType, state, codeChallenge: challenge }));
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
