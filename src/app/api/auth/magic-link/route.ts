import { NextRequest, NextResponse } from 'next/server';
import db from '@/db';
import { generateMagicLinkToken } from '@/lib/auth';
import { sendMagicLinkEmail } from '@/lib/mail';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const lowercaseEmail = email.toLowerCase().trim();

    // Check if student exists, otherwise create new student
    const student = db.prepare('SELECT id FROM students WHERE email = ?').get(lowercaseEmail) as { id: number } | undefined;
    
    if (!student) {
      db.prepare('INSERT INTO students (email, created_at) VALUES (?, ?)')
        .run(lowercaseEmail, new Date().toISOString());
    }

    // Generate JWT magic token
    const token = generateMagicLinkToken(lowercaseEmail);

    // Send the email
    await sendMagicLinkEmail(lowercaseEmail, token);

    return NextResponse.json({
      success: true,
      message: 'Magic link sent successfully.'
    });

  } catch (error: any) {
    console.error('Error generating magic link:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected server error occurred.' },
      { status: 500 }
    );
  }
}
