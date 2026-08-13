// src/components/RoleLoginPage.jsx
import React, { useState } from 'react';
import { 
  Sprout, 
  ArrowLeft, 
  ArrowRight, 
  ShieldCheck, 
  Lock, 
  User, 
  Phone, 
  Building2, 
  FileText,
  Tractor,
  Wrench,
  Landmark,
  Users,
  CheckCircle2,
  Mail
} from 'lucide-react';
import { loginRoleApi, registerApi } from '../api';
import toast, { Toaster } from 'react-hot-toast';

export const ROLE_DETAILS = {
  farmer: {
    id: 'farmer',
    name: 'Farmer',
    tag: 'AGRIRENTGOV • FARMER SERVICES',
    badge: 'Public Access',
    icon: Sprout,
    badgeColor: 'green',
    title: 'Farmer Cooperative Portal',
    subtitle: 'Enter your credentials to manage rentals & track machinery.',
    demoCreds: 'Email: farmer@agrirent.gov | Pass: farmer123',
    features: [
      'Cooperative Rental Rates (Up to 60% Savings)',
      'Instant Booking with ID verification',
      'Real-time GPS Delivery Tracking'
    ]
  },
  operator: {
    id: 'operator',
    name: 'Equipment Operator',
    tag: 'FIELD OPERATIONS & TELEMETRY',
    badge: 'Field Operations',
    icon: Tractor,
    badgeColor: 'green',
    title: 'Equipment Operator Portal',
    subtitle: 'Sign in to view assigned field jobs, log operating hours, and record machinery telemetry.',
    demoCreds: 'Email: operator@agrirent.gov | Pass: operator123',
    features: [
      'Daily Field Work Assignments & Jobs',
      'Engine Hours & Fuel Telemetry Logging',
      'Upload before/after work images'
    ]
  },
  equipmaintance: {
    id: 'equipmaintance',
    name: 'Equipmaintance Specialist',
    tag: 'MAINTENANCE & UPKEEP LEDGER',
    badge: 'Maintenance',
    icon: Wrench,
    badgeColor: 'blue',
    title: 'Equipment Maintenance Portal',
    subtitle: 'Sign in to manage machinery maintenance log sheets and schedule inspections.',
    demoCreds: 'Email: maint@agrirent.gov | Pass: maint123',
    features: [
      'Track machinery servicing status and schedule next maintenance',
      'Log parts replacement costs and technician diagnostics',
      'Maintain history log details for equipment condition auditing'
    ]
  },
  staff: {
    id: 'staff',
    name: 'Cooperative Staff',
    tag: 'COOPERATIVE CORE & OPERATIONS',
    badge: 'Cooperative Hub Control',
    icon: Users,
    badgeColor: 'blue',
    title: 'Cooperative Staff Portal',
    subtitle: 'Sign in to manage equipment inventory, approve rental requests, and handle invoices.',
    demoCreds: 'Email: staff@agrirent.gov | Pass: staff123',
    features: [
      'Review and Approve Farmer account registries & Rental bookings',
      'Manage cooperative machinery stock list inventory',
      'Generate invoices, track district stats and logs ledger'
    ]
  }
};

