// src/components/Features.jsx
import React from 'react';
import { FileText, Wrench, Building2 } from 'lucide-react';

export default function Features() {
  const featureList = [
    {
      id: 'f-1',
      icon: FileText,
      title: 'Immutable Audit Trail',
      description: 'Every login, booking, issue, return and maintenance action is logged automatically — no manual entry, no tampering.'
    },
    {
      id: 'f-2',
      icon: Wrench,
      title: 'Equipment Health Passport',
      description: 'Complete lifecycle: purchase, rental count, operating hours, maintenance & revenue in one profile.'
    },
    {
      id: 'f-3',
      icon: Building2,
      title: 'State-level Monitoring',
      description: 'District-wise cooperative performance, funding monitoring and utilization trends for administrators.'
    }
  ];

  return (
    <section id="features" style={{ padding: '3rem 2.5rem 4rem 2.5rem' }}>
      <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.8rem'
          }}
        >
          {featureList.map((feat) => {
            const IconComponent = feat.icon;

            return (
              <div
                key={feat.id}
                style={{
                  backgroundColor: '#131d35',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '20px',
                  padding: '2.2rem 2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start'
                }}
              >
                {/* Blue Squircle Icon Container */}
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(2, 132, 199, 0.25)',
                    border: '1px solid rgba(56, 189, 248, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.6rem'
                  }}
                >
                  <IconComponent size={22} color="#38bdf8" />
                </div>

                {/* Title */}
                <h3
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    marginBottom: '0.8rem',
                    lineHeight: 1.3
                  }}
                >
                  {feat.title}
                </h3>

                {/* Description */}
                <p
                  style={{
                    fontSize: '0.92rem',
                    color: '#94a3b8',
                    lineHeight: 1.6,
                    fontWeight: 400
                  }}
                >
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
