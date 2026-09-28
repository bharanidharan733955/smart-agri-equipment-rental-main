// src/components/Hero.jsx
import React from 'react';
import { Sprout, ArrowRight, ShieldCheck, FileText, Wrench } from 'lucide-react';

export default function Hero({ onSelectRole }) {
  return (
    <section style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: '6rem 2rem' }}>
      <div className="page-container" style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto', padding: '0' }}>
        
        {/* Top Tag */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--color-success-bg)', border: '1px solid var(--color-success)', color: 'var(--color-success)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '1.5rem', textTransform: 'uppercase' }}>
          <Sprout size={14} />
          <span>Government of State — Digital Agriculture</span>
        </div>

        {/* Headline */}
        <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--color-secondary)', lineHeight: 1.2, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
          Agricultural Equipment <br />
          <span style={{ color: 'var(--color-primary)' }}>When Farmers Need It.</span>
        </h1>

        {/* Subtitle */}
        <p style={{ fontSize: '1.125rem', color: 'var(--color-muted)', lineHeight: 1.6, marginBottom: '2.5rem' }}>
          Access reliable agricultural machinery through your local cooperative. A transparent, professionally audited ecosystem designed to empower farmers and streamline fleet management.
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button onClick={onSelectRole} className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>
            <span>Login to Portal</span>
            <ArrowRight size={18} />
          </button>
          <a href="#equipment" className="btn btn-secondary" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>
            Explore Equipment
          </a>
        </div>

        {/* Info Highlights */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', marginTop: '4rem', borderTop: '1px solid var(--color-border)', paddingTop: '2.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-text)' }}>
            <ShieldCheck size={24} color="var(--color-primary)" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Automated Auditing</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>Immutable usage logs</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-text)' }}>
            <FileText size={24} color="var(--color-primary)" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Transparent Billing</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>Upfront invoicing</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-text)' }}>
            <Wrench size={24} color="var(--color-primary)" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Scheduled Maintenance</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>360-hour service cycles</div>
            </div>
          </div>
        </div>
        
      </div>
    </section>
  );
}
