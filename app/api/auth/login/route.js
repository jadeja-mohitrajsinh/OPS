import { NextResponse } from 'next/server';

export async function POST(request) {
  return NextResponse.json(
    { success: false, error: 'Password login has been retired. Use Google primary-account sign-in.' },
    { status: 410 },
  );
}
