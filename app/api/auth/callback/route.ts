import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, signToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const from = searchParams.get('from');

  if (!token) {
    return NextResponse.redirect(new URL('/auth?error=missing_token', request.url));
  }

  const payload = await verifyToken(token);

  if (!payload || payload.type !== 'magic-link') {
    return NextResponse.redirect(new URL('/auth?error=invalid_token', request.url));
  }

  if (!payload.email.toLowerCase().endsWith('@cruxclimate.com')) {
    return NextResponse.redirect(new URL('/auth?error=invalid_domain', request.url));
  }

  // Validate redirect target — must be a relative path
  const redirect = from && from.startsWith('/') && !from.startsWith('//') ? from : '/';

  const sessionToken = await signToken({ email: payload.email, type: 'session' }, '7d');

  const response = NextResponse.redirect(new URL(redirect, request.url));
  response.cookies.set('session', sessionToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

  return response;
}
