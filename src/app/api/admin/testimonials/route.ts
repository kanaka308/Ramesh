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

    const { student_name, video_url, description } = await req.json();

    if (!student_name || !video_url) {
      return NextResponse.json({ success: false, error: 'Missing required testimonial fields.' }, { status: 400 });
    }

    await repo.addTestimonial({
      student_name,
      video_url,
      description: description || '',
      display_order: 0
    });

    revalidatePath('/');

    return NextResponse.json({
      success: true,
      message: 'Testimonial registered successfully.'
    });

  } catch (error: any) {
    console.error('Testimonial database error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!checkAdmin()) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin access.' }, { status: 401 });
    }

    const { id, student_name, video_url, description } = await req.json();

    if (!id || !student_name || !video_url) {
      return NextResponse.json({ success: false, error: 'Missing required fields.' }, { status: 400 });
    }

    await repo.updateTestimonial({
      id: Number(id),
      student_name,
      video_url,
      description: description || ''
    });

    revalidatePath('/');

    return NextResponse.json({
      success: true,
      message: 'Testimonial updated successfully.'
    });

  } catch (error: any) {
    console.error('Testimonial update database error:', error);
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
      return NextResponse.json({ success: false, error: 'Missing testimonial ID.' }, { status: 400 });
    }

    await repo.deleteTestimonial(id);

    revalidatePath('/');

    return NextResponse.json({
      success: true,
      message: 'Testimonial deleted successfully.'
    });

  } catch (error: any) {
    console.error('Testimonial delete database error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error.' }, { status: 500 });
  }
}
