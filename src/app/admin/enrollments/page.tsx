import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import repo from '@/db/repo';
import { verifySessionToken } from '@/lib/auth';
import EnrollmentsClient from './EnrollmentsClient';

export const dynamic = 'force-dynamic';

interface Course {
  id: number;
  title: string;
}

interface Enrollment {
  id: number;
  payment_id: string;
  purchased_at: string;
  student_email: string;
  course_title: string;
  course_id: number;
}

export default async function AdminEnrollmentsPage() {
  const cookieStore = cookies();
  const token = cookieStore.get('admin_session_token')?.value;
  const isAdmin = token ? verifySessionToken(token) === 'admin' : false;

  if (!isAdmin) {
    redirect('/admin/login');
  }

  // Fetch all completed purchases
  const enrollments = (await repo.getEnrollments())
    .filter(e => e.status === 'completed') as Enrollment[];

  // Fetch all courses for selector
  const courses = await repo.getRecordedCourses() as Course[];

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-serif)' }} className="gradient-text">Manual Course Access</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '5px' }}>
          Grant direct access to recorded courses for offline bootcamp students, friends, or manual cash payments.
        </p>
      </div>

      <EnrollmentsClient initialEnrollments={enrollments} courses={courses} />
    </div>
  );
}
