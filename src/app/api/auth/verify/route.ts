import { NextRequest, NextResponse } from 'next/server';
import { verifyMagicLinkToken, generateSessionToken } from '@/lib/auth';
import { config } from '@/lib/config';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(`${config.appUrl}/login?error=missing_token`);
    }

    const email = verifyMagicLinkToken(token);

    if (!email) {
      return NextResponse.redirect(`${config.appUrl}/login?error=expired_token`);
    }

    // Generate standard 30-day session JWT
    const sessionToken = generateSessionToken(email);

    // Prepare redirect to the courses page
    const response = NextResponse.redirect(`${config.appUrl}/courses`);

    // Set secure HttpOnly cookie
    response.cookies.set({
      name: 'session_token',
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;

  } catch (error) {
    console.error('Error verifying magic link token:', error);
    return NextResponse.redirect(`${config.appUrl}/login?error=server_error`);
  }
}
