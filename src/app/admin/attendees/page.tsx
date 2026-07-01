import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import repo from '@/db/repo';
import { verifySessionToken } from '@/lib/auth';
import AttendeesManagerClient from './AttendeesManagerClient';

export const dynamic = 'force-dynamic';

interface Batch {
  id: number;
  title: string;
}

interface Registration {
  id: number;
  batch_id: number;
  batch_title: string;
  student_name: string;
  student_email: string;
  student_phone: string;
  status: string;
  registered_at: string;
}

export default async function AdminAttendeesPage() {
  const cookieStore = cookies();
  const token = cookieStore.get('admin_session_token')?.value;
  const isAdmin = token ? verifySessionToken(token) === 'admin' : false;

  if (!isAdmin) {
    redirect('/admin/login');
  }

  // Fetch all registrations
  const registrations = await repo.getRegistrations() as Registration[];

  // Fetch all batches for dropdown selection
  const batches = await repo.getBootcampBatches() as Batch[];

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-serif)' }} className="gradient-text">Manage Bootcamp Attendees</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '5px' }}>
          Perform CRUD operations on students registered in cohorts. Track status from Inquiry to Enrolled.
        </p>
      </div>

      <AttendeesManagerClient initialRegistrations={registrations} batches={batches} />
    </div>
  );
}
