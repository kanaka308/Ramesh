import db from '@/db';
import Gallery from '@/components/Gallery';
import Perks from '@/components/Perks';
import TestimonialSlider from '@/components/TestimonialSlider';
import { generateWhatsAppLink } from '@/lib/whatsapp';

interface Bootcamp {
  id: number;
  title: string;
  next_date: string;
  is_active: number;
  description: string;
}

interface ImageItem {
  id: number;
  file_path: string;
  caption: string;
  category: string;
}

interface Testimonial {
  id: number;
  student_name: string;
  video_url: string;
  description: string;
}

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Fetch data directly from SQLite database in Server Component
  const batches = db.prepare('SELECT * FROM bootcamp_batches').all() as Bootcamp[];
  const portfolioItems = db.prepare('SELECT * FROM portfolio_images ORDER BY display_order ASC').all() as ImageItem[];
  const testimonials = db.prepare('SELECT * FROM testimonials ORDER BY display_order ASC').all() as Testimonial[];

  // Define WhatsApp Phone Number for booking inquiries
  const waPhoneNumber = '919900000000';

  return (
    <div style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>
      {/* 1. Cinematographic Hero Section */}
      <section style={{
        height: '90vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
        padding: '0 20px',
        overflow: 'hidden',
        background: 'radial-gradient(circle at center, rgba(212, 175, 55, 0.15) 0%, rgba(10, 10, 12, 1) 70%)'
      }}>
        {/* Background Decorative Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'linear-gradient(rgba(10, 10, 12, 0.5), rgba(10, 10, 12, 0.95))',
          zIndex: 1
        }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: '800px' }}>
          <p style={{
            color: 'var(--accent-gold)',
            textTransform: 'uppercase',
            letterSpacing: '3px',
            fontSize: '14px',
            fontWeight: 600,
            marginBottom: '20px'
          }}>Vijayapur Academy of Photography & Production</p>
          <h1 style={{
            fontSize: 'calc(24px + 3vw)',
            lineHeight: 1.1,
            fontFamily: 'var(--font-serif)',
            marginBottom: '30px',
            fontWeight: 700
          }}>
            Capture Life&apos;s Greatest <span className="gradient-text">Masterpieces</span>
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '18px',
            lineHeight: 1.6,
            marginBottom: '40px',
            maxWidth: '650px',
            margin: '0 auto 40px auto'
          }}>
            Learn elite, hands-on production directly from industry directors. Standard equipment, home-cooked food, and free premium stay provided.
          </p>
          
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#bootcamp-section" className="btn-gold">Explore Bootcamps</a>
            <a href="/courses" className="btn-outline">Recorded Storefront</a>
          </div>
        </div>
      </section>

      {/* 2. Perks Highlights */}
      <Perks />

      {/* 3. Live Offline Bootcamps Funnel */}
      <section id="bootcamp-section" style={{ padding: '100px 5%', background: '#070709' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <p style={{ color: 'var(--accent-gold)', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '13px', fontWeight: 600 }}>Vijayapur Masterclasses</p>
          <h2 style={{ fontSize: '38px', marginTop: '10px', fontFamily: 'var(--font-serif)' }} className="gradient-text">30-Day Intensive Bootcamps</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '15px auto 0 auto', fontSize: '16px' }}>
            Immersive on-site cohorts with raw studio access, live assignments, and personalized portfolio reviews.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '40px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {batches.map((batch) => {
            const waMsg = `Hi, I'm interested in the 30-day ${batch.title} in Vijayapur starting next batch on ${batch.next_date}. Please share details regarding enrollment.`;
            const waLink = generateWhatsAppLink(waPhoneNumber, waMsg);

            return (
              <div
                key={batch.id}
                id={`bootcamp-card-${batch.id}`}
                className="glass-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '40px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '24px', fontWeight: 600, color: '#fff' }}>{batch.title}</h3>
                    <span style={{
                      background: batch.is_active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: batch.is_active ? 'var(--success-color)' : 'var(--danger-color)',
                      border: `1px solid ${batch.is_active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 600
                    }}>
                      {batch.is_active ? 'Registrations Open' : 'Full / Closed'}
                    </span>
                  </div>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '30px', lineHeight: 1.6 }}>
                    {batch.description}
                  </p>

                  <div style={{
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    padding: '16px 0',
                    marginBottom: '30px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Next Cohort Date:</span>
                    <span style={{ color: 'var(--accent-gold)', fontSize: '18px', fontWeight: 700, letterSpacing: '1px' }}>
                      {batch.next_date}
                    </span>
                  </div>
                </div>

                {batch.is_active ? (
                  <a
                    id={`wa-cta-link-${batch.id}`}
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-whatsapp"
                  >
                    Enquire on WhatsApp
                  </a>
                ) : (
                  <button
                    disabled
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: 'var(--text-secondary)',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      fontWeight: 600,
                      display: 'block',
                      width: '100%',
                      cursor: 'not-allowed',
                      border: '1px solid rgba(255, 255, 255, 0.03)'
                    }}
                  >
                    Next Batch Full
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Interactive Portfolio Gallery */}
      <Gallery initialItems={portfolioItems} />

      {/* 5. Alumni Testimonial Slider */}
      <TestimonialSlider initialTestimonials={testimonials} />
    </div>
  );
}
