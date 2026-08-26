// src/components/operator/OperatorPortal.jsx
import React, { useState, useEffect } from 'react';
import { fetchOperatorJobs, startJobApi, completeJobApi, logoutUser, fetchOperatorsWithEquipment } from '../../api';
import { 
  Tractor, LogOut, CheckCircle2, AlertTriangle, Play, Calendar, User, Phone, MapPin, Fuel, Clock, Upload, Loader2, Users, Cpu, Star, Activity
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
  const [remarks, setRemarks] = useState('');
  const [workCompleted, setWorkCompleted] = useState('Fully Completed');
  const [fieldLocation, setFieldLocation] = useState('');
  const [equipmentCondition, setEquipmentCondition] = useState('Good');
  const [damageInfo, setDamageInfo] = useState('');
  const [photosInput, setPhotosInput] = useState('');

  useEffect(() => {
    if (activeJob) {
      const defaultStart = activeJob.startTime ? new Date(activeJob.startTime) : new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const formatLocal = (d) => {
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      };
      setStartTime(formatLocal(defaultStart));
      setEndTime(formatLocal(new Date()));
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
    if (!startTime || !endTime) {
      toast.error('Please enter both start and end times.');
      return;
    }
    const startVal = new Date(startTime);
    const endVal = new Date(endTime);
    if (endVal < startVal) {
      toast.error('End time cannot be before start time.');
      return;
    }
    const diffHours = (endVal - startVal) / (1000 * 60 * 60);
    if (diffHours > 9) {
      toast.error('Working hours cannot exceed 9 hours in a single day.');
      return;
    }
    setActionLoading(true);
    const res = await completeJobApi(activeJob._id || activeJob.id, {
      startTime,
      endTime,
      fuelUsed: parseFloat(fuelUsed) || 0,
      remarks,
      workCompleted,
      fieldLocation,
      equipmentCondition,
      damageInfo,
      photos: photosInput ? photosInput.split(',').map(s => s.trim()) : []
    });
    setActionLoading(false);
    if (res.success) {
      toast.success('Job completed and report submitted successfully!');
      setActiveJob(null);
      setStartTime('');
      setEndTime('');
      setFuelUsed('');
      setRemarks('');
      setWorkCompleted('Fully Completed');
      setFieldLocation('');
      setEquipmentCondition('Good');
      setDamageInfo('');
      setPhotosInput('');
      loadJobs();
    } else {
      toast.error(res.message || 'Failed to complete job.');
    }
  };

  const stats = {
    today: jobs.filter(j => j.status === 'Assigned').length,
    active: jobs.find(j => j.status === 'Started'),
    completed: jobs.filter(j => j.status === 'Completed').length
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-dark)', color: '#ffffff', display: 'flex', flexDirection: 'column' }}>
      <Toaster position="top-right" />
      {/* Header */}
      <header style={{ backgroundColor: 'var(--bg-header)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', padding: '1rem 2rem' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <Tractor size={28} color="var(--green-primary)" />
            <div>
              <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>AgriRent Operator Portal</span>
              <span style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8' }}>COOPERATIVE FIELD STAFF</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700 }}>{user?.name}</span>
              <span style={{ display: 'block', fontSize: '0.75rem', color: '#10b981' }}>Operator Connected</span>
            </div>
            <button
              onClick={() => {
                logoutUser();
                onLogout();
              }}
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#ef4444',
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
          <div style={{ backgroundColor: '#131d35', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem' }}>Assigned Jobs</span>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b' }}>{stats.today}</span>
          </div>
          <div style={{ backgroundColor: '#131d35', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem' }}>Active Work Session</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: stats.active ? '#10b981' : '#94a3b8' }}>
              {stats.active ? '1 In Progress' : 'No Active Job'}
            </span>
          </div>
          <div style={{ backgroundColor: '#131d35', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem' }}>Completed Work Orders</span>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>{stats.completed}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', backgroundColor: '#0f172a', padding: '0.4rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.07)', width: 'fit-content' }}>
          <button
            onClick={() => setActiveTab('jobs')}
            style={{
              padding: '0.6rem 1.4rem', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem',
              backgroundColor: activeTab === 'jobs' ? '#10b981' : 'transparent',
              color: activeTab === 'jobs' ? '#fff' : '#94a3b8',
              display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s'
            }}
          >
            <Activity size={16} />
            <span>My Work Orders</span>
          </button>
          <button
            onClick={() => setActiveTab('team')}
            style={{
              padding: '0.6rem 1.4rem', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem',
              backgroundColor: activeTab === 'team' ? '#10b981' : 'transparent',
              color: activeTab === 'team' ? '#fff' : '#94a3b8',
              display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s'
            }}
          >
            <Users size={16} />
            <span>Team &amp; Vehicles</span>
          </button>
        </div>

        {activeTab === 'jobs' && activeJob ? (
          /* Active job complete report form */
          <div style={{ backgroundColor: '#131d35', borderRadius: '20px', padding: '2rem', border: '1px solid var(--green-primary)', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem', color: '#10b981' }}>Submit Work Completion Report</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Job ID: {activeJob._id || activeJob.id} | Booking Date: {activeJob.booking?.startDate || 'Today'}
            </p>
            <form onSubmit={handleCompleteJob} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Actual Start Time</label>
                <input
                  type="datetime-local"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Actual End Time</label>
                <input
                  type="datetime-local"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Fuel Consumption (Liters)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="e.g. 15.5"
                  value={fuelUsed}
                  onChange={(e) => setFuelUsed(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Work Status / Progress</label>
                <select
                  value={workCompleted}
                  onChange={(e) => setWorkCompleted(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', backgroundColor: '#131d35', border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }}
                >
                  <option value="Fully Completed">Fully Completed</option>
                  <option value="Partially Completed">Partially Completed</option>
                  <option value="Aborted">Aborted / Halted</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Field Location / Plot Details</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ludhiana East Sector, Plot 4B"
                  value={fieldLocation}
                  onChange={(e) => setFieldLocation(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Equipment Post-Work Condition</label>
                <select
                  value={equipmentCondition}
                  onChange={(e) => setEquipmentCondition(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', backgroundColor: '#131d35', border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }}
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
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', minHeight: '60px' }}
                />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Work Remarks & Notes</label>
                <textarea
                  placeholder="Explain work done, land coverage, or machinery status..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', minHeight: '80px' }}
                />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Photo URLs (Comma-separated, optional)</label>
                <input
                  type="text"
                  placeholder="e.g. https://image1.jpg, https://image2.jpg"
                  value={photosInput}
                  onChange={(e) => setPhotosInput(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }}
                />
              </div>
              <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{
                    backgroundColor: '#10b981',
                    color: '#fff',
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
                  Submit Work Report
                </button>
                <button
                  type="button"
                  onClick={() => setActiveJob(null)}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    color: '#fff',
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
                <Loader2 className="animate-spin" size={40} color="#10b981" />
              </div>
            ) : jobs.length === 0 ? (
              <p style={{ color: '#94a3b8' }}>No work assignments assigned to you at the moment.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {jobs.map((job) => {

              const isActive = job.status === 'Started';
              const isCompleted = job.status === 'Completed';

              return (
                <div
                  key={job._id || job.id}
                  style={{
                    backgroundColor: '#131d35',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    border: isActive ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.06)',
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
                          backgroundColor: isCompleted ? 'rgba(16,185,129,0.1)' : isActive ? 'rgba(56,189,248,0.1)' : 'rgba(245,158,11,0.1)',
                          color: isCompleted ? '#10b981' : isActive ? '#38bdf8' : '#f59e0b'
                        }}
                      >
                        {job.status}
                      </span>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem 2rem', fontSize: '0.85rem', color: '#94a3b8' }}>
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

                  <div>
                    {job.status === 'Assigned' && (
                      <button
                        onClick={() => handleStartJob(job._id || job.id)}
                        disabled={actionLoading}
                        style={{
                          backgroundColor: '#10b981',
                          color: '#fff',
                          border: 'none',
                          padding: '0.65rem 1.5rem',
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
                    )}

                    {isActive && (
                      <button
                        onClick={() => setActiveJob(job)}
                        style={{
                          backgroundColor: '#38bdf8',
                          color: '#fff',
                          border: 'none',
                          padding: '0.65rem 1.5rem',
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
                    )}

                    {isCompleted && (
                      <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>
                        <CheckCircle2 size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
                        <span>Report Filed</span>
                      </div>
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
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>All registered equipment operators and their assigned agricultural vehicles.</p>
            </div>

            {teamLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                <Loader2 className="animate-spin" size={40} color="#10b981" />
              </div>
            ) : operatorsTeam.length === 0 ? (
              <p style={{ color: '#94a3b8', padding: '2rem 0' }}>No operators found in the system.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '1.5rem' }}>
                {operatorsTeam.map((op) => (
                  <div
                    key={op._id}
                    style={{
                      backgroundColor: '#131d35',
                      borderRadius: '20px',
                      border: op._id === (user?._id || user?.id) ? '1.5px solid #10b981' : '1px solid rgba(255,255,255,0.07)',
                      overflow: 'hidden',
                      boxShadow: op._id === (user?._id || user?.id) ? '0 0 20px rgba(16,185,129,0.12)' : 'none',
                      transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                  >
                    {/* Operator Card Header */}
                    <div style={{ padding: '1.25rem 1.5rem', background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(56,189,248,0.05) 100%)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {/* Avatar */}
                      <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>
                        {op.name.charAt(0)}
                      </div>
                      <div style={{ flexGrow: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '1.05rem', fontWeight: 800 }}>{op.name}</span>
                          {op._id === (user?._id || user?.id) && (
                            <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: '8px', backgroundColor: 'rgba(16,185,129,0.2)', color: '#10b981', fontWeight: 700 }}>You</span>
                          )}
                          <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: '8px', backgroundColor: op.isApproved ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', color: op.isApproved ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                            {op.isApproved ? 'Active' : 'Pending'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Phone size={11} /> {op.mobile || 'N/A'}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <MapPin size={11} /> {op.district || 'N/A'}
                          </span>
                        </div>
                      </div>
                      {/* Vehicle count badge */}
                      <div style={{ textAlign: 'center', flexShrink: 0 }}>
                        <div style={{ fontSize: '1.6rem', fontWeight: 900, color: op.assignedVehicles.length > 0 ? '#f59e0b' : '#475569', lineHeight: 1 }}>{op.assignedVehicles.length}</div>
                        <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>VEHICLES</div>
                      </div>
                    </div>

                    {/* Assigned Vehicles */}
                    <div style={{ padding: '1rem 1.5rem 1.25rem' }}>
                      {op.assignedVehicles.length === 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem 1rem', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)' }}>
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
                                backgroundColor: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.07)',
                                transition: 'background 0.15s'
                              }}
                            >
                              {/* Vehicle icon */}
                              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Tractor size={18} color="#10b981" />
                              </div>
                              <div style={{ flexGrow: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 700, fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{vehicle.name}</div>
                                <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '1px' }}>
                                  {vehicle.brand} {vehicle.model} &bull; {vehicle.regNumber}
                                </div>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem', flexShrink: 0 }}>
                                <span style={{
                                  fontSize: '0.65rem', padding: '0.18rem 0.55rem', borderRadius: '8px', fontWeight: 700,
                                  backgroundColor:
                                    vehicle.status === 'Available' ? 'rgba(16,185,129,0.12)' :
                                    vehicle.status === 'In Use' ? 'rgba(56,189,248,0.12)' :
                                    vehicle.status === 'Under Maintenance' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
                                  color:
                                    vehicle.status === 'Available' ? '#10b981' :
                                    vehicle.status === 'In Use' ? '#38bdf8' :
                                    vehicle.status === 'Under Maintenance' ? '#ef4444' : '#f59e0b'
                                }}>
                                  {vehicle.status}
                                </span>
                                <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>₹{vehicle.rentalRate}/day</span>
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

      </main>
    </div>
  );
}
