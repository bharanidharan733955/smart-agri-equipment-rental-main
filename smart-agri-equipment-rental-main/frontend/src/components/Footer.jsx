// src/components/Footer.jsx
import React from 'react';

export default function Footer({ onOpenContact }) {
  return (
    <footer
      style={{
        backgroundColor: '#080e1c',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '2rem 2.5rem'
      }}
    >
      <div
        style={{
          maxWidth: '1350px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.88rem',
          color: '#64748b'
        }}
      >
        {/* Left Copyright Text */}
        <div>
          &copy; {new Date().getFullYear()} AgriRentGov &bull; State Government Cooperative Platform
        </div>

        {/* Right Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <a
            href="#privacy"
            onClick={(e) => e.preventDefault()}
            style={{
              color: '#64748b',
              textDecoration: 'none',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => (e.target.style.color = '#ffffff')}
            onMouseLeave={(e) => (e.target.style.color = '#64748b')}
          >
            Privacy
          </a>
          <a
            href="#terms"
            onClick={(e) => e.preventDefault()}
            style={{
              color: '#64748b',
              textDecoration: 'none',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => (e.target.style.color = '#ffffff')}
            onMouseLeave={(e) => (e.target.style.color = '#64748b')}
          >
            Terms
          </a>
          <a
            href="#contact"
            onClick={(e) => {
              if (onOpenContact) onOpenContact();
            }}
            style={{
              color: '#64748b',
              textDecoration: 'none',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => (e.target.style.color = '#ffffff')}
            onMouseLeave={(e) => (e.target.style.color = '#64748b')}
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
