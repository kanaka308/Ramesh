import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import repo from '@/db/repo';
import { verifySessionToken } from '@/lib/auth';
import CoursesEditorClient from './CoursesEditorClient';

interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  thumbnail_path: string;
}

export const dynamic = 'force-dynamic';

export default async function AdminCoursesPage() {
  const cookieStore = cookies();
  const token = cookieStore.get('admin_session_token')?.value;
  const isAdmin = token ? verifySessionToken(token) === 'admin' : false;

  if (!isAdmin) {
    redirect('/admin/login');
  }

  // Fetch courses
  const courses = await repo.getRecordedCourses() as Course[];

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-serif)' }} className="gradient-text">Manage Recorded Courses</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '5px' }}>
          Add, edit, or delete student storefront recorded masterclasses and adjust pricing.
        </p>
      </div>

      <CoursesEditorClient initialCourses={courses} />
    </div>
  );
}
