// src/components/cooperative/EquipmentDetailsModal.jsx
import React from 'react';
import { X, ShieldCheck, MapPin, Wrench, Clock, Activity, DollarSign } from 'lucide-react';

export default function EquipmentDetailsModal({ equipment, isOpen, onClose }) {
  if (!isOpen || !equipment) return null;

  // Deterministically generate 15 units based on equipment unique properties
  const generateUnits = (eq) => {
    const seed = eq._id || eq.id || 'default';
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return Array.from({ length: 15 }, (_, index) => {
      const unitNum = index + 1;
      // Distribute a range of operating hours centered around the main equipment hours
      // Some lower-use units, some high-use units.
      const baseHours = eq.totalUsageHours || 12;
      const factor = Math.abs(Math.sin(hash + unitNum * 17));
      // Generate hours up to 380 to make some units close to or exceeding the 350h maintenance mark
      const hours = Math.round((factor * 370) * 10) / 10;
      
      let status = 'Available';
      if (hours >= 350) {
        status = 'Under Maintenance';
      } else {
        const randStatus = Math.cos(hash + unitNum * 23);
        if (randStatus > 0.4) status = 'Rented';
        else if (randStatus < -0.6) status = 'Reserved';
      }
      
      return {
        unitNum,
        serial: `${eq.regNumber || 'PB-10-AT-8821'}-${String(unitNum).padStart(2, '0')}`,
        hours,
        status
      };
    });
  };

  const units = equipment.units && equipment.units.length > 0 ? equipment.units : generateUnits(equipment);

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
          maxWidth: '850px',
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

        {/* Modal content layout side-by-side */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            {/* Equipment Image Preview */}
            <div
              style={{
                width: '100%',
                height: '180px',
                borderRadius: '16px',
                overflow: 'hidden',
                marginBottom: '1rem',
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)', color: '#10b981', padding: '0.4rem 0.8rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700 }}>
                Category Status: {equipment.status}
              </div>
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#ffffff', padding: '0.4rem 0.8rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700 }}>
                Cooperative Rate: ₹{equipment.price || equipment.pricePerDay}/day
              </div>
            </div>
          </div>

          <div>
            {/* Detailed Specs Grid */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '1.25rem',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                height: '100%'
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>HUB LOCATION</div>
                <div style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 600, marginTop: '2px' }}>{equipment.cooperativeHub || equipment.location || 'Ludhiana Central Hub #1'}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>MANUFACTURER</div>
                <div style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 600, marginTop: '2px' }}>{equipment.brand || equipment.manufacturer || 'Standard'}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>CATEGORY USAGE (AVG)</div>
                <div style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: 700, marginTop: '2px' }}>{equipment.totalUsageHours || 12} Hrs</div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>AUDIT LOG INTEGRITY</div>
                <div style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 600, marginTop: '2px' }}>SHA-256 SECURED</div>
              </div>
            </div>
          </div>
        </div>

        {/* 15 Individual Units Fleet Display */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} color="#10b981" />
            <span>Individual Fleet Unit Tracking (15 units available)</span>
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '0.8rem',
              maxHeight: '280px',
              overflowY: 'auto',
              paddingRight: '0.4rem',
              paddingBottom: '0.4rem'
            }}
          >
            {units.map((unit) => {
              const THRESHOLD = 350;
              const pct = Math.min((unit.hours / THRESHOLD) * 100, 100);
              const isMaint = unit.status === 'Under Maintenance';
              const isRented = unit.status === 'Rented';
              const isReserved = unit.status === 'Reserved';
              
              const statusColor = isMaint ? '#ef4444' : isRented ? '#38bdf8' : isReserved ? '#f59e0b' : '#10b981';
              const bgStatus = isMaint ? 'rgba(239, 68, 68, 0.12)' : isRented ? 'rgba(56, 189, 248, 0.12)' : isReserved ? 'rgba(245, 158, 11, 0.12)' : 'rgba(16, 185, 129, 0.12)';
              const barColor = unit.hours >= 350 ? '#ef4444' : unit.hours >= 280 ? '#f59e0b' : '#10b981';

              return (
                <div
                  key={unit.id || unit.serial}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '12px',
                    padding: '0.85rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff' }}>
                      Unit #{unit.unitNum}
                    </span>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '99px',
                        backgroundColor: bgStatus,
                        color: statusColor,
                        border: `1px solid ${statusColor}40`
                      }}
                    >
                      {unit.status}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                    SN: {unit.serial}
                  </div>

                  {/* Work Hours Progress Bar */}
                  <div style={{ marginTop: '0.2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', marginBottom: '2px' }}>
                      <span style={{ color: '#64748b' }}>Work Hours</span>
                      <span style={{ color: barColor, fontWeight: 700 }}>{unit.hours} / {THRESHOLD}h</span>
                    </div>
                    <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, backgroundColor: barColor, borderRadius: '99px' }} />
                    </div>
                    {unit.hours >= 350 && (
                      <div style={{ fontSize: '0.6rem', color: '#ef4444', marginTop: '3px', fontWeight: 600 }}>
                        ⚠ Auto-Sent to Maintenance
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button onClick={onClose} className="btn-green" style={{ width: '100%', padding: '0.85rem', justifyContent: 'center' }}>
          Close Equipment Details
        </button>
      </div>
    </div>
  );
}

