import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import repo from '@/db/repo';
import { verifySessionToken } from '@/lib/auth';
import CoursePlayerClient from './CoursePlayerClient';

interface Course {
  id: number;
  title: string;
  description: string;
}

interface VideoModule {
  id: number;
  title: string;
  secure_video_url: string;
  sort_order: number;
}

export const dynamic = 'force-dynamic';

export default async function CoursePlayerPage({ params }: { params: { id: string } }) {
  const courseId = parseInt(params.id, 10);
  if (isNaN(courseId)) {
    redirect('/courses');
  }

  // Verify auth session
  const cookieStore = cookies();
  const sessionToken = cookieStore.get('session_token')?.value;
  const email = sessionToken ? verifySessionToken(sessionToken) : null;

  if (!email) {
    redirect(`/login?redirect=/courses/${courseId}`);
  }

  const hasAccess = await repo.checkCourseAccess(email, courseId);
  if (!hasAccess) {
    // Student has not purchased this course yet
    redirect('/courses');
  }

  // Fetch course and its secure video modules
  const course = await repo.getRecordedCourse(courseId);
  if (!course) {
    redirect('/courses');
  }
  const modules = await repo.getVideoModules(courseId);

  // Fetch student rating if any
  const allRatings = await repo.getCourseRatings();
  const courseRatings = allRatings[String(courseId)] || {};
  const initialUserRating = email ? (courseRatings[email] || null) : null;

  return (
    <div style={{
      background: 'var(--bg-color)',
      color: 'var(--text-primary)',
      minHeight: '90vh',
      padding: '40px 5%'
    }}>
      <div style={{ marginBottom: '30px' }}>
        <a href="/courses" style={{ color: 'var(--accent-gold)', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          ← Back to Storefront
        </a>
        <h1 style={{ fontSize: '32px', fontFamily: 'var(--font-serif)', marginTop: '10px' }} className="gradient-text">
          {course.title}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '6px' }}>{course.description}</p>
      </div>

      <CoursePlayerClient 
        modules={modules} 
        courseId={courseId} 
        initialUserRating={initialUserRating} 
      />
    </div>
  );
}
