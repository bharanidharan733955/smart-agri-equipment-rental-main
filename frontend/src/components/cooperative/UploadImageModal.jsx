// src/components/cooperative/UploadImageModal.jsx
import React, { useState } from 'react';
import { X, Upload, Image } from 'lucide-react';

export default function UploadImageModal({ equipment, isOpen, onClose, onUploadImage }) {
  if (!isOpen || !equipment) return null;

  const [imageUrl, setImageUrl] = useState(equipment.imageUrl || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (imageUrl) {
      onUploadImage(equipment.id, imageUrl);
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        backgroundColor: 'var(--color-surface)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: 'var(--color-surface)',
          borderRadius: '24px',
          padding: '2.2rem',
          position: 'relative',
          border: '1px solid var(--color-border)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)'
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            background: 'var(--color-border)',
            border: 'none',
            color: 'var(--color-text)',
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={18} />
        </button>

        <span className="section-tag">UPLOAD IMAGE</span>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '1.2rem' }}>
          Upload Image for {equipment.name}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>
              Image URL / File Path *
            </label>
            <input
              type="url"
              required
              placeholder="https://images.unsplash.com/..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                backgroundColor: 'transparent',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
                fontSize: '0.92rem',
                outline: 'none'
              }}
            />
          </div>

          {imageUrl && (
            <div style={{ borderRadius: '12px', overflow: 'hidden', height: '180px', border: '1px solid var(--color-border)' }}>
              <img src={imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}

          <button type="submit" className="btn-green" style={{ width: '100%', padding: '0.85rem', justifyContent: 'center' }}>
            <Upload size={18} />
            <span>Upload Equipment Image</span>
          </button>
        </form>
      </div>
    </div>
  );
}
