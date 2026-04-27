import { NextRequest, NextResponse } from 'next/server';
import connect from '@/lib/db';
import User from '@/models/User';
import { hashPassword } from '@/server/auth/password';
import { createSessionToken, getSessionCookieName, getSessionCookieOptions } from '@/server/auth/session';
import { toAuthUser } from '@/server/services/userService';

export async function POST(request: NextRequest) {
  try {
    await connect();
    const body = await request.json();
    const email = String(body.email ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');
    const firstName = String(body.firstName ?? '').trim();
    const lastName = String(body.lastName ?? '').trim();

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email }).lean();
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    const created = await User.create({
      email,
      password: hashPassword(password),
      firstName,
      lastName,
      role: 'user',
    });

    const userObj = created.toObject();
    const authUser = toAuthUser(userObj as any);

    const sessionToken = await createSessionToken(authUser._id, authUser.role);
    const response = NextResponse.json({ success: true, data: authUser });
    response.cookies.set(getSessionCookieName(), sessionToken, getSessionCookieOptions());
    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Signup failed' },
      { status: 500 }
    );
  }
}
