'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({ type: 'success', text: 'Success! We sent a passwordless magic link to your email inbox.' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to send magic link. Please check your email format.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network connection error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      background: 'radial-gradient(circle at center, rgba(212, 175, 55, 0.08) 0%, rgba(10, 10, 12, 1) 80%)'
    }}>
      <div className="glass-card" style={{ maxWidth: '450px', width: '100%', padding: '40px 30px' }}>
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <span style={{ fontSize: '32px' }}>🔒</span>
          <h1 style={{ fontSize: '28px', marginTop: '15px', fontFamily: 'var(--font-serif)' }} className="gradient-text">Student Portal</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>
            Enter your email to receive an instant sign-in magic link. No password required.
          </p>
        </div>

        {message && (
          <div id="login-notification" style={{
            background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${message.type === 'success' ? 'var(--success-color)' : 'var(--danger-color)'}`,
            color: message.type === 'success' ? 'var(--success-color)' : '#fca5a5',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            marginBottom: '25px',
            textAlign: 'center'
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} id="login-form">
          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="student-email" style={{
              display: 'block',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontWeight: 500,
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>Email Address</label>
            <input
              type="email"
              id="student-email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '12px 16px',
                color: '#fff',
                fontSize: '15px',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent-gold)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
            />
          </div>

          <button
            type="submit"
            id="login-submit-btn"
            disabled={loading}
            style={{
              width: '100%',
              background: 'var(--accent-gold)',
              color: '#000',
              border: 'none',
              padding: '14px',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.3s ease'
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = 'var(--accent-gold-hover)';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = 'var(--accent-gold)';
            }}
          >
            {loading ? 'Sending link...' : 'Send Magic Link'}
          </button>
        </form>
      </div>
    </div>
  );
}
