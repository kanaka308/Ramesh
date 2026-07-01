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
    const batchId = searchParams.get('batch_id');

    const registrations = await repo.getRegistrations(batchId || undefined);

    return NextResponse.json({
      success: true,
      registrations
    });

  } catch (error: any) {
    console.error('Registrations GET error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!checkAdmin()) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin access.' }, { status: 401 });
    }

    const { batch_id, student_name, student_email, student_phone, status } = await req.json();

    if (!batch_id || !student_name || !student_email) {
      return NextResponse.json({ success: false, error: 'Missing required fields.' }, { status: 400 });
    }

    await repo.addRegistration({
      batch_id,
      student_name,
      student_email,
      student_phone: student_phone || '',
      status: status || 'enquired'
    });

    return NextResponse.json({
      success: true,
      message: 'Attendee registered successfully.'
    });

  } catch (error: any) {
    console.error('Registration POST error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!checkAdmin()) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin access.' }, { status: 401 });
    }

    const { id, batch_id, student_name, student_email, student_phone, status } = await req.json();

    if (!id || !batch_id || !student_name || !student_email) {
      return NextResponse.json({ success: false, error: 'Missing required fields.' }, { status: 400 });
    }

    await repo.updateRegistration({
      id,
      batch_id,
      student_name,
      student_email,
      student_phone: student_phone || '',
      status: status || 'enquired'
    });

    return NextResponse.json({
      success: true,
      message: 'Attendee updated successfully.'
    });

  } catch (error: any) {
    console.error('Registration PUT error:', error);
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
      return NextResponse.json({ success: false, error: 'Missing attendee ID.' }, { status: 400 });
    }

    await repo.deleteRegistration(id);

    return NextResponse.json({
      success: true,
      message: 'Attendee deleted successfully.'
    });

  } catch (error: any) {
    console.error('Registration DELETE error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error.' }, { status: 500 });
  }
}
