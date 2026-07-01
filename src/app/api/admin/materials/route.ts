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

export async function GET(req: NextRequest) {
  try {
    if (!checkAdmin()) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin access.' }, { status: 401 });
    }
    const materials = await repo.getMaterials();
    return NextResponse.json({ success: true, materials });
  } catch (error: any) {
    console.error('Materials GET error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!checkAdmin()) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin access.' }, { status: 401 });
    }

    const { title, description, price, file_url, whatsapp_enabled, online_enabled } = await req.json();

    if (!title || price === undefined || !file_url) {
      return NextResponse.json({ success: false, error: 'Title, Price, and Google Drive URL are required.' }, { status: 400 });
    }

    const priceNum = Number(price);
    if (isNaN(priceNum) || priceNum < 0) {
      return NextResponse.json({ success: false, error: 'Price must be a positive number.' }, { status: 400 });
    }

    const materials = await repo.getMaterials();
    const newMaterial = {
      id: Date.now(),
      title,
      description: description || '',
      price: priceNum,
      file_url,
      whatsapp_enabled: whatsapp_enabled !== false,
      online_enabled: online_enabled === true
    };

    materials.push(newMaterial);
    await repo.saveMaterials(materials);

    revalidatePath('/courses');

    return NextResponse.json({
      success: true,
      message: 'Material added successfully.',
      material: newMaterial
    });

  } catch (error: any) {
    console.error('Material POST error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!checkAdmin()) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin access.' }, { status: 401 });
    }

    const { id, title, description, price, file_url, whatsapp_enabled, online_enabled } = await req.json();

    if (!id || !title || price === undefined || !file_url) {
      return NextResponse.json({ success: false, error: 'Missing required fields.' }, { status: 400 });
    }

    const priceNum = Number(price);
    if (isNaN(priceNum) || priceNum < 0) {
      return NextResponse.json({ success: false, error: 'Price must be a positive number.' }, { status: 400 });
    }

    const materials = await repo.getMaterials();
    const idx = materials.findIndex(m => m.id === Number(id));

    if (idx === -1) {
      return NextResponse.json({ success: false, error: 'Material not found.' }, { status: 404 });
    }

    materials[idx] = {
      ...materials[idx],
      title,
      description: description || '',
      price: priceNum,
      file_url,
      whatsapp_enabled: whatsapp_enabled !== false,
      online_enabled: online_enabled === true
    };

    await repo.saveMaterials(materials);

    revalidatePath('/courses');

    return NextResponse.json({
      success: true,
      message: 'Material updated successfully.',
      material: materials[idx]
    });

  } catch (error: any) {
    console.error('Material PUT error:', error);
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
      return NextResponse.json({ success: false, error: 'Missing material ID.' }, { status: 400 });
    }

    const materials = await repo.getMaterials();
    const filtered = materials.filter(m => m.id !== Number(id));

    await repo.saveMaterials(filtered);

    revalidatePath('/courses');

    return NextResponse.json({
      success: true,
      message: 'Material deleted successfully.'
    });

  } catch (error: any) {
    console.error('Material DELETE error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error.' }, { status: 500 });
  }
}
