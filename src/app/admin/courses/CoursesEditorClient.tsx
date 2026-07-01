'use client';

import { useState } from 'react';

interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  thumbnail_path: string;
  pay_now_enabled?: boolean;
}

interface Lecture {
  id: number;
  course_id: number;
  title: string;
  secure_video_url: string;
  sort_order: number;
}

interface CoursesEditorClientProps {
  initialCourses: Course[];
}

export default function CoursesEditorClient({ initialCourses }: CoursesEditorClientProps) {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New course states
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPrice, setNewPrice] = useState('0');
  const [newThumbnail, setNewThumbnail] = useState('/images/course_default.jpg');
  const [newPayNowEnabled, setNewPayNowEnabled] = useState(true);

  // Editing course states
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrice, setEditPrice] = useState('0');
  const [editThumbnail, setEditThumbnail] = useState('');
  const [editPayNowEnabled, setEditPayNowEnabled] = useState(true);

  // Lecture management states
  const [activeCourseId, setActiveCourseId] = useState<number | null>(null);
  const [activeCourseTitle, setActiveCourseTitle] = useState('');
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loadingLectures, setLoadingLectures] = useState(false);
  const [lecTitle, setLecTitle] = useState('');
  const [lecUrl, setLecUrl] = useState('');
  const [lecSort, setLecSort] = useState('0');

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newPrice || !newThumbnail) {
      setStatusMsg({ type: 'error', text: 'Title, Price, and Thumbnail path are required.' });
      return;
    }

    const floatVal = parseFloat(newPrice);
    const paiseVal = isNaN(floatVal) ? 0 : Math.round(floatVal * 100);

    setLoading(true);
    setStatusMsg(null);

    try {
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          price: paiseVal,
          thumbnail_path: newThumbnail,
          pay_now_enabled: newPayNowEnabled
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatusMsg({ type: 'success', text: 'Course added successfully! Refresh the page to view additions.' });
        setNewTitle('');
        setNewDescription('');
        setNewPrice('0');
        setNewPayNowEnabled(true);
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Failed to add course.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Network connection failed.' });
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (course: Course) => {
    setEditingId(course.id);
    setEditTitle(course.title);
    setEditDescription(course.description);
    setEditPrice((course.price / 100).toString());
    setEditThumbnail(course.thumbnail_path);
    setEditPayNowEnabled(course.pay_now_enabled !== false);
    setStatusMsg(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditDescription('');
    setEditPrice('0');
    setEditThumbnail('');
    setEditPayNowEnabled(true);
  };

  const handleSaveEdit = async (id: number) => {
    if (!editTitle || !editPrice || !editThumbnail) {
      setStatusMsg({ type: 'error', text: 'Title, Price, and Thumbnail are required.' });
      return;
    }

    const floatVal = parseFloat(editPrice);
    const paiseVal = isNaN(floatVal) ? 0 : Math.round(floatVal * 100);

    setLoading(true);
    setStatusMsg(null);

    try {
      const response = await fetch('/api/admin/courses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          title: editTitle,
          description: editDescription,
          price: paiseVal,
          thumbnail_path: editThumbnail,
          pay_now_enabled: editPayNowEnabled
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatusMsg({ type: 'success', text: 'Course details updated successfully!' });
        setCourses(prev => prev.map(c => c.id === id ? {
          ...c,
          title: editTitle,
          description: editDescription,
          price: paiseVal,
          thumbnail_path: editThumbnail,
          pay_now_enabled: editPayNowEnabled
        } : c));
        setEditingId(null);
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Failed to update course.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Network connection failed.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (id: number) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) return;
    setStatusMsg(null);

    try {
      const response = await fetch(`/api/admin/courses?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatusMsg({ type: 'success', text: 'Course deleted successfully.' });
        setCourses(prev => prev.filter(c => c.id !== id));
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Failed to delete course.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Network connection failed.' });
    }
  };

  // Lecture handlers
  const handleOpenLectures = async (courseId: number, courseTitle: string) => {
    setActiveCourseId(courseId);
    setActiveCourseTitle(courseTitle);
    setLoadingLectures(true);
    setStatusMsg(null);

    try {
      const response = await fetch(`/api/admin/courses/lectures?courseId=${courseId}`);
      const data = await response.json();
      if (response.ok && data.success) {
        setLectures(data.lectures || []);
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Failed to load lectures.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Failed to connect to lectures server.' });
    } finally {
      setLoadingLectures(false);
    }
  };

  const handleAddLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lecTitle || !lecUrl) {
      setStatusMsg({ type: 'error', text: 'Lecture Title and Secure Video URL are required.' });
      return;
    }

    setLoading(true);
    setStatusMsg(null);

    try {
      const response = await fetch('/api/admin/courses/lectures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_id: activeCourseId,
          title: lecTitle,
          secure_video_url: lecUrl,
          sort_order: parseInt(lecSort, 10) || 0
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatusMsg({ type: 'success', text: 'New lecture module added successfully!' });
        const newLec: Lecture = {
          id: data.lecture_id || Date.now(),
          course_id: activeCourseId!,
          title: lecTitle,
          secure_video_url: lecUrl,
          sort_order: parseInt(lecSort, 10) || 0
        };
        setLectures(prev => [...prev, newLec].sort((a, b) => a.sort_order - b.sort_order));
        setLecTitle('');
        setLecUrl('');
        setLecSort('0');
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Failed to add lecture module.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Network connection failed.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLecture = async (id: number) => {
    if (!confirm('Are you sure you want to delete this lecture?')) return;
    setStatusMsg(null);

    try {
      const response = await fetch(`/api/admin/courses/lectures?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatusMsg({ type: 'success', text: 'Lecture module deleted successfully.' });
        setLectures(prev => prev.filter(l => l.id !== id));
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Failed to delete lecture.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Network connection failed.' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
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

      {activeCourseId === null ? (
        /* Course list & upload view */
        <div className="admin-editor-grid">
          
          {/* Add Course Form */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '20px' }}>Add Storefront Course</h3>
            
            <form onSubmit={handleAddCourse}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Course Title (Name)</label>
                <input
                  type="text"
                  placeholder="e.g. Masterclass in Composition"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '6px',
                    padding: '10px 14px',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Price (INR)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 999.00"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '6px',
                    padding: '10px 14px',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Thumbnail Path</label>
                <input
                  type="text"
                  value={newThumbnail}
                  onChange={(e) => setNewThumbnail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '6px',
                    padding: '10px 14px',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Course Description</label>
                <textarea
                  placeholder="Details regarding lecture modules..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  style={{
                    width: '100%',
                    height: '100px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '6px',
                    padding: '10px 14px',
                    color: '#fff',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', color: '#fff' }}>
                  <input
                    type="checkbox"
                    checked={newPayNowEnabled}
                    onChange={(e) => setNewPayNowEnabled(e.target.checked)}
                  />
                  Enable Pay Now / Buy Online Button
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  background: 'var(--accent-gold)',
                  color: '#000',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Adding...' : 'Add Course'}
              </button>
            </form>
          </div>

          {/* Courses List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {courses.length > 0 ? (
              courses.map((course) => {
                const isEditing = editingId === course.id;
                return (
                  <div key={course.id} className="glass-card" style={{ padding: '24px' }}>
                    {isEditing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--accent-gold)' }}>Edit Recorded Course details</h4>
                        
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Course Title</label>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            style={{
                              width: '100%',
                              background: '#0a0a0c',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '6px',
                              padding: '10px',
                              color: '#fff'
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Price (INR)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            style={{
                              width: '100%',
                              background: '#0a0a0c',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '6px',
                              padding: '10px',
                              color: '#fff'
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Thumbnail Path</label>
                          <input
                            type="text"
                            value={editThumbnail}
                            onChange={(e) => setEditThumbnail(e.target.value)}
                            style={{
                              width: '100%',
                              background: '#0a0a0c',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '6px',
                              padding: '10px',
                              color: '#fff'
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Course Description</label>
                          <textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            style={{
                              width: '100%',
                              height: '80px',
                              background: '#0a0a0c',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '6px',
                              padding: '10px',
                              color: '#fff',
                              resize: 'vertical'
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', color: '#fff' }}>
                            <input
                              type="checkbox"
                              checked={editPayNowEnabled}
                              onChange={(e) => setEditPayNowEnabled(e.target.checked)}
                            />
                            Enable Pay Now / Buy Online Button
                          </label>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                          <button
                            onClick={() => handleSaveEdit(course.id)}
                            style={{
                              background: 'var(--success-color, #10b981)',
                              color: '#fff',
                              border: 'none',
                              padding: '10px 24px',
                              borderRadius: '6px',
                              fontSize: '14px',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Save Changes
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            style={{
                              background: 'rgba(255, 255, 255, 0.1)',
                              color: '#fff',
                              border: 'none',
                              padding: '10px 24px',
                              borderRadius: '6px',
                              fontSize: '14px',
                              cursor: 'pointer'
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                          <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#fff' }}>
                            {course.title}
                          </h3>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => handleOpenLectures(course.id, course.title)}
                              style={{
                                background: 'rgba(139, 92, 246, 0.15)',
                                color: 'var(--accent-purple)',
                                border: '1px solid rgba(139, 92, 246, 0.25)',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '13px',
                                cursor: 'pointer',
                                fontWeight: 600
                              }}
                            >
                              🎬 Manage Lectures
                            </button>
                            <button
                              onClick={() => handleStartEdit(course)}
                              style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: '#fff',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '13px',
                                cursor: 'pointer'
                              }}
                            >
                              Edit Details
                            </button>
                            <button
                              onClick={() => handleDeleteCourse(course.id)}
                              style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: '#fca5a5',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '13px',
                                cursor: 'pointer'
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>{course.description}</p>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '14px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span>Thumbnail: <code style={{ color: 'var(--accent-gold)' }}>{course.thumbnail_path}</code></span>
                            <span style={{ color: course.pay_now_enabled !== false ? 'var(--success-color)' : 'var(--danger-color)', fontSize: '12px', fontWeight: 600 }}>
                              {course.pay_now_enabled !== false ? '💳 Online Purchase: Enabled' : '🚫 Online Purchase: Disabled (WhatsApp Only)'}
                            </span>
                          </span>
                          <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent-gold)' }}>
                            ₹{(course.price / 100).toFixed(2)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }} className="glass-card">
                No recorded courses found. Add a course from the left panel to begin.
              </div>
            )}
          </div>

        </div>
      ) : (
        /* Video Lectures management panel */
        <div className="glass-card" style={{ padding: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '20px', marginBottom: '25px' }}>
            <div>
              <span style={{ color: 'var(--accent-gold)', fontSize: '13px', textTransform: 'uppercase', fontWeight: 600 }}>Editing Lectures For</span>
              <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#fff', marginTop: '4px' }}>{activeCourseTitle}</h2>
            </div>
            <button
              onClick={() => {
                setActiveCourseId(null);
                setActiveCourseTitle('');
                setLectures([]);
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
                padding: '8px 20px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ← Back to Courses
            </button>
          </div>

          <div className="admin-editor-grid">
            
            {/* Add Lecture form */}
            <div style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px', padding: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '15px' }}>Add Video Lecture</h3>
              
              <form onSubmit={handleAddLecture}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Lecture Title</label>
                  <input
                    type="text"
                    placeholder="e.g. 1. Introduction to Composition"
                    value={lecTitle}
                    onChange={(e) => setLecTitle(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      background: '#0a0a0c',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      color: '#fff',
                      fontSize: '13px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>YouTube/Vimeo Embed Video URL</label>
                  <input
                    type="text"
                    placeholder="e.g. https://www.youtube.com/embed/..."
                    value={lecUrl}
                    onChange={(e) => setLecUrl(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      background: '#0a0a0c',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      color: '#fff',
                      fontSize: '13px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Sort Order (Position)</label>
                  <input
                    type="number"
                    value={lecSort}
                    onChange={(e) => setLecSort(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      background: '#0a0a0c',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      color: '#fff',
                      fontSize: '13px'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    background: 'var(--accent-gold)',
                    color: '#000',
                    border: 'none',
                    padding: '10px',
                    borderRadius: '6px',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Saving...' : 'Add Lecture'}
                </button>
              </form>
            </div>

            {/* Lecture list table */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '15px' }}>Course Video Playlist ({lectures.length})</h3>

              {loadingLectures ? (
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Loading lectures playlist...</div>
              ) : lectures.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '450px', overflowY: 'auto', paddingRight: '5px' }}>
                  {lectures.map((lec, index) => (
                    <div
                      key={lec.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.04)',
                        borderRadius: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: 'rgba(255,255,255,0.05)',
                          color: 'var(--text-secondary)',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 600
                        }}>
                          {index + 1}
                        </span>
                        <div>
                          <h4 style={{ fontSize: '14px', color: '#fff', fontWeight: 600 }}>{lec.title}</h4>
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                            URL: <code style={{ color: 'var(--accent-gold)' }}>{lec.secure_video_url}</code>
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteLecture(lec.id)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          color: '#fca5a5',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '20px 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
                  No video lectures added yet. Use the left panel to register the YouTube links.
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
