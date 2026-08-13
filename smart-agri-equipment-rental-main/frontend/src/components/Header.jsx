// src/components/Header.jsx
import React from 'react';
import { Sprout, ArrowRight } from 'lucide-react';

export default function Header({ onSelectRole }) {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'var(--bg-header)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        padding: '0.9rem 2.5rem'
      }}
    >
      <div
        style={{
          maxWidth: '1350px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        {/* Logo */}
        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', textDecoration: 'none' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: 'var(--green-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Sprout size={22} color="#ffffff" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.1, fontFamily: 'var(--font-family)' }}>
              AgriRentGov
            </div>
            <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', marginTop: '1px' }}>
              STATE COOPERATIVE
            </div>
          </div>
        </a>

        {/* Center Nav Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '2.2rem' }}>
          <a
            href="#features"
            style={{
              color: '#cbd5e1',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 500,
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => (e.target.style.color = '#ffffff')}
            onMouseLeave={(e) => (e.target.style.color = '#cbd5e1')}
          >
            Features
          </a>
          <a
            href="#equipment"
            style={{
              color: '#cbd5e1',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 500,
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => (e.target.style.color = '#ffffff')}
            onMouseLeave={(e) => (e.target.style.color = '#cbd5e1')}
          >
            Equipment
          </a>
          <a
            href="#how-it-works"
            style={{
              color: '#cbd5e1',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 500,
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => (e.target.style.color = '#ffffff')}
            onMouseLeave={(e) => (e.target.style.color = '#cbd5e1')}
          >
            How it works
          </a>
          <a
            href="#faq"
            style={{
              color: '#cbd5e1',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 500,
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => (e.target.style.color = '#ffffff')}
            onMouseLeave={(e) => (e.target.style.color = '#cbd5e1')}
          >
            FAQ
          </a>
        </nav>

        {/* Right CTA - Select Role Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={onSelectRole} className="btn-green" style={{ padding: '0.65rem 1.5rem', fontSize: '0.88rem' }}>
            <span>Select Role</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
