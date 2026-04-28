import { NextRequest, NextResponse } from 'next/server';
import connect from '@/lib/db';
import User from '@/models/User';
import { getSessionFromRequest, unauthorizedResponse } from '@/server/auth/guards';

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return unauthorizedResponse();

    await connect();
    const user = await User.findById(session.sub)
      .populate({
        path: 'nominees.user',
        select: 'firstName lastName email aadharNumber phoneNumber',
        strictPopulate: false
      })
      .lean();

    if (!user) return unauthorizedResponse();

    return NextResponse.json({ success: true, data: user.nominees || [] });
  } catch (error) {
    console.error('Error fetching nominees:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load family information' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return unauthorizedResponse();

    const { aadharNumber, relationship } = await request.json();
    if (!aadharNumber || !relationship) {
      return NextResponse.json({ success: false, error: 'Aadhar number and relationship are required' }, { status: 400 });
    }

    await connect();
    
    // Find the nominee by Aadhar
    const nomineeUser = await User.findOne({ aadharNumber }).lean();
    if (!nomineeUser) {
      return NextResponse.json({ success: false, error: 'User with this Aadhar number not found' }, { status: 404 });
    }

    if (String(nomineeUser._id) === session.sub) {
      return NextResponse.json({ success: false, error: 'Cannot add yourself as a nominee' }, { status: 400 });
    }

    // Add to current user's nominees
    const currentUser = await User.findById(session.sub);
    if (!currentUser) return unauthorizedResponse();

    const nominees = currentUser.nominees || [];

    // Check if already a nominee
    const alreadyExists = nominees.some(
      (n: any) => String(n.user) === String(nomineeUser._id)
    );

    if (alreadyExists) {
      return NextResponse.json({ success: false, error: 'This person is already added as a nominee' }, { status: 400 });
    }

    currentUser.nominees = nominees;
    currentUser.nominees.push({
      user: nomineeUser._id,
      relationship,
    });
    
    await currentUser.save();

    const updatedUser = await User.findById(session.sub)
      .populate({
        path: 'nominees.user',
        select: 'firstName lastName email aadharNumber phoneNumber',
        strictPopulate: false
      })
      .lean();

    return NextResponse.json({ success: true, data: updatedUser?.nominees || [] });
  } catch (error) {
    console.error('Error adding nominee:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add nominee' },
      { status: 500 }
    );
  }
}
