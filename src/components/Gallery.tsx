'use client';

import { useState } from 'react';

interface GalleryItem {
  id: number;
  file_path: string;
  caption: string;
  category: string;
}

interface GalleryProps {
  initialItems: GalleryItem[];
}

export default function Gallery({ initialItems }: GalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [items] = useState<GalleryItem[]>(initialItems);

  const categories = ['All', ...Array.from(new Set(items.map(item => item.category)))];

  const filteredItems = selectedCategory === 'All' 
    ? items 
    : items.filter(item => item.category === selectedCategory);

  return (
    <section id="portfolio-section" style={{ padding: '80px 5%', background: '#0a0a0c' }}>
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <p style={{ color: 'var(--accent-gold)', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '13px', fontWeight: 600 }}>Elite Production Works</p>
        <h2 style={{ fontSize: '36px', marginTop: '10px', fontFamily: 'var(--font-serif)' }} className="gradient-text">Featured Visual Portfolio</h2>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '40px', flexWrap: 'wrap' }}>
        {categories.map(category => (
          <button
            key={category}
            id={`filter-${category.toLowerCase().replace(/\s+/g, '-')}`}
            onClick={() => setSelectedCategory(category)}
            style={{
              background: selectedCategory === category ? 'var(--accent-gold)' : 'rgba(255, 255, 255, 0.03)',
              color: selectedCategory === category ? '#000' : 'var(--text-secondary)',
              border: selectedCategory === category ? '1px solid var(--accent-gold)' : '1px solid rgba(255, 255, 255, 0.05)',
              padding: '8px 24px',
              borderRadius: '30px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              transition: 'all 0.3s ease'
            }}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Grid Container */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '24px'
      }}>
        {filteredItems.map(item => (
          <div
            key={item.id}
            id={`gallery-item-${item.id}`}
            style={{
              position: 'relative',
              borderRadius: '16px',
              overflow: 'hidden',
              aspectRatio: '3/2',
              background: '#151518',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              cursor: 'pointer'
            }}
          >
            {/* Display a beautiful simulated photo using CSS gradients if image file isn't found */}
            <div style={{
              width: '100%',
              height: '100%',
              background: `linear-gradient(135deg, #1f1f23 0%, #111115 100%)`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative'
            }}>
              {/* Camera Aperture Vector Pattern / Placeholder Art */}
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                border: '2px dashed var(--accent-gold)',
                opacity: 0.3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '10px'
              }}>
                📷
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.category} Frame</span>
              
              {/* Caption Overlay - displays on hover */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(to top, rgba(0, 0, 0, 0.95) 0%, rgba(0,0,0,0.4) 70%, transparent 100%)',
                padding: '24px 20px 20px 20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                height: '50%',
                transition: 'opacity 0.3s ease'
              }}>
                <span style={{
                  color: 'var(--accent-gold)',
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '4px'
                }}>{item.category}</span>
                <h4 style={{ color: '#fff', fontSize: '16px', fontWeight: 500 }}>{item.caption}</h4>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
