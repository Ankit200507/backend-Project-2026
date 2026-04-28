import { NextRequest, NextResponse } from 'next/server';
import connect from '@/lib/db';
import User from '@/models/User';
import { getSessionFromRequest, unauthorizedResponse } from '@/server/auth/guards';
import { toAuthUser } from '@/server/services/userService';

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return unauthorizedResponse();

    await connect();
    const searchParams = request.nextUrl.searchParams;
    const aadharNumber = searchParams.get('aadharNumber');

    if (!aadharNumber) {
      return NextResponse.json(
        { success: false, error: 'Aadhar number is required' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ aadharNumber }).lean();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        aadharNumber: user.aadharNumber,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (error) {
    console.error('Error searching user:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to search user' },
      { status: 500 }
    );
  }
}
