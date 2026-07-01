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

export async function POST(req: NextRequest) {
  try {
    if (!checkAdmin()) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin access.' }, { status: 401 });
    }

    const { oldCategory, newCategory } = await req.json();

    if (!oldCategory || !newCategory || !newCategory.trim()) {
      return NextResponse.json({ success: false, error: 'Old category and valid new category name are required.' }, { status: 400 });
    }

    const cleanNew = newCategory.trim();

    // Update all gallery items matching the old category to the new category name
    await repo.renameGalleryCategory(oldCategory, cleanNew);

    return NextResponse.json({
      success: true,
      message: `Category successfully renamed from "${oldCategory}" to "${cleanNew}".`
    });

  } catch (error: any) {
    console.error('Rename category error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error.' }, { status: 500 });
  }
}
