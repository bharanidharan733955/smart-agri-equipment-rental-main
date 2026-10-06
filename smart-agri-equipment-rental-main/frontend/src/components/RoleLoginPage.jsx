// src/components/RoleLoginPage.jsx
import React, { useState } from 'react';
import {
  Sprout,
  ArrowLeft,
  ArrowRight,
  Lock,
  User,
  Phone,
  Building2,
  Tractor,
  Users,
  CheckCircle2,
  Mail
} from 'lucide-react';

import { loginRoleApi, registerApi } from '../api';
import { TN_DISTRICTS, getTaluksForDistrict } from '../data/tnLocationData';
import toast, { Toaster } from 'react-hot-toast';

export const ROLE_DETAILS = {
  farmer: {
    id: 'farmer',
    name: 'Farmer',
    tag: 'AGRIRENTGOV • FARMER SERVICES',
    badge: 'Public Access',
    icon: Sprout,
    title: 'Farmer Cooperative Portal',
    subtitle: 'Enter your credentials to manage rentals & track machinery.',
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
    title: 'Equipment Operator Portal',
    subtitle: 'Sign in to view assigned field jobs, log operating hours, and record machinery telemetry.',
    features: [
      'Daily Field Work Assignments & Jobs',
      'Engine Hours & Fuel Telemetry Logging',
      'Upload before/after work images'
    ]
  },

  staff: {
    id: 'staff',
    name: 'Cooperative Staff',
    tag: 'COOPERATIVE CORE & OPERATIONS',
    badge: 'Cooperative Hub Control',
    icon: Users,
    title: 'Cooperative Staff Portal',
    subtitle: 'Sign in to manage equipment inventory, approve rental requests, and handle invoices.',
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

  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    mobile: '',
    district: 'Coimbatore',
    taluk: 'Pollachi',
    village: 'Anaimalai',
    address: '',
    farmerId: '',
    cooperativeHub: 'Coimbatore Central Hub #1'
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'district') {
      const taluks = getTaluksForDistrict(value);
      setFormData(prev => ({
        ...prev,
        district: value,
        taluk: taluks[0] || ''
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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
        role.id === 'operator' ? 'Equipment Operator' : 'Staff';

    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      mobile: formData.mobile,
      district: formData.district,
      taluk: formData.taluk,
      village: formData.village,
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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)', color: 'var(--color-text)', display: 'flex', flexDirection: 'column' }}>
      <Toaster position="top-right" />

      {/* Top Navigation Bar */}
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

          <button onClick={onBackToRoles} className="btn btn-secondary">
            <ArrowLeft size={16} />
            <span>Back to Role Selection</span>
          </button>
        </div>
      </header>

      {/* Main Login/Register Body */}
      <main className="page-container" style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '1000px', width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>

            {/* Left Column: Form Container */}
            <div className="agri-card" style={{ padding: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <span className="status-badge" style={{ backgroundColor: 'var(--color-neutral-bg)', color: 'var(--color-muted)' }}>
                  {role.tag}
                </span>
              </div>

              <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-secondary)', marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>
                {isRegistering ? `Register ${role.name}` : role.title}
              </h1>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', marginBottom: '2rem', lineHeight: 1.5 }}>
                {isRegistering ? 'Create your official cooperative account below.' : role.subtitle}
              </p>

              {/* Action Form */}
              <form onSubmit={isRegistering ? handleRegisterSubmit : handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                {isRegistering && (
                  <div>
                    <label className="form-label">Full Name</label>
                    <div style={{ position: 'relative' }}>
                      <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
                      <input
                        type="text"
                        name="name"
                        required
                        placeholder="Enter full name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="form-input"
                        style={{ paddingLeft: '2.75rem' }}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="form-label">Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="name@domain.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-input"
                      style={{ paddingLeft: '2.75rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
                    <input
                      type="password"
                      name="password"
                      required
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="form-input"
                      style={{ paddingLeft: '2.75rem' }}
                    />
                  </div>
                </div>

                {isRegistering && (
                  <>
                    <div>
                      <label className="form-label">Mobile Number</label>
                      <div style={{ position: 'relative' }}>
                        <Phone size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
                        <input
                          type="text"
                          name="mobile"
                          required
                          placeholder="e.g. 9876543210"
                          value={formData.mobile}
                          onChange={handleInputChange}
                          className="form-input"
                          style={{ paddingLeft: '2.75rem' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="form-label">District *</label>
                      <div style={{ position: 'relative' }}>
                        <Building2 size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
                        <select
                          name="district"
                          value={formData.district}
                          onChange={handleInputChange}
                          className="form-select"
                          style={{ paddingLeft: '2.75rem' }}
                        >
                          {TN_DISTRICTS.map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="form-label">Taluk *</label>
                      <div style={{ position: 'relative' }}>
                        <Building2 size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
                        <select
                          name="taluk"
                          value={formData.taluk}
                          onChange={handleInputChange}
                          className="form-select"
                          style={{ paddingLeft: '2.75rem' }}
                        >
                          {getTaluksForDistrict(formData.district).map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {role.id === 'farmer' && (
                      <>
                        <div>
                          <label className="form-label">Farmer ID</label>
                          <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
                            <input
                              type="text"
                              name="farmerId"
                              placeholder="e.g. FID-TN-2026-8812"
                              value={formData.farmerId}
                              onChange={handleInputChange}
                              className="form-input"
                              style={{ paddingLeft: '2.75rem' }}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="form-label">Village Name</label>
                          <div style={{ position: 'relative' }}>
                            <Building2 size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
                            <input
                              type="text"
                              name="village"
                              placeholder="e.g. Anaimalai Village"
                              onChange={handleInputChange}
                              className="form-input"
                              style={{ paddingLeft: '2.75rem' }}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="form-label">Address</label>
                          <div style={{ position: 'relative' }}>
                            <Building2 size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
                            <input
                              type="text"
                              name="address"
                              required
                              placeholder="e.g. 45 Agriculture St, Pollachi"
                              value={formData.address}
                              onChange={handleInputChange}
                              className="form-input"
                              style={{ paddingLeft: '2.75rem' }}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}
                >
                  <span>{loading ? 'Processing...' : isRegistering ? 'Register Account' : 'Sign In'}</span>
                  <ArrowRight size={18} />
                </button>
              </form>

              {/* Toggle Login/Register Mode */}
              <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-muted)' }}>
                {isRegistering ? (
                  <span>
                    Already have an account?{' '}
                    <button onClick={() => setIsRegistering(false)} style={{ color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                      Sign In here
                    </button>
                  </span>
                ) : (
                  <span>
                    Don't have an account?{' '}
                    <button onClick={() => setIsRegistering(true)} style={{ color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                      Register here
                    </button>
                  </span>
                )}
              </div>
            </div>

            {/* Right Column: Privileges */}
            <div style={{ padding: '2rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-neutral-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <RoleIcon size={24} color="var(--color-secondary)" />
              </div>

              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-secondary)', marginBottom: '0.5rem' }}>
                {role.name} Privileges
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', lineHeight: 1.5, marginBottom: '2rem' }}>
                Secure system with role-based access control and audited operations.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {role.features.map((feat, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <CheckCircle2 size={18} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ fontSize: '0.875rem', color: 'var(--color-text)', lineHeight: 1.4 }}>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>

      <footer style={{ borderTop: '1px solid var(--color-border)', padding: '1.5rem 2rem', fontSize: '0.875rem', color: 'var(--color-muted)', textAlign: 'center', backgroundColor: 'var(--color-surface)' }}>
        &copy; {new Date().getFullYear()} AgriRentGov &bull; State Government Cooperative Platform
      </footer>
    </div>
  );
}
