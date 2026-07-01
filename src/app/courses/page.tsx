import { cookies } from 'next/headers';
import repo from '@/db/repo';
import { verifySessionToken } from '@/lib/auth';
import { getSiteSetting } from '@/lib/settings';
import StorefrontClient from './StorefrontClient';

interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  thumbnail_path: string;
}

export const dynamic = 'force-dynamic';

export default async function CoursesPage() {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get('session_token')?.value;
  const email = sessionToken ? verifySessionToken(sessionToken) : null;

  let purchasedCourseIds: number[] = [];
  let purchasedMaterialIds: number[] = [];

  if (email) {
    purchasedCourseIds = await repo.getPurchasedCourseIdsForEmail(email);
    purchasedMaterialIds = await repo.getMaterialPurchasedIdsForEmail(email);
  }

  // Fetch recorded storefront courses
  const courses = await repo.getRecordedCourses();
  
  // Fetch whatsapp number
  const whatsappNumber = await getSiteSetting('whatsapp_number', '919900000000');

  // Fetch course ratings
  const ratings = await repo.getCourseRatings();

  // Fetch materials
  const materials = await repo.getMaterials();

  return (
    <div style={{
      background: 'var(--bg-color)',
      color: 'var(--text-primary)',
      minHeight: '90vh',
      padding: '80px 5% 120px 5%'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <p style={{ color: 'var(--accent-gold)', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '13px', fontWeight: 600, margin: 0 }}>Self-Paced Masterclasses</p>
            <h1 style={{ fontSize: '38px', fontFamily: 'var(--font-serif)', marginTop: '8px' }} className="gradient-text">Recorded Lectures</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '15px' }}>Bite-sized masterclasses with lifetime access. Stream securely or download templates.</p>
          </div>
          
          {email ? (
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px 24px', borderRadius: '30px', border: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '14px', backdropFilter: 'blur(10px)' }}>
              Logged in as: <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>{email}</span>
            </div>
          ) : (
            <a href="/login" style={{
              background: 'var(--accent-gold)',
              color: '#000',
              padding: '12px 30px',
              borderRadius: '30px',
              fontWeight: 600,
              fontSize: '14px',
              boxShadow: '0 8px 20px rgba(245, 196, 83, 0.2)',
              transition: 'all 0.3s ease'
            }}
            id="storefront-signin-btn"
            >Sign In to Learn</a>
          )}
        </div>

        <StorefrontClient 
          courses={courses} 
          purchasedCourseIds={purchasedCourseIds} 
          isAuthenticated={!!email}
          whatsappNumber={whatsappNumber}
          ratings={ratings}
          materials={materials}
          purchasedMaterialIds={purchasedMaterialIds}
        />
      </div>
    </div>
  );
}
