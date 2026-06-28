'use client';

import { useState } from 'react';

interface Bootcamp {
  id: number;
  title: string;
  next_date: string;
  is_active: number;
  description: string;
}

interface BatchesEditorClientProps {
  initialBatches: Bootcamp[];
}

export default function BatchesEditorClient({ initialBatches }: BatchesEditorClientProps) {
  const [batches, setBatches] = useState<Bootcamp[]>(initialBatches);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleFieldChange = (id: number, field: keyof Bootcamp, value: any) => {
    setBatches(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const handleSave = async (id: number) => {
    setUpdatingId(id);
    setStatusMsg(null);
    const targetBatch = batches.find(b => b.id === id);

    try {
      const response = await fetch('/api/admin/updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'batch',
          id,
          next_date: targetBatch?.next_date,
          is_active: targetBatch?.is_active,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatusMsg({ type: 'success', text: `Successfully updated ${targetBatch?.title} batch details.` });
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Failed to save changes.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Network connection failed.' });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      {statusMsg && (
        <div style={{
          background: statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${statusMsg.type === 'success' ? 'var(--success-color)' : 'var(--danger-color)'}`,
          color: statusMsg.type === 'success' ? 'var(--success-color)' : '#fca5a5',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '14px',
          marginBottom: '25px',
          textAlign: 'center'
        }}>
          {statusMsg.text}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {batches.map(batch => (
          <div key={batch.id} className="glass-card" style={{ padding: '30px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#fff', marginBottom: '20px' }}>
              {batch.title}
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              marginBottom: '20px'
            }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Next Start Date
                </label>
                <input
                  type="text"
                  value={batch.next_date}
                  onChange={(e) => handleFieldChange(batch.id, 'next_date', e.target.value)}
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

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Registration Status
                </label>
                <select
                  value={batch.is_active}
                  onChange={(e) => handleFieldChange(batch.id, 'is_active', parseInt(e.target.value, 10))}
                  style={{
                    width: '100%',
                    background: 'rgba(10, 10, 12, 1)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '6px',
                    padding: '10px 14px',
                    color: '#fff',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  <option value={1}>Open (Accepting Inquiries)</option>
                  <option value={0}>Closed (Batch Full)</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => handleSave(batch.id)}
              disabled={updatingId === batch.id}
              style={{
                background: 'var(--accent-gold)',
                color: '#000',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background-color 0.3s ease'
              }}
            >
              {updatingId === batch.id ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
