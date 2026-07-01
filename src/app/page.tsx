import repo from '@/db/repo';
import Gallery from '@/components/Gallery';
import Perks from '@/components/Perks';
import TestimonialSlider from '@/components/TestimonialSlider';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { getSiteSetting } from '@/lib/settings';

interface Bootcamp {
  id: number;
  title: string;
  next_date: string;
  is_active: number;
  description: string;
}

interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  thumbnail_path: string;
  pay_now_enabled?: boolean;
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
  // Fetch data directly from Repository
  const batches = await repo.getBootcampBatches();
  const recordedCourses = await repo.getRecordedCourses();
  const portfolioItems = await repo.getPortfolioImages();
  const testimonials = await repo.getTestimonials();
  const ratings = await repo.getCourseRatings();
  const materials = await repo.getMaterials();

  // Define WhatsApp Phone Number for booking inquiries from settings
  const waPhoneNumber = await getSiteSetting('whatsapp_number', '919900000000');
  const heroPre = await getSiteSetting('site_hero_pre', 'Vijayapur Academy of Photography & Production');
  const heroTitle = await getSiteSetting('site_hero_title', "Capture Life's Greatest Masterpieces");
  const heroSubtitle = await getSiteSetting('site_hero_subtitle', 'Learn elite, hands-on production directly from industry directors. Standard equipment, home-cooked food, and free premium stay provided.');

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

        <div style={{ position: 'relative', zIndex: 2, maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img 
            src="/logo.jpg" 
            alt="Ramclicks Logo" 
            style={{ 
              height: '85px', 
              width: '85px', 
              borderRadius: '50%', 
              objectFit: 'cover', 
              border: '2px solid var(--accent-gold)', 
              marginBottom: '20px', 
              boxShadow: '0 0 25px rgba(245, 196, 83, 0.35)' 
            }} 
          />
          <p style={{
            color: 'var(--accent-gold)',
            textTransform: 'uppercase',
            letterSpacing: '3px',
            fontSize: '14px',
            fontWeight: 600,
            marginBottom: '20px'
          }}>{heroPre}</p>
          <h1 style={{
            fontSize: 'calc(24px + 3vw)',
            lineHeight: 1.1,
            fontFamily: 'var(--font-serif)',
            marginBottom: '30px',
            fontWeight: 700
          }}>
            {heroTitle}
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '18px',
            lineHeight: 1.6,
            marginBottom: '40px',
            maxWidth: '650px',
            margin: '0 auto 40px auto'
          }}>
            {heroSubtitle}
          </p>
          
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#bootcamp-section" className="btn-gold">Explore Bootcamps</a>
            <a href="/courses" className="btn-outline">Recorded Storefront</a>
          </div>
        </div>
      </section>

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
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '40px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {batches.map((batch) => {
            const waMsg = `Hi Ramclicks, I want to book my seat and purchase the offline bootcamp course "${batch.title}" starting on ${batch.next_date}. Please share details on how to make the payment and confirm my enrollment.`;
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {batch.pay_now_enabled !== false && (
                      <a
                        id={`home-pay-now-bootcamp-btn-${batch.id}`}
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-gold"
                        style={{ display: 'block', textAlign: 'center', width: '100%', padding: '12px' }}
                      >
                        💳 Pay Now (Secure Booking)
                      </a>
                    )}
                    <a
                      id={`wa-cta-link-${batch.id}`}
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-whatsapp"
                      style={{ display: 'block', textAlign: 'center', width: '100%' }}
                    >
                      💬 Purchase via WhatsApp
                    </a>
                  </div>
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

      {/* Unmatched Student Support Perks */}
      <Perks />

      {/* 3b. Recorded Courses Showcase Section */}
      <section id="recorded-courses-section" style={{ padding: '80px 5%', background: '#09090d', borderTop: '1px solid rgba(255, 255, 255, 0.03)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <p style={{ color: 'var(--accent-gold)', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '13px', fontWeight: 600, margin: 0 }}>Self-Paced Masterclasses</p>
            <h2 style={{ fontSize: '36px', marginTop: '10px', fontFamily: 'var(--font-serif)' }} className="gradient-text">Featured Recorded Lectures</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '15px' }}>
              Bite-sized visual lectures with lifetime access. Purchase online or via WhatsApp to unlock instant access.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            justifyContent: 'center',
            gap: '30px',
            marginBottom: '30px'
          }}>
            {recordedCourses.map((course) => {
              const priceInINR = (course.price / 100).toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0
              });
              const waMsg = `Hi Ramclicks, I want to purchase the recorded course "${course.title}" for ${priceInINR}. Please share payment details to confirm my order.`;
              const waLink = generateWhatsAppLink(waPhoneNumber, waMsg);

              return (
                <div
                  key={course.id}
                  id={`course-card-${course.id}`}
                  className="glass-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '24px'
                  }}
                >
                  <div>
                    {/* Visual Thumbnail */}
                    <div style={{
                      width: '100%',
                      aspectRatio: '16/9',
                      borderRadius: '8px',
                      background: course.thumbnail_path ? `url(${course.thumbnail_path}) center/cover no-repeat` : 'linear-gradient(135deg, #151518 0%, #070709 100%)',
                      marginBottom: '20px',
                      border: '1px solid rgba(255, 255, 255, 0.03)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '36px',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      {!course.thumbnail_path && '🎬'}
                      <span style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        background: 'rgba(10, 10, 12, 0.7)',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'var(--text-secondary)'
                      }}>
                        Recorded Video
                      </span>
                    </div>

                    <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>{course.title}</h3>
                    
                    {/* Star rating metric */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px', fontSize: '13px', color: 'var(--accent-gold)' }}>
                      {(() => {
                        const courseRatings = ratings[String(course.id)] || {};
                        const entries = Object.values(courseRatings);
                        if (entries.length > 0) {
                          const average = Math.round((entries.reduce((acc, r) => acc + r, 0) / entries.length) * 10) / 10;
                          return (
                            <>
                              <span>★ {average.toFixed(1)}</span>
                              <span style={{ color: 'var(--text-secondary)' }}>({entries.length} {entries.length === 1 ? 'rating' : 'ratings'})</span>
                            </>
                          );
                        }
                        return <span style={{ color: 'var(--text-secondary)' }}>★ No ratings yet</span>;
                      })()}
                    </div>

                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5, marginBottom: '24px' }}>
                      {course.description}
                    </p>
                  </div>

                  <div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                      paddingTop: '20px',
                      marginBottom: '20px'
                    }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Pricing:</span>
                      <span style={{ fontSize: '22px', fontWeight: 700, color: 'var(--accent-gold)' }}>
                        {priceInINR}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {course.pay_now_enabled !== false && (
                        <a
                          id={`home-enroll-course-btn-${course.id}`}
                          href={`/courses`}
                          style={{
                            background: 'var(--accent-gold)',
                            color: '#000',
                            textAlign: 'center',
                            padding: '12px',
                            borderRadius: '8px',
                            fontWeight: 600,
                            display: 'block',
                            width: '100%',
                            transition: 'background-color 0.3s ease'
                          }}
                        >
                          Enroll Now
                        </a>
                      )}
                      <a
                        id={`home-wa-buy-course-btn-${course.id}`}
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="wa-buy-btn"
                        style={{
                          textAlign: 'center',
                          padding: '10px',
                          borderRadius: '8px',
                          fontWeight: 600,
                          fontSize: '13px',
                          display: 'block',
                          width: '100%',
                          cursor: 'pointer'
                        }}
                      >
                        💬 Buy via WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3c. Materials and Templates Section */}
      <section id="materials-section" style={{ padding: '80px 5%', background: '#0a0a0f', borderTop: '1px solid rgba(255, 255, 255, 0.03)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <p style={{ color: 'var(--accent-gold)', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '13px', fontWeight: 600, margin: 0 }}>Design Assets & Presets</p>
            <h2 style={{ fontSize: '36px', marginTop: '10px', fontFamily: 'var(--font-serif)' }} className="gradient-text">Materials & Templates</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '15px' }}>
              Premium source files, Lightroom presets, and visual templates to accelerate your workflow.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            justifyContent: 'center',
            gap: '30px'
          }}>
            {materials.length > 0 ? (
              materials.map((material) => {
                const priceInINR = (material.price / 100).toLocaleString('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  maximumFractionDigits: 0
                });
                const waMsg = `Hi Ramclicks, I want to purchase the template asset "${material.title}" for ${priceInINR}. Please share payment details to confirm my order.`;
                const waLink = generateWhatsAppLink(waPhoneNumber, waMsg);

                return (
                  <div
                    key={material.id}
                    id={`material-card-${material.id}`}
                    className="glass-card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      padding: '24px'
                    }}
                  >
                    <div>
                      {/* Visual Icon Box */}
                      <div style={{
                        width: '100%',
                        aspectRatio: '16/9',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #2b1f4d 0%, #0c091f 100%)',
                        marginBottom: '20px',
                        border: '1px solid rgba(139, 92, 246, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '48px',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        📦
                        {/* Subtle Badge */}
                        <span style={{
                          position: 'absolute',
                          top: '12px',
                          left: '12px',
                          background: 'rgba(139, 92, 246, 0.25)',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          border: '1px solid rgba(139, 92, 246, 0.4)',
                          color: '#c084fc',
                          fontWeight: 600
                        }}>
                          Asset Template
                        </span>
                      </div>

                      <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#fff', marginBottom: '10px' }}>{material.title}</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5, marginBottom: '24px' }}>
                        {material.description}
                      </p>
                    </div>

                    <div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                        paddingTop: '20px',
                        marginBottom: '20px'
                      }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Pricing:</span>
                        <span style={{ fontSize: '22px', fontWeight: 700, color: 'var(--accent-gold)' }}>
                          {priceInINR}
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {material.online_enabled && (
                          <a
                            id={`home-enroll-material-btn-${material.id}`}
                            href={`/courses`}
                            style={{
                              background: 'var(--accent-gold)',
                              color: '#000',
                              textAlign: 'center',
                              padding: '12px',
                              borderRadius: '8px',
                              fontWeight: 600,
                              display: 'block',
                              width: '100%',
                              transition: 'background-color 0.3s ease'
                            }}
                          >
                            Pay Now
                          </a>
                        )}
                        <a
                          id={`home-wa-buy-material-btn-${material.id}`}
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="wa-buy-btn"
                          style={{
                            textAlign: 'center',
                            padding: '10px',
                            borderRadius: '8px',
                            fontWeight: 600,
                            fontSize: '13px',
                            display: 'block',
                            width: '100%',
                            cursor: 'pointer'
                          }}
                        >
                          💬 Buy via WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 0' }}>
                <span style={{ fontSize: '48px' }}>📂</span>
                <p style={{ color: 'var(--text-secondary)', marginTop: '20px' }}>No materials or templates are currently available for purchase.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. Interactive Portfolio Gallery */}
      <Gallery initialItems={portfolioItems} />

      {/* 5. Alumni Testimonial Slider */}
      <TestimonialSlider initialTestimonials={testimonials} />
    </div>
  );
}
