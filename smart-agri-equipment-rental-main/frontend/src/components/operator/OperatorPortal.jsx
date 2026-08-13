// src/components/operator/OperatorPortal.jsx
import React, { useState, useEffect } from 'react';
import { fetchOperatorJobs, startJobApi, completeJobApi, logoutUser } from '../../api';
import { 
  Tractor, LogOut, CheckCircle2, AlertTriangle, Play, Calendar, User, Phone, MapPin, Fuel, Clock, Upload, Loader2 
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function OperatorPortal({ user, onLogout }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeJob, setActiveJob] = useState(null);
  
  // Job execution state
  const [beforeImage, setBeforeImage] = useState('https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80');
  const [afterImage, setAfterImage] = useState('https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80');
  const [fuelUsed, setFuelUsed] = useState('');
  const [workingHours, setWorkingHours] = useState('');
  const [remarks, setRemarks] = useState('');

  const loadJobs = async () => {
    setLoading(true);
    const data = await fetchOperatorJobs();
    setJobs(data);
    setLoading(false);
  };

  useEffect(() => {
    loadJobs();
  }, []);

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
    if (!fuelUsed || !workingHours) {
      toast.error('Please enter fuel used and working hours.');
      return;
    }
    setActionLoading(true);
    const res = await completeJobApi(activeJob._id || activeJob.id, {
      fuelUsed: parseFloat(fuelUsed),
      workingHours: parseFloat(workingHours),
      remarks,
      afterImage
    });
    setActionLoading(false);
    if (res.success) {
      toast.success('Job completed and report submitted! Status returned to Available.');
      setActiveJob(null);
      setFuelUsed('');
      setWorkingHours('');
      setRemarks('');
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

        {activeJob ? (
          /* Active job complete report form */
          <div style={{ backgroundColor: '#131d35', borderRadius: '20px', padding: '2rem', border: '1px solid var(--green-primary)', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem', color: '#10b981' }}>Submit Work Completion Report</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Job ID: {activeJob._id || activeJob.id} | Booking Date: {activeJob.booking?.startDate || 'Today'}
            </p>
            <form onSubmit={handleCompleteJob} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
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
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Actual Work Hours</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  placeholder="e.g. 4.5"
                  value={workingHours}
                  onChange={(e) => setWorkingHours(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }}
                />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Work Remarks / Condition Details</label>
                <textarea
                  placeholder="Explain work done, land coverage, or machinery status..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', minHeight: '80px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Post-Work Image Verification URL</label>
                <input
                  type="text"
                  value={afterImage}
                  onChange={(e) => setAfterImage(e.target.value)}
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

        {/* Assigned & Active jobs list */}
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

      </main>
    </div>
  );
}
