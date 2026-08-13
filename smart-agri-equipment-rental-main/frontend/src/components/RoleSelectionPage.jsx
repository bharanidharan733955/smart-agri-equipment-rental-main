// src/components/RoleSelectionPage.jsx
import React from 'react';
import { 
  Sprout, 
  Users, 
  Tractor, 
  Wrench, 
  Landmark, 
  ShieldCheck, 
  ArrowLeft, 
  ArrowRight
} from 'lucide-react';

export const ROLES = [
  {
    id: 'farmer',
    name: 'Farmer',
    badge: 'Public Access',
    badgeColor: 'green',
    icon: Sprout,
    description: 'Browse cooperative equipment, submit ID-verified rental requests, and track field delivery.'
  },
  {
    id: 'operator',
    name: 'Equipment Operator',
    badge: 'Field Operations',
    badgeColor: 'green',
    icon: Tractor,
    description: 'Log field operating hours, view daily machine assignments, and record GPS telemetry data.'
  },
  {
    id: 'equipmaintance',
    name: 'Equipmaintance Specialist',
    badge: 'Maintenance',
    badgeColor: 'blue',
    icon: Wrench,
    description: 'Manage machinery upkeep logs, schedule inspections, record cost of parts, and complete services.'
  },
  {
    id: 'staff',
    name: 'Cooperative Staff',
    badge: 'Cooperative Management',
    badgeColor: 'blue',
    icon: Users,
    description: 'Approve farmer rental requests, update inventory listings, generate invoices, and view metrics.'
  }
];

export default function RoleSelectionPage({ onSelectRole, onBackToHome }) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-dark)', color: '#ffffff', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Header */}
      <header
        style={{
          backgroundColor: 'var(--bg-header)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '1rem 2.5rem'
        }}
      >
        <div style={{ maxWidth: '1350px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <div onClick={onBackToHome} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}>
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
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.1 }}>
                AgriRentGov
              </div>
              <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em' }}>
                STATE COOPERATIVE
              </div>
            </div>
          </div>

          {/* Back Button */}
          <button
            onClick={onBackToHome}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              padding: '0.6rem 1.2rem',
              borderRadius: 'var(--radius-pill)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)')}
          >
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flexGrow: 1, padding: '4rem 2.5rem 5rem 2.5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Header Title */}
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span className="section-tag">PORTAL ACCESS CONTROL</span>
            <h1 style={{ fontSize: '2.8rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.8rem', letterSpacing: '-0.02em' }}>
              Select Your Role
            </h1>
            <p style={{ fontSize: '1.05rem', color: '#94a3b8', maxWidth: '650px', margin: '0 auto', lineHeight: 1.6 }}>
              Click your administrative or field role below to open the dedicated login page for that role.
            </p>
          </div>

          {/* Role Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '1.8rem'
            }}
          >
            {ROLES.map((role) => {
              const IconComp = role.icon;
              const isGreen = role.badgeColor === 'green';

              return (
                <div
                  key={role.id}
                  onClick={() => onSelectRole(role.id)}
                  style={{
                    backgroundColor: '#131d35',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '20px',
                    padding: '2.2rem 1.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = isGreen ? 'rgba(16, 185, 129, 0.5)' : 'rgba(56, 189, 248, 0.5)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = isGreen ? '0 12px 30px rgba(16, 185, 129, 0.15)' : '0 12px 30px rgba(2, 132, 199, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div>
                    {/* Top Row: Icon & Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                      <div
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '12px',
                          backgroundColor: isGreen ? 'rgba(16, 185, 129, 0.15)' : 'rgba(2, 132, 199, 0.2)',
                          border: isGreen ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(56, 189, 248, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <IconComp size={24} color={isGreen ? '#10b981' : '#38bdf8'} />
                      </div>

                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.25rem 0.75rem',
                          borderRadius: 'var(--radius-pill)',
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                          backgroundColor: isGreen ? 'rgba(16, 185, 129, 0.12)' : 'rgba(56, 189, 248, 0.12)',
                          color: isGreen ? '#10b981' : '#38bdf8',
                          border: isGreen ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(56, 189, 248, 0.25)'
                        }}
                      >
                        {role.badge}
                      </span>
                    </div>

                    {/* Role Title */}
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.6rem' }}>
                      {role.name}
                    </h3>

                    {/* Role Description */}
                    <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.55, marginBottom: '2rem' }}>
                      {role.description}
                    </p>
                  </div>

                  {/* Bottom Action Link */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: isGreen ? '#10b981' : '#38bdf8',
                      paddingTop: '1rem',
                      borderTop: '1px solid rgba(255, 255, 255, 0.06)'
                    }}
                  >
                    <span>Open {role.name} Login Page</span>
                    <ArrowRight size={16} />
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </main>

      {/* Footer Bar */}
      <footer style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', padding: '1.5rem 2.5rem', fontSize: '0.85rem', color: '#64748b', textAlign: 'center' }}>
        &copy; {new Date().getFullYear()} AgriRentGov &bull; State Government Cooperative Platform &bull; Role-Based Access Control
      </footer>

    </div>
  );
}
