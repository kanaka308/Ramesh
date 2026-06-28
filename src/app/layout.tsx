import '../styles/global.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vijayapur Academy of Photography & Production',
  description: 'Elite 30-day bootcamps in Photography & Cinematography and professional recorded masterclasses.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
            <a href="/" id="nav-logo-link" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--accent-gold)' }}>VIJAYAPUR</span> ACADEMY
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
          <p>© 2026 Vijayapur Academy of Photography & Production. All rights reserved.</p>
          <p style={{ marginTop: '10px', fontSize: '12px', color: '#555' }}>
            Terms of Service | Privacy Policy | Secure Payments via Razorpay/Cashfree
          </p>
        </footer>
      </body>
    </html>
  );
}
