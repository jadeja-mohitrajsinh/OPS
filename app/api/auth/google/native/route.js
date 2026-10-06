import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import dbConnect from '@/lib/mongodb';
import { createSession, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from '@/lib/auth';
import User from '@/models/User';

export const runtime = 'nodejs';

function nativeGoogleAudiences() {
  const audiences = [process.env.GOOGLE_OAUTH_CLIENT_ID, process.env.GOOGLE_ANDROID_CLIENT_ID].filter(Boolean);
  if (!audiences.length) throw new Error('Google OAuth client IDs are not configured.');
  return audiences;
}

function nativeGoogleServerClientId() {
  // Credential Manager's GetGoogleIdOption requires the web/server OAuth
  // client ID: it becomes the ID token's `aud` and is verified by this API.
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  if (!clientId) throw new Error('GOOGLE_OAUTH_CLIENT_ID is not configured.');
  return clientId;
}

export async function GET() {
  try {
    // OAuth client IDs identify an application; they are intentionally public.
    return NextResponse.json({ success: true, data: { clientId: nativeGoogleServerClientId() } });
  } catch {
    return NextResponse.json({ success: false, error: 'Google Sign-In is not configured.' }, { status: 503 });
  }
}

export async function POST(request) {
  try {
    const { idToken } = await request.json();
    if (typeof idToken !== 'string' || !idToken.trim()) {
      return NextResponse.json({ success: false, error: 'A Google ID token is required.' }, { status: 400 });
    }

    // google-auth-library verifies the token signature, issuer, expiry, and the
    // intentionally configured OAuth client-ID audience allow-list.
    const ticket = await new OAuth2Client().verifyIdToken({
      idToken,
      audience: nativeGoogleAudiences(),
    });
    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email || payload.email_verified !== true) {
      return NextResponse.json({ success: false, error: 'Google did not return a verified identity.' }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findOneAndUpdate(
      { primaryGoogleSubject: payload.sub },
      { $set: { primaryEmail: payload.email, displayName: payload.name || payload.email } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    const response = NextResponse.json({
      success: true,
      data: { user: { id: String(user._id), email: user.primaryEmail, name: user.displayName } },
    });
    response.cookies.set({
      name: SESSION_COOKIE,
      value: await createSession(user),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE_SECONDS,
    });
    return response;
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Google Sign-In could not be verified.' }, { status: 401 });
  }
}
