'use client';

import { useState } from 'react';

interface Testimonial {
  id: number;
  student_name: string;
  video_url: string;
  description: string;
}

interface TestimonialsManagerClientProps {
  initialList: Testimonial[];
}

export default function TestimonialsManagerClient({ initialList }: TestimonialsManagerClientProps) {
  const [list, setList] = useState<Testimonial[]>(initialList);
  const [name, setName] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [quote, setQuote] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit states
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editVideoUrl, setEditVideoUrl] = useState('');
  const [editQuote, setEditQuote] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !videoUrl) {
      setStatusMsg({ type: 'error', text: 'Name and video URL are required.' });
      return;
    }

    setLoading(true);
    setStatusMsg(null);

    try {
      const response = await fetch('/api/admin/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_name: name,
          video_url: videoUrl,
          description: quote
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatusMsg({ type: 'success', text: 'Alumni testimonial registered successfully!' });
        
        // Let's reload to get the real DB ID or append with a temporary ID
        const newItem: Testimonial = {
          id: Date.now(), // Fallback UI ID
          student_name: name,
          video_url: videoUrl,
          description: quote
        };
        setList(prev => [newItem, ...prev]);
        setName('');
        setVideoUrl('');
        setQuote('');
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Failed to save testimonial.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Database error. Check your connection.' });
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (item: Testimonial) => {
    setEditingId(item.id);
    setEditName(item.student_name);
    setEditVideoUrl(item.video_url);
    setEditQuote(item.description || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleUpdate = async (id: number) => {
    if (!editName || !editVideoUrl) {
      setStatusMsg({ type: 'error', text: 'Name and video URL are required.' });
      return;
    }
    setLoading(true);
    setStatusMsg(null);

    try {
      const response = await fetch('/api/admin/testimonials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          student_name: editName,
          video_url: editVideoUrl,
          description: editQuote
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatusMsg({ type: 'success', text: 'Testimonial updated successfully.' });
        setList(prev => prev.map(t => t.id === id ? {
          ...t,
          student_name: editName,
          video_url: editVideoUrl,
          description: editQuote
        } : t));
        setEditingId(null);
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Failed to update testimonial.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Network connection error.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    setStatusMsg(null);

    try {
      const response = await fetch(`/api/admin/testimonials?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatusMsg({ type: 'success', text: 'Testimonial deleted successfully.' });
        setList(prev => prev.filter(t => t.id !== id));
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Failed to delete testimonial.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Network connection error.' });
    }
  };

  return (
    <div className="admin-editor-grid">
      {/* Add Form */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '20px' }}>Add Testimonial</h3>
        
        {statusMsg && (
          <div style={{
            background: statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${statusMsg.type === 'success' ? 'var(--success-color)' : 'var(--danger-color)'}`,
            color: statusMsg.type === 'success' ? 'var(--success-color)' : '#fca5a5',
            padding: '10px 14px',
            borderRadius: '6px',
            fontSize: '13px',
            marginBottom: '20px'
          }}>
            {statusMsg.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Student Name</label>
            <input
              type="text"
              placeholder="e.g. Rahul M."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '6px',
                padding: '8px 12px',
                color: '#fff',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Video Embed Link</label>
            <input
              type="url"
              placeholder="e.g. https://www.youtube.com/embed/..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              required
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '6px',
                padding: '8px 12px',
                color: '#fff',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Review Quote</label>
            <textarea
              placeholder="Enter student quote description..."
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              style={{
                width: '100%',
                height: '80px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '6px',
                padding: '8px 12px',
                color: '#fff',
                fontSize: '14px',
                resize: 'none'
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
              fontSize: '14px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Adding...' : 'Register Testimonial'}
          </button>
        </form>
      </div>

      {/* Testimonials List */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '20px' }}>Active Testimonials ({list.length})</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '500px', overflowY: 'auto' }}>
          {list.map(item => {
            const isEditing = editingId === item.id;
            return (
              <div key={item.id} style={{
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                {isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Name</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        style={{ width: '100%', background: '#0a0a0c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '6px', color: '#fff' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Video URL</label>
                      <input
                        type="url"
                        value={editVideoUrl}
                        onChange={(e) => setEditVideoUrl(e.target.value)}
                        style={{ width: '100%', background: '#0a0a0c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '6px', color: '#fff' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Quote Description</label>
                      <textarea
                        value={editQuote}
                        onChange={(e) => setEditQuote(e.target.value)}
                        style={{ width: '100%', height: '60px', background: '#0a0a0c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '6px', color: '#fff', resize: 'none' }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '5px' }}>
                      <button
                        onClick={() => handleUpdate(item.id)}
                        style={{ background: 'var(--success-color, #10b981)', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ fontSize: '15px', color: 'var(--accent-gold)', fontWeight: 600 }}>{item.student_name}</h4>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleStartEdit(item)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '12px', cursor: 'pointer' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          style={{ background: 'transparent', border: 'none', color: '#fca5a5', fontSize: '12px', cursor: 'pointer' }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p style={{ fontSize: '13px', fontStyle: 'italic', color: 'var(--text-primary)' }}>&quot;{item.description}&quot;</p>
                    <span style={{ fontSize: '11px', color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      Source: {item.video_url}
                    </span>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
