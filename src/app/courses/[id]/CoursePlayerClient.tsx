'use client';

import { useState } from 'react';

interface VideoModule {
  id: number;
  title: string;
  secure_video_url: string;
  sort_order: number;
}

interface CoursePlayerClientProps {
  modules: VideoModule[];
  courseId: number;
  initialUserRating: number | null;
}

export default function CoursePlayerClient({ modules, courseId, initialUserRating }: CoursePlayerClientProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [rating, setRating] = useState<number | null>(initialUserRating);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [rateStatus, setRateStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleRate = async (star: number) => {
    try {
      setRateStatus(null);
      const res = await fetch('/api/courses/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, rating: star }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRating(star);
        setRateStatus({ type: 'success', text: data.message || 'Thank you for your rating!' });
      } else {
        setRateStatus({ type: 'error', text: data.error || 'Failed to submit rating.' });
      }
    } catch (err) {
      setRateStatus({ type: 'error', text: 'Connection error. Please try again.' });
    }
  };

  if (!modules || modules.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <span style={{ fontSize: '48px' }}>📭</span>
        <p style={{ color: 'var(--text-secondary)', marginTop: '20px' }}>No video lectures found for this course yet.</p>
      </div>
    );
  }

  const activeModule = modules[activeIdx];

  return (
    <div className="course-player-container">
      {/* Left Column: Player and Active Video Details */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div>
          {/* Domain-locked Iframe Stream Player */}
          <div style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16/9',
            borderRadius: '12px',
            overflow: 'hidden',
            background: '#000',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            marginBottom: '20px'
          }}>
            <iframe
              id="secure-course-stream-player"
              src={activeModule.secure_video_url}
              title={activeModule.title}
              key={activeModule.id} // Forces iframe reload on URL change
              allow="autoplay; fullscreen; picture-in-picture"
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
          <h2 style={{ fontSize: '22px', fontWeight: 600, color: '#fff' }}>
            {activeIdx + 1}. {activeModule.title}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '6px' }}>
            Stream active. Access granted to paid student portal.
          </p>

          {/* Course Rating Option */}
          <div style={{
            marginTop: '30px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '15px'
          }}>
            <div>
              <h4 style={{ fontSize: '15px', color: '#fff', fontWeight: 500 }}>Rate this course</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Your feedback helps us improve.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRate(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    padding: '2px',
                    color: star <= (hoverRating || rating || 0) ? 'var(--accent-gold)' : 'rgba(255,255,255,0.15)',
                    transition: 'transform 0.2s ease',
                    transform: hoverRating === star ? 'scale(1.2)' : 'scale(1)'
                  }}
                  className="rating-star-btn"
                  title={`Rate ${star} Star`}
                >
                  ★
                </button>
              ))}
              {rating !== null && (
                <span style={{ fontSize: '13px', color: 'var(--accent-gold)', marginLeft: '6px', fontWeight: 600 }}>
                  ({rating} / 5)
                </span>
              )}
            </div>
            {rateStatus && (
              <div style={{
                width: '100%',
                fontSize: '13px',
                color: rateStatus.type === 'success' ? 'var(--success-color)' : '#f87171',
                marginTop: '10px'
              }}>
                {rateStatus.type === 'success' ? '✓ ' : '⚠️ '} {rateStatus.text}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Lecture Modules Playlist List */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '12px', marginBottom: '15px' }}>
          Course Playlist
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto' }}>
          {modules.map((mod, idx) => {
            const isActive = idx === activeIdx;
            return (
              <div
                key={mod.id}
                id={`module-item-${mod.id}`}
                onClick={() => setActiveIdx(idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '8px',
                  background: isActive ? 'rgba(245, 196, 83, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                  border: isActive ? '1px solid var(--accent-gold)' : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                }}
              >
                <div style={{
                  fontSize: '14px',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: isActive ? 'var(--accent-gold)' : 'rgba(255,255,255,0.05)',
                  color: isActive ? '#000' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  transition: 'all 0.3s ease'
                }}>
                  {idx + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '13px', color: '#fff', fontWeight: isActive ? 600 : 500 }}>{mod.title}</h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Lecture Stream</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
