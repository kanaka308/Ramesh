'use client';

import { useEffect } from 'react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Captured Next.js runtime error:', error);
  }, [error]);

  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      background: '#0a0a0c'
    }}>
      <div className="glass-card" style={{ maxWidth: '500px', width: '100%', textAlign: 'center', padding: '40px 30px' }}>
        <span style={{ fontSize: '48px' }}>⚠️</span>
        <h1 style={{ fontSize: '26px', fontFamily: 'var(--font-serif)', marginTop: '20px', color: 'var(--accent-gold)' }}>
          Something went wrong
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '12px', marginBottom: '30px', lineHeight: 1.6 }}>
          We encountered an unexpected error loading this resource. Please verify your connection or click retry below.
        </p>

        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <button
            onClick={() => reset()}
            style={{
              background: 'var(--accent-gold)',
              color: '#000',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Retry Loading
          </button>
          <a
            href="/"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '14px'
            }}
          >
            Return Home
          </a>
        </div>
      </div>
    </div>
  );
}
