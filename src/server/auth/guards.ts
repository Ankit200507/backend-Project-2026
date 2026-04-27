import { NextRequest, NextResponse } from 'next/server';
import type { SessionPayload } from '@/server/auth/session';
import { getSessionCookieName, readSessionToken } from '@/server/auth/session';

export async function getSessionFromRequest(request: NextRequest): Promise<SessionPayload | null> {
  const token = request.cookies.get(getSessionCookieName())?.value;
  return readSessionToken(token);
}

export function unauthorizedResponse() {
  return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
}

export function forbiddenResponse() {
  return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
}

