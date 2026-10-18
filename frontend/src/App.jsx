// src/App.jsx
import React, { useState, useEffect, lazy, Suspense } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import EquipmentCatalog from './components/EquipmentCatalog';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import FAQ from './components/FAQ';
import CtaBanner from './components/CtaBanner';
import Footer from './components/Footer';
import RentalModal from './components/RentalModal';
import RoleSelectionPage from './components/RoleSelectionPage';
import RoleLoginPage from './components/RoleLoginPage';

// Lazy-load portals — only downloaded when the user logs in with that role
const FarmerPortal = lazy(() => import('./components/farmer/FarmerPortal'));
const CoopPortal = lazy(() => import('./components/cooperative/CoopPortal'));
const OperatorPortal = lazy(() => import('./components/operator/OperatorPortal'));
const AdminPortal = lazy(() => import('./components/admin/AdminPortal'));
const GovernmentPortal = lazy(() => import('./components/government/GovernmentPortal'));

// Minimal loading spinner shown while a lazy portal chunk loads
function PortalLoader() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-dark)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(21, 128, 61,0.2)', borderTop: '3px solid var(--color-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem' }}>Loading portal…</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// Error Boundary — catches render errors and prevents blank pages
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('App render error caught by boundary:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-dark)', flexDirection: 'column', gap: '1rem', padding: '2rem' }}>
          <div style={{ fontSize: '2.5rem' }}>⚠️</div>
          <h2 style={{ color: 'var(--color-text)', fontWeight: 800, fontSize: '1.4rem', textAlign: 'center' }}>Something went wrong</h2>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', maxWidth: '480px', textAlign: 'center', lineHeight: 1.5 }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
            style={{ marginTop: '1rem', backgroundColor: 'var(--color-primary)', color: 'var(--color-text)', border: 'none', padding: '0.75rem 2rem', borderRadius: '30px', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}
          >
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export { ErrorBoundary as AppErrorBoundary };

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('landing'); // 'landing' | 'role-selection' | 'role-login'
  const [selectedRoleId, setSelectedRoleId] = useState('farmer');
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);

  // Restore session on load
  useEffect(() => {
    const savedUser = localStorage.getItem('agrirent_user');
    const savedToken = localStorage.getItem('agrirent_token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleOpenRental = (equipmentObj = null) => {
    setSelectedEquipment(equipmentObj);
    setIsRentalModalOpen(true);
  };

  const handleCloseRental = () => {
    setIsRentalModalOpen(false);
    setSelectedEquipment(null);
  };

  const handleRoleCardClick = (roleId) => {
    setSelectedRoleId(roleId);
    setView('role-login');
  };

  const handleLoginSuccess = (authenticatedUser) => {
    setUser(authenticatedUser);
    setView('landing'); // Clean up view state
  };

  const handleLogout = () => {
    localStorage.removeItem('agrirent_token');
    localStorage.removeItem('agrirent_user');
    setUser(null);
    setView('landing');
  };


  // If logged in, route to appropriate portal (Suspense ensures lazy chunk loads gracefully)
  if (user) {
    if (user.role === 'Farmer') {
      return <Suspense fallback={<PortalLoader />}><FarmerPortal onLogout={handleLogout} user={user} /></Suspense>;
    }
    if (user.role === 'Equipment Operator' || user.role === 'Operator') {
      return <Suspense fallback={<PortalLoader />}><OperatorPortal onLogout={handleLogout} user={user} /></Suspense>;
    }
    if (user.role === 'Staff') {
      return <Suspense fallback={<PortalLoader />}><CoopPortal onLogout={handleLogout} user={user} /></Suspense>;
    }
    if (user.role === 'Admin' || user.role === 'Manager') {
      return <Suspense fallback={<PortalLoader />}><AdminPortal onLogout={handleLogout} user={user} /></Suspense>;
    }
    if (user.role === 'Officer' || user.role === 'Auditor') {
      return <Suspense fallback={<PortalLoader />}><GovernmentPortal onLogout={handleLogout} user={user} /></Suspense>;
    }
  }

  // Otherwise, render landing/guest screens
  if (view === 'role-selection') {
    return (
      <RoleSelectionPage
        onSelectRole={handleRoleCardClick}
        onBackToHome={() => setView('landing')}
      />
    );
  }

  if (view === 'role-login') {
    return (
      <RoleLoginPage
        roleId={selectedRoleId}
        onBackToRoles={() => setView('role-selection')}
        onBackToHome={() => setView('landing')}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-dark)' }}>
      <Header onSelectRole={() => setView('role-selection')} />

      <main style={{ flexGrow: 1 }}>
        <Hero onSelectRole={() => setView('role-selection')} />
        <EquipmentCatalog
          onSelectEquipment={handleOpenRental}
          onOpenFullCatalog={() => handleOpenRental(null)}
        />
        <Features />
        <HowItWorks />
        <FAQ />
        <CtaBanner onSelectRole={() => setView('role-selection')} />
      </main>

      <Footer onOpenContact={() => setView('role-selection')} />

      {/* Rental Booking Modal */}
      <RentalModal
        equipment={selectedEquipment}
        isOpen={isRentalModalOpen}
        onClose={handleCloseRental}
      />
    </div>
  );
}
