// src/components/maintenance/MaintenancePortal.jsx
import React, { useState, useEffect } from 'react';
import { 
  fetchCoopEquipment, 
  fetchCoopOperators, 
  completeMaintenance, 
  updateCoopEquipmentStatus,
  startEquipmentMaintenance,
  reportEquipmentMaintenance,
  fetchMaintenanceLogs,
  fetchOperatorJobs
} from '../../api';
import toast, { Toaster } from 'react-hot-toast';
import { 
  Wrench, 
  LogOut, 
  Tractor, 
  Users, 
  Activity, 
  FileText, 
  CheckCircle2, 
  AlertTriangle,
  UserCheck,
  UserX,
  Printer,
  Play,
  Clipboard,
  Loader2
} from 'lucide-react';

export default function MaintenancePortal({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'reports'
  const [equipmentList, setEquipmentList] = useState([]);
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [maintHistory, setMaintHistory] = useState([]);
  const [jobs, setJobs] = useState([]);

  // Submit Report Modal State
  const [reportModalItem, setReportModalItem] = useState(null);
  const [problemDescription, setProblemDescription] = useState('');
  const [workPerformed, setWorkPerformed] = useState('');
  const [partsReplaced, setPartsReplaced] = useState('');
  const [partsCost, setPartsCost] = useState('');
  const [reportRemarks, setReportRemarks] = useState('');
  const [reportSpecialist, setReportSpecialist] = useState(user.name || '');

  const loadData = async () => {
    setLoading(true);
    try {
      const eq = await fetchCoopEquipment();
      setEquipmentList(eq || []);
      const ops = await fetchCoopOperators();
      setOperators(ops || []);
      const logs = await fetchMaintenanceLogs();
      setMaintHistory(logs || []);
      try {
        const jobsData = await fetchOperatorJobs();
        setJobs(jobsData || []);
      } catch (jobErr) {
        console.error('Jobs fetch skipped:', jobErr);
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load maintenance data.');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCompleteService = async (id) => {
    try {
      await completeMaintenance(id);
      toast.success('Maintenance completed successfully!');
      loadData();
    } catch (e) {
      console.error(e);
      toast.error('Failed to complete maintenance.');
    }
  };

  const handleStartMaintenance = async (id) => {
    setActionLoading(true);
    const res = await startEquipmentMaintenance(id);
    setActionLoading(false);
    if (res.success) {
      toast.success('Preventative Maintenance started. Status set to Under Maintenance.');
      loadData();
    } else {
      toast.error(res.message || 'Failed to start maintenance.');
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    const payload = {
      problemDescription,
      workPerformed,
      partsReplaced,
      partsCost: parseFloat(partsCost) || 0,
      labourCost: 0,
      remarks: reportRemarks,
      specialist: reportSpecialist || user.name,
      photos: []
    };
    const res = await reportEquipmentMaintenance(reportModalItem._id || reportModalItem.id, payload);
    setActionLoading(false);
    if (res.success) {
      toast.success('Maintenance report submitted successfully. Awaiting Manager Approval.');
      setReportModalItem(null);
      setProblemDescription('');
      setWorkPerformed('');
      setPartsReplaced('');
      setPartsCost('');
      setReportRemarks('');
      loadData();
    } else {
      toast.error(res.message || 'Failed to submit report.');
    }
  };

  // Helper to resolve operator details
  const getOperatorForEquipment = (item) => {
    if (!item.assignedOperator) return 'No Operator Assigned';
    if (typeof item.assignedOperator === 'object') {
      return item.assignedOperator.name;
    }
    // Lookup in operators list
    const found = operators.find(op => op._id === item.assignedOperator || op.id === item.assignedOperator);
    return found ? found.name : 'Unknown Operator';
  };

  // Determine Operator status: Available (not assigned to any active vehicle) or Not Available
  const getOperatorStatus = (operatorId) => {
    // Check 1: operator is assigned to a machine that is Rented, In Use, or Under Maintenance
    const isAssignedToEquip = equipmentList.some(eq => {
      const eqOpId = typeof eq.assignedOperator === 'object' ? eq.assignedOperator?._id : eq.assignedOperator;
      return eqOpId === operatorId && (eq.status === 'In Use' || eq.status === 'Under Maintenance' || eq.status === 'Rented' || eq.status === 'Reserved');
    });
    if (isAssignedToEquip) return 'Not Available';

    // Check 2: operator has an active job (Assigned or In Progress)
    const hasActiveJob = jobs.some(job => {
      const jobOpId = typeof job.operator === 'object' ? (job.operator?._id || job.operator?.id) : job.operator;
      return jobOpId === operatorId && (job.status === 'Assigned' || job.status === 'In Progress' || job.status === 'Started');
    });
    if (hasActiveJob) return 'Not Available';

    return 'Available';
  };

  // Get the equipment/job details for a busy operator
  const getBusyOperatorDetails = (operatorId) => {
    // Check equipment assignment first
    const assignedEq = equipmentList.find(eq => {
      const eqOpId = typeof eq.assignedOperator === 'object' ? eq.assignedOperator?._id : eq.assignedOperator;
      return eqOpId === operatorId && (eq.status === 'In Use' || eq.status === 'Under Maintenance' || eq.status === 'Rented' || eq.status === 'Reserved');
    });
    if (assignedEq) return `Working on: ${assignedEq.name} (${assignedEq.status})`;

    // Check active jobs
    const activeJob = jobs.find(job => {
      const jobOpId = typeof job.operator === 'object' ? (job.operator?._id || job.operator?.id) : job.operator;
      return jobOpId === operatorId && (job.status === 'Assigned' || job.status === 'In Progress' || job.status === 'Started');
    });
    if (activeJob) {
      const eqName = typeof activeJob.equipment === 'object' ? activeJob.equipment?.name : 'Equipment';
      return `Active Job: ${eqName} (${activeJob.status})`;
    }

    return 'Busy';
  };

  // Get permanently allocated equipment for an operator
  const getOperatorAllocatedEquipment = (operatorId) => {
    const assignedEq = equipmentList.filter(eq => {
      const eqOpId = typeof eq.assignedOperator === 'object' ? eq.assignedOperator?._id : eq.assignedOperator;
      return eqOpId === operatorId;
    });
    if (assignedEq.length > 0) {
      return assignedEq.map(e => e.name).join(', ');
    }
    return 'None';
  };

  // Generate and print report
  const handlePrintReport = () => {
    const reportWindow = window.open('', '_blank');
    
    const vehiclesUnderMaint = equipmentList.filter(e => e.status === 'Under Maintenance');
    
    const vehiclesRows = vehiclesUnderMaint.map(v => `
      <tr>
        <td><strong>${v.name}</strong><br><small>${v.category}</small></td>
        <td>${v.regNumber}</td>
        <td><span style="color: #ef4444; font-weight: bold;">Under Maintenance</span></td>
        <td>${getOperatorForEquipment(v)}</td>
      </tr>
    `).join('');

    const operatorRows = operators.map(op => {
      const status = getOperatorStatus(op._id || op.id);
      const isAvail = status === 'Available';
      return `
        <tr>
          <td><strong>${op.name}</strong></td>
          <td>${op.email || 'N/A'}</td>
          <td>${op.mobile || 'N/A'}</td>
          <td>
            <span style="color: ${isAvail ? '#10b981' : '#ef4444'}; font-weight: bold;">
              ${status}
            </span>
          </td>
        </tr>
      `;
    }).join('');

    reportWindow.document.write(`
      <html>
        <head>
          <title>AgriRentGov - Maintenance Operations & Operator Status Report</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1e293b; padding: 40px; line-height: 1.5; }
            h1 { color: #0f172a; border-bottom: 2px solid #cbd5e1; padding-bottom: 10px; margin-bottom: 20px; font-size: 24px; }
            h2 { color: #334155; margin-top: 30px; font-size: 18px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 25px; }
            th { background-color: #f1f5f9; color: #475569; font-weight: bold; text-align: left; padding: 10px; border: 1px solid #e2e8f0; font-size: 13px; }
            td { padding: 10px; border: 1px solid #e2e8f0; font-size: 13px; }
            tr:nth-child(even) td { background-color: #f8fafc; }
            .header-info { display: flex; justify-content: space-between; font-size: 12px; color: #64748b; margin-bottom: 40px; }
            .badge-maint { color: #ef4444; font-weight: bold; }
            .btn-print { background-color: #10b981; color: white; border: none; padding: 10px 20px; font-size: 14px; font-weight: bold; border-radius: 6px; cursor: pointer; margin-bottom: 20px; }
            @media print {
              .btn-print { display: none; }
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <button class="btn-print" onclick="window.print()">Print / Save PDF Report</button>
          <h1>🌾 AgriRentGov Maintenance Operations Report</h1>
          <div class="header-info">
            <div>
              <strong>Cooperative Station:</strong> ${user.cooperativeHub || 'Chennai Central Hub #1'}<br>
              <strong>Generated By:</strong> ${user.name} (Maintenance Specialist)
            </div>
            <div>
              <strong>Date:</strong> ${new Date().toLocaleString()}<br>
              <strong>Status:</strong> Active Hub Records
            </div>
          </div>

          <h2>🚜 Vehicles Currently Under Maintenance</h2>
          <table>
            <thead>
              <tr>
                <th>Vehicle / Model</th>
                <th>Reg Number</th>
                <th>Status</th>
                <th>Assigned Operator / Worker</th>
              </tr>
            </thead>
            <tbody>
              ${vehiclesRows || '<tr><td colspan="4" style="text-align: center; color: #64748b;">No vehicles currently under maintenance.</td></tr>'}
            </tbody>
          </table>

          <h2>👥 Maintenance & Field Operators Availability</h2>
          <table>
            <thead>
              <tr>
                <th>Operator Name</th>
                <th>Email Address</th>
                <th>Mobile Number</th>
                <th>Current Status</th>
              </tr>
            </thead>
            <tbody>
              ${operatorRows || '<tr><td colspan="4" style="text-align: center; color: #64748b;">No operators registered.</td></tr>'}
            </tbody>
          </table>

          <h2>📋 Maintenance Service History Log</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Equipment</th>
                <th>Description / Reason</th>
                <th>Parts Cost (₹)</th>
                <th>Specialist</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${maintHistory.length > 0 ? maintHistory.map(log => {
                const eqName = log.equipment?.name || 'Unknown';
                const eqReg = log.equipment?.regNumber || '';
                const dateStr = log.serviceDate || log.createdAt || '';
                return `
                  <tr>
                    <td>${dateStr ? new Date(dateStr).toLocaleDateString() : 'N/A'}</td>
                    <td><strong>${eqName}</strong><br><small>${eqReg}</small></td>
                    <td>${log.description || log.maintenanceReason || 'N/A'}</td>
                    <td>₹${(log.cost || 0).toLocaleString()}</td>
                    <td>${log.specialist || 'N/A'}</td>
                    <td>${log.status || (log.completedDate ? 'Completed' : 'Open')}</td>
                  </tr>
                `;
              }).join('') : '<tr><td colspan="6" style="text-align: center; color: #64748b;">No maintenance history records found.</td></tr>'}
            </tbody>
          </table>
        </body>
      </html>
    `);
    reportWindow.document.close();
  };

  const vehiclesUnderMaint = equipmentList.filter(e => e.status === 'Under Maintenance');

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: '#0b1324', color: '#ffffff' }}>
      <Toaster position="top-right" />
      
      {/* Sidebar */}
      <aside style={{ width: '270px', backgroundColor: '#0c162c', borderRight: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', flexShrink: 0, height: '100%' }}>
        {/* Sidebar Brand Header */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wrench size={22} color="#ffffff" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.1 }}>AgriRentGov</div>
            <div style={{ fontSize: '0.58rem', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.08em', marginTop: '2px', textTransform: 'uppercase' }}>Maintenance Portal</div>
          </div>
        </div>

        {/* Sidebar Nav links */}
        <nav style={{ padding: '1.25rem 1rem', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <button 
            onClick={() => setActiveTab('dashboard')}
            style={{
              width: '100%',
              padding: '0.75rem 1.25rem',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: activeTab === 'dashboard' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
              color: activeTab === 'dashboard' ? '#10b981' : '#cbd5e1',
              fontFamily: 'inherit',
              fontWeight: 600,
              fontSize: '0.92rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'left'
            }}
          >
            <Activity size={18} />
            <span>Maintenance Hub</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('reports')}
            style={{
              width: '100%',
              padding: '0.75rem 1.25rem',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: activeTab === 'reports' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
              color: activeTab === 'reports' ? '#10b981' : '#cbd5e1',
              fontFamily: 'inherit',
              fontWeight: 600,
              fontSize: '0.92rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'left'
            }}
          >
            <FileText size={18} />
            <span>Export Reports</span>
          </button>
        </nav>

        {/* Sidebar Footer / Logout */}
        <div style={{ padding: '1.25rem 1rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <button 
            onClick={onLogout}
            style={{
              width: '100%',
              padding: '0.75rem 1.25rem',
              borderRadius: '12px',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              color: '#f87171',
              fontFamily: 'inherit',
              fontWeight: 600,
              fontSize: '0.92rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)'}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flexGrow: 1, padding: '2.5rem', overflowY: 'auto' }}>
        {/* Top bar header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              Welcome back, {user.name}
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
              Logged in as <span style={{ color: '#38bdf8', fontWeight: 600 }}>Maintenance Specialist</span> &bull; {user.cooperativeHub || 'Chennai Central Hub #1'}
            </p>
          </div>
          <button
            onClick={handlePrintReport}
            className="btn-green"
            style={{ padding: '0.6rem 1.2rem', borderRadius: '12px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Printer size={16} />
            <span>Print Hub Report</span>
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                {/* Vehicles Under Maintenance Section */}
                <div style={{ backgroundColor: '#131d35', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.6rem', margin: 0 }}>
                      <Wrench size={20} color="#38bdf8" />
                      <span>Active Maintenance Work Queue ({equipmentList.filter(e => ['Maintenance Required', 'Under Maintenance', 'Awaiting Maintenance Approval'].includes(e.status)).length})</span>
                    </h3>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', textAlign: 'left' }}>
                          <th style={{ padding: '0.75rem 1rem' }}>Vehicle Model</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Registration</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Cycle Hours / Lifetime</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Condition</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Workflow Status</th>
                          <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {equipmentList
                          .filter(e => ['Maintenance Required', 'Under Maintenance', 'Awaiting Maintenance Approval'].includes(e.status))
                          .map((v) => (
                            <tr key={v._id || v.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#cbd5e1' }}>
                              <td style={{ padding: '0.75rem 1rem' }}>
                                <span style={{ fontWeight: 700, color: '#ffffff', display: 'block' }}>{v.name}</span>
                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{v.category}</span>
                              </td>
                              <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{v.regNumber}</td>
                              <td style={{ padding: '0.75rem 1rem' }}>
                                <span style={{ display: 'block', fontWeight: 700, color: '#38bdf8' }}>{v.currentCycleHours || 0} / 360 hrs</span>
                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total: {v.totalUsageHours || 0} hrs</span>
                              </td>
                              <td style={{ padding: '0.75rem 1rem' }}>
                                <span style={{
                                  fontSize: '0.72rem', padding: '0.2rem 0.5rem', borderRadius: '6px',
                                  backgroundColor: v.condition === 'Damaged' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                  color: v.condition === 'Damaged' ? '#ef4444' : '#f59e0b', fontWeight: 700
                                }}>
                                  {v.condition || 'Needs Service'}
                                </span>
                              </td>
                              <td style={{ padding: '0.75rem 1rem' }}>
                                <span style={{
                                  fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: '6px',
                                  backgroundColor: v.status === 'Maintenance Required' ? 'rgba(245, 158, 11, 0.1)' : v.status === 'Under Maintenance' ? 'rgba(56, 189, 248, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                  color: v.status === 'Maintenance Required' ? '#f59e0b' : v.status === 'Under Maintenance' ? '#38bdf8' : '#10b981',
                                  fontWeight: 700
                                }}>
                                  {v.status}
                                </span>
                              </td>
                              <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                                {v.status === 'Maintenance Required' && (
                                  <button
                                    onClick={() => handleStartMaintenance(v._id || v.id)}
                                    disabled={actionLoading}
                                    style={{ backgroundColor: '#f59e0b', color: '#fff', border: 'none', padding: '0.45rem 0.9rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                                  >
                                    <Play size={14} />
                                    <span>Start Maintenance</span>
                                  </button>
                                )}
                                {v.status === 'Under Maintenance' && (
                                  <button
                                    onClick={() => {
                                      setReportModalItem(v);
                                      setProblemDescription(v.remarks || 'Automated 360-hour preventative maintenance trigger');
                                      setWorkPerformed('');
                                      setPartsReplaced('');
                                      setPartsCost('');
                                      setReportRemarks('');
                                      setReportSpecialist(user.name);
                                    }}
                                    style={{ backgroundColor: '#38bdf8', color: '#fff', border: 'none', padding: '0.45rem 0.9rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                                  >
                                    <Clipboard size={14} />
                                    <span>Submit Report</span>
                                  </button>
                                )}
                                {v.status === 'Awaiting Maintenance Approval' && (
                                  <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>Pending Manager Signature</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        {equipmentList.filter(e => ['Maintenance Required', 'Under Maintenance', 'Awaiting Maintenance Approval'].includes(e.status)).length === 0 && (
                          <tr>
                            <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                              <AlertTriangle size={24} style={{ display: 'block', margin: '0 auto 0.5rem auto', color: '#10b981' }} />
                              All cooperative equipment is in healthy operating condition. No pending tasks.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Available & Not Available Operators Section */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  
                  {/* Available Operators List */}
                  <div style={{ backgroundColor: '#131d35', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', margin: 0 }}>
                      <UserCheck size={20} color="#10b981" />
                      <span>Available Operators ({operators.filter(op => getOperatorStatus(op._id || op.id) === 'Available').length})</span>
                    </h3>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', textAlign: 'left' }}>
                            <th style={{ padding: '0.75rem 1rem' }}>Name</th>
                            <th style={{ padding: '0.75rem 1rem' }}>Contact Details</th>
                            <th style={{ padding: '0.75rem 1rem' }}>Allocated Equipment</th>
                          </tr>
                        </thead>
                        <tbody>
                          {operators.filter(op => getOperatorStatus(op._id || op.id) === 'Available').map((op) => (
                            <tr key={op._id || op.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#cbd5e1' }}>
                              <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#ffffff' }}>{op.name}</td>
                              <td style={{ padding: '0.75rem 1rem' }}>
                                <span style={{ display: 'block' }}>{op.email}</span>
                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>📞 {op.mobile || 'N/A'}</span>
                              </td>
                              <td style={{ padding: '0.75rem 1rem', color: '#38bdf8', fontSize: '0.85rem' }}>
                                {getOperatorAllocatedEquipment(op._id || op.id)}
                              </td>
                            </tr>
                          ))}
                          {operators.filter(op => getOperatorStatus(op._id || op.id) === 'Available').length === 0 && (
                            <tr>
                              <td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                                No available operators.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Not Available / Busy Operators List */}
                  <div style={{ backgroundColor: '#131d35', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', margin: 0 }}>
                      <UserX size={20} color="#ef4444" />
                      <span>Not Available Operators ({operators.filter(op => getOperatorStatus(op._id || op.id) === 'Not Available').length})</span>
                    </h3>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', textAlign: 'left' }}>
                            <th style={{ padding: '0.75rem 1rem' }}>Name</th>
                            <th style={{ padding: '0.75rem 1rem' }}>Contact Details</th>
                            <th style={{ padding: '0.75rem 1rem' }}>Assigned To</th>
                          </tr>
                        </thead>
                        <tbody>
                          {operators.filter(op => getOperatorStatus(op._id || op.id) === 'Not Available').map((op) => (
                            <tr key={op._id || op.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#cbd5e1' }}>
                              <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#ffffff' }}>{op.name}</td>
                              <td style={{ padding: '0.75rem 1rem' }}>
                                <span style={{ display: 'block' }}>{op.email}</span>
                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>📞 {op.mobile || 'N/A'}</span>
                              </td>
                              <td style={{ padding: '0.75rem 1rem' }}>
                                <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 600 }}>
                                  {getBusyOperatorDetails(op._id || op.id)}
                                </span>
                              </td>
                            </tr>
                          ))}
                          {operators.filter(op => getOperatorStatus(op._id || op.id) === 'Not Available').length === 0 && (
                            <tr>
                              <td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                                No busy operators.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>

                {/* Maintenance History Section */}
                <div style={{ backgroundColor: '#131d35', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.6rem', margin: 0 }}>
                      <FileText size={20} color="#a78bfa" />
                      <span>Maintenance Service History ({maintHistory.length})</span>
                    </h3>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', textAlign: 'left' }}>
                          <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Equipment</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Description / Reason</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Parts Cost</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Specialist</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {maintHistory.map((log, idx) => {
                          const eqName = log.equipment?.name || 'Unknown';
                          const eqReg = log.equipment?.regNumber || '';
                          const dateStr = log.serviceDate || log.createdAt || '';
                          const statusLabel = log.status || (log.completedDate ? 'Completed' : 'Open');
                          const statusColor = statusLabel === 'Completed' ? '#10b981' : statusLabel === 'Approved' ? '#10b981' : '#f59e0b';
                          return (
                            <tr key={log._id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#cbd5e1' }}>
                              <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>{dateStr ? new Date(dateStr).toLocaleDateString() : 'N/A'}</td>
                              <td style={{ padding: '0.75rem 1rem' }}>
                                <span style={{ fontWeight: 700, color: '#ffffff', display: 'block' }}>{eqName}</span>
                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{eqReg}</span>
                              </td>
                              <td style={{ padding: '0.75rem 1rem', maxWidth: '250px' }}>
                                <span style={{ display: 'block', fontWeight: 600, color: '#38bdf8' }}>{log.maintenanceReason || 'Service'}</span>
                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{log.description || ''}</span>
                              </td>
                              <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#f87171' }}>₹{(log.cost || 0).toLocaleString()}</td>
                              <td style={{ padding: '0.75rem 1rem' }}>{log.specialist || 'N/A'}</td>
                              <td style={{ padding: '0.75rem 1rem' }}>
                                <span style={{
                                  fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: '6px',
                                  backgroundColor: statusColor === '#10b981' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                                  color: statusColor, fontWeight: 700
                                }}>
                                  {statusLabel}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                        {maintHistory.length === 0 && (
                          <tr>
                            <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                              No maintenance history records found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {activeTab === 'reports' && (
              <div style={{ backgroundColor: '#131d35', padding: '2.5rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                <FileText size={48} color="#10b981" style={{ marginBottom: '1.5rem' }} />
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.75rem' }}>
                  Generate Maintenance Operations Report
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                  Export a clean, government-compliant print layout displaying all vehicles currently in service, their corresponding technicians, and the live availability log of cooperative operators.
                </p>
                <button
                  onClick={handlePrintReport}
                  className="btn-green"
                  style={{ padding: '0.8rem 2rem', borderRadius: '12px', fontSize: '0.95rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}
                >
                  <Printer size={18} />
                  <span>Generate & View Report</span>
                </button>
              </div>
            )}
          </>
        )}

        {/* Submit Maintenance Report Modal */}
        {reportModalItem && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <div style={{ backgroundColor: '#131d35', padding: '2.5rem', borderRadius: '20px', maxWidth: '600px', width: '100%', border: '1px solid rgba(255,255,255,0.1)', overflowY: 'auto', maxHeight: '90vh' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Wrench size={22} />
                <span>Submit Service Report: {reportModalItem.name}</span>
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Registration: {reportModalItem.regNumber} | Current Usage: {reportModalItem.totalUsageHours} hrs
              </p>
              
              <form onSubmit={handleSubmitReport} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Problem Description</label>
                  <textarea required value={problemDescription} onChange={(e) => setProblemDescription(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Work Performed / Repairs Undertaken</label>
                  <textarea required placeholder="e.g. Engine oil replaced, fuel filter serviced" value={workPerformed} onChange={(e) => setWorkPerformed(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Parts Replaced</label>
                  <input type="text" placeholder="e.g. Air filter, Spark plug" value={partsReplaced} onChange={(e) => setPartsReplaced(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Parts Cost (₹)</label>
                  <input type="number" required placeholder="0" value={partsCost} onChange={(e) => setPartsCost(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Technician Name</label>
                  <input type="text" required value={reportSpecialist} onChange={(e) => setReportSpecialist(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>Remarks</label>
                  <textarea value={reportRemarks} onChange={(e) => setReportRemarks(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
                
                <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                  <button type="submit" disabled={actionLoading} style={{ backgroundColor: '#38bdf8', color: '#fff', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {actionLoading && <Loader2 className="animate-spin" size={16} />}
                    <span>Submit Report</span>
                  </button>
                  <button type="button" onClick={() => setReportModalItem(null)} style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: '#fff', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
