// src/components/cooperative/EquipmentDetailsModal.jsx
import React from 'react';
import { X, ShieldCheck, MapPin, Wrench, Clock, Activity, DollarSign } from 'lucide-react';

export default function EquipmentDetailsModal({ equipment, isOpen, onClose }) {
  if (!isOpen || !equipment) return null;

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
          maxWidth: '650px',
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

        <span className="section-tag">EQUIPMENT HEALTH PASSPORT & SPECIFICATIONS</span>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.4rem' }}>
          {equipment.name}
        </h2>
        <div style={{ fontSize: '0.88rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
          Category: {equipment.category} • Serial No: {equipment.serialNumber || 'EQ-SN-882190'}
        </div>

        {/* Equipment Image Preview */}
        <div
          style={{
            width: '100%',
            height: '240px',
            borderRadius: '16px',
            overflow: 'hidden',
            marginBottom: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <img
            src={equipment.imageUrl || 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80'}
            alt={equipment.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {/* Quick Badges Row */}
        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginBottom: '1.8rem' }}>
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-pill)', fontSize: '0.8rem', fontWeight: 700 }}>
            Status: {equipment.status}
          </div>
          <div style={{ backgroundColor: 'rgba(2, 132, 199, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-pill)', fontSize: '0.8rem', fontWeight: 700 }}>
            Condition: {equipment.condition}
          </div>
          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#ffffff', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-pill)', fontSize: '0.8rem', fontWeight: 700 }}>
            Cooperative Rate: ₹{equipment.price || equipment.pricePerDay}/day
          </div>
        </div>

        {/* Detailed Specs Grid */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '1.5rem',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1.2rem',
            marginBottom: '1.5rem'
          }}
        >
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>HUB LOCATION</div>
            <div style={{ fontSize: '0.95rem', color: '#ffffff', fontWeight: 600, marginTop: '2px' }}>{equipment.location}</div>
          </div>

          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>MANUFACTURER</div>
            <div style={{ fontSize: '0.95rem', color: '#ffffff', fontWeight: 600, marginTop: '2px' }}>{equipment.manufacturer || 'Mahindra & Mahindra'}</div>
          </div>

          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>OPERATING HOURS</div>
            <div style={{ fontSize: '0.95rem', color: '#10b981', fontWeight: 700, marginTop: '2px' }}>{equipment.operatingHours || 142.5} Hrs</div>
          </div>

          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>AUDIT LOG HASH</div>
            <div style={{ fontSize: '0.82rem', color: '#38bdf8', fontWeight: 600, marginTop: '2px' }}>GOV-HUB-881902</div>
          </div>
        </div>

        <button onClick={onClose} className="btn-green" style={{ width: '100%', padding: '0.85rem', justifyContent: 'center' }}>
          Close Equipment Details
        </button>
      </div>
    </div>
  );
}
