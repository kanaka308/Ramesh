'use client';

import { useState } from 'react';

interface Batch {
  id: number;
  title: string;
}

interface Registration {
  id: number;
  batch_id: number;
  batch_title: string;
  student_name: string;
  student_email: string;
  student_phone: string;
  status: string;
  registered_at: string;
}

interface AttendeesManagerClientProps {
  initialRegistrations: Registration[];
  batches: Batch[];
}

export default function AttendeesManagerClient({ initialRegistrations, batches }: AttendeesManagerClientProps) {
  const [registrations, setRegistrations] = useState<Registration[]>(initialRegistrations);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states for new attendee
  const [newBatchId, setNewBatchId] = useState<string>(batches[0]?.id.toString() || '');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newStatus, setNewStatus] = useState('enquired');

  // Editing state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editBatchId, setEditBatchId] = useState<number>(0);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editStatus, setEditStatus] = useState('');

  const handleAddAttendee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchId || !newName || !newEmail) {
      setStatusMsg({ type: 'error', text: 'Batch, Name, and Email are required.' });
      return;
    }

    setLoading(true);
    setStatusMsg(null);

    try {
      const response = await fetch('/api/admin/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batch_id: parseInt(newBatchId, 10),
          student_name: newName,
          student_email: newEmail,
          student_phone: newPhone,
          status: newStatus
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatusMsg({ type: 'success', text: 'Attendee registered successfully!' });
        
        // Refresh local list (simplest is page reload or appending to state)
        const selectedBatch = batches.find(b => b.id.toString() === newBatchId);
        const newItem: Registration = {
          id: Date.now(), // temporary UI ID
          batch_id: parseInt(newBatchId, 10),
          batch_title: selectedBatch ? selectedBatch.title : 'Selected Batch',
          student_name: newName,
          student_email: newEmail,
          student_phone: newPhone,
          status: newStatus,
          registered_at: new Date().toISOString()
        };
        
        setRegistrations(prev => [newItem, ...prev]);
        setNewName('');
        setNewEmail('');
        setNewPhone('');
        setNewStatus('enquired');
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Failed to add attendee.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Network connection error.' });
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (item: Registration) => {
    setEditingId(item.id);
    setEditBatchId(item.batch_id);
    setEditName(item.student_name);
    setEditEmail(item.student_email);
    setEditPhone(item.student_phone);
    setEditStatus(item.status);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleUpdateAttendee = async (id: number) => {
    setLoading(true);
    setStatusMsg(null);

    try {
      const response = await fetch('/api/admin/registrations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          batch_id: editBatchId,
          student_name: editName,
          student_email: editEmail,
          student_phone: editPhone,
          status: editStatus
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatusMsg({ type: 'success', text: 'Attendee details updated successfully.' });
        const selectedBatch = batches.find(b => b.id === editBatchId);
        setRegistrations(prev => prev.map(r => r.id === id ? {
          ...r,
          batch_id: editBatchId,
          batch_title: selectedBatch ? selectedBatch.title : r.batch_title,
          student_name: editName,
          student_email: editEmail,
          student_phone: editPhone,
          status: editStatus
        } : r));
        setEditingId(null);
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Failed to update attendee.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Network connection error.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAttendee = async (id: number) => {
    if (!confirm('Are you sure you want to delete this attendee?')) return;
    setStatusMsg(null);

    try {
      const response = await fetch(`/api/admin/registrations?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatusMsg({ type: 'success', text: 'Attendee removed successfully.' });
        setRegistrations(prev => prev.filter(r => r.id !== id));
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Failed to delete attendee.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Network connection error.' });
    }
  };

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case 'joined':
        return { background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-color)' };
      case 'cancelled':
        return { background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)' };
      default:
        return { background: 'rgba(212, 175, 55, 0.1)', color: 'var(--accent-gold)' };
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
      
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

      {/* Add Form Card */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '20px' }}>Register / Add Attendee manually</h3>
        
        <form onSubmit={handleAddAttendee} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Select Bootcamp</label>
            <select
              value={newBatchId}
              onChange={(e) => setNewBatchId(e.target.value)}
              required
              style={{
                width: '100%',
                background: '#0a0a0c',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '6px',
                padding: '8px 12px',
                color: '#fff',
                fontSize: '14px',
                height: '38px'
              }}
            >
              {batches.map(b => (
                <option key={b.id} value={b.id}>{b.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Student Name</label>
            <input
              type="text"
              placeholder="e.g. Ramesh"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '6px',
                padding: '8px 12px',
                color: '#fff',
                fontSize: '14px',
                height: '38px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Student Email</label>
            <input
              type="email"
              placeholder="e.g. ramesh@example.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '6px',
                padding: '8px 12px',
                color: '#fff',
                fontSize: '14px',
                height: '38px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Phone Number</label>
            <input
              type="tel"
              placeholder="e.g. +91 9900000000"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '6px',
                padding: '8px 12px',
                color: '#fff',
                fontSize: '14px',
                height: '38px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              style={{
                width: '100%',
                background: '#0a0a0c',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '6px',
                padding: '8px 12px',
                color: '#fff',
                fontSize: '14px',
                height: '38px'
              }}
            >
              <option value="enquired">Enquiry</option>
              <option value="joined">Enrolled / Joined</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || batches.length === 0}
            style={{
              background: 'var(--accent-gold)',
              color: '#000',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: (loading || batches.length === 0) ? 'not-allowed' : 'pointer',
              height: '38px',
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? 'Adding...' : '+ Add Student'}
          </button>
        </form>
      </div>

      {/* Attendees Table / List */}
      <div className="glass-card" style={{ padding: '24px', overflowX: 'auto' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '20px' }}>Active Registrations ({registrations.length})</h3>

        {registrations.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px 16px' }}>Student</th>
                <th style={{ padding: '12px 16px' }}>Bootcamp Batch</th>
                <th style={{ padding: '12px 16px' }}>Contact</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map(r => {
                const isEditing = editingId === r.id;
                return (
                  <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', verticalAlign: 'middle' }}>
                    
                    {/* Student Info */}
                    <td style={{ padding: '16px' }}>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          style={{
                            background: '#0a0a0c',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            color: '#fff',
                            width: '120px'
                          }}
                        />
                      ) : (
                        <div style={{ fontWeight: 500, color: '#fff' }}>{r.student_name}</div>
                      )}
                    </td>

                    {/* Bootcamp Batch */}
                    <td style={{ padding: '16px' }}>
                      {isEditing ? (
                        <select
                          value={editBatchId}
                          onChange={(e) => setEditBatchId(parseInt(e.target.value, 10))}
                          style={{
                            background: '#0a0a0c',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            color: '#fff'
                          }}
                        >
                          {batches.map(b => (
                            <option key={b.id} value={b.id}>{b.title}</option>
                          ))}
                        </select>
                      ) : (
                        <span style={{ color: 'var(--text-secondary)' }}>{r.batch_title}</span>
                      )}
                    </td>

                    {/* Contact Details */}
                    <td style={{ padding: '16px' }}>
                      {isEditing ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <input
                            type="email"
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            style={{
                              background: '#0a0a0c',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '4px',
                              padding: '4px 8px',
                              color: '#fff',
                              width: '160px'
                            }}
                          />
                          <input
                            type="text"
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                            style={{
                              background: '#0a0a0c',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '4px',
                              padding: '4px 8px',
                              color: '#fff',
                              width: '160px'
                            }}
                          />
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontSize: '13px', color: '#fff' }}>{r.student_email}</div>
                          {r.student_phone && <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{r.student_phone}</div>}
                        </div>
                      )}
                    </td>

                    {/* Status badge */}
                    <td style={{ padding: '16px' }}>
                      {isEditing ? (
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                          style={{
                            background: '#0a0a0c',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            color: '#fff'
                          }}
                        >
                          <option value="enquired">Enquiry</option>
                          <option value="joined">Enrolled / Joined</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      ) : (
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          ...getStatusBadgeStyles(r.status)
                        }}>
                          {r.status}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      {isEditing ? (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleUpdateAttendee(r.id)}
                            style={{
                              background: 'var(--success-color, #10b981)',
                              color: '#fff',
                              border: 'none',
                              padding: '4px 10px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            style={{
                              background: 'rgba(255,255,255,0.1)',
                              color: '#fff',
                              border: 'none',
                              padding: '4px 10px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleStartEdit(r)}
                            style={{
                              background: 'rgba(255, 255, 255, 0.04)',
                              color: '#fff',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              padding: '4px 10px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteAttendee(r.id)}
                            style={{
                              background: 'rgba(239, 68, 68, 0.1)',
                              color: '#fca5a5',
                              border: '1px solid rgba(239, 68, 68, 0.2)',
                              padding: '4px 10px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No registered attendees found. Use the form above to register students manually.
          </div>
        )}
      </div>

    </div>
  );
}
