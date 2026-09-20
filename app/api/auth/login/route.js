import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { password } = await request.json();
    const correctPassword = process.env.APP_PASSWORD || 'admin123';

    if (password === correctPassword) {
      const response = NextResponse.json({ success: true, message: 'Authenticated successfully' });
      // Set secure HTTP-only cookie
      response.cookies.set({
        name: 'personal_os_auth',
        value: 'authenticated_session_token_active',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
      return response;
    } else {
      return NextResponse.json({ success: false, error: 'Incorrect password' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
