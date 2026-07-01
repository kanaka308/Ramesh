'use client';

import { useState } from 'react';

interface Material {
  id: number;
  title: string;
  description: string;
  price: number; // in paise
  file_url: string;
  whatsapp_enabled: boolean;
  online_enabled: boolean;
}

interface MaterialsManagerClientProps {
  initialMaterials: Material[];
}

export default function MaterialsManagerClient({ initialMaterials }: MaterialsManagerClientProps) {
  const [materials, setMaterials] = useState<Material[]>(initialMaterials);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  // Form states - Create new
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriceINR, setNewPriceINR] = useState('');
  const [newFileUrl, setNewFileUrl] = useState('');
  const [newWhatsappEnabled, setNewWhatsappEnabled] = useState(true);
  const [newOnlineEnabled, setNewOnlineEnabled] = useState(false);

  // Form states - Edit
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriceINR, setEditPriceINR] = useState('');
  const [editFileUrl, setEditFileUrl] = useState('');
  const [editWhatsappEnabled, setEditWhatsappEnabled] = useState(true);
  const [editOnlineEnabled, setEditOnlineEnabled] = useState(false);

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPriceINR.trim() || !newFileUrl.trim()) {
      setStatusMsg({ type: 'error', text: 'Title, Price, and File URL are required.' });
      return;
    }

    const priceINR = parseFloat(newPriceINR);
    if (isNaN(priceINR) || priceINR < 0) {
      setStatusMsg({ type: 'error', text: 'Please enter a valid positive price.' });
      return;
    }

    setLoading(true);
    setStatusMsg(null);

    try {
      const response = await fetch('/api/admin/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDescription.trim(),
          price: Math.round(priceINR * 100), // convert to paise
          file_url: newFileUrl.trim(),
          whatsapp_enabled: newWhatsappEnabled,
          online_enabled: newOnlineEnabled
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatusMsg({ type: 'success', text: 'Material template created successfully!' });
        setMaterials(prev => [...prev, data.material]);
        
        // Reset fields
        setNewTitle('');
        setNewDescription('');
        setNewPriceINR('');
        setNewFileUrl('');
        setNewWhatsappEnabled(true);
        setNewOnlineEnabled(false);
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Failed to create material.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Connection error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (material: Material) => {
    setEditingMaterial(material);
    setEditTitle(material.title);
    setEditDescription(material.description);
    setEditPriceINR((material.price / 100).toString());
    setEditFileUrl(material.file_url);
    setEditWhatsappEnabled(material.whatsapp_enabled);
    setEditOnlineEnabled(material.online_enabled);
    setStatusMsg(null);
  };

  const handleCancelEdit = () => {
    setEditingMaterial(null);
    setStatusMsg(null);
  };

  const handleUpdateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMaterial) return;

    if (!editTitle.trim() || !editPriceINR.trim() || !editFileUrl.trim()) {
      setStatusMsg({ type: 'error', text: 'Title, Price, and File URL are required.' });
      return;
    }

    const priceINR = parseFloat(editPriceINR);
    if (isNaN(priceINR) || priceINR < 0) {
      setStatusMsg({ type: 'error', text: 'Please enter a valid positive price.' });
      return;
    }

    setLoading(true);
    setStatusMsg(null);

    try {
      const response = await fetch('/api/admin/materials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingMaterial.id,
          title: editTitle.trim(),
          description: editDescription.trim(),
          price: Math.round(priceINR * 100),
          file_url: editFileUrl.trim(),
          whatsapp_enabled: editWhatsappEnabled,
          online_enabled: editOnlineEnabled
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatusMsg({ type: 'success', text: 'Material template updated successfully!' });
        setMaterials(prev => prev.map(m => m.id === editingMaterial.id ? data.material : m));
        setEditingMaterial(null);
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Failed to update material.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Connection error.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMaterial = async (id: number) => {
    if (!confirm('Are you sure you want to delete this material?')) return;
    setLoading(true);
    setStatusMsg(null);

    try {
      const response = await fetch(`/api/admin/materials?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatusMsg({ type: 'success', text: 'Material deleted successfully.' });
        setMaterials(prev => prev.filter(m => m.id !== id));
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Failed to delete material.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Connection error.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div>
        <h1 style={{ fontSize: '32px', fontFamily: 'var(--font-serif)', marginBottom: '8px' }} className="gradient-text">
          Materials & Templates Editor
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Add files (Google Drive links) for sale, customize booking options, and manage access.
        </p>
      </div>

      {statusMsg && (
        <div style={{
          background: statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${statusMsg.type === 'success' ? 'var(--success-color)' : 'var(--danger-color)'}`,
          color: statusMsg.type === 'success' ? 'var(--success-color)' : '#fca5a5',
          padding: '16px',
          borderRadius: '8px',
          fontSize: '14px',
          textAlign: 'center',
          maxWidth: '800px'
        }}>
          {statusMsg.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px', alignItems: 'flex-start' }}>
        {/* Form Container */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '20px' }}>
            {editingMaterial ? 'Edit Material' : 'Add New Material'}
          </h3>

          <form onSubmit={editingMaterial ? handleUpdateMaterial : handleAddMaterial} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Material Title</label>
              <input
                type="text"
                placeholder="e.g. Cinematic Presets & LUTs Pack"
                value={editingMaterial ? editTitle : newTitle}
                onChange={(e) => editingMaterial ? setEditTitle(e.target.value) : setNewTitle(e.target.value)}
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

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Description</label>
              <textarea
                placeholder="Details about what files are inside the Google Drive pack..."
                value={editingMaterial ? editDescription : newDescription}
                onChange={(e) => editingMaterial ? setEditDescription(e.target.value) : setNewDescription(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  color: '#fff',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Price (INR)</label>
              <input
                type="number"
                placeholder="e.g. 199"
                value={editingMaterial ? editPriceINR : newPriceINR}
                onChange={(e) => editingMaterial ? setEditPriceINR(e.target.value) : setNewPriceINR(e.target.value)}
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

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Google Drive URL</label>
              <input
                type="url"
                placeholder="https://drive.google.com/file/d/..."
                value={editingMaterial ? editFileUrl : newFileUrl}
                onChange={(e) => editingMaterial ? setEditFileUrl(e.target.value) : setNewFileUrl(e.target.value)}
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

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Purchase Channels</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'rgba(255, 255, 255, 0.4)' }}>
                  <input
                    type="checkbox"
                    checked={true}
                    disabled={true}
                  />
                  WhatsApp Buy (Enabled by default)
                </div>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={editingMaterial ? editOnlineEnabled : newOnlineEnabled}
                    onChange={(e) => editingMaterial ? setEditOnlineEnabled(e.target.checked) : setNewOnlineEnabled(e.target.checked)}
                  />
                  Pay Now / Purchase Online Button
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  background: 'var(--accent-gold)',
                  color: '#000',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Processing...' : editingMaterial ? 'Update Material' : 'Create Material'}
              </button>
              {editingMaterial && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    color: '#fff',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: '6px',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Materials List */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '20px' }}>
            Current Materials & Templates ({materials.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '600px', overflowY: 'auto', paddingRight: '5px' }}>
            {materials.length > 0 ? (
              materials.map(m => (
                <div
                  key={m.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ fontSize: '17px', fontWeight: 600, color: '#fff', margin: 0 }}>{m.title}</h4>
                      <span style={{ fontSize: '14px', color: 'var(--accent-gold)', fontWeight: 600, display: 'inline-block', marginTop: '4px' }}>
                        ₹{(m.price / 100).toFixed(2)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleStartEdit(m)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: '#fff',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteMaterial(m.id)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid var(--danger-color)',
                          color: 'var(--danger-color)',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {m.description && (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0, lineHeight: 1.4 }}>
                      {m.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '10px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      📂 Google Drive URL: <code style={{ color: 'var(--accent-gold)' }}>{m.file_url}</code>
                    </div>
                    <div style={{ display: 'flex', gap: '15px', marginTop: '4px' }}>
                      <span style={{ fontSize: '11px', background: 'rgba(37, 211, 102, 0.15)', color: '#25D366', padding: '2px 8px', borderRadius: '4px', border: '1px solid #25D366' }}>
                        💬 WhatsApp Purchase: Active (Default)
                      </span>
                      <span style={{ fontSize: '11px', background: m.online_enabled ? 'rgba(245, 196, 83, 0.15)' : 'rgba(255,255,255,0.05)', color: m.online_enabled ? 'var(--accent-gold)' : 'var(--text-secondary)', padding: '2px 8px', borderRadius: '4px', border: m.online_enabled ? '1px solid var(--accent-gold)' : '1px solid rgba(255,255,255,0.1)' }}>
                        💳 Online Pay Now: {m.online_enabled ? 'Visible' : 'Hidden'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                No materials/templates created yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
