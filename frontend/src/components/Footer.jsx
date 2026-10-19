// src/components/Footer.jsx
import React from 'react';

export default function Footer({ onOpenContact }) {
  return (
    <footer style={{ backgroundColor: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', padding: 'clamp(1.5rem, 4vw, 2rem) clamp(1rem, 4vw, 2.5rem)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', fontSize: '0.875rem', color: 'var(--color-muted)' }}>
        {/* Left Copyright Text */}
        <div style={{ lineHeight: 1.4 }}>
          &copy; {new Date().getFullYear()} AgriRentGov &bull; State Government Cooperative Platform
        </div>

        {/* Right Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(1rem, 3vw, 2rem)', flexWrap: 'wrap' }}>
          <a
            href="#privacy"
            onClick={(e) => e.preventDefault()}
            style={{ color: 'var(--color-muted)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={(e) => (e.target.style.color = 'var(--color-secondary)')}
            onMouseLeave={(e) => (e.target.style.color = 'var(--color-muted)')}
          >
            Privacy
          </a>
          <a
            href="#terms"
            onClick={(e) => e.preventDefault()}
            style={{ color: 'var(--color-muted)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={(e) => (e.target.style.color = 'var(--color-secondary)')}
            onMouseLeave={(e) => (e.target.style.color = 'var(--color-muted)')}
          >
            Terms
          </a>
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              if (onOpenContact) onOpenContact();
            }}
            style={{ color: 'var(--color-muted)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={(e) => (e.target.style.color = 'var(--color-secondary)')}
            onMouseLeave={(e) => (e.target.style.color = 'var(--color-muted)')}
          >
            Contact Support
          </a>
        </div>
      </div>
    </footer>
  );
}
