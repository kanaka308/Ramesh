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

    const { title, next_date, is_active, description, pay_now_enabled } = await req.json();

    if (!title || !next_date) {
      return NextResponse.json({ success: false, error: 'Missing required fields.' }, { status: 400 });
    }

    const newId = await repo.addBootcampBatch({
      title,
      next_date,
      is_active: is_active ?? 1,
      description: description || ''
    });

    if (pay_now_enabled !== undefined) {
      await repo.setBootcampPayNowEnabled(newId, pay_now_enabled === true);
    }

    revalidatePath('/');

    return NextResponse.json({
      success: true,
      message: 'Bootcamp batch added successfully.'
    });

  } catch (error: any) {
    console.error('Batch add error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!checkAdmin()) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin access.' }, { status: 401 });
    }

    const { id, title, next_date, is_active, description, pay_now_enabled } = await req.json();

    if (!id || !title || !next_date) {
      return NextResponse.json({ success: false, error: 'Missing required fields.' }, { status: 400 });
    }

    await repo.updateBootcampBatch({
      id: Number(id),
      title,
      next_date,
      is_active: is_active ?? 1,
      description: description || ''
    });

    if (pay_now_enabled !== undefined) {
      await repo.setBootcampPayNowEnabled(Number(id), pay_now_enabled === true);
    }

    revalidatePath('/');

    return NextResponse.json({
      success: true,
      message: 'Bootcamp batch updated successfully.'
    });

  } catch (error: any) {
    console.error('Batch update error:', error);
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
      return NextResponse.json({ success: false, error: 'Missing batch ID.' }, { status: 400 });
    }

    await repo.deleteBootcampBatch(id);

    revalidatePath('/');

    return NextResponse.json({
      success: true,
      message: 'Bootcamp batch deleted successfully.'
    });

  } catch (error: any) {
    console.error('Batch delete error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error.' }, { status: 500 });
  }
}
