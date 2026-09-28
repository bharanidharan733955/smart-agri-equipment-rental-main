// src/components/farmer/FarmerLayout.jsx
import React from 'react';
import { 
  Sprout, 
  LayoutDashboard, 
  Tractor, 
  Calendar, 
  MessageSquare, 
  Bell, 
  LogOut,
  ShieldCheck,
  Menu
} from 'lucide-react';

export default function FarmerLayout({ activeTab, setActiveTab, onLogout, farmerUser, children }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'equipment', label: 'Equipment', icon: Tractor },
    { id: 'bookings', label: 'My Bookings', icon: Calendar },
    { id: 'complaints', label: 'Complaints', icon: MessageSquare },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ];

  const getBreadcrumbTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard';
      case 'equipment': return 'Equipment';
      case 'bookings': return 'My Bookings';
      case 'complaints': return 'Complaints';
      case 'notifications': return 'Notifications';
      default: return 'App';
    }
  };

  const userName = farmerUser?.name || 'SIVA SUBRAMANI BHARATHI HARI KRISHNA';
  const userEmail = farmerUser?.email || 'harikrishnasb3246@gmail.com';
  const userInitials = farmerUser?.initials || 'SI';

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: 'var(--color-background)', color: 'var(--color-text)' }}>
      
      {/* Sidebar */}
      <aside
        style={{
          width: '260px',
          backgroundColor: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          height: '100%',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        {/* Sidebar Header Brand */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Sprout size={22} color="#ffffff" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-secondary)', lineHeight: 1.1 }}>
                AGRI RENT GOV
              </div>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-muted)', letterSpacing: '0.05em', marginTop: '2px' }}>
                FARMER PORTAL
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu Links */}
        <nav style={{ padding: '1.25rem 1rem', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isActive ? 'rgba(21, 128, 61, 0.08)' : 'transparent',
                  border: 'none',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text)',
                  fontFamily: 'var(--font-family)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'var(--color-background)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <IconComponent size={18} color={isActive ? 'var(--color-primary)' : 'var(--color-muted)'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Logout Button */}
        <div style={{ padding: '1.25rem 1rem', borderTop: '1px solid var(--color-border)' }}>
          <button
            onClick={onLogout}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--color-muted)',
              fontFamily: 'var(--font-family)',
              fontWeight: 500,
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-danger-bg)';
              e.currentTarget.style.color = 'var(--color-danger)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--color-muted)';
            }}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0, backgroundColor: 'var(--color-background)' }}>
        
        {/* Top Navbar */}
        <header
          style={{
            height: '64px',
            backgroundColor: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border)',
            padding: '0 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0
          }}
        >
          {/* Left Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--color-muted)' }}>
            <Menu size={18} color="var(--color-muted)" />
            <span>AgriRentGov</span>
            <span>/</span>
            <span>Farmer</span>
            <span>/</span>
            <span style={{ color: 'var(--color-secondary)', fontWeight: 600 }}>{getBreadcrumbTitle()}</span>
          </div>

          {/* Right User Profile Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.25rem 0.75rem',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'var(--color-success-bg)',
                color: 'var(--color-success)',
                fontSize: '0.75rem',
                fontWeight: 600
              }}
            >
              <ShieldCheck size={14} />
              <span>Farmer</span>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-secondary)', lineHeight: 1.1 }}>
                {userName}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '2px' }}>
                {userEmail}
              </div>
            </div>

            {/* Initials Circle */}
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-background)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: '0.875rem',
                color: 'var(--color-secondary)'
              }}
            >
              {userInitials}
            </div>
          </div>
        </header>

        {/* View Content */}
        <main style={{ flexGrow: 1, padding: '2rem', overflowY: 'auto' }}>
          <div className="page-container" style={{ padding: 0 }}>
            {children}
          </div>
        </main>

      </div>

    </div>
  );
}
