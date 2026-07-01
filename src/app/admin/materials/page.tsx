import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import repo from '@/db/repo';
import { verifySessionToken } from '@/lib/auth';
import MaterialsManagerClient from './MaterialsManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminMaterialsPage() {
  const cookieStore = cookies();
  const token = cookieStore.get('admin_session_token')?.value;
  const isAdmin = token ? verifySessionToken(token) === 'admin' : false;

  if (!isAdmin) {
    redirect('/admin/login');
  }

  // Fetch materials
  const materials = await repo.getMaterials();

  return (
    <MaterialsManagerClient initialMaterials={materials} />
  );
}
