import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import repo from '@/db/repo';
import { verifySessionToken } from '@/lib/auth';
import NotificationsClient from './NotificationsClient';

export const dynamic = 'force-dynamic';

export default async function AdminNotificationsPage() {
  const cookieStore = cookies();
  const token = cookieStore.get('admin_session_token')?.value;
  const isAdmin = token ? verifySessionToken(token) === 'admin' : false;

  if (!isAdmin) {
    redirect('/admin/login');
  }

  // Fetch all notifications from database
  const notifications = await repo.getNotifications();

  // Automatically mark all as read when opening this page
  try {
    await repo.markNotificationsRead();
  } catch (err) {
    console.error('Failed to mark notifications as read:', err);
  }

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-serif)' }} className="gradient-text">Payment Notifications</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '5px' }}>
          Real-time alerts for online payments completed by students purchasing recorded courses.
        </p>
      </div>

      <NotificationsClient initialNotifications={notifications} />
    </div>
  );
}
