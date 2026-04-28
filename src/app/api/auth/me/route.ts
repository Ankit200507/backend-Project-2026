import { NextRequest, NextResponse } from 'next/server';
import connect from '@/lib/db';
import User from '@/models/User';
import { getSessionFromRequest, unauthorizedResponse } from '@/server/auth/guards';
import { toAuthUser } from '@/server/services/userService';

type LeanUser = {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
};

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return unauthorizedResponse();

    await connect();
    const user = await User.findById(session.sub)
      .select('email firstName lastName role aadharNumber phoneNumber address accountType')
      .lean();

    if (!user) return unauthorizedResponse();
    
    // We pass the raw user directly or expand toAuthUser to handle these
    // But since the Profile page uses data directly from /api/auth/me, we can just return the user object.
    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error('Me endpoint error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to load user' },
      { status: 500 }
    );
  }
}