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
    const aadharNumber = body.aadharNumber ? String(body.aadharNumber).trim() : undefined;
    const phoneNumber = body.phoneNumber ? String(body.phoneNumber).trim() : undefined;
    const address = body.address ? String(body.address).trim() : undefined;
    const accountType = body.accountType === 'organization' ? 'organization' : 'individual';

    if (!email || !password || !firstName) {
      return NextResponse.json(
        { success: false, error: 'Email, password, and primary name are required' },
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
      aadharNumber,
      phoneNumber,
      address,
      accountType,
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
