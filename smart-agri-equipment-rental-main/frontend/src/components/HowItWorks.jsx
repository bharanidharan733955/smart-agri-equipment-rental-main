// src/components/HowItWorks.jsx
import React from 'react';
import { Sprout, Tractor, CalendarCheck, FileCheck } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      step: 'Step 1',
      icon: Sprout,
      title: 'Register as Farmer',
      description: 'Sign up in minutes with your ID-verified profile, land & crop details.'
    },
    {
      step: 'Step 2',
      icon: Tractor,
      title: 'Browse Equipment',
      description: 'Search cooperative machinery near you — filter by category, district, and price.'
    },
    {
      step: 'Step 3',
      icon: CalendarCheck,
      title: 'Book Instantly',
      description: 'Pick your rental window. Cooperative staff reviews and approves quickly.'
    },
    {
      step: 'Step 4',
      icon: FileCheck,
      title: 'Every Action Audited',
      description: 'Immutable, timestamped audit log for every booking, issue and return.'
    }
  ];

  return (
    <section id="how-it-works" style={{ padding: '4rem 2.5rem 5rem 2.5rem' }}>
      <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
        
        {/* Section Header */}
        <div style={{ marginBottom: '2.8rem' }}>
          <span className="section-tag">HOW IT WORKS</span>
          <h2
            style={{
              fontSize: '2.4rem',
              fontWeight: 800,
              color: 'var(--color-text)',
              letterSpacing: '-0.02em',
              maxWidth: '800px'
            }}
          >
            From registration to return — a fully digital workflow.
          </h2>
        </div>

        {/* 4 Step Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1.5rem'
          }}
        >
          {steps.map((item) => {
            const IconComp = item.icon;

            return (
              <div
                key={item.step}
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '16px',
                  padding: '2rem 1.6rem',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Step Number */}
                <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', fontWeight: 500, marginBottom: '1rem' }}>
                  {item.step}
                </div>

                {/* Green Icon Box */}
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--color-success-bg)',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.4rem'
                  }}
                >
                  <IconComp size={22} color="var(--color-primary)" />
                </div>

                {/* Title */}
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.6rem' }}>
                  {item.title}
                </h3>

                {/* Description */}
                <p style={{ fontSize: '0.88rem', color: 'var(--color-muted)', lineHeight: 1.5, fontWeight: 400 }}>
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
