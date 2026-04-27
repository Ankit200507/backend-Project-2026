import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookieName, readSessionToken } from '@/server/auth/session';

const ADMIN_ONLY_PREFIXES = ['/dashboard', '/register-property'];
const AUTH_REQUIRED_PREFIXES = ['/dashboard', '/map', '/properties', '/my-properties', '/register-property'];
const PUBLIC_PATHS = ['/', '/login', '/signup', '/forbidden'];

function pathMatches(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.includes(pathname);
  const isAuthRequired = pathMatches(pathname, AUTH_REQUIRED_PREFIXES);
  const isAdminOnly = pathMatches(pathname, ADMIN_ONLY_PREFIXES);

  if (!isPublic && !isAuthRequired) {
    return NextResponse.next();
  }

  let session = null;
  const token = request.cookies.get(getSessionCookieName())?.value;
  try {
    session = await readSessionToken(token);
  } catch {
    session = null;
  }

  if (pathname === '/login' && session) {
    const target = session.role === 'admin' ? '/dashboard' : '/my-properties';
    return NextResponse.redirect(new URL(target, request.url));
  }

  if (isAuthRequired && !session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminOnly && session?.role !== 'admin') {
    return NextResponse.redirect(new URL('/forbidden', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

