'use client';

import { useState } from 'react';

interface Bootcamp {
  id: number;
  title: string;
  next_date: string;
  is_active: number;
  description: string;
  pay_now_enabled?: boolean;
}

interface BatchesEditorClientProps {
  initialBatches: Bootcamp[];
}

export default function BatchesEditorClient({ initialBatches }: BatchesEditorClientProps) {
  const [batches, setBatches] = useState<Bootcamp[]>(initialBatches);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states for adding a new batch
  const [newTitle, setNewTitle] = useState('');
  const [newNextDate, setNewNextDate] = useState('');
  const [newIsActive, setNewIsActive] = useState<number>(1);
  const [newDescription, setNewDescription] = useState('');
  const [newPayNowEnabled, setNewPayNowEnabled] = useState(true);

  // Editing states
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editNextDate, setEditNextDate] = useState('');
  const [editIsActive, setEditIsActive] = useState<number>(1);
  const [editDescription, setEditDescription] = useState('');
  const [editPayNowEnabled, setEditPayNowEnabled] = useState(true);

  const handleAddBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newNextDate) {
      setStatusMsg({ type: 'error', text: 'Title and Next Date are required.' });
      return;
    }

    setLoading(true);
    setStatusMsg(null);

    try {
      const response = await fetch('/api/admin/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          next_date: newNextDate,
          is_active: newIsActive,
          description: newDescription,
          pay_now_enabled: newPayNowEnabled
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatusMsg({ type: 'success', text: `Successfully registered bootcamp cohort "${newTitle}".` });
        
        const newItem: Bootcamp = {
          id: Date.now(), // temp UI ID
          title: newTitle,
          next_date: newNextDate,
          is_active: newIsActive,
          description: newDescription,
          pay_now_enabled: newPayNowEnabled
        };
        setBatches(prev => [newItem, ...prev]);
        setNewTitle('');
        setNewNextDate('');
        setNewIsActive(1);
        setNewDescription('');
        setNewPayNowEnabled(true);
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Failed to add bootcamp cohort.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Network connection failed.' });
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (batch: Bootcamp) => {
    setEditingId(batch.id);
    setEditTitle(batch.title);
    setEditNextDate(batch.next_date);
    setEditIsActive(batch.is_active);
    setEditDescription(batch.description || '');
    setEditPayNowEnabled(batch.pay_now_enabled !== false);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (id: number) => {
    if (!editTitle || !editNextDate) {
      setStatusMsg({ type: 'error', text: 'Title and Next Date are required.' });
      return;
    }

    setLoading(true);
    setStatusMsg(null);

    try {
      const response = await fetch('/api/admin/batches', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          title: editTitle,
          next_date: editNextDate,
          is_active: editIsActive,
          description: editDescription,
          pay_now_enabled: editPayNowEnabled
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatusMsg({ type: 'success', text: `Successfully updated cohort "${editTitle}".` });
        setBatches(prev => prev.map(b => b.id === id ? {
          ...b,
          title: editTitle,
          next_date: editNextDate,
          is_active: editIsActive,
          description: editDescription,
          pay_now_enabled: editPayNowEnabled
        } : b));
        setEditingId(null);
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Failed to save changes.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Network connection failed.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBatch = async (id: number) => {
    if (!confirm('Are you sure you want to delete this bootcamp cohort? All registered students will lose cohort associations.')) return;
    setStatusMsg(null);

    try {
      const response = await fetch(`/api/admin/batches?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatusMsg({ type: 'success', text: 'Bootcamp cohort deleted successfully.' });
        setBatches(prev => prev.filter(b => b.id !== id));
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Failed to delete cohort.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Network connection failed.' });
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px', alignItems: 'flex-start' }}>
      
      {/* Add Batch Card */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '20px' }}>Add Bootcamp Cohort</h3>
        
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

        <form onSubmit={handleAddBatch}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Bootcamp Cohort Title</label>
            <input
              type="text"
              placeholder="e.g. Advanced Cinematography"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
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
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Next Cohort Start Date</label>
            <input
              type="text"
              placeholder="e.g. 15 SEPTEMBER"
              value={newNextDate}
              onChange={(e) => setNewNextDate(e.target.value)}
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
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Registration Availability</label>
            <select
              value={newIsActive}
              onChange={(e) => setNewIsActive(parseInt(e.target.value, 10))}
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
              <option value={1}>Open (Accepting Inquiries)</option>
              <option value={0}>Closed (Batch Full)</option>
            </select>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Description / Perks</label>
            <textarea
              placeholder="Enter cohort description curriculum details..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              style={{
                width: '100%',
                height: '100px',
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

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', color: '#fff' }}>
              <input
                type="checkbox"
                checked={newPayNowEnabled}
                onChange={(e) => setNewPayNowEnabled(e.target.checked)}
              />
              Enable Pay Now / Buy Online Button
            </label>
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
            {loading ? 'Adding...' : 'Create Cohort'}
          </button>
        </form>
      </div>

      {/* Cohorts list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', flex: 1 }}>
        {batches.map(batch => {
          const isEditing = editingId === batch.id;
          return (
            <div key={batch.id} className="glass-card" style={{ padding: '30px' }}>
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Bootcamp Cohort Title</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#0a0a0c',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '6px',
                        padding: '10px',
                        color: '#fff'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Next cohort Date</label>
                    <input
                      type="text"
                      value={editNextDate}
                      onChange={(e) => setEditNextDate(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#0a0a0c',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '6px',
                        padding: '10px',
                        color: '#fff'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Registration Availability</label>
                    <select
                      value={editIsActive}
                      onChange={(e) => setEditIsActive(parseInt(e.target.value, 10))}
                      style={{
                        width: '100%',
                        background: '#0a0a0c',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '6px',
                        padding: '10px',
                        color: '#fff'
                      }}
                    >
                      <option value={1}>Open (Accepting Inquiries)</option>
                      <option value={0}>Closed (Batch Full)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Description</label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      style={{
                        width: '100%',
                        height: '100px',
                        background: '#0a0a0c',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '6px',
                        padding: '10px',
                        color: '#fff',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', color: '#fff' }}>
                      <input
                        type="checkbox"
                        checked={editPayNowEnabled}
                        onChange={(e) => setEditPayNowEnabled(e.target.checked)}
                      />
                      Enable Pay Now / Buy Online Button
                    </label>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button
                      onClick={() => handleSaveEdit(batch.id)}
                      style={{
                        background: 'var(--success-color, #10b981)',
                        color: '#fff',
                        border: 'none',
                        padding: '10px 24px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: '#fff',
                        border: 'none',
                        padding: '10px 24px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#fff' }}>
                      {batch.title}
                    </h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => handleStartEdit(batch)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: '#fff',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          padding: '6px 14px',
                          borderRadius: '6px',
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      >
                        Edit / Rename
                      </button>
                      <button
                        onClick={() => handleDeleteBatch(batch.id)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#fca5a5',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          padding: '6px 14px',
                          borderRadius: '6px',
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>{batch.description}</p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span>Start Date: <strong style={{ color: 'var(--accent-gold)' }}>{batch.next_date}</strong></span>
                      <span style={{ color: batch.pay_now_enabled !== false ? 'var(--success-color)' : 'var(--danger-color)', fontSize: '12px', fontWeight: 600 }}>
                        {batch.pay_now_enabled !== false ? '💳 Online Purchase: Enabled' : '🚫 Online Purchase: Disabled (WhatsApp Only)'}
                      </span>
                    </span>
                    <span style={{
                      background: batch.is_active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: batch.is_active ? 'var(--success-color)' : 'var(--danger-color)',
                      border: `1px solid ${batch.is_active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 600
                    }}>
                      {batch.is_active ? 'Open' : 'Closed'}
                    </span>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
