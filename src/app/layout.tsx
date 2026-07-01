import '../styles/global.css';
import type { Metadata } from 'next';
import { getSiteSetting } from '@/lib/settings';

export async function generateMetadata(): Promise<Metadata> {
  const title = await getSiteSetting('site_title', 'Ramclicks');
  return {
    title,
    description: 'Elite 30-day bootcamps in Photography & Cinematography and professional recorded masterclasses.',
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const logoFirst = await getSiteSetting('site_logo_first', 'RAM');
  const logoSecond = await getSiteSetting('site_logo_second', 'CLICKS');
  const siteTitle = await getSiteSetting('site_title', 'Ramclicks');

  const whatsappNumber = await getSiteSetting('whatsapp_number', '919900000000');
  const whatsappMsg = await getSiteSetting('whatsapp_custom_message', 'Hi Ramclicks, I would like to enquire about your photography bootcamps and recorded courses!');
  const encodedMsg = encodeURIComponent(whatsappMsg);
  const waUrl = `https://wa.me/${whatsappNumber}?text=${encodedMsg}`;

  return (
    <html lang="en">
      <body id="academy-root-layout">
        <header style={{
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          padding: '20px 5%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(10, 10, 12, 0.8)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ fontWeight: 'bold', fontSize: '20px', letterSpacing: '1px' }}>
            <a href="/" id="nav-logo-link" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img 
                src="/logo.jpg" 
                alt="Ramclicks Logo" 
                style={{ 
                  height: '36px', 
                  width: '36px', 
                  borderRadius: '50%', 
                  objectFit: 'cover', 
                  border: '1px solid rgba(255, 255, 255, 0.1)' 
                }} 
              />
              <span>
                <span style={{ color: 'var(--accent-gold)' }}>{logoFirst}</span> {logoSecond}
              </span>
            </a>
          </div>
          <nav style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
            <a href="/#portfolio-section" id="nav-portfolio" style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>Portfolio</a>
            <a href="/#bootcamp-section" id="nav-bootcamps" style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>Bootcamps</a>
            <a href="/courses" id="nav-courses" style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>Recorded Lectures</a>
            <a href="/login" id="nav-login-btn" style={{
              background: 'transparent',
              border: '1px solid var(--accent-gold)',
              color: 'var(--accent-gold)',
              padding: '8px 20px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: 500
            }}>Student Portal</a>
          </nav>
        </header>
        
        <main>{children}</main>
        
        <footer style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          padding: '40px 5%',
          textAlign: 'center',
          background: '#070709',
          color: 'var(--text-secondary)',
          fontSize: '14px'
        }}>
          <p>© 2026 {siteTitle}. All rights reserved.</p>
          <p style={{ marginTop: '10px', fontSize: '12px', color: '#555' }}>
            Terms of Service | Privacy Policy | Secure Payments via Razorpay/Cashfree
          </p>
        </footer>

        {/* Floating WhatsApp Button */}
        <a 
          href={waUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          id="floating-whatsapp-btn"
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            width: '60px',
            height: '60px',
            background: '#25D366',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 30px rgba(37, 211, 102, 0.4)',
            zIndex: 9999,
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
          className="whatsapp-float-btn"
          title="Chat with us on WhatsApp"
        >
          <svg style={{ width: '32px', height: '32px', fill: '#fff' }} viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.858.002-2.635-1.023-5.11-2.884-6.974C16.588 1.91 14.12 .882 11.488.882c-5.44 0-9.863 4.424-9.867 9.864-.001 1.69.444 3.344 1.288 4.791l-.999 3.647 3.727-.977zm11.523-7.82c-.3-.149-1.772-.875-2.046-.975-.274-.1-.474-.15-.674.15-.2.3-.773.975-.95 1.174-.173.2-.347.224-.647.075-.3-.15-1.263-.465-2.403-1.482-.888-.793-1.488-1.77-1.663-2.07-.174-.3-.019-.462.13-.61.135-.133.3-.349.45-.523.15-.174.2-.3.3-.499.1-.2.05-.375-.025-.524-.075-.15-.674-1.623-.924-2.224-.244-.589-.493-.51-.674-.519-.174-.007-.374-.009-.573-.009-.2 0-.525.075-.8.374-.275.3-1.05 1.024-1.05 2.5 0 1.475 1.075 2.9 1.225 3.1.15.2 2.11 3.224 5.116 4.525.715.31 1.273.495 1.71.635.717.227 1.37.195 1.885.118.574-.086 1.772-.725 2.02-.142 4.25-.7 4.25-1.299.175-1.424-.075-.125-.275-.199-.575-.349z"/>
          </svg>
        </a>
      </body>
    </html>
  );
}
