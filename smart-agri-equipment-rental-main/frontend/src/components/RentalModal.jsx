// src/components/RentalModal.jsx
import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck } from 'lucide-react';
import { submitRentalApi } from '../api';

export default function RentalModal({ equipment, isOpen, onClose }) {
  const [startDate, setStartDate] = useState('');
  const [durationDays, setDurationDays] = useState('1');
  const [fuelType, setFuelType] = useState('Diesel');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [loading, setLoading] = useState(false);

  // Load session user details
  const savedUserStr = localStorage.getItem('agrirent_user');
  const sessionUser = savedUserStr ? JSON.parse(savedUserStr) : null;

  const todayStr = new Date().toISOString().split('T')[0];

  const dailyPrice = equipment?.rentalRate || equipment?.price || equipment?.pricePerDay || 800;
  const duration = parseInt(durationDays) || 1;
  const baseRent = dailyPrice * duration;
  const tax = Math.round(baseRent * 0.18);
  const tentativeTotal = baseRent + tax;

  // Guard must come AFTER all hooks (Rules of Hooks)
  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (startDate < todayStr) {
      alert("Invalid date: Booking day cannot be in the past.");
      return;
    }

    setLoading(true);

    const payload = {
      equipmentId: equipment?.id || equipment?._id || 'eq-1',
      equipmentName: equipment?.name || 'Tractor',
      fullName: sessionUser?.name || 'Farmer Client',
      phone: sessionUser?.mobile || 'N/A',
      farmerId: sessionUser?.id || 'N/A',
      district: sessionUser?.district || 'N/A',
      startDate,
      durationDays: duration,
      dailyPrice
    };

    const res = await submitRentalApi(payload);
    setLoading(false);
    if (res && res.success) {
      setBookingRef(res.data?._id || res.data?.id || res.data?.auditHash || 'GOV-AUDIT-882109');
      setIsSubmitted(true);
    } else {
      alert(res?.message || "No equipment currently available in your area.");
    }
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
          maxWidth: '620px',
          backgroundColor: 'var(--color-surface)',
          borderRadius: '20px',
          padding: '2.2rem',
          position: 'relative',
          border: '1px solid var(--color-border)',
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

        {!isSubmitted ? (
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <span className="section-tag">STATE COOPERATIVE RENTAL</span>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-text)', marginTop: '0.2rem' }}>
                {equipment ? `Book ${equipment.name}` : 'Book Machinery'}
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--color-muted)', marginTop: '4px' }}>
                Cooperative Base Rate: ₹{dailyPrice}/day • Tentative &amp; Final Bill System
              </p>
            </div>

             <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {/* Logged in Farmer Profile Preview Widget */}
              <div style={{ backgroundColor: 'var(--color-border)', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: 'var(--color-muted)', display: 'block', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>Farmer Name</span>
                    <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>{sessionUser?.name || 'Farmer Client'}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-muted)', display: 'block', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>Mobile Number</span>
                    <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>{sessionUser?.mobile || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Date & Days */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: '0.3rem', fontWeight: 600 }}>
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      borderRadius: '10px',
                      backgroundColor: 'transparent',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: '0.3rem', fontWeight: 600 }}>
                    Duration (Days) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    required
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      borderRadius: '10px',
                      backgroundColor: 'transparent',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Tentative Bill Summary Breakdown */}
              <div
                style={{
                  backgroundColor: 'rgba(21, 128, 61, 0.08)',
                  border: '1px solid rgba(21, 128, 61, 0.3)',
                  borderRadius: '14px',
                  padding: '1rem 1.25rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    📋 Tentative Bill Breakdown
                  </span>
                  <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '10px', backgroundColor: 'var(--color-warning-bg)', color: '#f59e0b', fontWeight: 700 }}>
                    Initial Estimate
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.82rem', color: 'var(--color-muted)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Equipment Rental ({duration} Days @ ₹{dailyPrice}):</span>
                    <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>₹{baseRent.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>CGST &amp; SGST (18%):</span>
                    <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>₹{tax.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '0.4rem', marginTop: '0.2rem', fontSize: '1rem', fontWeight: 800 }}>
                    <span style={{ color: 'var(--color-text)' }}>Tentative Total Bill:</span>
                    <span style={{ color: 'var(--color-primary)' }}>₹{tentativeTotal.toLocaleString()}</span>
                  </div>
                </div>

                <p style={{ fontSize: '0.73rem', color: 'var(--color-info)', marginTop: '0.6rem', lineHeight: 1.35, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <ShieldCheck size={14} style={{ flexShrink: 0 }} />
                  <span>Note: Final bill will be calculated after work completion based on actual operator fuel report. Minimal variance guaranteed.</span>
                </p>
              </div>

              <button type="submit" disabled={loading} className="btn-green" style={{ width: '100%', padding: '0.85rem', marginTop: '0.2rem' }}>
                {loading ? 'Submitting to Backend API...' : `Confirm Booking • Tentative Bill ₹${tentativeTotal}`}
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
                backgroundColor: 'rgba(21, 128, 61, 0.2)',
                border: '2px solid var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.2rem'
              }}
            >
              <CheckCircle size={36} color="var(--color-primary)" />
            </div>

            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.4rem' }}>
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
                color: 'var(--color-info)',
                letterSpacing: '0.08em',
                marginBottom: '1.5rem'
              }}
            >
              {bookingRef}
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--color-muted)', maxWidth: '420px', margin: '0 auto 1.8rem', lineHeight: 1.5 }}>
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
