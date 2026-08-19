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
      case 'dashboard': return 'App';
      case 'equipment': return 'Equipment';
      case 'bookings': return 'Bookings';
      case 'complaints': return 'Complaints';
      case 'notifications': return 'Notifications';
      default: return 'App';
    }
  };

  const userName = farmerUser?.name || 'SIVA SUBRAMANI BHARATHI HARI KRISHNA';
  const userEmail = farmerUser?.email || 'harikrishnasb3246@gmail.com';
  const userInitials = farmerUser?.initials || 'SI';

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: '#0b1324', color: '#ffffff' }}>
      
      {/* Sidebar */}
      <aside
        style={{
          width: '260px',
          backgroundColor: '#0c162c',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          height: '100%'
        }}
      >
        {/* Sidebar Header Brand */}
        <div style={{ padding: '1.5rem 1.5rem 1.8rem 1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
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
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.1 }}>
                AgriRentGov
              </div>
              <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', marginTop: '1px' }}>
                STATE COOPERATIVE
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
                  padding: '0.75rem 1.25rem',
                  borderRadius: '12px',
                  backgroundColor: isActive ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                  border: isActive ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
                  color: isActive ? '#10b981' : '#94a3b8',
                  fontFamily: 'var(--font-family)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.92rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                    e.currentTarget.style.color = '#ffffff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#94a3b8';
                  }
                }}
              >
                <IconComponent size={20} color={isActive ? '#10b981' : '#94a3b8'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Logout Button */}
        <div style={{ padding: '1.25rem 1rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <button
            onClick={onLogout}
            style={{
              width: '100%',
              padding: '0.75rem 1.25rem',
              borderRadius: '12px',
              backgroundColor: 'transparent',
              border: '1px solid transparent',
              color: '#94a3b8',
              fontFamily: 'var(--font-family)',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.8rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
              e.currentTarget.style.color = '#ef4444';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#94a3b8';
            }}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        
        {/* Top Navbar */}
        <header
          style={{
            height: '70px',
            backgroundColor: '#0c162c',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '0 2.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0
          }}
        >
          {/* Left Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: '#94a3b8' }}>
            <Menu size={18} color="#94a3b8" />
            <span>AgriRentGov</span>
            <span>/</span>
            <span style={{ color: '#ffffff', fontWeight: 600 }}>{getBreadcrumbTitle()}</span>
          </div>

          {/* Right User Profile Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.3rem 0.8rem',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#10b981',
                fontSize: '0.78rem',
                fontWeight: 700
              }}
            >
              <ShieldCheck size={14} />
              <span>Farmer</span>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.1 }}>
                {userName}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                {userEmail}
              </div>
            </div>

            {/* Initials Circle */}
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
                color: '#ffffff'
              }}
            >
              {userInitials}
            </div>
          </div>
        </header>

        {/* View Content */}
        <main style={{ flexGrow: 1, padding: '2.5rem', overflowY: 'auto' }}>
          {children}
        </main>

      </div>

    </div>
  );
}
