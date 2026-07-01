'use client';

import { useState, useEffect } from 'react';

interface Notification {
  id: number;
  is_read: number;
}

export default function NotificationBadge() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch('/api/admin/notifications');
        const data = await res.json();
        if (data.success && data.notifications) {
          const count = data.notifications.filter((n: Notification) => n.is_read === 0).length;
          setUnreadCount(count);
        }
      } catch (err) {
        console.error('Failed to load notifications count:', err);
      }
    }

    fetchCount();
    
    // Poll every 30 seconds for live payment notifications
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  if (unreadCount === 0) return null;

  return (
    <span style={{ 
      background: 'var(--accent-gold)', 
      color: '#000', 
      fontWeight: 'bold', 
      fontSize: '11px', 
      padding: '2px 8px', 
      borderRadius: '10px' 
    }}>
      {unreadCount}
    </span>
  );
}
