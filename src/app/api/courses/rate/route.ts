import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import repo from '@/db/repo';
import { verifySessionToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user session
    const cookieStore = cookies();
    const sessionToken = cookieStore.get('session_token')?.value;
    const email = sessionToken ? verifySessionToken(sessionToken) : null;

    if (!email) {
      return NextResponse.json({ success: false, error: 'Please sign in to rate this course.' }, { status: 401 });
    }

    // 2. Parse request payload
    const { courseId, rating } = await req.json();

    if (!courseId || rating === undefined) {
      return NextResponse.json({ success: false, error: 'Missing course ID or rating.' }, { status: 400 });
    }

    const courseNum = parseInt(courseId, 10);
    const ratingNum = parseInt(rating, 10);

    if (isNaN(courseNum) || isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json({ success: false, error: 'Invalid rating values.' }, { status: 400 });
    }

    // 3. Verify course access (prevent rating courses they don't own)
    const hasAccess = await repo.checkCourseAccess(email, courseNum);
    if (!hasAccess) {
      return NextResponse.json({ success: false, error: 'You can only rate courses you have purchased.' }, { status: 403 });
    }

    // 4. Save rating
    await repo.submitCourseRating(courseNum, email, ratingNum);

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your rating has been recorded.'
    });

  } catch (error: any) {
    console.error('Course rate POST error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error.' }, { status: 500 });
  }
}
