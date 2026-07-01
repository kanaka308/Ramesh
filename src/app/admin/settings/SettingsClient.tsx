'use client';

import { useState } from 'react';

interface SettingsClientProps {
  initialSettings: Record<string, string>;
}

export default function SettingsClient({ initialSettings }: SettingsClientProps) {
  const [settings, setSettings] = useState<Record<string, string>>(initialSettings);
  const [loading, setLoading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleFieldChange = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoUploading(true);
    setStatusMsg(null);

    const formData = new FormData();
    formData.append('logo', file);

    try {
      const response = await fetch('/api/admin/settings/logo', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatusMsg({ type: 'success', text: 'Logo uploaded successfully! Refresh the page to see changes across the site.' });
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Failed to upload logo.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Network connection failed during upload.' });
    } finally {
      setLogoUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatusMsg({ type: 'success', text: 'All settings saved successfully! Changes are now live.' });
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Failed to save settings.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Network connection failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px' }}>
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

      <form onSubmit={handleSave} className="glass-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '25px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '15px' }}>
          Header & Brand Details
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Upload Brand Logo (.jpg/.png)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              disabled={logoUploading}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '6px',
                padding: '6px 12px',
                color: '#fff',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            />
            {logoUploading && <span style={{ fontSize: '11px', color: 'var(--accent-gold)', marginTop: '4px', display: 'block' }}>Uploading...</span>}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Logo Text (First Part)</label>
            <input
              type="text"
              value={settings.site_logo_first}
              onChange={(e) => handleFieldChange('site_logo_first', e.target.value)}
              required
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
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Logo Text (Second Part)</label>
            <input
              type="text"
              value={settings.site_logo_second}
              onChange={(e) => handleFieldChange('site_logo_second', e.target.value)}
              required
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
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Site Window Title (SEO Meta Title)</label>
          <input
            type="text"
            value={settings.site_title}
            onChange={(e) => handleFieldChange('site_title', e.target.value)}
            required
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

        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '15px', marginTop: '15px' }}>
          Hero Section Customization
        </h3>

        <div>
          <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Hero Small Pre-Title</label>
          <input
            type="text"
            value={settings.site_hero_pre}
            onChange={(e) => handleFieldChange('site_hero_pre', e.target.value)}
            required
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
          <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Hero Main Headline Title</label>
          <input
            type="text"
            value={settings.site_hero_title}
            onChange={(e) => handleFieldChange('site_hero_title', e.target.value)}
            required
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
          <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Hero Subtitle Description</label>
          <textarea
            value={settings.site_hero_subtitle}
            onChange={(e) => handleFieldChange('site_hero_subtitle', e.target.value)}
            required
            style={{
              width: '100%',
              height: '100px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '6px',
              padding: '10px 14px',
              color: '#fff',
              fontSize: '14px',
              resize: 'vertical'
            }}
          />
        </div>

        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '15px', marginTop: '15px' }}>
          Contact Settings
        </h3>

        <div>
          <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>WhatsApp Enquiries Number (with Country Code, no symbols/spaces)</label>
          <input
            type="text"
            value={settings.whatsapp_number}
            onChange={(e) => handleFieldChange('whatsapp_number', e.target.value)}
            required
            placeholder="e.g. 919900000000"
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
          <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>WhatsApp Floating Button Welcome Message</label>
          <textarea
            value={settings.whatsapp_custom_message || ''}
            onChange={(e) => handleFieldChange('whatsapp_custom_message', e.target.value)}
            required
            placeholder="Welcome message sent when a user clicks the floating WhatsApp icon"
            style={{
              width: '100%',
              height: '80px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '6px',
              padding: '10px 14px',
              color: '#fff',
              fontSize: '14px',
              resize: 'vertical'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            background: 'var(--accent-gold)',
            color: '#000',
            border: 'none',
            padding: '14px',
            borderRadius: '6px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.3s ease',
            marginTop: '15px'
          }}
        >
          {loading ? 'Saving Customizations...' : 'Publish Settings'}
        </button>
      </form>
    </div>
  );
}
