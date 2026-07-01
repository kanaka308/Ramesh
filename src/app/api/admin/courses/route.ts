import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import repo from '@/db/repo';
import { verifySessionToken } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

function checkAdmin() {
  const cookieStore = cookies();
  const token = cookieStore.get('admin_session_token')?.value;
  return token ? verifySessionToken(token) === 'admin' : false;
}

export async function POST(req: NextRequest) {
  try {
    if (!checkAdmin()) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin access.' }, { status: 401 });
    }

    const { title, description, price, thumbnail_path, pay_now_enabled } = await req.json();

    if (!title || price === undefined || !thumbnail_path) {
      return NextResponse.json({ success: false, error: 'Missing required fields.' }, { status: 400 });
    }

    const newId = await repo.addRecordedCourse({
      title,
      description: description || '',
      price: Number(price),
      thumbnail_path
    });

    if (pay_now_enabled !== undefined) {
      await repo.setCoursePayNowEnabled(newId, pay_now_enabled === true);
    }

    revalidatePath('/');
    revalidatePath('/courses');

    return NextResponse.json({
      success: true,
      message: 'Course added successfully.'
    });

  } catch (error: any) {
    console.error('Course add error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!checkAdmin()) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin access.' }, { status: 401 });
    }

    const { id, title, description, price, thumbnail_path, pay_now_enabled } = await req.json();

    if (!id || !title || price === undefined || !thumbnail_path) {
      return NextResponse.json({ success: false, error: 'Missing required fields.' }, { status: 400 });
    }

    await repo.updateRecordedCourse({
      id: Number(id),
      title,
      description: description || '',
      price: Number(price),
      thumbnail_path
    });

    if (pay_now_enabled !== undefined) {
      await repo.setCoursePayNowEnabled(Number(id), pay_now_enabled === true);
    }

    revalidatePath('/');
    revalidatePath('/courses');

    return NextResponse.json({
      success: true,
      message: 'Course updated successfully.'
    });

  } catch (error: any) {
    console.error('Course update error:', error);
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
      return NextResponse.json({ success: false, error: 'Missing course ID.' }, { status: 400 });
    }

    await repo.deleteRecordedCourse(id);

    revalidatePath('/');
    revalidatePath('/courses');

    return NextResponse.json({
      success: true,
      message: 'Course deleted successfully.'
    });

  } catch (error: any) {
    console.error('Course delete error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error.' }, { status: 500 });
  }
}
