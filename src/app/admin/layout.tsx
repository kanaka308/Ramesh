import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySessionToken } from '@/lib/auth';
import NotificationBadge from './NotificationBadge';

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
  // Let's allow pages to check themselves or keep layout rendering clean.

  return (
    <div className="admin-container">
      {/* Pure CSS Checkbox Toggle for Sidebar */}
      <input type="checkbox" id="admin-sidebar-toggle" style={{ display: 'none' }} />
      
      {/* Tap Overlay to Close Sidebar */}
      <label htmlFor="admin-sidebar-toggle" className="admin-sidebar-overlay" />

      {/* Mobile Sticky Header */}
      <div className="admin-mobile-header">
        <a href="/admin/batches" style={{ fontWeight: 'bold', fontSize: '16px', color: 'var(--accent-gold)' }}>
          Instructor Dashboard
        </a>
        <label htmlFor="admin-sidebar-toggle" className="admin-hamburger">
          <span />
          <span />
          <span />
        </label>
      </div>

      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div style={{ fontWeight: 'bold', fontSize: '18px', color: 'var(--accent-gold)' }}>
          Instructor Dashboard
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <a href="/admin/batches" style={{ padding: '12px 15px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', fontSize: '14px', display: 'block', transition: 'background 0.2s' }}>
            📅 Bootcamp Batches
          </a>
          <a href="/admin/attendees" style={{ padding: '12px 15px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', fontSize: '14px', display: 'block', transition: 'background 0.2s' }}>
            👥 Bootcamp Attendees
          </a>
          <a href="/admin/courses" style={{ padding: '12px 15px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', fontSize: '14px', display: 'block', transition: 'background 0.2s' }}>
            📖 Recorded Courses
          </a>
          <a href="/admin/enrollments" style={{ padding: '12px 15px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', fontSize: '14px', display: 'block', transition: 'background 0.2s' }}>
            🎓 Manual Course Access
          </a>
          <a href="/admin/gallery" style={{ padding: '12px 15px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', fontSize: '14px', display: 'block', transition: 'background 0.2s' }}>
            🖼️ Portfolio Gallery
          </a>
          <a href="/admin/testimonials" style={{ padding: '12px 15px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', fontSize: '14px', display: 'block', transition: 'background 0.2s' }}>
            💬 Testimonials
          </a>
          <a href="/admin/materials" style={{ padding: '12px 15px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', fontSize: '14px', display: 'block', transition: 'background 0.2s' }}>
            📦 Materials & Templates
          </a>
          <a href="/admin/settings" style={{ padding: '12px 15px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', fontSize: '14px', display: 'block', transition: 'background 0.2s' }}>
            ⚙️ Site Settings
          </a>
          <a href="/admin/notifications" style={{ 
            padding: '12px 15px', 
            borderRadius: '8px', 
            background: 'rgba(255,255,255,0.02)', 
            fontSize: '14px', 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            transition: 'background 0.2s' 
          }}>
            <span>🔔 Notifications</span>
            <NotificationBadge />
          </a>
        </nav>
        
        <div style={{ marginTop: 'auto' }}>
          <a href="/" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            ← View Live Site
          </a>
        </div>
      </aside>

      {/* Main Admin Content Workspace */}
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}
