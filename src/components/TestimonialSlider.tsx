'use client';

import { useState } from 'react';

interface Testimonial {
  id: number;
  student_name: string;
  video_url: string;
  description: string;
}

interface TestimonialSliderProps {
  initialTestimonials: Testimonial[];
}

export default function TestimonialSlider({ initialTestimonials }: TestimonialSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [testimonials] = useState<Testimonial[]>(initialTestimonials);

  if (testimonials.length === 0) {
    return null;
  }

  const current = testimonials[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section id="testimonials-section" style={{ padding: '80px 5%', background: '#0a0a0c' }}>
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <p style={{ color: 'var(--accent-gold)', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '13px', fontWeight: 600 }}>Alumni Success Stories</p>
        <h2 style={{ fontSize: '36px', marginTop: '10px', fontFamily: 'var(--font-serif)' }} className="gradient-text">What Our Graduates Say</h2>
      </div>

      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* Main Video Card */}
        <div className="glass-card" style={{
          width: '100%',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          alignItems: 'center'
        }}>
          {/* Responsive Video Frame */}
          <div style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16/9',
            borderRadius: '12px',
            overflow: 'hidden',
            background: '#000',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <iframe
              id="testimonial-video-player"
              src={current.video_url}
              title={`Testimonial video by ${current.student_name}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none'
              }}
            />
          </div>

          {/* Details */}
          <div style={{ textAlign: 'center', maxWidth: '700px' }}>
            <p style={{ fontSize: '18px', fontStyle: 'italic', color: 'var(--text-primary)', marginBottom: '15px' }}>
              &quot;{current.description}&quot;
            </p>
            <h4 style={{ color: 'var(--accent-gold)', fontSize: '16px', fontWeight: 600 }}>
              — {current.student_name}
            </h4>
          </div>
        </div>

        {/* Navigation Buttons */}
        {testimonials.length > 1 && (
          <div style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
            <button
              id="prev-testimonial"
              onClick={handlePrev}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                color: '#fff',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                fontSize: '18px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-gold)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)'}
            >
              ←
            </button>
            <button
              id="next-testimonial"
              onClick={handleNext}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                color: '#fff',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                fontSize: '18px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-gold)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)'}
            >
              →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
