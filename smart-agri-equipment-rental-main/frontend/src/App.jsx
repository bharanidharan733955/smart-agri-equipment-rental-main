// src/App.jsx
import React, { useState, useEffect } from 'react';
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
import FarmerPortal from './components/farmer/FarmerPortal';
import CoopPortal from './components/cooperative/CoopPortal';
import OperatorPortal from './components/operator/OperatorPortal';
import AdminPortal from './components/admin/AdminPortal';

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
    setUser(null);
    setView('landing');
  };

  // If logged in, route to appropriate portal
  if (user) {
    if (user.role === 'Farmer') {
      return <FarmerPortal onLogout={handleLogout} user={user} />;
    }
    if (user.role === 'Equipment Operator' || user.role === 'Operator') {
      return <OperatorPortal onLogout={handleLogout} user={user} />;
    }
    if (user.role === 'Equipmaintance') {
      return <CoopPortal onLogout={handleLogout} user={user} />;
    }
    if (user.role === 'Staff' || user.role === 'Admin' || user.role === 'Manager') {
      return <AdminPortal onLogout={handleLogout} user={user} />;
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
