import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';
import db from '@/db';
import { verifySessionToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // Validate admin session
    const cookieStore = cookies();
    const token = cookieStore.get('admin_session_token')?.value;
    const isAdmin = token ? verifySessionToken(token) === 'admin' : false;

    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin access.' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const caption = formData.get('caption') as string || '';
    const category = formData.get('category') as string || 'General';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded.' }, { status: 400 });
    }

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'images');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate unique file name
    const fileExtension = file.name.split('.').pop();
    const uniqueFileName = `upload_${Date.now()}.${fileExtension}`;
    const filePath = path.join(uploadDir, uniqueFileName);

    // Save file buffer to local disk
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    // Insert record into portfolio_images database table
    const publicUrlPath = `/images/${uniqueFileName}`;
    db.prepare('INSERT INTO portfolio_images (file_path, caption, category, display_order) VALUES (?, ?, ?, ?)')
      .run(publicUrlPath, caption, category, 0);

    return NextResponse.json({
      success: true,
      message: 'Portfolio image uploaded and registered successfully.',
      file_path: publicUrlPath
    });

  } catch (error: any) {
    console.error('Gallery upload error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error during upload.' }, { status: 500 });
  }
}
