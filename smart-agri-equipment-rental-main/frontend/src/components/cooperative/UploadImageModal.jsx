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
        backgroundColor: 'rgba(8, 14, 28, 0.85)',
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
          backgroundColor: '#131d35',
          borderRadius: '24px',
          padding: '2.2rem',
          position: 'relative',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)'
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            color: '#ffffff',
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
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginBottom: '1.2rem' }}>
          Upload Image for {equipment.name}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: 600 }}>
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
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                fontSize: '0.92rem',
                outline: 'none'
              }}
            />
          </div>

          {imageUrl && (
            <div style={{ borderRadius: '12px', overflow: 'hidden', height: '180px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
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
