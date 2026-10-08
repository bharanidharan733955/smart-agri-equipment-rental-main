// src/components/cooperative/AddEquipmentModal.jsx
import React, { useState } from 'react';
import { X, PlusCircle, MapPin, Building2, ShieldCheck } from 'lucide-react';
import { TN_DISTRICTS, getTaluksForDistrict } from '../../data/tnLocationData';

export default function AddEquipmentModal({ isOpen, onClose, onAddEquipment }) {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Tractor');
  const [price, setPrice] = useState(1800);
  const [district, setDistrict] = useState('Coimbatore');
  const [taluk, setTaluk] = useState('Pollachi');
  const [location, setLocation] = useState('Pollachi Cooperative Hub, Coimbatore');
  const [regNumber, setRegNumber] = useState(`TN-37-EQ-${Math.floor(1000 + Math.random() * 9000)}`);
  const [totalUnits, setTotalUnits] = useState(15);
  const [condition, setCondition] = useState('good');
  const [status, setStatus] = useState('Available');
  const [imageUrl, setImageUrl] = useState('');
  const [manufacturer, setManufacturer] = useState('Mahindra');
  const [hp, setHp] = useState('50 HP');
  const [fuel, setFuel] = useState('Diesel');

  const handleDistrictChange = (e) => {
    const selectedDist = e.target.value;
    setDistrict(selectedDist);
    const taluks = getTaluksForDistrict(selectedDist);
    const firstTaluk = taluks[0] || 'Central';
    setTaluk(firstTaluk);
    setLocation(`${firstTaluk} Cooperative Hub, ${selectedDist}`);
  };

  const handleTalukChange = (e) => {
    const selectedTaluk = e.target.value;
    setTaluk(selectedTaluk);
    setLocation(`${selectedTaluk} Cooperative Hub, ${district}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddEquipment({
      name,
      category,
      price: parseFloat(price),
      rentalRate: parseFloat(price),
      district,
      taluk,
      cooperativeHub: `${taluk} Cooperative Hub`,
      location: location || `${taluk} Hub, ${district}`,
      regNumber: regNumber || `TN-${Math.floor(10 + Math.random() * 80)}-EQ-${Math.floor(1000 + Math.random() * 9000)}`,
      totalUnits: parseInt(totalUnits) || 15,
      condition,
      status,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80',
      manufacturer,
      brand: manufacturer,
      specs: { power: hp, fuelType: fuel }
    });
    onClose();
  };

  const availableTaluks = getTaluksForDistrict(district);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        backgroundColor: 'rgba(10, 15, 20, 0.85)',
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
          maxWidth: '650px',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: 'var(--color-surface)',
          borderRadius: '24px',
          padding: '2.5rem',
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

        <span className="section-tag">COOPERATIVE INVENTORY MANAGEMENT</span>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.3rem' }}>
          Add New Machinery
        </h2>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
          Assign machinery directly to a specific District and Taluk hub fleet.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          
          {/* Location Assignment: District & Taluk */}
          <div style={{
            padding: '1.2rem',
            borderRadius: '16px',
            backgroundColor: 'rgba(21, 128, 61, 0.08)',
            border: '1px solid rgba(21, 128, 61, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4ade80', fontWeight: 700, fontSize: '0.9rem' }}>
              <MapPin size={18} />
              <span>Target District & Taluk Deployment</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--color-text)', marginBottom: '0.35rem', fontWeight: 600 }}>
                  District *
                </label>
                <select
                  value={district}
                  onChange={handleDistrictChange}
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.9rem',
                    borderRadius: '10px',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {TN_DISTRICTS.map(d => (
                    <option key={d} value={d} style={{ backgroundColor: 'var(--color-surface)' }}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--color-text)', marginBottom: '0.35rem', fontWeight: 600 }}>
                  Taluk *
                </label>
                <select
                  value={taluk}
                  onChange={handleTalukChange}
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.9rem',
                    borderRadius: '10px',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {availableTaluks.map(t => (
                    <option key={t} value={t} style={{ backgroundColor: 'var(--color-surface)' }}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Name & Manufacturer */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--color-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>
                Equipment Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Mahindra Tractor 575 DI"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.7rem 0.9rem',
                  borderRadius: '10px',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--color-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>
                Manufacturer / Brand *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Mahindra / John Deere"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.7rem 0.9rem',
                  borderRadius: '10px',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Category & Daily Price */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--color-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.7rem 0.9rem',
                  borderRadius: '10px',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="Tractor" style={{ backgroundColor: 'var(--color-surface)' }}>Tractor</option>
                <option value="Cultivator" style={{ backgroundColor: 'var(--color-surface)' }}>Cultivator</option>
                <option value="Rotavator" style={{ backgroundColor: 'var(--color-surface)' }}>Rotavator</option>
                <option value="Thresher" style={{ backgroundColor: 'var(--color-surface)' }}>Thresher</option>
                <option value="Seed Drill" style={{ backgroundColor: 'var(--color-surface)' }}>Seed Drill</option>
                <option value="Sprayer" style={{ backgroundColor: 'var(--color-surface)' }}>Sprayer</option>
                <option value="Harvester" style={{ backgroundColor: 'var(--color-surface)' }}>Harvester</option>
                <option value="Power Tiller" style={{ backgroundColor: 'var(--color-surface)' }}>Power Tiller</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--color-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>
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
                  backgroundColor: 'transparent',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Registration Number & Total Fleet Units */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--color-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>
                Registration Number *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. TN-37-EQ-8844"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.7rem 0.9rem',
                  borderRadius: '10px',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--color-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>
                Total Units Fleet Size *
              </label>
              <input
                type="number"
                required
                min="1"
                max="50"
                value={totalUnits}
                onChange={(e) => setTotalUnits(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.7rem 0.9rem',
                  borderRadius: '10px',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Condition & Initial Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--color-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>
                Equipment Condition *
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.7rem 0.9rem',
                  borderRadius: '10px',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="excellent" style={{ backgroundColor: 'var(--color-surface)' }}>Excellent</option>
                <option value="good" style={{ backgroundColor: 'var(--color-surface)' }}>Good</option>
                <option value="fair" style={{ backgroundColor: 'var(--color-surface)' }}>Fair</option>
                <option value="needs_service" style={{ backgroundColor: 'var(--color-surface)' }}>Needs Service</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--color-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>
                Initial Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.7rem 0.9rem',
                  borderRadius: '10px',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="Available" style={{ backgroundColor: 'var(--color-surface)' }}>Available</option>
                <option value="Under Maintenance" style={{ backgroundColor: 'var(--color-surface)' }}>Under Maintenance</option>
              </select>
            </div>
          </div>

          {/* Hub Location */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--color-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>
              Hub Display Location *
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
                backgroundColor: 'transparent',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          <button type="submit" className="btn-green" style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', justifyContent: 'center' }}>
            <PlusCircle size={18} />
            <span>Deploy Equipment to {taluk} Hub</span>
          </button>
        </form>
      </div>
    </div>
  );
}
