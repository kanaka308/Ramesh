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

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json({ success: false, error: 'Missing courseId parameter.' }, { status: 400 });
    }

    const lectures = await repo.getVideoModules(courseId);

    return NextResponse.json({
      success: true,
      lectures
    });

  } catch (error: any) {
    console.error('Lectures GET error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!checkAdmin()) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin access.' }, { status: 401 });
    }

    const { course_id, title, secure_video_url, sort_order } = await req.json();

    if (!course_id || !title || !secure_video_url) {
      return NextResponse.json({ success: false, error: 'Missing required fields.' }, { status: 400 });
    }

    const finalSort = parseInt(sort_order, 10) || 0;

    const lectureId = await repo.addVideoModule({
      course_id: Number(course_id),
      title,
      secure_video_url,
      sort_order: finalSort
    });

    return NextResponse.json({
      success: true,
      message: 'Lecture added successfully.',
      lecture_id: lectureId
    });

  } catch (error: any) {
    console.error('Lecture add error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!checkAdmin()) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin access.' }, { status: 401 });
    }

    const { id, title, secure_video_url, sort_order } = await req.json();

    if (!id || !title || !secure_video_url) {
      return NextResponse.json({ success: false, error: 'Missing required fields.' }, { status: 400 });
    }

    const finalSort = parseInt(sort_order, 10) || 0;

    await repo.updateVideoModule({
      id: Number(id),
      title,
      secure_video_url,
      sort_order: finalSort
    });

    return NextResponse.json({
      success: true,
      message: 'Lecture updated successfully.'
    });

  } catch (error: any) {
    console.error('Lecture update error:', error);
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
      return NextResponse.json({ success: false, error: 'Missing lecture ID.' }, { status: 400 });
    }

    await repo.deleteVideoModule(id);

    return NextResponse.json({
      success: true,
      message: 'Lecture deleted successfully.'
    });

  } catch (error: any) {
    console.error('Lecture delete error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error.' }, { status: 500 });
  }
}
