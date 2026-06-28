'use client';

import { useState } from 'react';

interface GalleryItem {
  id: number;
  file_path: string;
  caption: string;
  category: string;
}

interface GalleryManagerClientProps {
  initialItems: GalleryItem[];
}

export default function GalleryManagerClient({ initialItems }: GalleryManagerClientProps) {
  const [items, setItems] = useState<GalleryItem[]>(initialItems);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState('Cinematography');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setStatusMsg({ type: 'error', text: 'Please select a photo file to upload.' });
      return;
    }

    setLoading(true);
    setStatusMsg(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('caption', caption);
    formData.append('category', category);

    try {
      const response = await fetch('/api/admin/gallery', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatusMsg({ type: 'success', text: 'Portfolio image uploaded successfully!' });
        
        // Append newly created image metadata to list
        const newItem: GalleryItem = {
          id: Date.now(), // Client side temporary ID or fetch new list
          file_path: data.file_path,
          caption,
          category
        };
        setItems(prev => [newItem, ...prev]);
        setFile(null);
        setCaption('');
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Failed to upload photo.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Upload failed due to connection error.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px', alignItems: 'flex-start' }}>
      {/* Upload Form */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '20px' }}>Upload New Photo</h3>
        
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
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Photo File</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
              style={{
                width: '100%',
                color: 'var(--text-secondary)',
                fontSize: '13px'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Caption / Title</label>
            <input
              type="text"
              placeholder="e.g. Golden Hour Frames"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
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
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: '100%',
                background: '#0a0a0c',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '6px',
                padding: '8px 12px',
                color: '#fff',
                fontSize: '14px'
              }}
            >
              <option value="Cinematography">Cinematography</option>
              <option value="Portrait">Portrait</option>
              <option value="Landscape">Landscape</option>
              <option value="Street">Street</option>
            </select>
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
            {loading ? 'Uploading...' : 'Upload Image'}
          </button>
        </form>
      </div>

      {/* Gallery List */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '20px' }}>Current Gallery Portfolio ({items.length})</h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '15px',
          maxHeight: '500px',
          overflowY: 'auto',
          paddingRight: '5px'
        }}>
          {items.map(item => (
            <div key={item.id} style={{
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              padding: '10px',
              position: 'relative'
            }}>
              <div style={{
                width: '100%',
                aspectRatio: '3/2',
                borderRadius: '4px',
                background: 'linear-gradient(135deg, #151518 0%, #070709 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                marginBottom: '8px'
              }}>
                🖼️
              </div>
              <h4 style={{ fontSize: '13px', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.caption}
              </h4>
              <span style={{ fontSize: '11px', color: 'var(--accent-gold)', textTransform: 'uppercase' }}>
                {item.category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
