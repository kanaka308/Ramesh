import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import repo from '@/db/repo';
import { verifySessionToken } from '@/lib/auth';
import BatchesEditorClient from './BatchesEditorClient';

interface Bootcamp {
  id: number;
  title: string;
  next_date: string;
  is_active: number;
  description: string;
}

export const dynamic = 'force-dynamic';

export default async function AdminBatchesPage() {
  const cookieStore = cookies();
  const token = cookieStore.get('admin_session_token')?.value;
  const isAdmin = token ? verifySessionToken(token) === 'admin' : false;

  if (!isAdmin) {
    redirect('/admin/login');
  }

  // Fetch batches
  const batches = await repo.getBootcampBatches() as Bootcamp[];

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-serif)' }} className="gradient-text">Manage Bootcamp Batches</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '5px' }}>
          Add, edit/rename, or delete upcoming schedules and toggle registration availability for on-site cohorts.
        </p>
      </div>

      <BatchesEditorClient initialBatches={batches} />
    </div>
  );
}
