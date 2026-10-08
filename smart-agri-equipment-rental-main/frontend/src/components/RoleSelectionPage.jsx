// src/components/RoleSelectionPage.jsx
import React from 'react';
import { 
  Sprout, 
  Users, 
  Tractor, 
  ArrowLeft, 
  ArrowRight,
  ShieldCheck
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
    badgeColor: 'blue',
    icon: Tractor,
    description: 'Log field operating hours, view daily machine assignments, and record telemetry data.'
  },
  {
    id: 'staff',
    name: 'District Cooperative Officer',
    badge: 'District Hub Control',
    badgeColor: 'navy',
    icon: Users,
    description: 'Manage equipment list for your district, approve district farmer requests, process billing invoices, and generate reports.'
  },
  {
    id: 'officer',
    name: 'Government Officer',
    badge: 'State Oversight & Auditor',
    badgeColor: 'purple',
    icon: ShieldCheck,
    description: 'Statewide governance portal: View all equipment district-wise, view & download total state billing financial reports.'
  }
];

export default function RoleSelectionPage({ onSelectRole, onBackToHome }) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)', color: 'var(--color-text)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Header */}
      <header style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: '1rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <div onClick={onBackToHome} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sprout size={20} color="#ffffff" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-secondary)', lineHeight: 1.1 }}>AGRI RENT GOV</div>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-muted)', letterSpacing: '0.05em' }}>STATE COOPERATIVE</div>
            </div>
          </div>

          {/* Back Button */}
          <button onClick={onBackToHome} className="btn btn-secondary">
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flexGrow: 1, padding: '4rem 2rem 5rem 2rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          
          {/* Header Title */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-secondary)', marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>
              Select Your Role
            </h1>
            <p style={{ fontSize: '1rem', color: 'var(--color-muted)', maxWidth: '600px', margin: '0 auto' }}>
              Choose your administrative or field role below to securely log into the portal.
            </p>
          </div>

          {/* Role Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {ROLES.map((role) => {
              const IconComp = role.icon;

              return (
                <div
                  key={role.id}
                  onClick={() => onSelectRole(role.id)}
                  className="agri-card"
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '1.5rem'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                >
                  <div>
                    {/* Top Row: Icon & Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-neutral-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IconComp size={20} color="var(--color-secondary)" />
                      </div>
                      <span className="status-badge" style={{ backgroundColor: 'var(--color-neutral-bg)', color: 'var(--color-muted)' }}>
                        {role.badge}
                      </span>
                    </div>

                    {/* Role Title */}
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-secondary)', marginBottom: '0.5rem' }}>
                      {role.name}
                    </h3>

                    {/* Role Description */}
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                      {role.description}
                    </p>
                  </div>

                  {/* Bottom Action Link */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-primary)', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                    <span>Login</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </main>

      {/* Footer Bar */}
      <footer style={{ borderTop: '1px solid var(--color-border)', padding: '1.5rem 2rem', fontSize: '0.875rem', color: 'var(--color-muted)', textAlign: 'center', backgroundColor: 'var(--color-surface)' }}>
        &copy; {new Date().getFullYear()} AgriRentGov &bull; State Government Cooperative Platform &bull; Professional Access Portal
      </footer>

    </div>
  );
}
