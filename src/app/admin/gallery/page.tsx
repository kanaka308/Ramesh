import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import repo from '@/db/repo';
import { verifySessionToken } from '@/lib/auth';
import GalleryManagerClient from './GalleryManagerClient';

interface GalleryItem {
  id: number;
  file_path: string;
  caption: string;
  category: string;
}

export const dynamic = 'force-dynamic';

export default async function AdminGalleryPage() {
  const cookieStore = cookies();
  const token = cookieStore.get('admin_session_token')?.value;
  const isAdmin = token ? verifySessionToken(token) === 'admin' : false;

  if (!isAdmin) {
    redirect('/admin/login');
  }

  // Fetch gallery items
  const items = (await repo.getPortfolioImages()).sort((a, b) => b.id - a.id) as GalleryItem[];

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-serif)' }} className="gradient-text">Manage Portfolio Gallery</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '5px' }}>
          Upload high-resolution photographs or cinematography screen frames directly to the homepage gallery.
        </p>
      </div>

      <GalleryManagerClient initialItems={items} />
    </div>
  );
}
