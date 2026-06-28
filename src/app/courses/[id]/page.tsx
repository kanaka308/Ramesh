import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import db from '@/db';
import { verifySessionToken } from '@/lib/auth';

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

  // Resolve student and check purchase completion
  const student = db.prepare('SELECT id FROM students WHERE email = ?').get(email) as { id: number } | undefined;
  if (!student) {
    redirect('/login');
  }

  const purchase = db.prepare("SELECT id FROM purchases WHERE student_id = ? AND course_id = ? AND status = 'completed'")
    .get(student.id, courseId);

  if (!purchase) {
    // Student has not purchased this course yet
    redirect('/courses');
  }

  // Fetch course and its secure video modules
  const course = db.prepare('SELECT * FROM recorded_courses WHERE id = ?').get(courseId) as Course;
  const modules = db.prepare('SELECT * FROM video_modules WHERE course_id = ? ORDER BY sort_order ASC').all(courseId) as VideoModule[];

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

      <div style={{
        display: 'grid',
        gridTemplateColumns: '3fr 1fr',
        gap: '40px',
        alignItems: 'flex-start'
      }}>
        {/* Left Column: Player and Active Video Details */}
        <div className="glass-card" style={{ padding: '24px' }}>
          {modules.length > 0 ? (
            <div>
              {/* Domain-locked Iframe Stream Player */}
              <div style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '16/9',
                borderRadius: '8px',
                overflow: 'hidden',
                background: '#000',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                marginBottom: '20px'
              }}>
                <iframe
                  id="secure-course-stream-player"
                  src={modules[0].secure_video_url}
                  title={modules[0].title}
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none'
                  }}
                />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 600 }}>1. {modules[0].title}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '5px' }}>
                Secure content stream active. Direct downloads and URL sharing are restricted by domain policies.
              </p>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <span style={{ fontSize: '48px' }}>📭</span>
              <p style={{ color: 'var(--text-secondary)', marginTop: '20px' }}>No video modules found for this course yet.</p>
            </div>
          )}
        </div>

        {/* Right Column: Lecture Modules Playlist List */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '12px', marginBottom: '15px' }}>
            Course Playlist
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {modules.map((mod, idx) => (
              <div
                key={mod.id}
                id={`module-item-${mod.id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '8px',
                  background: idx === 0 ? 'rgba(212, 175, 55, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                  border: idx === 0 ? '1px solid var(--accent-gold)' : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{
                  fontSize: '16px',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: idx === 0 ? 'var(--accent-gold)' : 'rgba(255,255,255,0.05)',
                  color: idx === 0 ? '#000' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600
                }}>
                  {idx + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '13px', color: '#fff', fontWeight: idx === 0 ? 600 : 500 }}>{mod.title}</h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Secure Stream</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
