'use client';

import { useState } from 'react';

interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  thumbnail_path: string;
}

interface CoursesEditorClientProps {
  initialCourses: Course[];
}

export default function CoursesEditorClient({ initialCourses }: CoursesEditorClientProps) {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handlePriceChange = (id: number, rawValue: string) => {
    // Replace non-numeric input to prevent invalid float inputs
    const cleanNum = rawValue.replace(/[^\d.]/g, '');
    const floatVal = parseFloat(cleanNum);
    const paiseVal = isNaN(floatVal) ? 0 : Math.round(floatVal * 100);
    setCourses(prev => prev.map(c => c.id === id ? { ...c, price: paiseVal } : c));
  };

  const handleSave = async (id: number) => {
    setUpdatingId(id);
    setStatusMsg(null);
    const targetCourse = courses.find(c => c.id === id);

    try {
      const response = await fetch('/api/admin/updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'course',
          id,
          price: targetCourse?.price,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatusMsg({ type: 'success', text: `Successfully updated pricing for "${targetCourse?.title}".` });
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Failed to save changes.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Network connection failed.' });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      {statusMsg && (
        <div style={{
          background: statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${statusMsg.type === 'success' ? 'var(--success-color)' : 'var(--danger-color)'}`,
          color: statusMsg.type === 'success' ? 'var(--success-color)' : '#fca5a5',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '14px',
          marginBottom: '25px',
          textAlign: 'center'
        }}>
          {statusMsg.text}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {courses.map(course => (
          <div key={course.id} className="glass-card" style={{ padding: '30px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#fff', marginBottom: '10px' }}>
              {course.title}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>{course.description}</p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              marginBottom: '20px'
            }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Storefront Price (INR)
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span style={{ position: 'absolute', left: '14px', color: 'var(--text-secondary)', fontSize: '14px' }}>₹</span>
                  <input
                    type="text"
                    value={course.price / 100}
                    onChange={(e) => handlePriceChange(course.id, e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '6px',
                      padding: '10px 14px 10px 28px',
                      color: '#fff',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => handleSave(course.id)}
              disabled={updatingId === course.id}
              style={{
                background: 'var(--accent-gold)',
                color: '#000',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background-color 0.3s ease'
              }}
            >
              {updatingId === course.id ? 'Saving...' : 'Save Price'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
