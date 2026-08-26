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

  const units = equipment.units || [];

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
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>LIFETIME USAGE HOURS</div>
                <div style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: 700, marginTop: '2px' }}>{equipment.totalUsageHours || 0} Hrs</div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>CURRENT CYCLE HOURS</div>
                <div style={{ fontSize: '0.9rem', color: '#f59e0b', fontWeight: 700, marginTop: '2px' }}>{equipment.currentCycleHours || 0} / 360 Hrs</div>
              </div>
            </div>
          </div>
        </div>

        {/* 15 Individual Units Fleet Display */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} color="#10b981" />
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
              const THRESHOLD = 360;
              const pct = Math.min((unit.hours / THRESHOLD) * 100, 100);
              const isMaint = unit.status === 'Under Maintenance';
              const isRented = unit.status === 'Rented';
              const isReserved = unit.status === 'Reserved';
              
              const statusColor = isMaint ? '#ef4444' : isRented ? '#38bdf8' : isReserved ? '#f59e0b' : '#10b981';
              const bgStatus = isMaint ? 'rgba(239, 68, 68, 0.12)' : isRented ? 'rgba(56, 189, 248, 0.12)' : isReserved ? 'rgba(245, 158, 11, 0.12)' : 'rgba(16, 185, 129, 0.12)';
              const barColor = unit.hours >= 360 ? '#ef4444' : unit.hours >= 300 ? '#f59e0b' : '#10b981';

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
                    {unit.hours >= 360 && (
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

        {/* Maintenance History Log */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.5rem', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Wrench size={18} color="#38bdf8" />
            <span>Service & Maintenance History Log</span>
          </h3>

          {maintLoading ? (
            <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Loading service logs...</div>
          ) : maintLogs.length === 0 ? (
            <div style={{ color: '#94a3b8', fontSize: '0.88rem', fontStyle: 'italic' }}>
              No service or preventative maintenance records logged for this vehicle.
            </div>
          ) : (
            <div style={{ overflowX: 'auto', maxHeight: '200px', backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8' }}>
                    <th style={{ padding: '0.6rem 0.8rem' }}>Date</th>
                    <th style={{ padding: '0.6rem 0.8rem' }}>Reason / Description</th>
                    <th style={{ padding: '0.6rem 0.8rem' }}>Technician</th>
                    <th style={{ padding: '0.6rem 0.8rem' }}>Cost</th>
                    <th style={{ padding: '0.6rem 0.8rem', textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {maintLogs.map((log) => (
                    <tr key={log._id || log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '0.5rem 0.8rem', color: '#cbd5e1' }}>{new Date(log.serviceDate || log.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '0.5rem 0.8rem' }}>
                        <div style={{ fontWeight: 600, color: '#ffffff' }}>{log.maintenanceReason || 'Preventative'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{log.description || log.problemDescription}</div>
                      </td>
                      <td style={{ padding: '0.5rem 0.8rem', color: '#cbd5e1' }}>{log.specialist || 'N/A'}</td>
                      <td style={{ padding: '0.5rem 0.8rem', fontWeight: 700, color: '#f87171' }}>₹{log.cost || 0}</td>
                      <td style={{ padding: '0.5rem 0.8rem', textAlign: 'right' }}>
                        <span style={{
                          fontSize: '0.7rem', padding: '0.15rem 0.4rem', borderRadius: '4px',
                          backgroundColor: log.status === 'Approved' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                          color: log.status === 'Approved' ? '#10b981' : '#f59e0b', fontWeight: 700
                        }}>{log.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <button onClick={onClose} className="btn-green" style={{ width: '100%', padding: '0.85rem', justifyContent: 'center' }}>
          Close Equipment Details
        </button>
      </div>
    </div>
  );
}

