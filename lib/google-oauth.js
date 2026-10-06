import { createHash, randomBytes } from 'crypto';
import { OAuth2Client } from 'google-auth-library';

const GOOGLE_AUTH_BASE = 'https://accounts.google.com/o/oauth2/v2/auth';
const TASKS_SCOPE = 'https://www.googleapis.com/auth/tasks';
const GMAIL_METADATA_SCOPE = 'https://www.googleapis.com/auth/gmail.metadata';

function config() {
  const { GOOGLE_OAUTH_CLIENT_ID: clientId, GOOGLE_OAUTH_CLIENT_SECRET: clientSecret, GOOGLE_OAUTH_REDIRECT_URI: redirectUri } = process.env;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Google OAuth is not configured. Set GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, and GOOGLE_OAUTH_REDIRECT_URI.');
  }
  return { clientId, clientSecret, redirectUri };
}

export function connectionScopes(connectionType) {
  if (connectionType === 'primary_tasks') return ['openid', 'email', 'profile', TASKS_SCOPE];
  if (connectionType === 'connected_gmail') return ['openid', 'email', 'profile', GMAIL_METADATA_SCOPE];
  throw new Error('Unsupported Google connection type.');
}

export function createPkcePair() {
  const verifier = randomBytes(48).toString('base64url');
  const challenge = createHash('sha256').update(verifier).digest('base64url');
  return { verifier, challenge };
}

export function createAuthorizationUrl({ connectionType, state, codeChallenge }) {
  const { clientId, redirectUri } = config();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: connectionScopes(connectionType).join(' '),
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    access_type: 'offline',
    prompt: 'select_account',
    include_granted_scopes: 'true',
  });
  return `${GOOGLE_AUTH_BASE}?${params.toString()}`;
}

export function createGoogleClient() {
  const { clientId, clientSecret, redirectUri } = config();
  return new OAuth2Client(clientId, clientSecret, redirectUri);
}

export async function exchangeCode({ code, codeVerifier }) {
  const client = createGoogleClient();
  const { tokens } = await client.getToken({ code, codeVerifier });
  if (!tokens.id_token) throw new Error('Google did not return an ID token.');
  const { clientId } = config();
  const ticket = await client.verifyIdToken({ idToken: tokens.id_token, audience: clientId });
  const payload = ticket.getPayload();
  if (!payload?.sub || !payload.email) throw new Error('Google identity response is incomplete.');
  return { tokens, profile: { sub: payload.sub, email: payload.email, name: payload.name || payload.email } };
}
