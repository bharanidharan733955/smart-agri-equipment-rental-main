// src/components/cooperative/AddEquipmentModal.jsx
import React, { useState } from 'react';
import { X, PlusCircle, Tractor, Upload } from 'lucide-react';

export default function AddEquipmentModal({ isOpen, onClose, onAddEquipment }) {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Tractor');
  const [price, setPrice] = useState(1800);
  const [location, setLocation] = useState('Ludhiana Central Hub #1');
  const [condition, setCondition] = useState('good');
  const [status, setStatus] = useState('Available');
  const [imageUrl, setImageUrl] = useState('');
  const [manufacturer, setManufacturer] = useState('Mahindra');
  const [hp, setHp] = useState('50 HP');
  const [fuel, setFuel] = useState('Diesel');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddEquipment({
      name,
      category,
      price,
      location,
      condition,
      status,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80',
      manufacturer,
      specs: { power: hp, fuelType: fuel }
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

        <span className="section-tag">COOPERATIVE INVENTORY MANAGEMENT</span>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginBottom: '1.5rem' }}>
          Add New Equipment
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          
          {/* Name & Manufacturer */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '0.35rem', fontWeight: 600 }}>
                Equipment Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Mahindra Tractor 6670"
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
                Manufacturer / Brand *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. John Deere / Mahindra"
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

          {/* Category & Daily Price */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '0.35rem', fontWeight: 600 }}>
                Category *
              </label>
              <select
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
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="Tractor" style={{ backgroundColor: '#131d35' }}>Tractor</option>
                <option value="Cultivator" style={{ backgroundColor: '#131d35' }}>Cultivator</option>
                <option value="Rotavator" style={{ backgroundColor: '#131d35' }}>Rotavator</option>
                <option value="Thresher" style={{ backgroundColor: '#131d35' }}>Thresher</option>
                <option value="Seed Drill" style={{ backgroundColor: '#131d35' }}>Seed Drill</option>
                <option value="Sprayer" style={{ backgroundColor: '#131d35' }}>Sprayer</option>
                <option value="Harvester" style={{ backgroundColor: '#131d35' }}>Harvester</option>
                <option value="Power Tiller" style={{ backgroundColor: '#131d35' }}>Power Tiller</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '0.35rem', fontWeight: 600 }}>
                Daily Cooperative Rate (₹) *
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

          {/* Condition & Initial Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '0.35rem', fontWeight: 600 }}>
                Equipment Condition *
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
                  outline: 'none',
                  cursor: 'pointer'
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
                Initial Status *
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
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="Available" style={{ backgroundColor: '#131d35' }}>Available</option>
                <option value="Under Maintenance" style={{ backgroundColor: '#131d35' }}>Under Maintenance</option>
              </select>
            </div>
          </div>

          {/* Hub Location */}
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
            <PlusCircle size={18} />
            <span>Add Equipment to Inventory</span>
          </button>
        </form>
      </div>
    </div>
  );
}
