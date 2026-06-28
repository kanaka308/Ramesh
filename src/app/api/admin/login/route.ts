import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminCredentials, generateSessionToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    const isValid = verifyAdminCredentials(username, password);

    if (isValid) {
      // Generate admin session JWT
      const token = generateSessionToken('admin');
      
      const response = NextResponse.json({ success: true, message: 'Logged in successfully.' });
      
      response.cookies.set({
        name: 'admin_session_token',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 24 * 60 * 60, // 1 day
      });

      return response;
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password credentials.' },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server login error.' },
      { status: 500 }
    );
  }
}
