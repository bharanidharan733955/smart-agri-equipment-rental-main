// src/components/Header.jsx
import React, { useState } from 'react';
import { Sprout, ArrowRight, Menu, X } from 'lucide-react';

export default function Header({ onSelectRole }) {
  const [navOpen, setNavOpen] = useState(false);

  const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '#equipment', label: 'Equipment' },
    { href: '#how-it-works', label: 'How it works' },
    { href: '#faq', label: 'FAQ' },
  ];

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'var(--bg-header)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      <div
        className="header-inner"
        style={{
          maxWidth: '1350px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.9rem 2.5rem',
          position: 'relative',
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
              justifyContent: 'center',
              flexShrink: 0,
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

        {/* Center Nav Links — hidden on mobile via CSS class */}
        <nav className={`header-nav${navOpen ? ' open' : ''}`}>
          {navLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              onClick={() => setNavOpen(false)}
              style={{
                color: '#cbd5e1',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: 500,
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.target.style.color = '#ffffff')}
              onMouseLeave={(e) => (e.target.style.color = '#cbd5e1')}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Right: CTA + Hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={onSelectRole} className="btn-green" style={{ padding: '0.65rem 1.5rem', fontSize: '0.88rem' }}>
            <span>Select Role</span>
            <ArrowRight size={16} />
          </button>

          {/* Hamburger — shown only on mobile via CSS class */}
          <button
            className="header-mobile-toggle"
            onClick={() => setNavOpen((v) => !v)}
            aria-label={navOpen ? 'Close menu' : 'Open menu'}
          >
            {navOpen ? <X size={24} color="#fff" /> : <Menu size={24} color="#fff" />}
          </button>
        </div>
      </div>
    </header>
  );
}
