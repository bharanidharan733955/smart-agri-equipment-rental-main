// src/components/cooperative/FarmerVerificationView.jsx
import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  UserCheck,
  UserX,
  AlertTriangle,
  Search,
  CheckCircle,
  XCircle,
  FileText,
  Building2,
  MapPin,
  User,
  Database
} from 'lucide-react';
import { fetchFarmerVerifications, approveFarmerApi, rejectFarmerApi } from '../../api';
import toast from 'react-hot-toast';

export default function FarmerVerificationView() {
  const [verifications, setVerifications] = useState([]);
  const [govtRegistry, setGovtRegistry] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('PENDING_VERIFICATION');
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectingFarmer, setRejectingFarmer] = useState(null);
  const [rejectReason, setRejectReason] = useState('Farmer ID mismatch in official database');

  useEffect(() => {
    loadData();
  }, [filterStatus]);

  const loadData = async () => {
    setLoading(true);
    const res = await fetchFarmerVerifications(filterStatus);
    if (res.success) {
      setVerifications(res.data || []);
      setGovtRegistry(res.govtRegistry || []);
    }
    setLoading(false);
  };

  const handleApprove = async (id, name) => {
    const res = await approveFarmerApi(id);
    if (res.success) {
      toast.success(`Farmer ${name} approved successfully!`);
      loadData();
    } else {
      toast.error(res.message || 'Failed to approve farmer.');
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectingFarmer) return;

    const res = await rejectFarmerApi(rejectingFarmer._id || rejectingFarmer.id, rejectReason);
    if (res.success) {
      toast.success(`Farmer registration rejected.`);
      setRejectingFarmer(null);
      loadData();
    } else {
      toast.error(res.message || 'Failed to reject farmer.');
    }
  };

  const filteredItems = verifications.filter(f => {
    const q = searchQuery.toLowerCase();
    const nameMatch = (f.name || '').toLowerCase().includes(q);
    const idMatch = (f.farmerId || '').toLowerCase().includes(q);
    const mobileMatch = (f.mobile || '').toLowerCase().includes(q);
    const distMatch = (f.district || '').toLowerCase().includes(q);
    return nameMatch || idMatch || mobileMatch || distMatch;
  });

  const pendingCount = verifications.filter(f => f.verificationStatus === 'PENDING_VERIFICATION' || !f.isApproved).length;
  const approvedCount = verifications.filter(f => f.isApproved || f.verificationStatus === 'APPROVED').length;
  const rejectedCount = verifications.filter(f => f.isRejected || f.verificationStatus === 'REJECTED').length;

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', color: 'var(--color-text)' }}>
      {/* Section Tag */}
      <span className="section-tag">STATE GOVT REGISTRY AUDIT</span>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
            Farmer Verification & Approvals
          </h1>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.92rem', marginTop: '4px' }}>
            Cross-check farmer submitted ID against the Tamil Nadu Agriculture Registry database.
          </p>
        </div>

        {/* Status Count Pills */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={16} color="#f59e0b" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Pending: {pendingCount}</span>
          </div>
          <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={16} color="var(--color-primary)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Approved: {approvedCount}</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'var(--color-surface)', padding: '0.35rem', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
          {[
            { id: 'PENDING_VERIFICATION', label: 'Pending Verification' },
            { id: 'APPROVED', label: 'Approved' },
            { id: 'REJECTED', label: 'Rejected' },
            { id: 'ALL', label: 'All Registrations' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              style={{
                padding: '0.5rem 1.1rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: filterStatus === tab.id ? 'var(--color-primary)' : 'transparent',
                color: filterStatus === tab.id ? '#ffffff' : 'var(--color-text)',
                fontWeight: filterStatus === tab.id ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={18} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
          <input
            type="text"
            placeholder="Search Farmer ID, Name, Mobile..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.9rem 0.55rem 2.6rem',
              borderRadius: '10px',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
              fontSize: '0.88rem',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Verification Cards List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-muted)' }}>
          Loading farmer verifications...
        </div>
      ) : filteredItems.length === 0 ? (
        <div style={{ backgroundColor: 'var(--color-surface)', padding: '3rem', borderRadius: '20px', textAlign: 'center', border: '1px solid var(--color-border)' }}>
          <UserCheck size={40} color="var(--color-muted)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>No Farmer Registrations Found</h3>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
            There are no farmer registrations matching the selected filter ({filterStatus}).
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {filteredItems.map(farmer => {
            const isMatched = farmer.isIdMatched;
            const govt = farmer.govtMatch;

            return (
              <div
                key={farmer._id || farmer.id}
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '20px',
                  padding: '1.8rem',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 220px',
                  gap: '1.5rem',
                  alignItems: 'center'
                }}
              >
                {/* 1. Farmer Registration Input */}
                <div style={{ borderRight: '1px solid var(--color-border)', paddingRight: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
                    <User size={18} color="var(--color-primary)" />
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-muted)', letterSpacing: '0.05em' }}>
                      Registered Farmer Input
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text)', margin: '0 0 0.4rem 0' }}>
                    {farmer.name}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
                    <div>
                      <span style={{ color: 'var(--color-muted)' }}>Farmer ID Used: </span>
                      <strong style={{ fontFamily: 'monospace', color: 'var(--color-info)' }}>{farmer.farmerId || 'Not Provided'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--color-muted)' }}>Mobile: </span>
                      <strong>{farmer.mobile || 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--color-muted)' }}>Location: </span>
                      <strong>{farmer.district || 'Coimbatore'}{farmer.taluk ? ` • ${farmer.taluk}` : ''}</strong>
                    </div>
                    {farmer.address && (
                      <div>
                        <span style={{ color: 'var(--color-muted)' }}>Address: </span>
                        <span>{farmer.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Seeded Database Cross-Verification */}
                <div style={{ borderRight: '1px solid var(--color-border)', paddingRight: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
                    <Database size={18} color={isMatched ? 'var(--color-primary)' : '#ef4444'} />
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-muted)', letterSpacing: '0.05em' }}>
                      Govt Database Record
                    </span>
                  </div>

                  {isMatched && govt ? (
                    <div>
                      {((farmer.name || '').toLowerCase().trim() === (govt.officialName || '').toLowerCase().trim() || farmer.isNameMatched) ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', backgroundColor: 'var(--color-success-bg)', border: '1px solid var(--color-border)', color: 'var(--color-primary)', fontSize: '0.75rem', fontWeight: 800, padding: '0.25rem 0.6rem', borderRadius: '20px', marginBottom: '0.6rem' }}>
                          <CheckCircle size={14} />
                          <span>VERIFIED ID & NAME MATCH</span>
                        </div>
                      ) : (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', backgroundColor: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.4)', color: '#d97706', fontSize: '0.75rem', fontWeight: 800, padding: '0.25rem 0.6rem', borderRadius: '20px', marginBottom: '0.6rem' }}>
                          <AlertTriangle size={14} />
                          <span>⚠️ NAME MISMATCH (Govt Name: {govt.officialName})</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.85rem' }}>
                        <div><span style={{ color: 'var(--color-muted)' }}>Official Name: </span><strong style={{ color: (farmer.name || '').toLowerCase().trim() === (govt.officialName || '').toLowerCase().trim() ? 'inherit' : '#d97706' }}>{govt.officialName}</strong></div>
                        <div><span style={{ color: 'var(--color-muted)' }}>Matched ID: </span><strong style={{ fontFamily: 'monospace' }}>{govt.govtFarmerId}</strong></div>
                        <div><span style={{ color: 'var(--color-muted)' }}>Land Holding: </span><strong>{govt.landHoldingAcres} Acres</strong></div>
                        <div><span style={{ color: 'var(--color-muted)' }}>Aadhaar: </span><span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{govt.aadhaarStatus}</span></div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', fontSize: '0.75rem', fontWeight: 800, padding: '0.25rem 0.6rem', borderRadius: '20px', marginBottom: '0.6rem' }}>
                        <XCircle size={14} />
                        <span>UNMATCHED / INVALID ID</span>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: 'var(--color-muted)', lineHeight: 1.4, margin: 0 }}>
                        Submitted Farmer ID (<strong>{farmer.farmerId || 'N/A'}</strong>) does not match any entry in the Tamil Nadu Agriculture Registry database.
                      </p>
                    </div>
                  )}
                </div>

                {/* 3. Action Buttons & Current Status */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', justifyContent: 'center' }}>
                  <div style={{ textAlign: 'center', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', display: 'block', marginBottom: '4px' }}>Current Status</span>
                    <span style={{
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      padding: '0.3rem 0.8rem',
                      borderRadius: '20px',
                      backgroundColor: farmer.isApproved ? 'var(--color-success-bg)' : (farmer.isRejected ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)'),
                      color: farmer.isApproved ? 'var(--color-primary)' : (farmer.isRejected ? '#ef4444' : '#f59e0b'),
                      border: `1px solid ${farmer.isApproved ? 'var(--color-border)' : (farmer.isRejected ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)')}`
                    }}>
                      {farmer.isApproved ? 'APPROVED' : (farmer.isRejected ? 'REJECTED' : 'PENDING')}
                    </span>
                  </div>

                  {!farmer.isApproved && (
                    <button
                      onClick={() => handleApprove(farmer._id || farmer.id, farmer.name)}
                      className="btn-green"
                      style={{ padding: '0.55rem 1rem', fontSize: '0.85rem', width: '100%', justifyContent: 'center' }}
                    >
                      <UserCheck size={16} />
                      <span>Approve Farmer</span>
                    </button>
                  )}

                  {!farmer.isRejected && (
                    <button
                      onClick={() => setRejectingFarmer(farmer)}
                      style={{
                        padding: '0.55rem 1rem',
                        fontSize: '0.85rem',
                        width: '100%',
                        borderRadius: '10px',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        backgroundColor: 'rgba(239, 68, 68, 0.08)',
                        color: '#ef4444',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <UserX size={16} />
                      <span>Reject Farmer</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Modal */}
      {rejectingFarmer && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '480px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>Reject Farmer Registration</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-muted)', marginBottom: '1.2rem' }}>
              Rejecting account for <strong>{rejectingFarmer.name}</strong> (Farmer ID: {rejectingFarmer.farmerId || 'N/A'}).
            </p>

            <form onSubmit={handleRejectSubmit}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-muted)', marginBottom: '0.4rem' }}>
                Reason for Rejection *
              </label>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)', fontSize: '0.88rem', outline: 'none', marginBottom: '1.5rem' }}
              >
                <option value="Farmer ID mismatch in official database">Farmer ID mismatch in official database</option>
                <option value="Mobile number not registered with land holding">Mobile number not registered with land holding</option>
                <option value="District / Taluk jurisdiction mismatch">District / Taluk jurisdiction mismatch</option>
                <option value="Incomplete or unverified documentation">Incomplete or unverified documentation</option>
              </select>

              <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setRejectingFarmer(null)}
                  style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', border: '1px solid var(--color-border)', backgroundColor: 'transparent', color: 'var(--color-text)', cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', border: 'none', backgroundColor: '#ef4444', color: '#ffffff', cursor: 'pointer', fontWeight: 700 }}
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
