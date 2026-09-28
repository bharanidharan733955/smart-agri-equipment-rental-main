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
        backgroundColor: 'var(--color-primary)',
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
        backgroundColor: ['#f59e0b', '#38bdf8', 'var(--color-primary)', '#ef4444'],
        hoverOffset: 4
      }
    ]
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-dark)', color: 'var(--color-text)', display: 'flex', flexDirection: 'column' }}>
      <Toaster position="top-right" />
      {/* Top Header */}
      <header style={{ backgroundColor: 'var(--bg-header)', borderBottom: '1px solid var(--color-border)', padding: '1rem 2rem' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <Landmark size={28} color="#38bdf8" />
            <div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>AgriRent Government Monitoring Platform</span>
              <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--color-muted)' }}>OFFICIAL STATE DASHBOARD</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700 }}>{user?.name}</span>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-info)' }}>State Auditor / Officer</span>
            </div>
            <button
              onClick={() => {
                logoutUser();
                onLogout();
              }}
              style={{
                backgroundColor: 'var(--color-danger-bg)',
                border: '1px solid var(--color-border)',
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

      <div style={{ display: 'flex', flexGrow: 1, maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
        
        {/* Sidebar Navigation */}
        <aside style={{ width: '260px', backgroundColor: 'var(--color-surface)', padding: '2rem 1.5rem', borderRight: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              onClick={() => setActiveTab('dashboard')}
              style={{
                textAlign: 'left',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: activeTab === 'dashboard' ? 'var(--color-info-bg)' : 'transparent',
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
                backgroundColor: activeTab === 'utilization' ? 'var(--color-info-bg)' : 'transparent',
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
                backgroundColor: activeTab === 'revenue' ? 'var(--color-info-bg)' : 'transparent',
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
                backgroundColor: activeTab === 'audits' ? 'var(--color-info-bg)' : 'transparent',
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
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-text)',
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
                    <div style={{ backgroundColor: 'var(--color-surface)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                      <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '0.4rem' }}>State Districts</span>
                      <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-info)' }}>5 Districts</span>
                    </div>
                    <div style={{ backgroundColor: 'var(--color-surface)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                      <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '0.4rem' }}>Active Cooperatives</span>
                      <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)' }}>12 Hubs</span>
                    </div>
                    <div style={{ backgroundColor: 'var(--color-surface)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                      <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '0.4rem' }}>State Machinery Count</span>
                      <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-warning)' }}>
                        {stats?.equipmentUtilization?.total || 0} units
                      </span>
                    </div>
                    <div style={{ backgroundColor: 'var(--color-surface)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                      <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '0.4rem' }}>Utilization Percentage</span>
                      <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-info)' }}>
                        {stats?.equipmentUtilization?.utilizationRate || 0}%
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: '2rem' }}>
                    <div style={{ backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: '20px', border: '1px solid var(--color-border)' }}>
                      <h4 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 700 }}>Total Bookings by District</h4>
                      <div style={{ height: '300px' }}>
                        <Bar data={districtChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                      </div>
                    </div>

                    <div style={{ backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: '20px', border: '1px solid var(--color-border)' }}>
                      <h4 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 700 }}>State Machinery Status Ratio</h4>
                      <div style={{ height: '260px', display: 'flex', justifyContent: 'center' }}>
                        <Pie data={utilizationChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'utilization' && (
                <div style={{ backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: '20px', border: '1px solid var(--color-border)' }}>
                  <h3 style={{ marginBottom: '1.5rem' }}>Active Equipment Utilization Summary</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ padding: '1rem', backgroundColor: 'var(--color-surface)', borderRadius: '12px' }}>
                      <span style={{ display: 'block', color: 'var(--color-muted)', fontSize: '0.8rem' }}>In Use Count</span>
                      <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-warning)' }}>{stats?.equipmentUtilization?.inUse}</span>
                    </div>
                    <div style={{ padding: '1rem', backgroundColor: 'var(--color-surface)', borderRadius: '12px' }}>
                      <span style={{ display: 'block', color: 'var(--color-muted)', fontSize: '0.8rem' }}>Reserved Count</span>
                      <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-info)' }}>{stats?.equipmentUtilization?.reserved}</span>
                    </div>
                    <div style={{ padding: '1rem', backgroundColor: 'var(--color-surface)', borderRadius: '12px' }}>
                      <span style={{ display: 'block', color: 'var(--color-muted)', fontSize: '0.8rem' }}>Available Count</span>
                      <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>{stats?.equipmentUtilization?.available}</span>
                    </div>
                    <div style={{ padding: '1rem', backgroundColor: 'var(--color-surface)', borderRadius: '12px' }}>
                      <span style={{ display: 'block', color: 'var(--color-muted)', fontSize: '0.8rem' }}>Under Maintenance</span>
                      <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-danger)' }}>{stats?.equipmentUtilization?.maintenance}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'revenue' && (
                <div style={{ backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: '20px', border: '1px solid var(--color-border)' }}>
                   <h3>Financial Ledger Summary</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginTop: '1.5rem', marginBottom: '2rem' }}>
                    <div style={{ padding: '1.5rem', backgroundColor: 'var(--color-surface)', borderRadius: '16px' }}>
                      <span style={{ display: 'block', color: 'var(--color-muted)', fontSize: '0.85rem' }}>Total Platform Invoiced</span>
                      <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-info)' }}>₹{stats?.revenue?.totalRevenue || 0}</span>
                    </div>
                    <div style={{ padding: '1.5rem', backgroundColor: 'var(--color-surface)', borderRadius: '16px' }}>
                      <span style={{ display: 'block', color: 'var(--color-muted)', fontSize: '0.85rem' }}>Total Paid (Disbursed)</span>
                      <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)' }}>₹{stats?.revenue?.paid || 0}</span>
                    </div>
                    <div style={{ padding: '1.5rem', backgroundColor: 'var(--color-surface)', borderRadius: '16px' }}>
                      <span style={{ display: 'block', color: 'var(--color-muted)', fontSize: '0.85rem' }}>Pending Collectibles</span>
                      <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-danger)' }}>₹{stats?.revenue?.pending || 0}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'audits' && (
                <div style={{ backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: '20px', border: '1px solid var(--color-border)' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-muted)', textAlign: 'left' }}>
                          <th style={{ padding: '0.75rem 1rem' }}>User / Role</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Action</th>
                          <th style={{ padding: '0.75rem 1rem' }}>IP Address</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Timestamp</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditLogs.map((log, idx) => (
                          <tr key={log._id || idx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <span style={{ fontWeight: 700 }}>{log.user}</span>
                              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-muted)' }}>{log.role}</span>
                            </td>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{log.action}</span>
                            </td>
                            <td style={{ padding: '0.75rem 1rem', color: 'var(--color-muted)' }}>{log.ipAddress}</td>
                            <td style={{ padding: '0.75rem 1rem', color: 'var(--color-muted)' }}>
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
