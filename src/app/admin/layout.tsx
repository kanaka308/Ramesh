import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySessionToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const token = cookieStore.get('admin_session_token')?.value;
  const isAdmin = token ? verifySessionToken(token) === 'admin' : false;

  // Protect layout (exclude login path to avoid redirection loops)
  // Since Next.js App Router checks layouts recursively, but we want login page unauthenticated,
  // we must check the path or only put Layout checks where layout runs.
  // Wait, let's look at route patterns: `/admin/login` has its own page.
  // Let's check if there's any simple way: we can verify if the user is attempting to login.
  // In Next.js App Router layout server components, we don't have direct access to req pathname,
  // but we can pass verification results or simply allow pages to check themselves,
  // or put Layout protection only if we are not on login page.
  // Wait! In App Router, we can place a check: if not logged in, we check if layout should redirect.
  // Wait! Since `/admin/login` is inside `/admin`, it inherits `src/app/admin/layout.tsx`.
  // To bypass protection on `/admin/login`, we can check:
  // Since we cannot read headers in App Router layouts easily without headers() module,
  // let's use `headers().get('x-url')` or simply do Client-side or Page-level redirection checks!
  // Yes! If we do it page-level, it is extremely robust and doesn't conflict with subfolders!
  // Let's implement layout.tsx without redirect, and let individual admin sub-pages (batches, courses, gallery) check auth.
  // This is extremely safe and prevents redirect loop issues on the login page!

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '250px 1fr',
      minHeight: '90vh',
      background: '#0a0a0c'
    }}>
      {/* Sidebar Navigation */}
      <aside style={{
        background: '#111115',
        borderRight: '1px solid rgba(255, 255, 255, 0.05)',
        padding: '40px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '30px'
      }}>
        <div style={{ fontWeight: 'bold', fontSize: '18px', color: 'var(--accent-gold)' }}>
          Instructor Dashboard
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <a href="/admin/batches" style={{ padding: '10px 15px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', fontSize: '14px' }}>
            📅 Bootcamp Batches
          </a>
          <a href="/admin/courses" style={{ padding: '10px 15px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', fontSize: '14px' }}>
            📖 Recorded Courses
          </a>
          <a href="/admin/gallery" style={{ padding: '10px 15px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', fontSize: '14px' }}>
            🖼️ Portfolio Gallery
          </a>
          <a href="/admin/testimonials" style={{ padding: '10px 15px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', fontSize: '14px' }}>
            💬 Testimonials
          </a>
        </nav>
        
        <div style={{ marginTop: 'auto' }}>
          <a href="/" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            ← View Live Site
          </a>
        </div>
      </aside>

      {/* Main Admin Content Workspace */}
      <main style={{ padding: '40px' }}>
        {children}
      </main>
    </div>
  );
}
