import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SESSION_COOKIE = 'ops_session';
const encoder = new TextEncoder();

async function hasValidSession(token) {
  const secret = process.env.SESSION_SECRET;
  if (!secret || !token) return false;
  try {
    await jwtVerify(token, encoder.encode(secret), { issuer: 'ops', audience: 'ops-web' });
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const authCookie = request.cookies.get(SESSION_COOKIE);

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

  // If user is not authenticated, redirect to /login
  if (!(await hasValidSession(authCookie?.value))) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
