// src/components/CtaBanner.jsx
import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function CtaBanner({ onSelectRole }) {
  return (
    <section style={{ padding: 'clamp(1.5rem, 4vw, 2rem) clamp(1rem, 4vw, 2.5rem) clamp(2.5rem, 6vw, 5rem)' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'clamp(16px, 4vw, 24px)',
            padding: 'clamp(2rem, 5vw, 4.5rem) clamp(1.2rem, 4vw, 2rem)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)'
          }}
        >
          {/* Main Title */}
          <h2
            style={{
              fontSize: 'clamp(1.5rem, 4.5vw, 2.5rem)',
              fontWeight: 800,
              color: 'var(--color-text)',
              marginBottom: '1.2rem',
              letterSpacing: '-0.02em',
              lineHeight: 1.25
            }}
          >
            Join the digital cooperative movement.
          </h2>

          {/* Subtitle */}
          <p
            style={{
              fontSize: '1rem',
              color: 'var(--color-muted)',
              maxWidth: '600px',
              lineHeight: 1.6,
              marginBottom: '2.5rem',
              fontWeight: 400
            }}
          >
            Register today and get instant access to cooperative machinery, transparent bookings, and real-time support.
          </p>

          {/* Centered Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
            <button
              onClick={onSelectRole}
              className="btn-green"
              style={{ padding: '0.85rem 2.4rem', fontSize: '0.98rem', borderRadius: 'var(--radius-pill)' }}
            >
              <span>Select Your Role</span>
              <ArrowRight size={18} />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
