import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import db from '@/db';
import { verifySessionToken } from '@/lib/auth';
import TestimonialsManagerClient from './TestimonialsManagerClient';

interface Testimonial {
  id: number;
  student_name: string;
  video_url: string;
  description: string;
}

export const dynamic = 'force-dynamic';

export default async function AdminTestimonialsPage() {
  const cookieStore = cookies();
  const token = cookieStore.get('admin_session_token')?.value;
  const isAdmin = token ? verifySessionToken(token) === 'admin' : false;

  if (!isAdmin) {
    redirect('/admin/login');
  }

  // Fetch testimonials
  const list = db.prepare('SELECT * FROM testimonials ORDER BY id DESC').all() as Testimonial[];

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-serif)' }} className="gradient-text">Manage Alumni Testimonials</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '5px' }}>
          Add or edit video testimonial embeds showing off alumni success reviews on the front page.
        </p>
      </div>

      <TestimonialsManagerClient initialList={list} />
    </div>
  );
}
