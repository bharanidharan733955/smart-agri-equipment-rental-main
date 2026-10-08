// src/components/operator/OperatorPortal.jsx
import React, { useState, useEffect } from 'react';
import { fetchOperatorJobs, startJobApi, completeJobApi, logoutUser, fetchOperatorsWithEquipment, requestJobCancellationApi, reportJobIssueApi } from '../../api';
import { 
  Tractor, LogOut, CheckCircle2, AlertTriangle, Play, Calendar, User, Phone, MapPin, Fuel, Clock, Upload, Loader2, Users, Cpu, Star, Activity, XCircle, AlertCircle
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function OperatorPortal({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('jobs');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeJob, setActiveJob] = useState(null);
  const [operatorsTeam, setOperatorsTeam] = useState([]);
  const [teamLoading, setTeamLoading] = useState(false);
  
  // Job execution state
  const [beforeImage, setBeforeImage] = useState('https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [fuelUsed, setFuelUsed] = useState('');
  const [fuelType, setFuelType] = useState('Diesel');
  const [remarks, setRemarks] = useState('');
  const [workCompleted, setWorkCompleted] = useState('Fully Completed');
  const [fieldLocation, setFieldLocation] = useState('');
  const [equipmentCondition, setEquipmentCondition] = useState('Good');
  const [damageInfo, setDamageInfo] = useState('');
  const [photosInput, setPhotosInput] = useState('');

  // Cancellation & Issue Reporting State
  const [cancellationModalJob, setCancellationModalJob] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('Personal Emergency');
  const [cancellationExplanation, setCancellationExplanation] = useState('');

  const [issueModalJob, setIssueModalJob] = useState(null);
  const [issueType, setIssueType] = useState('Engine Breakdown');
  const [issueDescription, setIssueDescription] = useState('');
  const [issuePhoto, setIssuePhoto] = useState('');

  const handleRequestCancellationSubmit = async (e) => {
    e.preventDefault();
    if (!cancellationReason || !cancellationExplanation.trim()) {
      toast.error('Reason and detailed explanation are mandatory.');
      return;
    }
    setActionLoading(true);
    const res = await requestJobCancellationApi(cancellationModalJob._id || cancellationModalJob.id, {
      reason: cancellationReason,
      explanation: cancellationExplanation
    });
    setActionLoading(false);
    if (res.success) {
      toast.success('Cancellation request submitted to Cooperative Staff!');
      setCancellationModalJob(null);
      setCancellationExplanation('');
      loadJobs();
    } else {
      toast.error(res.message || 'Failed to submit cancellation request.');
    }
  };

  const handleReportIssueSubmit = async (e) => {
    e.preventDefault();
    if (!issueType || !issueDescription.trim()) {
      toast.error('Issue type and description are required.');
      return;
    }
    setActionLoading(true);
    const res = await reportJobIssueApi(issueModalJob._id || issueModalJob.id, {
      issueType,
      description: issueDescription,
      photo: issuePhoto
    });
    setActionLoading(false);
    if (res.success) {
      toast.error('Equipment issue reported to Cooperative Staff!');
      setIssueModalJob(null);
      setIssueDescription('');
      loadJobs();
    } else {
      toast.error(res.message || 'Failed to report equipment issue.');
    }
  };

  useEffect(() => {
    if (activeJob) {
      const defaultStart = activeJob.startTime ? new Date(activeJob.startTime) : new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const formatLocal = (d) => {
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      };
      setStartTime(formatLocal(defaultStart));
      setEndTime(formatLocal(new Date()));
      if (activeJob.booking?.tentativeBill?.fuelType) {
        setFuelType(activeJob.booking.tentativeBill.fuelType);
      }
    }
  }, [activeJob]);

  const loadJobs = async () => {
    setLoading(true);
    const data = await fetchOperatorJobs();
    setJobs(data);
    setLoading(false);
  };

  const loadTeam = async () => {
    setTeamLoading(true);
    const data = await fetchOperatorsWithEquipment();
    setOperatorsTeam(data);
    setTeamLoading(false);
  };

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    if (activeTab === 'team') {
      loadTeam();
    }
  }, [activeTab]);

  const handleStartJob = async (jobId) => {
    setActionLoading(true);
    const res = await startJobApi(jobId, beforeImage);
    setActionLoading(false);
    if (res.success) {
      toast.success('Job started successfully! Equipment is now In Use.');
      loadJobs();
    } else {
      toast.error(res.message || 'Failed to start job.');
    }
  };

  const handleCompleteJob = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    const res = await completeJobApi(activeJob._id || activeJob.id, {
      fuelUsed: parseFloat(fuelUsed) || 0,
      fuelType,
      remarks,
      workCompleted,
      equipmentCondition,
      damageInfo
    });
    setActionLoading(false);
    if (res.success) {
      toast.success('Job completed and report submitted successfully!');
      setActiveJob(null);
      setFuelUsed('');
      setFuelType('Diesel');
      setRemarks('');
      setWorkCompleted('Fully Completed');
      setEquipmentCondition('Good');
      setDamageInfo('');
      loadJobs();
    } else {
      toast.error(res.message || 'Failed to complete job.');
    }
  };

  const stats = {
    today: jobs.filter(j => j.status === 'Assigned').length,
    active: jobs.filter(j => j.status === 'Started' || j.status === 'In Progress').length,
    completed: jobs.filter(j => j.status === 'Completed').length
  };

  // Helper for live final bill preview calculation in operator completion modal
  const getLiveFinalBillPreview = () => {
    if (!activeJob) return null;
    const durationDays = activeJob.booking?.durationDays || 1;
    const rate = activeJob.equipment?.rentalRate || activeJob.booking?.rentalRate || 1800;
    const baseAmt = rate * durationDays;
    const pricePerL = fuelType === 'Petrol' ? 102 : 95;
    const actualL = parseFloat(fuelUsed) || 0;
    const actualFuelAmt = Math.round(actualL * pricePerL);
    
    const estL = durationDays * 6.0;
    const estFuelAmt = Math.round(estL * pricePerL);
    const estTotal = activeJob.booking?.tentativeBill?.tentativeTotal || Math.round((baseAmt + estFuelAmt) * 1.18);
    
    const subtotal = baseAmt + actualFuelAmt;
    const tax = Math.round(subtotal * 0.18);
    const finalTotal = subtotal + tax;
    const diff = finalTotal - estTotal;

    return { baseAmt, actualL, pricePerL, actualFuelAmt, estTotal, finalTotal, diff };
  };

  const livePreview = activeJob ? getLiveFinalBillPreview() : null;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)', color: 'var(--color-text)', display: 'flex', flexDirection: 'column' }}>
      <Toaster position="top-right" />
      {/* Header */}
      <header style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: '1rem 2rem' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <Tractor size={28} color="var(--color-primary)" />
            <div>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-secondary)' }}>AgriRent Operator Portal</span>
              <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--color-muted)' }}>COOPERATIVE FIELD STAFF</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-secondary)' }}>{user?.name}</span>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-success)' }}>Operator Connected</span>
            </div>
            <button
              onClick={() => {
                logoutUser();
                onLogout();
              }}
              style={{
                backgroundColor: 'var(--color-danger-bg)',
                border: '1px solid var(--color-danger)',
                color: 'var(--color-danger)',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: 600
              }}
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ flexGrow: 1, padding: '2rem', maxWidth: '1350px', width: '100%', margin: '0 auto' }}>
        
        {/* Stats bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="agri-card">
            <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '0.4rem' }}>Assigned Jobs</span>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-warning)' }}>{stats.today}</span>
          </div>
          <div className="agri-card">
            <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '0.4rem' }}>Active Work Session</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: stats.active > 0 ? 'var(--color-success)' : 'var(--color-muted)' }}>
              {stats.active > 0 ? `${stats.active} In Progress` : 'No Active Job'}
            </span>
          </div>
          <div className="agri-card">
            <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '0.4rem' }}>Completed Work Orders</span>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-success)' }}>{stats.completed}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', backgroundColor: 'var(--color-surface)', padding: '0.4rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', width: 'fit-content' }}>
          <button
            onClick={() => setActiveTab('jobs')}
            style={{
              padding: '0.6rem 1.4rem', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
              backgroundColor: activeTab === 'jobs' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'jobs' ? '#fff' : 'var(--color-muted)',
              display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s'
            }}
          >
            <Activity size={16} />
            <span>My Work Orders</span>
          </button>
          <button
            onClick={() => setActiveTab('team')}
            style={{
              padding: '0.6rem 1.4rem', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
              backgroundColor: activeTab === 'team' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'team' ? '#fff' : 'var(--color-muted)',
              display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s'
            }}
          >
            <Users size={16} />
            <span>Team &amp; Vehicles</span>
          </button>
        </div>

        {activeTab === 'jobs' && activeJob ? (
          /* Active job complete report form */
          <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: '20px', padding: '2rem', border: '1px solid var(--color-primary)', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.3rem', color: 'var(--color-primary)' }}>Submit Work Completion &amp; Fuel Log Report</h2>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              Job ID: {activeJob._id || activeJob.id} | Machine: {activeJob.equipment?.name || 'Machinery'} | Duration: {activeJob.booking?.durationDays || 1} Days
            </p>

            <form onSubmit={handleCompleteJob} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Fuel Type Used</label>
                <select
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                >
                  <option value="Diesel">Diesel (₹95/Liter)</option>
                  <option value="Petrol">Petrol (₹102/Liter)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Actual Fuel Consumed (Liters) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="e.g. 12.5"
                  value={fuelUsed}
                  onChange={(e) => setFuelUsed(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', backgroundColor: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                />
              </div>

              {/* Live Final Bill Preview Box */}
              {livePreview && (
                <div style={{ gridColumn: 'span 2', backgroundColor: 'rgba(2, 132, 199, 0.08)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '14px', padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-info)' }}>
                      ⚡ LIVE FINAL BILL CALCULATION PREVIEW
                    </span>
                    <span style={{ fontSize: '0.75rem', color: livePreview.diff >= 0 ? 'var(--color-warning)' : 'var(--color-success)', fontWeight: 700 }}>
                      Fuel Adjustment: {livePreview.diff >= 0 ? '+' : ''}₹{livePreview.diff}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.75rem', fontSize: '0.8rem' }}>
                    <div>
                      <span style={{ color: 'var(--color-muted)', display: 'block', fontSize: '0.7rem' }}>Tentative Bill Est:</span>
                      <strong style={{ color: 'var(--color-text)' }}>₹{livePreview.estTotal}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--color-muted)', display: 'block', fontSize: '0.7rem' }}>Reported Fuel Cost:</span>
                      <strong style={{ color: 'var(--color-text)' }}>{livePreview.actualL}L @ ₹{livePreview.pricePerL} = ₹{livePreview.actualFuelAmt}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--color-muted)', display: 'block', fontSize: '0.7rem' }}>GST Tax (18%):</span>
                      <strong style={{ color: 'var(--color-text)' }}>₹{Math.round((livePreview.baseAmt + livePreview.actualFuelAmt) * 0.18)}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--color-muted)', display: 'block', fontSize: '0.7rem' }}>Calculated Final Bill:</span>
                      <strong style={{ color: 'var(--color-primary)', fontSize: '1rem' }}>₹{livePreview.finalTotal}</strong>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Work Status / Progress</label>
                <select
                  value={workCompleted}
                  onChange={(e) => setWorkCompleted(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                >
                  <option value="Fully Completed">Fully Completed</option>
                  <option value="Partially Completed">Partially Completed</option>
                  <option value="Aborted">Aborted / Halted</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Equipment Post-Work Condition</label>
                <select
                  value={equipmentCondition}
                  onChange={(e) => setEquipmentCondition(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                >
                  <option value="Good">Good / Ready</option>
                  <option value="Needs Maintenance">Needs Preventive Maintenance</option>
                  <option value="Damaged">Damaged / Malfunctioning</option>
                </select>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Damage details (if any)</label>
                <textarea
                  placeholder="Describe damage, component failures, or technical faults if any..."
                  value={damageInfo}
                  onChange={(e) => setDamageInfo(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', backgroundColor: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text)', minHeight: '60px' }}
                />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Work Remarks &amp; Notes</label>
                <textarea
                  placeholder="Explain work done, land coverage, or machinery status..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', backgroundColor: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text)', minHeight: '80px' }}
                />
              </div>
              <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'var(--color-text)',
                    padding: '0.8rem 2rem',
                    borderRadius: '30px',
                    border: 'none',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {actionLoading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                  Submit Work &amp; Finalize Bill
                </button>
                <button
                  type="button"
                  onClick={() => setActiveJob(null)}
                  style={{
                    backgroundColor: 'var(--color-border)',
                    color: 'var(--color-text)',
                    padding: '0.8rem 2rem',
                    borderRadius: '30px',
                    border: 'none',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : null}

        {activeTab === 'jobs' && (
          <>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem' }}>Assigned Work Orders</h3>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                <Loader2 className="animate-spin" size={40} color="var(--color-primary)" />
              </div>
            ) : jobs.length === 0 ? (
              <p style={{ color: 'var(--color-muted)' }}>No work assignments assigned to you at the moment.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[...jobs].sort((a, b) => {
                  const getWeight = (status) => {
                    if (status === 'Started') return 1;
                    if (status === 'Assigned') return 2;
                    if (status === 'CANCELLATION_REQUESTED') return 3;
                    if (status === 'Completed') return 4;
                    return 3;
                  };
                  const weightDiff = getWeight(a.status) - getWeight(b.status);
                  if (weightDiff !== 0) return weightDiff;
                  return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
                }).map((job) => {

              const isActive = job.status === 'Started';
              const isCompleted = job.status === 'Completed';

              return (
                <div
                  key={job._id || job.id}
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    border: isActive ? '1px solid var(--color-primary)' : '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>{job.equipment?.name || 'Agri Equipment'}</span>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '12px',
                          fontWeight: 700,
                          backgroundColor: isCompleted ? 'var(--color-success-bg)' : isActive ? 'var(--color-info-bg)' : 'var(--color-warning-bg)',
                          color: isCompleted ? 'var(--color-primary)' : isActive ? '#38bdf8' : '#f59e0b'
                        }}
                      >
                        {job.status}
                      </span>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem 2rem', fontSize: '0.85rem', color: 'var(--color-muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <User size={14} />
                        <span>Farmer: {job.farmer?.name || 'Registered Farmer'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Phone size={14} />
                        <span>Contact: {job.farmer?.mobile || 'N/A'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <MapPin size={14} />
                        <span>Hub: {job.equipment?.cooperativeHub || 'District Hub'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Calendar size={14} />
                        <span>Booking Duration: {job.booking?.durationDays || 1} Days</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    {job.cancellationRequested || job.status === 'CANCELLATION_REQUESTED' ? (
                      <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.12)', border: '1px solid #f59e0b', borderRadius: '10px', padding: '0.6rem 1rem', textAlign: 'right' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'flex-end' }}>
                          <AlertCircle size={14} /> Cancellation Request: Awaiting Staff Review
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)', marginTop: '2px' }}>
                          Reason: {job.cancellationReason}
                        </div>
                      </div>
                    ) : (
                      <>
                        {job.cancellationDecision === 'Rejected' && (
                          <div style={{ fontSize: '0.72rem', color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.3rem 0.6rem', borderRadius: '6px', marginBottom: '0.3rem' }}>
                            Cancellation Rejected by Staff: {job.cancellationDecisionReason || 'Job remains assigned.'}
                          </div>
                        )}
                        {job.status === 'Assigned' && (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => handleStartJob(job._id || job.id)}
                              disabled={actionLoading}
                              style={{
                                backgroundColor: 'var(--color-primary)',
                                color: 'var(--color-text)',
                                border: 'none',
                                padding: '0.65rem 1.2rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem'
                              }}
                            >
                              <Play size={14} />
                              <span>Start Work</span>
                            </button>

                            <button
                              onClick={() => {
                                setCancellationModalJob(job);
                                setCancellationReason('Personal Emergency');
                                setCancellationExplanation('');
                              }}
                              style={{
                                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                color: '#ef4444',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                padding: '0.65rem 1.2rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem'
                              }}
                            >
                              <XCircle size={14} />
                              <span>Request Cancellation</span>
                            </button>
                          </div>
                        )}

                        {isActive && (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => setActiveJob(job)}
                              style={{
                                backgroundColor: '#0284c7',
                                color: '#fff',
                                border: 'none',
                                padding: '0.65rem 1.2rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem'
                              }}
                            >
                              <CheckCircle2 size={14} />
                              <span>Complete Job</span>
                            </button>
                            <button
                              onClick={() => {
                                setIssueModalJob(job);
                                setIssueType('Engine Breakdown');
                                setIssueDescription('');
                              }}
                              style={{
                                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                                color: '#f59e0b',
                                border: '1px solid rgba(245, 158, 11, 0.3)',
                                padding: '0.65rem 1.2rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem'
                              }}
                            >
                              <AlertTriangle size={14} />
                              <span>Report Issue</span>
                            </button>
                          </div>
                        )}

                        {isCompleted && (
                          <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                            <CheckCircle2 size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
                            <span>Report Filed</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                </div>
              );
            })}
              </div>
            )}
          </>
        )}

        {/* ========== TEAM & VEHICLES TAB ========== */}
        {activeTab === 'team' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.3rem' }}>Field Operator Directory</h3>
              <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem' }}>All registered equipment operators and their assigned agricultural vehicles.</p>
            </div>

            {teamLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                <Loader2 className="animate-spin" size={40} color="var(--color-primary)" />
              </div>
            ) : operatorsTeam.length === 0 ? (
              <p style={{ color: 'var(--color-muted)', padding: '2rem 0' }}>No operators found in the system.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '1.5rem' }}>
                {operatorsTeam.map((op) => (
                  <div
                    key={op._id}
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderRadius: '20px',
                      border: op._id === (user?._id || user?.id) ? '1.5px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.07)',
                      overflow: 'hidden',
                      boxShadow: op._id === (user?._id || user?.id) ? '0 0 20px rgba(21, 128, 61,0.12)' : 'none',
                      transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                  >
                    {/* Operator Card Header */}
                    <div style={{ padding: '1.25rem 1.5rem', background: 'linear-gradient(135deg, rgba(21, 128, 61,0.08) 0%, rgba(56,189,248,0.05) 100%)', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {/* Avatar */}
                      <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-text)' }}>
                        {op.name.charAt(0)}
                      </div>
                      <div style={{ flexGrow: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '1.05rem', fontWeight: 800 }}>{op.name}</span>
                          {op._id === (user?._id || user?.id) && (
                            <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: '8px', backgroundColor: 'rgba(21, 128, 61,0.2)', color: 'var(--color-primary)', fontWeight: 700 }}>You</span>
                          )}
                          <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: '8px', backgroundColor: op.isApproved ? 'var(--color-success-bg)' : 'var(--color-danger-bg)', color: op.isApproved ? 'var(--color-primary)' : '#ef4444', fontWeight: 700 }}>
                            {op.isApproved ? 'Active' : 'Pending'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Phone size={11} /> {op.mobile || 'N/A'}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <MapPin size={11} /> {op.district || 'N/A'}
                          </span>
                        </div>
                      </div>
                      {/* Vehicle count badge */}
                      <div style={{ textAlign: 'center', flexShrink: 0 }}>
                        <div style={{ fontSize: '1.6rem', fontWeight: 900, color: op.assignedVehicles.length > 0 ? '#f59e0b' : '#475569', lineHeight: 1 }}>{op.assignedVehicles.length}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--color-muted)', fontWeight: 600, marginTop: '2px' }}>VEHICLES</div>
                      </div>
                    </div>

                    {/* Assigned Vehicles */}
                    <div style={{ padding: '1rem 1.5rem 1.25rem' }}>
                      {op.assignedVehicles.length === 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem 1rem', borderRadius: '10px', backgroundColor: 'var(--color-border)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                          <Tractor size={16} color="#475569" />
                          <span style={{ fontSize: '0.82rem', color: '#475569', fontStyle: 'italic' }}>No vehicles assigned yet</span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                          {op.assignedVehicles.map((vehicle) => (
                            <div
                              key={vehicle._id}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '0.85rem',
                                padding: '0.75rem 1rem', borderRadius: '12px',
                                backgroundColor: 'var(--color-border)',
                                border: '1px solid var(--color-border)',
                                transition: 'background 0.15s'
                              }}
                            >
                              {/* Vehicle icon */}
                              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--color-success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Tractor size={18} color="var(--color-primary)" />
                              </div>
                              <div style={{ flexGrow: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 700, fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{vehicle.name}</div>
                                <div style={{ fontSize: '0.74rem', color: 'var(--color-muted)', marginTop: '1px' }}>
                                  {vehicle.brand} {vehicle.model} &bull; {vehicle.regNumber}
                                </div>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem', flexShrink: 0 }}>
                                <span style={{
                                  fontSize: '0.65rem', padding: '0.18rem 0.55rem', borderRadius: '8px', fontWeight: 700,
                                  backgroundColor:
                                    vehicle.status === 'Available' ? 'var(--color-success-bg)' :
                                    vehicle.status === 'In Use' ? 'var(--color-info-bg)' :
                                    vehicle.status === 'Under Maintenance' ? 'var(--color-danger-bg)' : 'var(--color-warning-bg)',
                                  color:
                                    vehicle.status === 'Available' ? 'var(--color-primary)' :
                                    vehicle.status === 'In Use' ? '#38bdf8' :
                                    vehicle.status === 'Under Maintenance' ? '#ef4444' : '#f59e0b'
                                }}>
                                  {vehicle.status}
                                </span>
                                <span style={{ fontSize: '0.68rem', color: 'var(--color-muted)' }}>₹{vehicle.rentalRate}/day</span>
                                <span style={{ fontSize: '0.65rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                  <Clock size={10} /> {vehicle.totalUsageHours}h used
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= CANCELLATION REQUEST MODAL ================= */}
        {cancellationModalJob && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
            <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '20px', width: '100%', maxWidth: '550px', padding: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.8rem' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                  <XCircle size={22} /> REQUEST JOB CANCELLATION
                </h3>
                <button onClick={() => setCancellationModalJob(null)} style={{ background: 'none', border: 'none', color: 'var(--color-muted)', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
              </div>

              <p style={{ fontSize: '0.88rem', color: 'var(--color-muted)', marginBottom: '1rem' }}>
                Job ID: <strong>{cancellationModalJob.jobId || cancellationModalJob._id || cancellationModalJob.id}</strong> | Machine: <strong>{cancellationModalJob.equipment?.name || 'Equipment'}</strong>
              </p>

              <form onSubmit={handleRequestCancellationSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.6rem' }}>Select Reason *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                    {[
                      'Equipment issue',
                      'Personal emergency',
                      'Schedule conflict',
                      'Unable to reach location',
                      'Emergency',
                      'Other'
                    ].map(reasonOption => (
                      <label key={reasonOption} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', padding: '0.6rem 0.8rem', borderRadius: '10px', backgroundColor: cancellationReason === reasonOption ? 'rgba(239, 68, 68, 0.15)' : 'var(--color-border)', border: cancellationReason === reasonOption ? '1px solid #ef4444' : '1px solid transparent', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="cancellationReason"
                          value={reasonOption}
                          checked={cancellationReason === reasonOption}
                          onChange={(e) => setCancellationReason(e.target.value)}
                        />
                        {reasonOption}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>Detailed Explanation *</label>
                  <textarea
                    required
                    placeholder="Provide detailed explanation for your cancellation request..."
                    value={cancellationExplanation}
                    onChange={(e) => setCancellationExplanation(e.target.value)}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', backgroundColor: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text)', minHeight: '90px' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setCancellationModalJob(null)}
                    style={{ padding: '0.7rem 1.4rem', borderRadius: '10px', border: '1px solid var(--color-border)', backgroundColor: 'transparent', color: 'var(--color-text)', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    style={{ padding: '0.7rem 1.6rem', borderRadius: '10px', border: 'none', backgroundColor: '#ef4444', color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    {actionLoading ? <Loader2 className="animate-spin" size={16} /> : <XCircle size={16} />}
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= REPORT EQUIPMENT ISSUE MODAL ================= */}
        {issueModalJob && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
            <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '20px', width: '100%', maxWidth: '550px', padding: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.8rem' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                  <AlertTriangle size={22} /> REPORT EQUIPMENT BREAKDOWN / ISSUE
                </h3>
                <button onClick={() => setIssueModalJob(null)} style={{ background: 'none', border: 'none', color: 'var(--color-muted)', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
              </div>

              <p style={{ fontSize: '0.88rem', color: 'var(--color-muted)', marginBottom: '1rem' }}>
                Job ID: <strong>{issueModalJob.jobId || issueModalJob._id || issueModalJob.id}</strong> | Machine: <strong>{issueModalJob.equipment?.name || 'Equipment'}</strong>
              </p>

              <form onSubmit={handleReportIssueSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>Issue Type *</label>
                  <select
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                  >
                    <option value="Engine Breakdown">Engine Breakdown / Mechanical Failure</option>
                    <option value="Hydraulic Leak">Hydraulic Oil Leak</option>
                    <option value="Tire / Attachment Damage">Tire Burst / Attachment Fault</option>
                    <option value="Electrical Issue">Electrical System Malfunction</option>
                    <option value="Other">Other Mechanical Fault</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>Description of Issue *</label>
                  <textarea
                    required
                    placeholder="Describe the issue, symptoms, or location of failure..."
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', backgroundColor: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text)', minHeight: '90px' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setIssueModalJob(null)}
                    style={{ padding: '0.7rem 1.4rem', borderRadius: '10px', border: '1px solid var(--color-border)', backgroundColor: 'transparent', color: 'var(--color-text)', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    style={{ padding: '0.7rem 1.6rem', borderRadius: '10px', border: 'none', backgroundColor: '#f59e0b', color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    {actionLoading ? <Loader2 className="animate-spin" size={16} /> : <AlertTriangle size={16} />}
                    Submit Issue Report
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

