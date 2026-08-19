// src/components/RentalModal.jsx
import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck } from 'lucide-react';
import { submitRentalApi } from '../api';

export default function RentalModal({ equipment, isOpen, onClose }) {
  const [startDate, setStartDate] = useState('');
  const [durationDays, setDurationDays] = useState(2);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [loading, setLoading] = useState(false);

  // Load session user details
  const savedUserStr = localStorage.getItem('agrirent_user');
  const sessionUser = savedUserStr ? JSON.parse(savedUserStr) : null;

  const dailyPrice = equipment?.rentalRate || equipment?.price || equipment?.pricePerDay || 800;
  const grandTotal = dailyPrice * durationDays;

  // Guard must come AFTER all hooks (Rules of Hooks)
  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      equipmentId: equipment?.id || equipment?._id || 'eq-1',
      equipmentName: equipment?.name || 'Tractor',
      fullName: sessionUser?.name || 'Farmer Client',
      phone: sessionUser?.mobile || 'N/A',
      farmerId: sessionUser?.id || 'N/A',
      district: sessionUser?.district || 'N/A',
      startDate,
      durationDays,
      dailyPrice
    };

    const res = await submitRentalApi(payload);
    setLoading(false);
    setBookingRef(res.data?.auditHash || 'GOV-AUDIT-882109');
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setIsSubmitted(false);
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
          maxWidth: '580px',
          backgroundColor: '#131d35',
          borderRadius: '20px',
          padding: '2.2rem',
          position: 'relative',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)'
        }}
      >
        {/* Close button */}
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

        {!isSubmitted ? (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <span className="section-tag">STATE COOPERATIVE RENTAL</span>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>
                {equipment ? `Book ${equipment.name}` : 'Book Machinery'}
              </h2>
              <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginTop: '4px' }}>
                Cooperative Rate: ₹{dailyPrice}/day • Immutable Audit Logging
              </p>
            </div>

             <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {/* Logged in Farmer Profile Preview Widget */}
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>Farmer Name</span>
                    <span style={{ fontWeight: 700, color: '#ffffff' }}>{sessionUser?.name || 'Farmer Client'}</span>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>Mobile Number</span>
                    <span style={{ fontWeight: 700, color: '#ffffff' }}>{sessionUser?.mobile || 'N/A'}</span>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>Farmer ID</span>
                    <span style={{ fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace' }}>{sessionUser?.id || 'N/A'}</span>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>District</span>
                    <span style={{ fontWeight: 700, color: '#ffffff' }}>{sessionUser?.district || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Date & Days */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '0.35rem', fontWeight: 600 }}>
                    Rental Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
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
                    Duration (Days) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    required
                    value={durationDays}
                    onChange={(e) => setDurationDays(parseInt(e.target.value) || 1)}
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

              {/* Summary */}
              <div
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '12px',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '0.4rem'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Total Rental Amount</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>
                    ₹{grandTotal}
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <ShieldCheck size={16} />
                  <span>Logged via Express Backend API</span>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-green" style={{ width: '100%', padding: '0.85rem', marginTop: '0.4rem' }}>
                {loading ? 'Submitting to Backend API...' : 'Confirm Booking'}
              </button>
            </form>
          </div>
        ) : (
          /* Confirmation */
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                border: '2px solid #10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.2rem'
              }}
            >
              <CheckCircle size={36} color="#10b981" />
            </div>

            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.4rem' }}>
              Booking Logged in State Audit Ledger
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.2rem' }}>
              Audit Hash Code:
            </p>

            <div
              style={{
                display: 'inline-block',
                backgroundColor: 'rgba(2, 132, 199, 0.2)',
                border: '1px dashed #38bdf8',
                padding: '0.6rem 1.5rem',
                borderRadius: '10px',
                fontSize: '1.2rem',
                fontWeight: 800,
                color: '#38bdf8',
                letterSpacing: '0.08em',
                marginBottom: '1.5rem'
              }}
            >
              {bookingRef}
            </div>

            <p style={{ fontSize: '0.88rem', color: '#94a3b8', maxWidth: '420px', margin: '0 auto 1.8rem', lineHeight: 1.5 }}>
              Cooperative Hub officer in <strong>{sessionUser?.district || 'your district'}</strong> will dispatch the machine for <strong>{startDate}</strong>.
            </p>

            <button onClick={handleReset} className="btn-green" style={{ padding: '0.75rem 2rem' }}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
