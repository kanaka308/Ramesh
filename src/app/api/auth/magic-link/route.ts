import { NextRequest, NextResponse } from 'next/server';
import repo from '@/db/repo';
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
    const student = await repo.getStudentByEmail(lowercaseEmail);
    
    if (!student) {
      await repo.createStudent(lowercaseEmail);
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
