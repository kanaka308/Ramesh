import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import repo from '@/db/repo';
import { verifySessionToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function checkAdmin() {
  const cookieStore = cookies();
  const token = cookieStore.get('admin_session_token')?.value;
  return token ? verifySessionToken(token) === 'admin' : false;
}

export async function GET(req: NextRequest) {
  try {
    if (!checkAdmin()) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin access.' }, { status: 401 });
    }

    // Fetch all completed purchases
    const enrollments = (await repo.getEnrollments())
      .filter((e: any) => e.status === 'completed');

    return NextResponse.json({
      success: true,
      enrollments
    });

  } catch (error: any) {
    console.error('Enrollments GET error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!checkAdmin()) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin access.' }, { status: 401 });
    }

    const { email, course_id } = await req.json();

    if (!email || !course_id) {
      return NextResponse.json({ success: false, error: 'Email and Course ID are required.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if already has completed access
    const hasAccess = await repo.checkCourseAccess(cleanEmail, course_id);

    if (hasAccess) {
      return NextResponse.json({ success: false, error: 'Student already has access to this course.' }, { status: 400 });
    }

    // Grant access
    await repo.grantManualAccess(cleanEmail, Number(course_id));

    return NextResponse.json({
      success: true,
      message: 'Access granted successfully.'
    });

  } catch (error: any) {
    console.error('Enrollments POST error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!checkAdmin()) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin access.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing enrollment purchase ID.' }, { status: 400 });
    }

    await repo.deleteEnrollment(id);

    return NextResponse.json({
      success: true,
      message: 'Access revoked successfully.'
    });

  } catch (error: any) {
    console.error('Enrollments DELETE error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error.' }, { status: 500 });
  }
}
