import { NextRequest, NextResponse } from 'next/server';
import connect from '@/lib/db';
import { authenticateUser } from '@/server/services/userService';
import { createSessionToken, getSessionCookieName, getSessionCookieOptions } from '@/server/auth/session';

export async function POST(request: NextRequest) {
  try {
    await connect();
    const body = await request.json();
    const email = String(body.email ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await authenticateUser(email, password);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const sessionToken = await createSessionToken(user._id, user.role);
    const response = NextResponse.json({ success: true, data: user });
    response.cookies.set(getSessionCookieName(), sessionToken, getSessionCookieOptions());
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Login failed' },
      { status: 500 }
    );
  }
}

