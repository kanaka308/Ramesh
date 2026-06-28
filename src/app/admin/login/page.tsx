'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        router.push('/admin/batches');
        router.refresh();
      } else {
        setErrorMsg(data.error || 'Invalid credentials.');
      }
    } catch (err) {
      setErrorMsg('Network connection failed.');
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
      background: 'radial-gradient(circle at center, rgba(212, 175, 55, 0.05) 0%, rgba(10, 10, 12, 1) 80%)'
    }}>
      <div className="glass-card" style={{ maxWidth: '400px', width: '100%', padding: '40px 30px' }}>
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <span style={{ fontSize: '32px' }}>⚙️</span>
          <h1 style={{ fontSize: '28px', marginTop: '15px', fontFamily: 'var(--font-serif)' }} className="gradient-text">Admin Login</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>
            Instructor portal access. Enter credentials.
          </p>
        </div>

        {errorMsg && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid var(--danger-color)',
            color: '#fca5a5',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '14px',
            marginBottom: '25px',
            textAlign: 'center'
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="admin-username" style={{
              display: 'block',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontWeight: 500,
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>Username</label>
            <input
              type="text"
              id="admin-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '12px 16px',
                color: '#fff',
                fontSize: '15px'
              }}
            />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label htmlFor="admin-password" style={{
              display: 'block',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontWeight: 500,
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>Password</label>
            <input
              type="password"
              id="admin-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '12px 16px',
                color: '#fff',
                fontSize: '15px'
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
              padding: '14px',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.3s ease'
            }}
          >
            {loading ? 'Logging in...' : 'Access Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