export default function RoleLoginPage({ roleId, onBackToRoles, onBackToHome, onLoginSuccess }) {
  const role = ROLE_DETAILS[roleId] || ROLE_DETAILS.farmer;
  const RoleIcon = role.icon;
  const isGreen = role.badgeColor === 'green';

  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    mobile: '',
    district: 'Chennai',
    address: '',
    farmerId: '',
    cooperativeHub: 'Chennai Central Hub #1'
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await loginRoleApi(formData.email, formData.password);
    setLoading(false);
    if (res.success) {
      toast.success('Logged in successfully!');
      if (onLoginSuccess) {
        onLoginSuccess(res.user);
      }
    } else {
      toast.error(res.message || 'Login failed.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const mappedRoleName = 
      role.id === 'farmer' ? 'Farmer' :
      role.id === 'operator' ? 'Equipment Operator' :
      role.id === 'equipmaintance' ? 'Equipmaintance' : 'Staff';

    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      mobile: formData.mobile,
      district: formData.district,
      address: formData.address,
      farmerId: formData.farmerId,
      cooperativeHub: formData.cooperativeHub,
      role: mappedRoleName
    };

    const res = await registerApi(payload);
    setLoading(false);
    if (res.success) {
      toast.success(res.message);
      setIsRegistering(false);
    } else {
      toast.error(res.message || 'Registration failed.');
    }
  };

  const handleFillDemo = () => {
    const demoEmail = 
      role.id === 'farmer' ? 'farmer@agrirent.gov' :
      role.id === 'operator' ? 'operator@agrirent.gov' :
      role.id === 'equipmaintance' ? 'maint@agrirent.gov' : 'staff@agrirent.gov';
    
    const demoPassword = 
      role.id === 'farmer' ? 'farmer123' :
      role.id === 'operator' ? 'operator123' :
      role.id === 'equipmaintance' ? 'maint123' : 'staff123';

    setFormData(prev => ({
      ...prev,
      email: demoEmail,
      password: demoPassword,
      mobile: role.id === 'farmer' ? '9876543210' : '',
      farmerId: role.id === 'farmer' ? '123456789012' : ''
    }));
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-dark)', color: '#ffffff', display: 'flex', flexDirection: 'column' }}>
      <Toaster position="top-right" />
      {/* Top Navigation Bar */}
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={onBackToRoles}
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
                fontWeight: 600
              }}
            >
              <ArrowLeft size={16} />
              <span>Back to Role Selection</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Login/Register Body */}
      <main style={{ flexGrow: 1, padding: '3.5rem 2.5rem 5rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '1100px', width: '100%', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '3rem', alignItems: 'center' }}>
            
            {/* Left Column: Login / Register Form Container */}
            <div
              style={{
                backgroundColor: '#131d35',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '24px',
                padding: '3rem 2.5rem',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
                <span className="section-tag" style={{ marginBottom: 0 }}>
                  {role.tag}
                </span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.25rem 0.75rem',
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: isGreen ? 'rgba(16, 185, 129, 0.12)' : 'rgba(56, 189, 248, 0.12)',
                    color: isGreen ? '#10b981' : '#38bdf8',
                    border: isGreen ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(56, 189, 248, 0.25)'
                  }}
                >
                  {role.badge}
                </span>
              </div>

              <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                {isRegistering ? `Register ${role.name}` : role.title}
              </h1>
              <p style={{ fontSize: '0.92rem', color: '#94a3b8', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                {isRegistering ? 'Create your official co-operative account below.' : role.subtitle}
              </p>

              {/* Demo Helper Button (only for sign in) */}
              {!isRegistering && (
                <div
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px dashed rgba(255, 255, 255, 0.15)',
                    borderRadius: '12px',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1.5rem',
                    fontSize: '0.82rem',
                    color: '#94a3b8'
                  }}
                >
                  <div>
                    <span style={{ color: '#10b981', fontWeight: 700 }}>Demo Login: </span>
                    {role.demoCreds}
                  </div>
                  <button
                    type="button"
                    onClick={handleFillDemo}
                    style={{
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: '#10b981',
                      padding: '0.3rem 0.75rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '0.75rem'
                    }}
                  >
                    Auto Fill
                  </button>
                </div>
              )}

              {/* Action Form */}
              <form onSubmit={isRegistering ? handleRegisterSubmit : handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                
                {isRegistering && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: 600 }}>
                      Full Name
                    </label>
                    <div style={{ position: 'relative' }}>
                      <User size={18} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="text"
                        name="name"
                        required
                        placeholder="Enter full name"
                        value={formData.name}
                        onChange={handleInputChange}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem 0.75rem 2.8rem',
                          borderRadius: '12px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#ffffff',
                          fontSize: '0.92rem',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Email and Password inputs (required for both login and registration across all roles) */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: 600 }}>
                    Official Email
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="name@domain.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem 0.75rem 2.8rem',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#ffffff',
                        fontSize: '0.92rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: 600 }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="password"
                      name="password"
                      required
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem 0.75rem 2.8rem',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#ffffff',
                        fontSize: '0.92rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                {isRegistering && (
                  <>
                    {/* Mobile number (for all roles) */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: 600 }}>
                        Mobile Number
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Phone size={18} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                          type="text"
                          name="mobile"
                          required
                          placeholder="e.g. 9876543210"
                          value={formData.mobile}
                          onChange={handleInputChange}
                          style={{
                            width: '100%',
                            padding: '0.75rem 1rem 0.75rem 2.8rem',
                            borderRadius: '12px',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            color: '#ffffff',
                            fontSize: '0.92rem',
                            outline: 'none'
                          }}
                        />
                      </div>
                    </div>

                    {/* Farmer specific fields: Farmer ID, Address, Tamil Nadu districts */}
                    {role.id === 'farmer' ? (
                      <>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: 600 }}>
                            Farmer ID
                          </label>
                          <div style={{ position: 'relative' }}>
                            <ShieldCheck size={18} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                              type="text"
                              name="farmerId"
                              required
                              placeholder="e.g. 123456789012"
                              value={formData.farmerId}
                              onChange={handleInputChange}
                              style={{
                                width: '100%',
                                padding: '0.75rem 1rem 0.75rem 2.8rem',
                                borderRadius: '12px',
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.12)',
                                color: '#ffffff',
                                fontSize: '0.92rem',
                                outline: 'none'
                              }}
                            />
                          </div>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: 600 }}>
                            Address
                          </label>
                          <div style={{ position: 'relative' }}>
                            <Building2 size={18} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                              type="text"
                              name="address"
                              required
                              placeholder="e.g. 123 Temple St, Adyar"
                              value={formData.address}
                              onChange={handleInputChange}
                              style={{
                                width: '100%',
                                padding: '0.75rem 1rem 0.75rem 2.8rem',
                                borderRadius: '12px',
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.12)',
                                color: '#ffffff',
                                fontSize: '0.92rem',
                                outline: 'none'
                              }}
                            />
                          </div>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: 600 }}>
                            District (Tamil Nadu)
                          </label>
                          <div style={{ position: 'relative' }}>
                            <Building2 size={18} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                            <select
                              name="district"
                              value={formData.district}
                              onChange={handleInputChange}
                              style={{
                                width: '100%',
                                padding: '0.75rem 1rem 0.75rem 2.8rem',
                                borderRadius: '12px',
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.12)',
                                color: '#ffffff',
                                fontSize: '0.92rem',
                                outline: 'none'
                              }}
                            >
                              {['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Vellore', 'Thanjavur', 'Erode', 'Dindigul', 'Thoothukudi', 'Nagercoil'].map(d => (
                                <option key={d} value={d} style={{ backgroundColor: '#131d35' }}>{d}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Other roles: standard district select */}
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: 600 }}>
                            District
                          </label>
                          <div style={{ position: 'relative' }}>
                            <Building2 size={18} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                            <select
                              name="district"
                              value={formData.district}
                              onChange={handleInputChange}
                              style={{
                                width: '100%',
                                padding: '0.75rem 1rem 0.75rem 2.8rem',
                                borderRadius: '12px',
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.12)',
                                color: '#ffffff',
                                fontSize: '0.92rem',
                                outline: 'none'
                              }}
                            >
                              {['Ludhiana', 'Patiala', 'Amritsar', 'Bathinda', 'Sangrur', 'Jalandhar'].map(d => (
                                <option key={d} value={d} style={{ backgroundColor: '#131d35' }}>{d}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-green"
                  style={{
                    padding: '0.9rem',
                    fontSize: '1rem',
                    marginTop: '0.8rem',
                    borderRadius: 'var(--radius-pill)',
                    width: '100%',
                    justifyContent: 'center',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  <span>{loading ? 'Processing...' : isRegistering ? 'Register Account' : 'Sign In'}</span>
                  <ArrowRight size={18} />
                </button>
              </form>

              {/* Toggle Login/Register Mode */}
              <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: '#94a3b8' }}>
                {isRegistering ? (
                  <span>
                    Already have an account?{' '}
                    <button onClick={() => setIsRegistering(false)} style={{ color: '#10b981', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                      Sign In here
                    </button>
                  </span>
                ) : (
                  <span>
                    Don't have an account?{' '}
                    <button onClick={() => setIsRegistering(true)} style={{ color: '#10b981', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                      Register here
                    </button>
                  </span>
                )}
              </div>
            </div>

            {/* Right Column: Privileges details */}
            <div>
              <div
                style={{
                  backgroundColor: '#131d35',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '24px',
                  padding: '2.5rem'
                }}
              >
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '16px',
                    backgroundColor: isGreen ? 'rgba(16, 185, 129, 0.15)' : 'rgba(2, 132, 199, 0.2)',
                    border: isGreen ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(56, 189, 248, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem'
                  }}
                >
                  <RoleIcon size={28} color={isGreen ? '#10b981' : '#38bdf8'} />
                </div>

                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.8rem' }}>
                  {role.name} Platform Privileges
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '2.0rem' }}>
                  Secure system with RBAC logic. Audited operations.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {role.features.map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <CheckCircle2 size={18} color="#10b981" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.4 }}>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <footer style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', padding: '1.5rem 2.5rem', fontSize: '0.85rem', color: '#64748b', textAlign: 'center' }}>
        &copy; {new Date().getFullYear()} AgriRentGov &bull; State Government Cooperative Platform
      </footer>
    </div>
  );
}
