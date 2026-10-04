import { NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySession } from '@/lib/auth';

export async function requireSession(request) {
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session?.userId) {
    return {
      session: null,
      response: NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 }),
    };
  }
  return { session, response: null };
}
