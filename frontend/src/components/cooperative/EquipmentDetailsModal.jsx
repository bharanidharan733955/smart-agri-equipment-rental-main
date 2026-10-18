// src/components/cooperative/EquipmentDetailsModal.jsx
import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, MapPin, Wrench, Clock, Activity, DollarSign } from 'lucide-react';
import { fetchMaintenanceLogs } from '../../api';

export default function EquipmentDetailsModal({ equipment, isOpen, onClose }) {
  const [maintLogs, setMaintLogs] = useState([]);
  const [maintLoading, setMaintLoading] = useState(false);

  useEffect(() => {
    if (isOpen && equipment) {
      setMaintLoading(true);
      fetchMaintenanceLogs()
        .then(logs => {
          const eqId = equipment._id || equipment.id;
          const filtered = logs.filter(log => {
            const mEqId = log.equipment?._id || log.equipment?.id || log.equipment;
            return mEqId === eqId;
          });
          setMaintLogs(filtered);
        })
        .catch(err => console.error(err))
        .finally(() => setMaintLoading(false));
    }
  }, [isOpen, equipment]);
  if (!isOpen || !equipment) return null;

  let units = equipment.units || [];
  if (!units || units.length === 0) {
    const total = equipment.totalUnits || equipment.totalQuantity || 20;
    units = Array.from({ length: total }, (_, index) => {
      const unitNum = index + 1;
      return {
        unitNum,
        serial: `${equipment.regNumber || 'TN-37-EQ-8821'}-${String(unitNum).padStart(2, '0')}`,
        hours: unitNum * 12,
        status: 'Available'
      };
    });
  }

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
          maxWidth: '850px',
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

        <span className="section-tag">EQUIPMENT HEALTH PASSPORT & SPECIFICATIONS</span>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.4rem' }}>
          {equipment.name}
        </h2>
        <div style={{ fontSize: '0.88rem', color: 'var(--color-muted)', marginBottom: '1.5rem' }}>
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
                border: '1px solid var(--color-border)'
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
              <div style={{ backgroundColor: 'var(--color-success-bg)', border: '1px solid var(--color-border)', color: 'var(--color-primary)', padding: '0.4rem 0.8rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700 }}>
                Category Status: {equipment.status}
              </div>
              <div style={{ backgroundColor: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text)', padding: '0.4rem 0.8rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700 }}>
                Cooperative Rate: ₹{equipment.price || equipment.pricePerDay}/day
              </div>
            </div>
          </div>

          <div>
            {/* Detailed Specs Grid */}
            <div
              style={{
                backgroundColor: 'var(--color-border)',
                border: '1px solid var(--color-border)',
                borderRadius: '16px',
                padding: '1.25rem',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                height: '100%'
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 700 }}>HUB LOCATION</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--color-text)', fontWeight: 600, marginTop: '2px' }}>{equipment.cooperativeHub || equipment.location || 'Ludhiana Central Hub #1'}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 700 }}>MANUFACTURER</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--color-text)', fontWeight: 600, marginTop: '2px' }}>{equipment.brand || equipment.manufacturer || 'Standard'}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 700 }}>LIFETIME USAGE HOURS</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--color-primary)', fontWeight: 700, marginTop: '2px' }}>{equipment.totalUsageHours || 0} Hrs</div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 700 }}>FLEET AVAILABILITY</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--color-primary)', fontWeight: 700, marginTop: '2px' }}>{units.filter(u => u.status === 'Available').length} / {units.length || 15} Units Available</div>
              </div>
            </div>
          </div>
        </div>

        {/* Individual Units Fleet Display */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} color="var(--color-primary)" />
            <span>Individual Fleet Unit Tracking ({units.filter(u => u.status === 'Available').length} units available)</span>
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
              const isReserved = ['Reserved', 'Rented', 'In Use', 'Assigned', 'BOOKED'].includes(unit.status);
              const displayStatus = isReserved ? 'Reserved' : 'Available';
              const statusColor = isReserved ? '#f59e0b' : 'var(--color-primary)';
              const bgStatus = isReserved ? 'rgba(245, 158, 11, 0.15)' : 'var(--color-success-bg)';

              return (
                <div
                  key={unit.id || unit.serial}
                  style={{
                    backgroundColor: 'var(--color-border)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '12px',
                    padding: '0.85rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text)' }}>
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
                      {displayStatus}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)', fontFamily: 'monospace' }}>
                    SN: {unit.serial}
                  </div>

                  <div style={{ fontSize: '0.73rem', color: 'var(--color-text)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <span>👤 Operator:</span>
                    <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
                      {unit.assignedOperator?.name || (typeof unit.assignedOperator === 'object' ? unit.assignedOperator?.email : null) || `Operator #${unit.unitNum}`}
                    </span>
                  </div>

                  {/* Work Hours */}
                  <div style={{ marginTop: '0.2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '2px' }}>
                      <span style={{ color: 'var(--color-muted)' }}>Work Hours</span>
                      <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{unit.hours || 0} hrs</span>
                    </div>
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

