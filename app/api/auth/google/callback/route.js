import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { createSession, SESSION_COOKIE } from '@/lib/auth';
import { encryptJson } from '@/lib/oauth-crypto';
import { exchangeCode } from '@/lib/google-oauth';
import User from '@/models/User';
import OAuthConnection from '@/models/OAuthConnection';
import OAuthState from '@/models/OAuthState';

export const runtime = 'nodejs';

function redirectWithError(request, error) {
  const url = new URL('/login', request.url);
  url.searchParams.set('error', error);
  return NextResponse.redirect(url);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const stateValue = searchParams.get('state');
  const oauthError = searchParams.get('error');
  if (oauthError) return redirectWithError(request, 'Google authorization was cancelled or denied.');
  if (!code || !stateValue) return redirectWithError(request, 'Missing Google authorization response.');

  try {
    await dbConnect();
    const state = await OAuthState.findOneAndDelete({ state: stateValue }).select('+codeVerifier');
    if (!state || state.expiresAt <= new Date()) return redirectWithError(request, 'This authorization request expired. Please try again.');

    const { tokens, profile } = await exchangeCode({ code, codeVerifier: state.codeVerifier });
    const encryptedTokens = encryptJson({
      accessToken: tokens.access_token || '',
      refreshToken: tokens.refresh_token || '',
      expiryDate: tokens.expiry_date || null,
      tokenType: tokens.token_type || 'Bearer',
    });

    if (state.connectionType === 'primary_tasks') {
      const user = await User.findOneAndUpdate(
        { primaryGoogleSubject: profile.sub },
        { $set: { primaryEmail: profile.email, displayName: profile.name } },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      );
      const connection = await OAuthConnection.findOneAndUpdate(
        { userId: user._id, connectionType: 'primary_tasks' },
        { $set: { provider: 'google', googleSubject: profile.sub, email: profile.email, scopes: ['https://www.googleapis.com/auth/tasks'], encryptedTokens, status: 'active' } },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      );
      if (!user.primaryTaskConnectionId || String(user.primaryTaskConnectionId) !== String(connection._id)) {
        user.primaryTaskConnectionId = connection._id;
        await user.save();
      }
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.set({ name: SESSION_COOKIE, value: await createSession(user), httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 8 });
      return response;
    }

    if (!state.userId) return redirectWithError(request, 'Missing primary account session.');
    const conflict = await OAuthConnection.exists({ connectionType: 'connected_gmail', googleSubject: profile.sub, userId: { $ne: state.userId }, status: { $ne: 'removed' } });
    if (conflict) return redirectWithError(request, 'That Gmail account is already connected to a different primary account.');
    await OAuthConnection.findOneAndUpdate(
      { userId: state.userId, connectionType: 'connected_gmail', googleSubject: profile.sub },
      { $set: { provider: 'google', email: profile.email, scopes: ['https://www.googleapis.com/auth/gmail.metadata'], encryptedTokens, status: 'active' } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
    return NextResponse.redirect(new URL('/tasks?connected=1', request.url));
  } catch (error) {
    return redirectWithError(request, error.message || 'Google connection could not be completed.');
  }
}
