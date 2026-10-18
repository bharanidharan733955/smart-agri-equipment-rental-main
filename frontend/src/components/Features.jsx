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
    <section id="features" style={{ padding: '4rem 2rem', backgroundColor: 'var(--color-background)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {featureList.map((feat) => {
            const IconComponent = feat.icon;

            return (
              <div key={feat.id} className="agri-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                {/* Icon Container */}
                <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-neutral-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                  <IconComponent size={24} color="var(--color-secondary)" />
                </div>

                {/* Title */}
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-secondary)', marginBottom: '0.75rem', lineHeight: 1.3 }}>
                  {feat.title}
                </h3>

                {/* Description */}
                <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', lineHeight: 1.6, fontWeight: 400 }}>
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
