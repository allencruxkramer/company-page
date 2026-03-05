import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const PUBLIC_PATHS = ['/auth', '/auth/verify', '/api/auth/send', '/api/auth/callback'];

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('AUTH_SECRET is not set');
  return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public auth routes
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get('session')?.value;

  if (sessionCookie) {
    try {
      const { payload } = await jwtVerify(sessionCookie, getSecret());
      if (payload.type === 'session') return NextResponse.next();
    } catch {
      // invalid or expired
    }
  }

  const from = encodeURIComponent(pathname);
  return NextResponse.redirect(new URL(`/auth?from=${from}`, request.url));
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
