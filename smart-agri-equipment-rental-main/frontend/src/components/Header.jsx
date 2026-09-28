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
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div
        className="header-inner"
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 2rem',
          position: 'relative',
        }}
      >
        {/* Logo */}
        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Sprout size={20} color="#ffffff" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-secondary)', lineHeight: 1.1, fontFamily: 'var(--font-family)' }}>
              AGRI RENT GOV
            </div>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-muted)', letterSpacing: '0.05em', marginTop: '1px' }}>
              STATE COOPERATIVE
            </div>
          </div>
        </a>

        {/* Center Nav Links */}
        <nav className={`header-nav${navOpen ? ' open' : ''}`}>
          {navLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              onClick={() => setNavOpen(false)}
              style={{
                color: 'var(--color-text)',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: 500,
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.target.style.color = 'var(--color-primary)')}
              onMouseLeave={(e) => (e.target.style.color = 'var(--color-text)')}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Right: CTA + Hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={onSelectRole} className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>
            <span>Select Role</span>
            <ArrowRight size={16} />
          </button>

          {/* Hamburger */}
          <button
            className="header-mobile-toggle"
            onClick={() => setNavOpen((v) => !v)}
            aria-label={navOpen ? 'Close menu' : 'Open menu'}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
          >
            {navOpen ? <X size={24} color="var(--color-text)" /> : <Menu size={24} color="var(--color-text)" />}
          </button>
        </div>
      </div>
    </header>
  );
}
