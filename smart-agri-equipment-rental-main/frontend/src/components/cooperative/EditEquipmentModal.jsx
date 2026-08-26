// src/components/cooperative/EditEquipmentModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Edit, Save } from 'lucide-react';

export default function EditEquipmentModal({ equipment, isOpen, onClose, onSaveEdit }) {
  if (!isOpen || !equipment) return null;

  const [name, setName] = useState(equipment.name || '');
  const [category, setCategory] = useState(equipment.category || 'Tractor');
  const [price, setPrice] = useState(equipment.price || equipment.pricePerDay || 1500);
  const [location, setLocation] = useState(equipment.location || 'Ludhiana Central Hub #1');
  const [condition, setCondition] = useState(equipment.condition || 'good');
  const [status, setStatus] = useState(equipment.status || 'Available');
  const [imageUrl, setImageUrl] = useState(equipment.imageUrl || '');
  const [manufacturer, setManufacturer] = useState(equipment.manufacturer || 'Mahindra');

  useEffect(() => {
    if (equipment) {
      setName(equipment.name || '');
      setCategory(equipment.category || 'Tractor');
      setPrice(equipment.rentalRate || equipment.price || equipment.pricePerDay || 1500);
      setLocation(equipment.location || 'Ludhiana Central Hub #1');
      setCondition(equipment.condition || 'good');
      setStatus(equipment.status || 'Available');
      setImageUrl(equipment.imageUrl || '');
      setManufacturer(equipment.manufacturer || 'Mahindra');
    }
  }, [equipment]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveEdit(equipment._id || equipment.id, {
      name,
      category,
      price: parseFloat(price),
      rentalRate: parseFloat(price),
      location,
      condition,
      status,
      imageUrl,
      manufacturer
    });
    onClose();
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
          maxWidth: '600px',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: '#131d35',
          borderRadius: '24px',
          padding: '2.5rem',
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

        <span className="section-tag">EDIT MACHINERY DETAILS</span>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginBottom: '1.5rem' }}>
          Edit {equipment.name}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '0.35rem', fontWeight: 600 }}>
                Equipment Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.7rem 0.9rem',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '0.35rem', fontWeight: 600 }}>
                Manufacturer *
              </label>
              <input
                type="text"
                required
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.7rem 0.9rem',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '0.35rem', fontWeight: 600 }}>
                Category *
              </label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.7rem 0.9rem',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '0.35rem', fontWeight: 600 }}>
                Daily Price (₹) *
              </label>
              <input
                type="number"
                required
                min="1800"
                max="3500"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.7rem 0.9rem',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '0.35rem', fontWeight: 600 }}>
                Condition *
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.7rem 0.9rem',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              >
                <option value="excellent" style={{ backgroundColor: '#131d35' }}>Excellent</option>
                <option value="good" style={{ backgroundColor: '#131d35' }}>Good</option>
                <option value="fair" style={{ backgroundColor: '#131d35' }}>Fair</option>
                <option value="needs_service" style={{ backgroundColor: '#131d35' }}>Needs Service</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '0.35rem', fontWeight: 600 }}>
                Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.7rem 0.9rem',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              >
                <option value="Available" style={{ backgroundColor: '#131d35' }}>Available</option>
                <option value="Under Maintenance" style={{ backgroundColor: '#131d35' }}>Under Maintenance</option>
                <option value="Rented" style={{ backgroundColor: '#131d35' }}>Rented</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '0.35rem', fontWeight: 600 }}>
              Hub Location *
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{
                width: '100%',
                padding: '0.7rem 0.9rem',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          <button type="submit" className="btn-green" style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', justifyContent: 'center' }}>
            <Save size={18} />
            <span>Save Machinery Updates</span>
          </button>
        </form>
      </div>
    </div>
  );
}
