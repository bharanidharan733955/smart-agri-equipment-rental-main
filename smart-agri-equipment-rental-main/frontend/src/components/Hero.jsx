// src/components/Hero.jsx
import React from 'react';
import { Sprout, ArrowRight, Users, Tractor, MapPin, TrendingUp, ShieldCheck } from 'lucide-react';

export default function Hero({ onSelectRole }) {
  return (
    <section style={{ padding: '3.5rem 2.5rem 4rem 2.5rem', position: 'relative' }}>
      <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
        
        {/* Main Grid: Left Text Content & Right Image Card */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 540px',
            gap: '3.5rem',
            alignItems: 'center'
          }}
        >
          {/* Left Column */}
          <div>
            {/* Top Pill Tag */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.35rem 1rem',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                marginBottom: '1.8rem'
              }}
            >
              <Sprout size={14} color="#10b981" />
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#10b981',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase'
                }}
              >
                GOVERNMENT OF STATE — DIGITAL AGRICULTURE
              </span>
            </div>

            {/* Headline */}
            <h1
              style={{
                fontSize: '3.5rem',
                fontWeight: 800,
                lineHeight: 1.15,
                color: '#ffffff',
                marginBottom: '1.5rem',
                letterSpacing: '-0.03em'
              }}
            >
              Rent cooperative farm<br />
              machinery.<br />
              <span style={{ color: '#10b981' }}>Every action, transparently<br />audited.</span>
            </h1>

            {/* Paragraph Description */}
            <p
              style={{
                fontSize: '1.05rem',
                color: '#94a3b8',
                lineHeight: 1.6,
                maxWidth: '620px',
                marginBottom: '2.2rem',
                fontWeight: 400
              }}
            >
              AgriRentGov digitizes the state cooperative equipment rental ecosystem — from tractors to threshers — with automated, immutable usage auditing so farmers, cooperatives and administrators can trust every transaction.
            </p>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3.5rem' }}>
              <button
                onClick={onSelectRole}
                className="btn-green"
                style={{ padding: '0.85rem 2rem', fontSize: '0.98rem' }}
              >
                <span>Select Your Role</span>
                <ArrowRight size={18} />
              </button>
              <a
                href="#equipment"
                className="btn-outline-dark"
                style={{ padding: '0.85rem 1.8rem', fontSize: '0.98rem' }}
              >
                Explore Equipment
              </a>
            </div>

            {/* Metrics Row (4 Cards) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1rem'
              }}
            >
              {/* Metric 1 */}
              <div
                style={{
                  backgroundColor: '#131d35',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.1rem 1rem'
                }}
              >
                <div style={{ marginBottom: '0.5rem' }}>
                  <Users size={20} color="#10b981" />
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>
                  12,480+
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px', fontWeight: 500 }}>
                  Registered Farmers
                </div>
              </div>

              {/* Metric 2 */}
              <div
                style={{
                  backgroundColor: '#131d35',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.1rem 1rem'
                }}
              >
                <div style={{ marginBottom: '0.5rem' }}>
                  <Tractor size={20} color="#10b981" />
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>
                  3,200+
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px', fontWeight: 500 }}>
                  Machines Available
                </div>
              </div>

              {/* Metric 3 */}
              <div
                style={{
                  backgroundColor: '#131d35',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.1rem 1rem'
                }}
              >
                <div style={{ marginBottom: '0.5rem' }}>
                  <MapPin size={20} color="#10b981" />
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>
                  38
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px', fontWeight: 500 }}>
                  Districts Covered
                </div>
              </div>

              {/* Metric 4 */}
              <div
                style={{
                  backgroundColor: '#131d35',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.1rem 1rem'
                }}
              >
                <div style={{ marginBottom: '0.5rem' }}>
                  <TrendingUp size={20} color="#10b981" />
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>
                  ₹142
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px', fontWeight: 500 }}>
                  Cost Saved (Cr)
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Large Image Container */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                borderRadius: '24px',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                height: '520px'
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1200&q=80"
                alt="Cooperative Farm Machinery"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />

              {/* Floating Audit Card at Bottom */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '1.5rem',
                  left: '1.5rem',
                  right: '1.5rem',
                  backgroundColor: 'rgba(15, 25, 48, 0.88)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '16px',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(2, 132, 199, 0.25)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <ShieldCheck size={22} color="#38bdf8" />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#ffffff', marginBottom: '2px' }}>
                    Automated Usage Auditing
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.3 }}>
                    Immutable log of every rental & maintenance action.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
