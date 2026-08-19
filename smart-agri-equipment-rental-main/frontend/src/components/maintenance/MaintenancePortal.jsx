// src/components/maintenance/MaintenancePortal.jsx
import React, { useState, useEffect } from 'react';
import { 
  fetchCoopEquipment, 
  fetchCoopOperators, 
  completeMaintenance, 
  updateCoopEquipmentStatus 
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
  Printer
} from 'lucide-react';

export default function MaintenancePortal({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'reports'
  const [equipmentList, setEquipmentList] = useState([]);
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const eq = await fetchCoopEquipment();
      setEquipmentList(eq || []);
      const ops = await fetchCoopOperators();
      setOperators(ops || []);
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
      // In this app, completeMaintenance resets status to Available
      await completeMaintenance(id);
      toast.success('Maintenance completed. Vehicle is now Available!');
      loadData();
    } catch (e) {
      console.error(e);
      toast.error('Failed to complete maintenance.');
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
    // An operator is Not Available if they are assigned to a machine that is Rented, In Use, or Under Maintenance
    const isAssigned = equipmentList.some(eq => {
      const eqOpId = typeof eq.assignedOperator === 'object' ? eq.assignedOperator?._id : eq.assignedOperator;
      return eqOpId === operatorId && (eq.status === 'In Use' || eq.status === 'Under Maintenance' || eq.status === 'Rented');
    });
    return isAssigned ? 'Not Available' : 'Available';
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
                      <Tractor size={20} color="#ef4444" />
                      <span>Vehicles Under Maintenance ({vehiclesUnderMaint.length})</span>
                    </h3>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', textAlign: 'left' }}>
                          <th style={{ padding: '0.75rem 1rem' }}>Vehicle Model</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Registration Number</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Condition</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Worker / Operator Working On It</th>
                          <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vehiclesUnderMaint.map((v) => (
                          <tr key={v._id || v.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#cbd5e1' }}>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <span style={{ fontWeight: 700, color: '#ffffff', display: 'block' }}>{v.name}</span>
                              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{v.category}</span>
                            </td>
                            <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{v.regNumber}</td>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <span style={{
                                fontSize: '0.72rem', padding: '0.2rem 0.5rem', borderRadius: '6px',
                                backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontWeight: 700,
                                textTransform: 'capitalize'
                              }}>
                                {v.condition || 'Needs Service'}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#ffffff' }}>
                              {getOperatorForEquipment(v)}
                            </td>
                            <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                              <button
                                onClick={() => handleCompleteService(v._id || v.id)}
                                style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '0.45rem 0.9rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                              >
                                <CheckCircle2 size={14} />
                                <span>Complete Service</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                        {vehiclesUnderMaint.length === 0 && (
                          <tr>
                            <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                              <AlertTriangle size={24} style={{ display: 'block', margin: '0 auto 0.5rem auto', color: '#10b981' }} />
                              No vehicles currently under maintenance.
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
                            </tr>
                          ))}
                          {operators.filter(op => getOperatorStatus(op._id || op.id) === 'Available').length === 0 && (
                            <tr>
                              <td colSpan="2" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
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
                            </tr>
                          ))}
                          {operators.filter(op => getOperatorStatus(op._id || op.id) === 'Not Available').length === 0 && (
                            <tr>
                              <td colSpan="2" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                                No busy operators.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
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
      </main>
    </div>
  );
}
