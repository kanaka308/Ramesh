import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import repo from '@/db/repo';
import { verifySessionToken } from '@/lib/auth';
import SettingsClient from './SettingsClient';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const cookieStore = cookies();
  const token = cookieStore.get('admin_session_token')?.value;
  const isAdmin = token ? verifySessionToken(token) === 'admin' : false;

  if (!isAdmin) {
    redirect('/admin/login');
  }

  // Fetch all current settings
  const rows = await repo.getSiteSettings();
  const initialSettings: Record<string, string> = {
    site_title: 'Vijayapur Academy of Photography & Production',
    site_logo_first: 'VIJAYAPUR',
    site_logo_second: 'ACADEMY',
    site_hero_pre: 'Vijayapur Academy of Photography & Production',
    site_hero_title: "Capture Life's Greatest Masterpieces",
    site_hero_subtitle: 'Learn elite, hands-on production directly from industry directors. Standard equipment, home-cooked food, and free premium stay provided.',
    whatsapp_number: '919900000000',
    whatsapp_custom_message: 'Hi Ramclicks, I would like to enquire about your photography bootcamps and recorded courses!',
  };

  rows.forEach(r => {
    initialSettings[r.key] = r.value;
  });

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-serif)' }} className="gradient-text">Site Customization Settings</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '5px' }}>
          Fully customize your homepage headers, title, logos, and WhatsApp contact details.
        </p>
      </div>

      <SettingsClient initialSettings={initialSettings} />
    </div>
  );
}
