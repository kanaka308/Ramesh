'use client';

import { useState } from 'react';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  created_at: string;
  is_read: number;
}

interface NotificationsClientProps {
  initialNotifications: Notification[];
}

export default function NotificationsClient({ initialNotifications }: NotificationsClientProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [loading, setLoading] = useState(false);

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clear all notifications?')) return;
    setLoading(true);

    try {
      const response = await fetch('/api/admin/notifications', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setNotifications([]);
      } else {
        alert(data.error || 'Failed to clear notifications.');
      }
    } catch (err) {
      alert('Network error.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearSingle = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/notifications?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setNotifications(prev => prev.filter(n => n.id !== id));
      } else {
        alert(data.error || 'Failed to delete notification.');
      }
    } catch (err) {
      alert('Network error.');
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString();
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      {notifications.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleClearAll}
              disabled={loading}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid var(--danger-color)',
                color: '#fca5a5',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              Clear All Notifications
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {notifications.map(n => (
              <div
                key={n.id}
                className="glass-card"
                style={{
                  padding: '20px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '20px',
                  borderLeft: '4px solid var(--accent-gold)'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '16px' }}>💰</span>
                    <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#fff' }}>{n.title}</h4>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {formatDate(n.created_at)}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>
                    {n.message}
                  </p>
                </div>

                <button
                  onClick={() => handleClearSingle(n.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#555',
                    fontSize: '18px',
                    cursor: 'pointer',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    transition: 'color 0.2s, background 0.2s'
                  }}
                  title="Delete"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ef4444';
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#555';
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '50px 30px', textAlign: 'center' }}>
          <span style={{ fontSize: '40px', display: 'block', marginBottom: '15px' }}>🔔</span>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>All caught up!</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            No new payment notifications received. When online purchases are made, alerts will show up here.
          </p>
        </div>
      )}
    </div>
  );
}
