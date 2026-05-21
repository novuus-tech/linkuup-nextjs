import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const AUTH_PREFIX = '/auth';
const API_PREFIX = '/api';

async function isTokenValid(token: string): Promise<boolean> {
  const secret = process.env.JWT_SECRET;
  if (!secret) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Let API routes handle their own auth
  if (pathname.startsWith(API_PREFIX)) return NextResponse.next();

  const accessToken = req.cookies.get('accessToken')?.value;
  const authenticated = accessToken ? await isTokenValid(accessToken) : false;

  // Unauthenticated user trying to access a protected page
  if (!authenticated && !pathname.startsWith(AUTH_PREFIX)) {
    const url = req.nextUrl.clone();
    url.pathname = '/auth/signin';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  // Authenticated user trying to access an auth page
  if (authenticated && pathname.startsWith(AUTH_PREFIX)) {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
};
