import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
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

    const body = await req.json();
    const { type, id } = body;

    if (!type || !id) {
      return NextResponse.json({ success: false, error: 'Missing update arguments.' }, { status: 400 });
    }

    if (type === 'batch') {
      const { next_date, is_active } = body;
      
      db.prepare('UPDATE bootcamp_batches SET next_date = ?, is_active = ? WHERE id = ?')
        .run(next_date, is_active, id);
        
      return NextResponse.json({ success: true, message: 'Bootcamp batch updated successfully.' });
      
    } else if (type === 'course') {
      const { price } = body;
      
      if (price === undefined || price < 0) {
        return NextResponse.json({ success: false, error: 'Invalid price amount.' }, { status: 400 });
      }
      
      db.prepare('UPDATE recorded_courses SET price = ? WHERE id = ?')
        .run(price, id);

      return NextResponse.json({ success: true, message: 'Recorded course pricing updated successfully.' });
    }

    return NextResponse.json({ success: false, error: 'Unknown update type.' }, { status: 400 });

  } catch (error: any) {
    console.error('Error updating records:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error.' }, { status: 500 });
  }
}
