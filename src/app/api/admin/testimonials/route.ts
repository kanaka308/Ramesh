import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/db';
import { verifySessionToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // Validate admin session
    const cookieStore = cookies();
    const token = cookieStore.get('admin_session_token')?.value;
    const isAdmin = token ? verifySessionToken(token) === 'admin' : false;

    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin access.' }, { status: 401 });
    }

    const { student_name, video_url, description } = await req.json();

    if (!student_name || !video_url) {
      return NextResponse.json({ success: false, error: 'Missing required testimonial fields.' }, { status: 400 });
    }

    // Insert testimonial into database
    db.prepare('INSERT INTO testimonials (student_name, video_url, description, display_order) VALUES (?, ?, ?, ?)')
      .run(student_name, video_url, description || '', 0);

    return NextResponse.json({
      success: true,
      message: 'Testimonial registered successfully.'
    });

  } catch (error: any) {
    console.error('Testimonial database error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error.' }, { status: 500 });
  }
}
