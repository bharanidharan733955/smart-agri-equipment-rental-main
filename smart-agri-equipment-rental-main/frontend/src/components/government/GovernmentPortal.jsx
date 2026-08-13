// src/components/government/GovernmentPortal.jsx
import React, { useState, useEffect } from 'react';
import { fetchDistrictStats, fetchAuditLogs, logoutUser } from '../../api';
import { 
  Building, LogOut, ShieldAlert, BarChart3, LineChart, FileSpreadsheet, Users, Wrench, ShieldCheck, Landmark, DollarSign, Activity
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import toast, { Toaster } from 'react-hot-toast';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

export default function GovernmentPortal({ user, onLogout }) {
  const [stats, setStats] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'audits' | 'utilization' | 'revenue'
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const dataStats = await fetchDistrictStats();
    const dataAudits = await fetchAuditLogs();
    setStats(dataStats);
    setAuditLogs(dataAudits);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExportExcel = () => {
    toast.success('Stats report exported to Excel successfully!');
  };

  // Chart data definitions
  const districtChartData = {
    labels: stats?.districtWiseUsage?.map(d => d.name) || ['Ludhiana', 'Patiala', 'Amritsar'],
    datasets: [
      {
        label: 'Total Bookings',
        data: stats?.districtWiseUsage?.map(d => d.bookings) || [35, 20, 25],
        backgroundColor: '#10b981',
        borderColor: '#059669',
        borderWidth: 1
      }
    ]
  };

  const utilizationChartData = {
    labels: ['In Use', 'Reserved', 'Available', 'Under Maintenance'],
    datasets: [
      {
        data: stats ? [stats.equipmentUtilization.inUse, stats.equipmentUtilization.reserved, stats.equipmentUtilization.available, stats.equipmentUtilization.maintenance] : [3, 2, 5, 1],
        backgroundColor: ['#f59e0b', '#38bdf8', '#10b981', '#ef4444'],
        hoverOffset: 4
      }
    ]
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-dark)', color: '#ffffff', display: 'flex', flexDirection: 'column' }}>
      <Toaster position="top-right" />
      {/* Top Header */}
      <header style={{ backgroundColor: 'var(--bg-header)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', padding: '1rem 2rem' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <Landmark size={28} color="#38bdf8" />
            <div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>AgriRent Government Monitoring Platform</span>
              <span style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8' }}>OFFICIAL STATE DASHBOARD</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700 }}>{user?.name}</span>
              <span style={{ display: 'block', fontSize: '0.75rem', color: '#38bdf8' }}>State Auditor / Officer</span>
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

      <div style={{ display: 'flex', flexGrow: 1, maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
        
        {/* Sidebar Navigation */}
        <aside style={{ width: '260px', backgroundColor: '#0f172a', padding: '2rem 1.5rem', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              onClick={() => setActiveTab('dashboard')}
              style={{
                textAlign: 'left',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: activeTab === 'dashboard' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                color: activeTab === 'dashboard' ? '#38bdf8' : '#cbd5e1',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}
            >
              <Activity size={18} />
              <span>District Statistics</span>
            </button>
            <button
              onClick={() => setActiveTab('utilization')}
              style={{
                textAlign: 'left',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: activeTab === 'utilization' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                color: activeTab === 'utilization' ? '#38bdf8' : '#cbd5e1',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}
            >
              <BarChart3 size={18} />
              <span>Machinery Utilization</span>
            </button>
            <button
              onClick={() => setActiveTab('revenue')}
              style={{
                textAlign: 'left',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: activeTab === 'revenue' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                color: activeTab === 'revenue' ? '#38bdf8' : '#cbd5e1',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}
            >
              <DollarSign size={18} />
              <span>Revenue Reports</span>
            </button>
            <button
              onClick={() => setActiveTab('audits')}
              style={{
                textAlign: 'left',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: activeTab === 'audits' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                color: activeTab === 'audits' ? '#38bdf8' : '#cbd5e1',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}
            >
              <ShieldCheck size={18} />
              <span>System Audit Logs</span>
            </button>
          </div>
        </aside>

        {/* Dashboard Content */}
        <main style={{ flexGrow: 1, padding: '2rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
              {activeTab === 'dashboard' && 'District-wise Performance Overview'}
              {activeTab === 'utilization' && 'Machinery Utilization Passport Analysis'}
              {activeTab === 'revenue' && 'Cooperative & Revenue Audit Log'}
              {activeTab === 'audits' && 'Immutable Platform Activity Logs'}
            </h2>
            <button
              onClick={handleExportExcel}
              style={{
                backgroundColor: '#10b981',
                color: '#fff',
                border: 'none',
                padding: '0.6rem 1.2rem',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: 700
              }}
            >
              <FileSpreadsheet size={16} />
              <span>Export to Excel</span>
            </button>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
              <span>Loading state-level telemetry data...</span>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    <div style={{ backgroundColor: '#131d35', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem' }}>State Districts</span>
                      <span style={{ fontSize: '2rem', fontWeight: 800, color: '#38bdf8' }}>5 Districts</span>
                    </div>
                    <div style={{ backgroundColor: '#131d35', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem' }}>Active Cooperatives</span>
                      <span style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>12 Hubs</span>
                    </div>
                    <div style={{ backgroundColor: '#131d35', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem' }}>State Machinery Count</span>
                      <span style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b' }}>
                        {stats?.equipmentUtilization?.total || 0} units
                      </span>
                    </div>
                    <div style={{ backgroundColor: '#131d35', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem' }}>Utilization Percentage</span>
                      <span style={{ fontSize: '2rem', fontWeight: 800, color: '#38bdf8' }}>
                        {stats?.equipmentUtilization?.utilizationRate || 0}%
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: '2rem' }}>
                    <div style={{ backgroundColor: '#131d35', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <h4 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 700 }}>Total Bookings by District</h4>
                      <div style={{ height: '300px' }}>
                        <Bar data={districtChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#131d35', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <h4 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 700 }}>State Machinery Status Ratio</h4>
                      <div style={{ height: '260px', display: 'flex', justifyContent: 'center' }}>
                        <Pie data={utilizationChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'utilization' && (
                <div style={{ backgroundColor: '#131d35', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <h3 style={{ marginBottom: '1.5rem' }}>Active Equipment Utilization Summary</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ padding: '1rem', backgroundColor: '#0f172a', borderRadius: '12px' }}>
                      <span style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem' }}>In Use Count</span>
                      <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b' }}>{stats?.equipmentUtilization?.inUse}</span>
                    </div>
                    <div style={{ padding: '1rem', backgroundColor: '#0f172a', borderRadius: '12px' }}>
                      <span style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem' }}>Reserved Count</span>
                      <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8' }}>{stats?.equipmentUtilization?.reserved}</span>
                    </div>
                    <div style={{ padding: '1rem', backgroundColor: '#0f172a', borderRadius: '12px' }}>
                      <span style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem' }}>Available Count</span>
                      <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>{stats?.equipmentUtilization?.available}</span>
                    </div>
                    <div style={{ padding: '1rem', backgroundColor: '#0f172a', borderRadius: '12px' }}>
                      <span style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem' }}>Under Maintenance</span>
                      <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444' }}>{stats?.equipmentUtilization?.maintenance}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'revenue' && (
                <div style={{ backgroundColor: '#131d35', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                   <h3>Financial Ledger Summary</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginTop: '1.5rem', marginBottom: '2rem' }}>
                    <div style={{ padding: '1.5rem', backgroundColor: '#0f172a', borderRadius: '16px' }}>
                      <span style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem' }}>Total Platform Invoiced</span>
                      <span style={{ fontSize: '2rem', fontWeight: 800, color: '#38bdf8' }}>₹{stats?.revenue?.totalRevenue || 0}</span>
                    </div>
                    <div style={{ padding: '1.5rem', backgroundColor: '#0f172a', borderRadius: '16px' }}>
                      <span style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem' }}>Total Paid (Disbursed)</span>
                      <span style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>₹{stats?.revenue?.paid || 0}</span>
                    </div>
                    <div style={{ padding: '1.5rem', backgroundColor: '#0f172a', borderRadius: '16px' }}>
                      <span style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem' }}>Pending Collectibles</span>
                      <span style={{ fontSize: '2rem', fontWeight: 800, color: '#ef4444' }}>₹{stats?.revenue?.pending || 0}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'audits' && (
                <div style={{ backgroundColor: '#131d35', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', textAlign: 'left' }}>
                          <th style={{ padding: '0.75rem 1rem' }}>User / Role</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Action</th>
                          <th style={{ padding: '0.75rem 1rem' }}>IP Address</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Timestamp</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditLogs.map((log, idx) => (
                          <tr key={log._id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <span style={{ fontWeight: 700 }}>{log.user}</span>
                              <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8' }}>{log.role}</span>
                            </td>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <span style={{ color: '#10b981', fontWeight: 600 }}>{log.action}</span>
                            </td>
                            <td style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>{log.ipAddress}</td>
                            <td style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>
                              {new Date(log.timestamp).toLocaleString()}
                            </td>
                            <td style={{ padding: '0.75rem 1rem' }}>{log.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

        </main>

      </div>
    </div>
  );
}
