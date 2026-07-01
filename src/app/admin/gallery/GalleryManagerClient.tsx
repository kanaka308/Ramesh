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
  const [activeTab, setActiveTab] = useState<'photos' | 'categories'>('photos');

  // Upload Form states
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [categoryType, setCategoryType] = useState<'existing' | 'new'>('existing');
  const [selectedCategory, setSelectedCategory] = useState('Cinematography');
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Category rename states
  const [renameTarget, setRenameTarget] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  // Extract all distinct categories dynamically
  const existingCategories = Array.from(new Set(items.map(item => item.category).filter(Boolean)));
  const defaultCategories = ['Cinematography', 'Portrait', 'Landscape', 'Street'];
  const allCategoriesList = Array.from(new Set([...defaultCategories, ...existingCategories]));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setStatusMsg({ type: 'error', text: 'Please select a photo file to upload.' });
      return;
    }

    const finalCategory = categoryType === 'new' ? newCategory.trim() : selectedCategory;
    if (!finalCategory) {
      setStatusMsg({ type: 'error', text: 'Please specify a valid category name.' });
      return;
    }

    setLoading(true);
    setStatusMsg(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('caption', caption);
    formData.append('category', finalCategory);

    try {
      const response = await fetch('/api/admin/gallery', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatusMsg({ type: 'success', text: 'Portfolio image uploaded successfully!' });
        
        const newItem: GalleryItem = {
          id: Date.now(), // Fallback UI ID
          file_path: data.file_path,
          caption,
          category: finalCategory
        };
        setItems(prev => [newItem, ...prev]);
        setFile(null);
        setCaption('');
        setNewCategory('');
        setCategoryType('existing');
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Failed to upload photo.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Upload failed due to connection error.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async (id: number) => {
    if (!confirm('Are you sure you want to delete this image from your portfolio?')) return;
    setStatusMsg(null);

    try {
      const response = await fetch(`/api/admin/gallery?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatusMsg({ type: 'success', text: 'Image removed from gallery successfully.' });
        setItems(prev => prev.filter(item => item.id !== id));
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Failed to delete image.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Network connection failed.' });
    }
  };

  const handleRenameCategory = async (oldCat: string) => {
    if (!renameValue.trim()) return;
    const newCat = renameValue.trim();
    setLoading(true);
    setStatusMsg(null);

    try {
      const response = await fetch('/api/admin/gallery/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldCategory: oldCat, newCategory: newCat }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatusMsg({ type: 'success', text: `Category renamed to "${newCat}" successfully!` });
        // Update local items state
        setItems(prev => prev.map(item => {
          if (item.category === oldCat) {
            return { ...item, category: newCat };
          }
          return item;
        }));
        setRenameTarget(null);
        setRenameValue('');
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Failed to rename category.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Network connection failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
      
      {/* Navigation tabs */}
      <div style={{ display: 'flex', gap: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '15px' }}>
        <button
          onClick={() => setActiveTab('photos')}
          style={{
            background: activeTab === 'photos' ? 'var(--accent-gold)' : 'transparent',
            color: activeTab === 'photos' ? '#000' : 'var(--text-secondary)',
            border: activeTab === 'photos' ? '1px solid var(--accent-gold)' : '1px solid rgba(255,255,255,0.1)',
            padding: '8px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
            transition: 'all 0.2s'
          }}
        >
          🖼️ Portfolio Photos
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          style={{
            background: activeTab === 'categories' ? 'var(--accent-gold)' : 'transparent',
            color: activeTab === 'categories' ? '#000' : 'var(--text-secondary)',
            border: activeTab === 'categories' ? '1px solid var(--accent-gold)' : '1px solid rgba(255,255,255,0.1)',
            padding: '8px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
            transition: 'all 0.2s'
          }}
        >
          🏷️ Manage Categories
        </button>
      </div>

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

      {activeTab === 'photos' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px', alignItems: 'flex-start' }}>
          
          {/* Upload Form */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '20px' }}>Upload New Photo</h3>
            
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

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Category Designation</label>
                
                <div style={{ display: 'flex', gap: '15px', marginBottom: '10px' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="categoryType"
                      checked={categoryType === 'existing'}
                      onChange={() => setCategoryType('existing')}
                    />
                    Choose Existing
                  </label>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="categoryType"
                      checked={categoryType === 'new'}
                      onChange={() => setCategoryType('new')}
                    />
                    ➕ Create New
                  </label>
                </div>

                {categoryType === 'existing' ? (
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#0a0a0c',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      color: '#fff',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    {allCategoriesList.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="e.g. Wildlife, Fashion, Corporate"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
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
                )}
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
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginTop: '10px'
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
              maxHeight: '550px',
              overflowY: 'auto',
              paddingRight: '5px'
            }}>
              {items.map(item => (
                <div key={item.id} style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  padding: '10px',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <div style={{
                    width: '100%',
                    aspectRatio: '3/2',
                    borderRadius: '4px',
                    background: `linear-gradient(135deg, #1f1f23 0%, #0c0c0e 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    {item.file_path ? (
                      <img 
                        src={item.file_path.startsWith('/images/upload_') ? item.file_path.replace('/images/', '/api/images/') : item.file_path} 
                        alt={item.caption} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    ) : (
                      '🖼️'
                    )}
                    <button
                      onClick={() => handleDeleteImage(item.id)}
                      style={{
                        position: 'absolute',
                        top: '5px',
                        right: '5px',
                        background: 'rgba(239, 68, 68, 0.85)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '2px 6px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        zIndex: 10,
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#ef4444'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.85)'}
                    >
                      Delete
                    </button>
                  </div>
                  <h4 style={{ fontSize: '13px', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                    {item.caption}
                  </h4>
                  <span style={{ fontSize: '11px', color: 'var(--accent-gold)', textTransform: 'uppercase', fontWeight: 600 }}>
                    {item.category}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : (
        /* Manage Categories Tab */
        <div className="glass-card" style={{ padding: '30px', maxWidth: '800px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#fff', marginBottom: '10px' }}>Manage Gallery Categories</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '25px' }}>
            Rename categories globally. Renaming a category updates the category tags for all images currently assigned to it.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {existingCategories.length > 0 ? (
              existingCategories.map(cat => {
                const count = items.filter(item => item.category === cat).length;
                const isRenaming = renameTarget === cat;
                return (
                  <div
                    key={cat}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px 20px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    {isRenaming ? (
                      <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                        <input
                          type="text"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          placeholder="Enter new category name..."
                          style={{
                            flex: 1,
                            background: '#0a0a0c',
                            border: '1px solid var(--accent-gold)',
                            borderRadius: '6px',
                            padding: '8px 12px',
                            color: '#fff',
                            fontSize: '14px'
                          }}
                        />
                        <button
                          onClick={() => handleRenameCategory(cat)}
                          disabled={loading || !renameValue.trim()}
                          style={{
                            background: 'var(--success-color)',
                            color: '#fff',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            fontWeight: 600,
                            cursor: (loading || !renameValue.trim()) ? 'not-allowed' : 'pointer'
                          }}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setRenameTarget(null);
                            setRenameValue('');
                          }}
                          style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            color: '#fff',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <div>
                          <span style={{ fontSize: '16px', color: '#fff', fontWeight: 600 }}>{cat}</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '12px' }}>
                            ({count} {count === 1 ? 'image' : 'images'} currently using this category)
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setRenameTarget(cat);
                            setRenameValue(cat);
                          }}
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#fff',
                            padding: '6px 14px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.border = '1px solid var(--accent-gold)';
                            e.currentTarget.style.color = 'var(--accent-gold)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)';
                            e.currentTarget.style.color = '#fff';
                          }}
                        >
                          Rename Category
                        </button>
                      </>
                    )}
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                No active categories found. Upload images and set categories to see them here.
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
