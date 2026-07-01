'use client';

import { useState } from 'react';

interface Course {
  id: number;
  title: string;
}

interface Enrollment {
  id: number;
  payment_id: string;
  purchased_at: string;
  student_email: string;
  course_title: string;
  course_id: number;
}

interface EnrollmentsClientProps {
  initialEnrollments: Enrollment[];
  courses: Course[];
}

export default function EnrollmentsClient({ initialEnrollments, courses }: EnrollmentsClientProps) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>(initialEnrollments);
  const [email, setEmail] = useState('');
  const [courseId, setCourseId] = useState(courses[0]?.id.toString() || '');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !courseId) {
      setStatusMsg({ type: 'error', text: 'Email and course selection are required.' });
      return;
    }

    setLoading(true);
    setStatusMsg(null);

    try {
      const response = await fetch('/api/admin/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          course_id: parseInt(courseId, 10)
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatusMsg({ type: 'success', text: `Access successfully granted to "${email}".` });
        
        // Add to UI list
        const selectedCourse = courses.find(c => c.id.toString() === courseId);
        const newEnrollment: Enrollment = {
          id: Date.now(), // UI fallback id
          payment_id: `manual_${Date.now()}`,
          purchased_at: new Date().toISOString(),
          student_email: email,
          course_title: selectedCourse ? selectedCourse.title : 'Selected Course',
          course_id: parseInt(courseId, 10)
        };
        setEnrollments(prev => [newEnrollment, ...prev]);
        setEmail('');
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Failed to grant access.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Network connection failed.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeAccess = async (id: number, emailStr: string, titleStr: string) => {
    if (!confirm(`Are you sure you want to revoke access to "${titleStr}" for "${emailStr}"?`)) return;
    setStatusMsg(null);

    try {
      const response = await fetch(`/api/admin/enrollments?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatusMsg({ type: 'success', text: `Revoked course access for "${emailStr}".` });
        setEnrollments(prev => prev.filter(e => e.id !== id));
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Failed to revoke access.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Network connection failed.' });
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {statusMsg && (
        <div style={{
          background: statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${statusMsg.type === 'success' ? 'var(--success-color)' : 'var(--danger-color)'}`,
          color: statusMsg.type === 'success' ? 'var(--success-color)' : '#fca5a5',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '14px',
          textAlign: 'center'
        }}>
          {statusMsg.text}
        </div>
      )}

      {/* Grant Access Card */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '20px' }}>Grant Direct Course Access</h3>
        
        <form onSubmit={handleGrantAccess} className="admin-enrollments-form">
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Student Email Address</label>
            <input
              type="email"
              placeholder="e.g. student@ramclicks.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '6px',
                padding: '10px 14px',
                color: '#fff',
                fontSize: '14px',
                height: '42px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Select Recorded Course</label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              required
              style={{
                width: '100%',
                background: '#0a0a0c',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '6px',
                padding: '10px 14px',
                color: '#fff',
                fontSize: '14px',
                height: '42px',
                cursor: 'pointer'
              }}
            >
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || courses.length === 0}
            style={{
              background: 'var(--accent-gold)',
              color: '#000',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: (loading || courses.length === 0) ? 'not-allowed' : 'pointer',
              height: '42px',
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? 'Granting...' : 'Grant Access'}
          </button>
        </form>
      </div>

      {/* Enrollments List */}
      <div className="glass-card" style={{ padding: '24px', overflowX: 'auto' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '20px' }}>Active Course Enrollments ({enrollments.length})</h3>

        {enrollments.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px 16px' }}>Student Email</th>
                <th style={{ padding: '12px 16px' }}>Course Title</th>
                <th style={{ padding: '12px 16px' }}>Enrollment Type</th>
                <th style={{ padding: '12px 16px' }}>Granted Date</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map(e => {
                const isManual = e.payment_id.startsWith('manual_');
                return (
                  <tr key={e.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '16px', color: '#fff', fontWeight: 500 }}>{e.student_email}</td>
                    <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{e.course_title}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '10px',
                        fontSize: '11px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        background: isManual ? 'rgba(139, 92, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        color: isManual ? 'var(--accent-purple)' : 'var(--success-color)'
                      }}>
                        {isManual ? 'Manual Grant' : 'Online Payment'}
                      </span>
                    </td>
                    <td style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                      {formatDate(e.purchased_at)}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleRevokeAccess(e.id, e.student_email, e.course_title)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#fca5a5',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(elm) => {
                          elm.currentTarget.style.background = 'var(--danger-color)';
                          elm.currentTarget.style.color = '#000';
                        }}
                        onMouseLeave={(elm) => {
                          elm.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                          elm.currentTarget.style.color = '#fca5a5';
                        }}
                      >
                        Revoke Access
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No course enrollments found. Use the form above to grant manual student access.
          </div>
        )}
      </div>

    </div>
  );
}
