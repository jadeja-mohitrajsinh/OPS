import { NextResponse } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';

const SESSION_COOKIE = 'ops_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const SESSION_RENEWAL_WINDOW_SECONDS = 60 * 60 * 24 * 7;
const encoder = new TextEncoder();

async function getValidSession(token) {
  const secret = process.env.SESSION_SECRET;
  if (!secret || !token) return null;
  try {
    const { payload } = await jwtVerify(token, encoder.encode(secret), { issuer: 'ops', audience: 'ops-web' });
    return payload;
  } catch {
    return null;
  }
}

async function renewSession(payload) {
  return new SignJWT({ email: payload.email, name: payload.name })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer('ops')
    .setAudience('ops-web')
    .setSubject(String(payload.sub))
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(encoder.encode(process.env.SESSION_SECRET));
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const authCookie = request.cookies.get(SESSION_COOKIE);

  // Check if running in Capacitor (Android app) - local server
  const host = request.headers.get('host') || '';
  const isLocalCapacitor = host.includes('localhost') || host.includes('127.0.0.1');

  // Allow static assets, images, next internal files, and auth API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname === '/login' ||
    pathname === '/about' ||
    pathname === '/privacy' ||
    pathname === '/terms' ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Skip authentication for local Capacitor/Android app
  if (isLocalCapacitor) {
    return NextResponse.next();
  }

  // If user is not authenticated, redirect to /login
  const session = await getValidSession(authCookie?.value);
  if (!session) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();
  const secondsUntilExpiry = (session.exp || 0) - Math.floor(Date.now() / 1000);
  if (secondsUntilExpiry < SESSION_RENEWAL_WINDOW_SECONDS) {
    response.cookies.set({
      name: SESSION_COOKIE,
      value: await renewSession(session),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE_SECONDS,
    });
  }
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
