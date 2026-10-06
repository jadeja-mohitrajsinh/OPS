import { createSecretKey, randomUUID } from 'crypto';
import { SignJWT, jwtVerify } from 'jose';

export const SESSION_COOKIE = 'ops_session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const SESSION_ISSUER = 'ops';
const SESSION_AUDIENCE = 'ops-web';

function sessionKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET must be set to a random value of at least 32 characters.');
  }
  return createSecretKey(Buffer.from(secret, 'utf8'));
}

export async function createSession(user) {
  return new SignJWT({ email: user.primaryEmail, name: user.displayName })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(SESSION_ISSUER)
    .setAudience(SESSION_AUDIENCE)
    .setSubject(String(user._id))
    .setJti(randomUUID())
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(sessionKey());
}

export async function verifySession(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, sessionKey(), {
      issuer: SESSION_ISSUER,
      audience: SESSION_AUDIENCE,
    });
    return { userId: payload.sub, email: payload.email, name: payload.name };
  } catch {
    return null;
  }
}
