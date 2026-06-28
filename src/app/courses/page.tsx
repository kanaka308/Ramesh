import { cookies } from 'next/headers';
import db from '@/db';
import { verifySessionToken } from '@/lib/auth';
import StorefrontClient from './StorefrontClient';

interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  thumbnail_path: string;
}

interface Purchase {
  course_id: number;
  status: string;
}

export const dynamic = 'force-dynamic';

export default async function CoursesPage() {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get('session_token')?.value;
  const email = sessionToken ? verifySessionToken(sessionToken) : null;

  let studentId: number | null = null;
  let purchasedCourseIds: number[] = [];

  if (email) {
    const student = db.prepare('SELECT id FROM students WHERE email = ?').get(email) as { id: number } | undefined;
    if (student) {
      studentId = student.id;
      const purchases = db.prepare("SELECT course_id FROM purchases WHERE student_id = ? AND status = 'completed'").all(studentId) as Purchase[];
      purchasedCourseIds = purchases.map(p => p.course_id);
    }
  }

  // Fetch recorded storefront courses
  const courses = db.prepare('SELECT * FROM recorded_courses').all() as Course[];

  return (
    <div style={{
      background: 'var(--bg-color)',
      color: 'var(--text-primary)',
      minHeight: '90vh',
      padding: '60px 5%'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '36px', fontFamily: 'var(--font-serif)' }} className="gradient-text">Recorded Lectures</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Bite-sized masterclasses with lifetime access. Stream securely anytime.</p>
        </div>
        
        {email ? (
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 20px', borderRadius: '30px', border: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '14px' }}>
            Logged in as: <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>{email}</span>
          </div>
        ) : (
          <a href="/login" style={{
            background: 'var(--accent-gold)',
            color: '#000',
            padding: '10px 24px',
            borderRadius: '30px',
            fontWeight: 600,
            fontSize: '14px'
          }}>Sign In to Learn</a>
        )}
      </div>

      <StorefrontClient 
        courses={courses} 
        purchasedCourseIds={purchasedCourseIds} 
        isAuthenticated={!!email}
      />
    </div>
  );
}
