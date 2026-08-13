// src/components/admin/AdminPortal.jsx
import React, { useState, useEffect } from 'react';
import { 
  fetchCoopEquipment, 
  fetchCoopStats, 
  addCoopEquipment, 
  editCoopEquipment, 
  deleteCoopEquipment, 
  updateCoopEquipmentStatus, 
  updateCoopEquipmentCondition, 
  uploadCoopEquipmentImage,
  fetchFarmerBookings,
  approveRentalBooking,
  rejectRentalBooking,
  fetchCoopOperators,
  fetchCoopFarmers,
  approveFarmerApi,
  scheduleMaintenance,
  completeMaintenance,
  fetchCoopInvoices,
  payInvoice,
  fetchAdminUsers,
  updateAdminUser,
  deleteAdminUser,
  fetchAuditLogs,
  logoutUser,
  fetchDistrictStats,
  fetchMaintenanceLogs
} from '../../api';
import toast, { Toaster } from 'react-hot-toast';
import { 
  ShieldCheck, LogOut, Users, Tractor, Calendar, DollarSign, Activity, FileText, ClipboardList, PlusCircle, Wrench, Search, ShieldAlert, CheckCircle2, UserCheck, BarChart3, PieChart
} from 'lucide-react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import CoopEquipmentView from '../cooperative/CoopEquipmentView';
import AddEquipmentModal from '../cooperative/AddEquipmentModal';
import EditEquipmentModal from '../cooperative/EditEquipmentModal';
import EquipmentDetailsModal from '../cooperative/EquipmentDetailsModal';
import UploadImageModal from '../cooperative/UploadImageModal';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function AdminPortal({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('inventory');
  const [loading, setLoading] = useState(true);

  // States
  const [equipmentList, setEquipmentList] = useState([]);
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);

  // Audit Filters
  const [auditSearch, setAuditSearch] = useState('');
  const [auditRoleFilter, setAuditRoleFilter] = useState('All');
  const [auditActionFilter, setAuditActionFilter] = useState('All');
  const [userSearch, setUserSearch] = useState('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [detailsItem, setDetailsItem] = useState(null);
  const [uploadItem, setUploadItem] = useState(null);
  const [maintItem, setMaintItem] = useState(null);
  const [maintDesc, setMaintDesc] = useState('');
  const [maintCost, setMaintCost] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const eq = await fetchCoopEquipment();
      setEquipmentList(eq || []);

      const st = await fetchCoopStats();
      if (st) setStats(st);

      const bks = await fetchFarmerBookings();
      setBookings(bks || []);

      const frms = await fetchCoopFarmers();
      setFarmers(frms || []);

      const invs = await fetchCoopInvoices();
      setInvoices(invs || []);

      const usrs = await fetchAdminUsers();
      setUsersList(usrs || []);

      const logs = await fetchAuditLogs();
      setAuditLogs(logs || []);

      const mLogs = await fetchMaintenanceLogs();
      setMaintenanceLogs(mLogs || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  // Inventory Handlers
  const handleAddEquipment = async (payload) => {
    const res = await addCoopEquipment(payload);
    if (res.success) {
      toast.success('Equipment added successfully!');
      setIsAddOpen(false);
      loadData();
    }
  };

  const handleSaveEdit = async (id, payload) => {
    const res = await editCoopEquipment(id, payload);
    if (res.success) {
      toast.success('Equipment details updated!');
      setEditingItem(null);
      loadData();
    }
  };

  const handleDeleteEquipment = async (id, name) => {
    if (window.confirm(`Delete ${name} from Hub Inventory?`)) {
      await deleteCoopEquipment(id);
      toast.success('Equipment deleted.');
      loadData();
    }
  };

  const handleUpdateStatus = async (id, status) => {
    await updateCoopEquipmentStatus(id, status);
    loadData();
  };

  const handleUpdateCondition = async (id, condition) => {
    await updateCoopEquipmentCondition(id, condition);
    loadData();
  };

  const handleUploadImage = async (id, imageUrl) => {
    await uploadCoopEquipmentImage(id, imageUrl);
    loadData();
  };

  // Dispatch Approvals
  const handleApproveBooking = async (id) => {
    const res = await approveRentalBooking(id);
    if (res.success) {
      toast.success('Booking approved! Operator dispatched.');
      loadData();
    } else {
      toast.error(res.message);
    }
  };

  const handleRejectBooking = async (id) => {
    const res = await rejectRentalBooking(id);
    if (res.success) {
      toast.success('Booking rejected.');
      loadData();
    }
  };

  // Farmer Approvals
  const handleApproveFarmer = async (id) => {
    const res = await approveFarmerApi(id);
    if (res.success) {
      toast.success('Farmer approved.');
      loadData();
    }
  };

  // Invoice & Payments
  const handleCollectPayment = async (id) => {
    const res = await payInvoice(id);
    if (res.success) {
      toast.success('Payment collected!');
      loadData();
    }
  };

  // User Suspensions / Role Management
  const handleApproveUser = async (id, isApproved) => {
    const res = await updateAdminUser(id, { isApproved: !isApproved });
    if (res.success) {
      toast.success('User approval status updated!');
      loadData();
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Delete user profile?')) {
      await deleteAdminUser(id);
      toast.success('User profile removed.');
      loadData();
    }
  };

  // Maintenance Handlers
  const handleScheduleMaintSubmit = async (e) => {
    e.preventDefault();
    const res = await scheduleMaintenance(maintItem._id || maintItem.id, {
      description: maintDesc,
      cost: parseFloat(maintCost) || 0
    });
    if (res.success) {
      toast.success('Equipment placed in maintenance.');
      setMaintItem(null);
      setMaintDesc('');
      setMaintCost('');
      loadData();
    }
  };

  const handleCompleteMaint = async (id) => {
    await completeMaintenance(id);
    toast.success('Maintenance completed.');
    loadData();
  };

  const handleDownloadReport = () => {
    const reportWindow = window.open('', '_blank');
    
    // Calculate total revenue
    const totalRevenue = invoices.filter(i => i.paymentStatus === 'Paid').reduce((sum, i) => sum + i.totalAmount, 0);

    // Calculate revenue per equipment
    const rentPerEq = {};
    invoices.forEach(i => {
      if (i.paymentStatus === 'Paid') {
        const name = i.booking?.equipment?.name || 'Unknown Machinery';
        rentPerEq[name] = (rentPerEq[name] || 0) + i.totalAmount;
      }
    });

    // Calculate revenue per district
    const rentPerDist = {};
    invoices.forEach(i => {
      if (i.paymentStatus === 'Paid') {
        const dist = i.booking?.farmer?.district || 'Other';
        rentPerDist[dist] = (rentPerDist[dist] || 0) + i.totalAmount;
      }
    });

    // Generate table rows
    const eqRows = Object.entries(rentPerEq).map(([name, total]) => `
      <tr>
        <td>${name}</td>
        <td style="text-align: right; font-weight: bold;">₹${total}</td>
      </tr>
    `).join('');

    const distRows = Object.entries(rentPerDist).map(([dist, total]) => `
      <tr>
        <td>${dist}</td>
        <td style="text-align: right; font-weight: bold;">₹${total}</td>
      </tr>
    `).join('');

    const colors = ['#10b981', '#38bdf8', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#f43f5e', '#14b8a6'];

    // Generate simple SVG Pie Chart for Equipment Revenue
    const totalEqVal = Object.values(rentPerEq).reduce((a, b) => a + b, 0) || 1;
    let accumAngle = 0;
    const pieSlices = Object.entries(rentPerEq).map(([name, val], idx) => {
      const percentage = val / totalEqVal;
      const angle = percentage * 360;
      const radStart = (accumAngle - 90) * Math.PI / 180;
      accumAngle += angle;
      const radEnd = (accumAngle - 90) * Math.PI / 180;
      
      const x1 = 125 + 90 * Math.cos(radStart);
      const y1 = 125 + 90 * Math.sin(radStart);
      const x2 = 125 + 90 * Math.cos(radEnd);
      const y2 = 125 + 90 * Math.sin(radEnd);
      
      const largeArcFlag = angle > 180 ? 1 : 0;
      const pathData = `M 125 125 L ${x1} ${y1} A 90 90 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
      const color = colors[idx % colors.length];
      
      return {
        path: `<path d="${pathData}" fill="${color}" stroke="#ffffff" stroke-width="1.5" />`,
        legend: `
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem; font-size: 0.8rem;">
            <span style="display: inline-block; width: 12px; height: 12px; background-color: ${color}; border-radius: 3px;"></span>
            <span>${name}: ₹${val} (${Math.round(percentage * 100)}%)</span>
          </div>
        `
      };
    });

    const slicesHtml = pieSlices.map(s => s.path).join('');
    const legendHtml = pieSlices.map(s => s.legend).join('');

    // Generate simple SVG Bar Chart for Districts
    const maxDistVal = Math.max(...Object.values(rentPerDist), 0) || 1;
    const barChartHeight = 200;
    const barsHtml = Object.entries(rentPerDist).map(([dist, val], idx) => {
      const barWidth = 35;
      const gap = 15;
      const x = 50 + idx * (barWidth + gap);
      const height = (val / maxDistVal) * (barChartHeight - 50);
      const y = barChartHeight - 30 - height;
      const color = colors[idx % colors.length];
      
      return `
        <rect x="${x}" y="${y}" width="${barWidth}" height="${height}" fill="${color}" rx="4" />
        <text x="${x + barWidth/2}" y="${barChartHeight - 10}" font-size="10" text-anchor="middle" fill="#475569">${dist}</text>
        <text x="${x + barWidth/2}" y="${y - 8}" font-size="9" font-weight="bold" text-anchor="middle" fill="#1e293b">₹${val}</text>
      `;
    }).join('');

    reportWindow.document.write(`
      <html>
        <head>
          <title>AgriRentGov State Cooperative - Billing Report</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap');
            body { font-family: 'Outfit', sans-serif; padding: 2.5rem; color: #1e293b; background-color: #ffffff; line-height: 1.5; }
            .header-container { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #10b981; padding-bottom: 1rem; margin-bottom: 2rem; }
            h1 { color: #0f172a; margin: 0; font-size: 1.75rem; font-weight: 800; }
            h2 { color: #10b981; margin: 0; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.1em; }
            .meta { font-size: 0.85rem; color: #64748b; text-align: right; }
            .metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 2.5rem; }
            .metric-card { padding: 1.5rem; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #f8fafc; }
            .metric-title { font-size: 0.8rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
            .metric-value { font-size: 2rem; font-weight: 800; color: #10b981; margin-top: 0.5rem; }
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2.5rem; }
            .card { border: 1px solid #e2e8f0; border-radius: 16px; padding: 1.5rem; }
            .card-title { font-size: 1.1rem; font-weight: 700; color: #0f172a; margin-bottom: 1.25rem; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.5rem; }
            table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
            th { text-align: left; padding: 0.75rem 1rem; border-bottom: 2px solid #e2e8f0; color: #475569; font-weight: 600; }
            td { padding: 0.75rem 1rem; border-bottom: 1px solid #f1f5f9; color: #334155; }
            tr:last-child td { border-bottom: none; }
            .chart-wrapper { display: flex; flex-direction: column; align-items: center; justify-content: center; }
            .pie-container { display: flex; align-items: center; gap: 1.5rem; justify-content: center; width: 100%; }
            .pie-legend { display: flex; flex-direction: column; gap: 0.4rem; max-width: 200px; }
            .btn-print { background-color: #10b981; color: white; border: none; padding: 0.8rem 1.75rem; border-radius: 30px; font-weight: bold; cursor: pointer; font-size: 0.9rem; box-shadow: 0 4px 6px rgba(16,185,129,0.2); }
            @media print { .btn-print { display: none; } }
          </style>
        </head>
        <body>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <div>
              <h2>State Cooperative Administration</h2>
              <h1>🌾 AgriRentGov Official Billing Report</h1>
            </div>
            <button class="btn-print" onclick="window.print()">Print or Save PDF</button>
          </div>
          <div class="header-container">
            <div class="meta">Generated: ${new Date().toLocaleString()}</div>
            <div class="meta">Scope: All Cooperative Invoices</div>
          </div>

          <div class="metrics-grid">
            <div class="metric-card">
              <span class="metric-title">Total Equipment Rent Collected</span>
              <div class="metric-value">₹${totalRevenue}</div>
            </div>
            <div class="metric-card">
              <span class="metric-title">Active Billings Processed</span>
              <div class="metric-value">${invoices.length} Invoices</div>
            </div>
            <div class="metric-card">
              <span class="metric-title">Average Invoice Amount</span>
              <div class="metric-value">₹${Math.round(totalRevenue / (invoices.length || 1))}</div>
            </div>
          </div>

          <div class="grid-2">
            <div class="card">
              <div class="card-title">Equipment Rent Breakdown</div>
              <table>
                <thead>
                  <tr>
                    <th>Equipment Name</th>
                    <th style="text-align: right;">Total Rent Earned</th>
                  </tr>
                </thead>
                <tbody>
                  ${eqRows || '<tr><td colspan="2">No records found.</td></tr>'}
                </tbody>
              </table>
            </div>

            <div class="card">
              <div class="card-title">District Revenue Breakdown</div>
              <table>
                <thead>
                  <tr>
                    <th>District</th>
                    <th style="text-align: right;">Total Rent Earned</th>
                  </tr>
                </thead>
                <tbody>
                  ${distRows || '<tr><td colspan="2">No records found.</td></tr>'}
                </tbody>
              </table>
            </div>
          </div>

          <div class="grid-2">
            <div class="card chart-wrapper">
              <div class="card-title">Machinery Rent Share Ratio</div>
              <div class="pie-container">
                <svg width="250" height="250" viewBox="0 0 250 250">
                  ${slicesHtml}
                </svg>
                <div class="pie-legend">
                  ${legendHtml}
                </div>
              </div>
            </div>

            <div class="card chart-wrapper">
              <div class="card-title">District Comparison Graph</div>
              <svg width="400" height="200">
                ${barsHtml}
              </svg>
            </div>
          </div>
        </body>
      </html>
    `);
    reportWindow.document.close();
  };

  // --- Audit Log Analytics Calculations ---
  const filteredAudits = auditLogs.filter(log => {
    const matchesSearch = log.user?.toLowerCase().includes(auditSearch.toLowerCase()) || 
                          log.description?.toLowerCase().includes(auditSearch.toLowerCase()) || 
                          log.ipAddress?.toLowerCase().includes(auditSearch.toLowerCase());
    const matchesRole = auditRoleFilter === 'All' || log.role === auditRoleFilter;
    const matchesAction = auditActionFilter === 'All' || log.action === auditActionFilter;
    return matchesSearch && matchesRole && matchesAction;
  });

  const auditStats = {
    total: filteredAudits.length,
    loginCount: filteredAudits.filter(l => l.action === 'Login').length,
    bookingCount: filteredAudits.filter(l => l.action === 'Booking Request' || l.action === 'Booking').length,
    approvalCount: filteredAudits.filter(l => l.action === 'Booking Approval').length,
    workCompleted: filteredAudits.filter(l => l.action === 'Work Completed').length,
    revenueReceived: filteredAudits.filter(l => l.action === 'Payment Received').length
  };

  const uniqueIPs = new Set(filteredAudits.map(l => l.ipAddress)).size;

  // Chart data definitions
  const districtChartData = {
    labels: ['Ludhiana', 'Patiala', 'Amritsar', 'Bathinda', 'Sangrur'],
    datasets: [
      {
        label: 'Bookings',
        data: [42, 28, 31, 19, 15],
        backgroundColor: '#10b981'
      }
    ]
  };

  const filteredUsers = usersList.filter(u => {
    const searchLower = userSearch.toLowerCase();
    return (
      (u.name || '').toLowerCase().includes(searchLower) ||
      (u.email || '').toLowerCase().includes(searchLower) ||
      (u.role || '').toLowerCase().includes(searchLower) ||
      (u.cooperativeHub || '').toLowerCase().includes(searchLower)
    );
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-dark)', color: '#ffffff', display: 'flex', flexDirection: 'column' }}>
      <Toaster position="top-right" />
      {/* Top Brand Header */}
      <header style={{ backgroundColor: 'var(--bg-header)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', padding: '1rem 2rem' }}>
        <div style={{ maxWidth: '1500px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <ShieldCheck size={28} color="#10b981" />
            <div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>AgriRent Consolidated Administration Portal</span>
              <span style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8' }}>COOPERATIVE SOCIETY & GOV OVERSIGHT SYSTEM CONTROL</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700 }}>{user?.name}</span>
              <span style={{ display: 'block', fontSize: '0.75rem', color: '#10b981' }}>Super Administrator</span>
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

      {/* Main Layout Body */}
      <div style={{ display: 'flex', flexGrow: 1, maxWidth: '1500px', width: '100%', margin: '0 auto' }}>
        
        {/* Sidebar Nav */}
        <aside style={{ width: '280px', backgroundColor: '#0f172a', padding: '2rem 1.5rem', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <button
              onClick={() => setActiveTab('inventory')}
              style={{
                textAlign: 'left', padding: '0.75rem 1rem', borderRadius: '10px', border: 'none',
                backgroundColor: activeTab === 'inventory' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                color: activeTab === 'inventory' ? '#10b981' : '#cbd5e1', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.75rem'
              }}
            >
              <Tractor size={18} />
              <span>Machinery Inventory</span>
            </button>

            <button
              onClick={() => setActiveTab('requests')}
              style={{
                textAlign: 'left', padding: '0.75rem 1rem', borderRadius: '10px', border: 'none',
                backgroundColor: activeTab === 'requests' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                color: activeTab === 'requests' ? '#10b981' : '#cbd5e1', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.75rem'
              }}
            >
              <Calendar size={18} />
              <span>Booking Dispatch Requests</span>
            </button>

            <button
              onClick={() => setActiveTab('farmers')}
              style={{
                textAlign: 'left', padding: '0.75rem 1rem', borderRadius: '10px', border: 'none',
                backgroundColor: activeTab === 'farmers' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                color: activeTab === 'farmers' ? '#10b981' : '#cbd5e1', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.75rem'
              }}
            >
              <Users size={18} />
              <span>Cooperative Farmers</span>
            </button>

            <button
              onClick={() => setActiveTab('invoices')}
              style={{
                textAlign: 'left', padding: '0.75rem 1rem', borderRadius: '10px', border: 'none',
                backgroundColor: activeTab === 'invoices' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                color: activeTab === 'invoices' ? '#10b981' : '#cbd5e1', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.75rem'
              }}
            >
              <DollarSign size={18} />
              <span>Billing & Invoices</span>
            </button>

            <button
              onClick={() => setActiveTab('maintenance')}
              style={{
                textAlign: 'left', padding: '0.75rem 1rem', borderRadius: '10px', border: 'none',
                backgroundColor: activeTab === 'maintenance' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                color: activeTab === 'maintenance' ? '#10b981' : '#cbd5e1', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.75rem'
              }}
            >
              <Wrench size={18} />
              <span>Maintenance Ledger</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              style={{
                textAlign: 'left', padding: '0.75rem 1rem', borderRadius: '10px', border: 'none',
                backgroundColor: activeTab === 'analytics' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                color: activeTab === 'analytics' ? '#10b981' : '#cbd5e1', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.75rem'
              }}
            >
              <Activity size={18} />
              <span>District Oversight Stats</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              style={{
                textAlign: 'left', padding: '0.75rem 1rem', borderRadius: '10px', border: 'none',
                backgroundColor: activeTab === 'users' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                color: activeTab === 'users' ? '#10b981' : '#cbd5e1', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.75rem'
              }}
            >
              <ShieldAlert size={18} />
              <span>System Suspensions</span>
            </button>

            <button
              onClick={() => setActiveTab('audits')}
              style={{
                textAlign: 'left', padding: '0.75rem 1rem', borderRadius: '10px', border: 'none',
                backgroundColor: activeTab === 'audits' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                color: activeTab === 'audits' ? '#10b981' : '#cbd5e1', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.75rem'
              }}
            >
              <ClipboardList size={18} />
              <span>Auto Auditing Logs</span>
            </button>
          </div>
        </aside>

        {/* Dashboard Work Panel */}
        <main style={{ flexGrow: 1, padding: '2.5rem', overflowY: 'auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
              {activeTab === 'inventory' && 'Cooperative Hub Machinery'}
              {activeTab === 'requests' && 'Rental Dispatch Work Orders'}
              {activeTab === 'farmers' && 'Cooperative Farmers Approval'}
              {activeTab === 'invoices' && 'Cooperative Invoices Ledger'}
              {activeTab === 'maintenance' && 'Equipment Maintenance Logs Ledger'}
              {activeTab === 'analytics' && 'State District Statistics'}
              {activeTab === 'users' && 'System Account Suspensions'}
              {activeTab === 'audits' && 'Platform Audit Ledger Logs'}
            </h2>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
              <span>Syncing database records...</span>
            </div>
          ) : (
            <>
              {activeTab === 'inventory' && (
                <CoopEquipmentView
                  equipmentList={equipmentList}
                  stats={stats}
                  onOpenAddModal={() => setIsAddOpen(true)}
                  onViewDetails={(item) => setDetailsItem(item)}
                  onEditEquipment={(item) => setEditingItem(item)}
                  onDeleteEquipment={handleDeleteEquipment}
                  onUploadImage={(item) => setUploadItem(item)}
                  onUpdateStatus={handleUpdateStatus}
                  onUpdateCondition={handleUpdateCondition}
                  onScheduleMaint={(item) => setMaintItem(item)}
                  onCompleteMaint={handleCompleteMaint}
                />
              )}

              {activeTab === 'requests' && (
                <div style={{ backgroundColor: '#131d35', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', textAlign: 'left' }}>
                        <th style={{ padding: '0.75rem 1rem' }}>Farmer</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Equipment</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Dates</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Cost</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((bk) => (
                        <tr key={bk._id || bk.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <span style={{ fontWeight: 700, display: 'block' }}>{bk.farmer?.name || 'Farmer'}</span>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{bk.farmer?.mobile}</span>
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>{bk.equipment?.name}</td>
                          <td style={{ padding: '0.75rem 1rem' }}>{new Date(bk.startDate).toLocaleDateString()}</td>
                          <td style={{ padding: '0.75rem 1rem', color: '#10b981', fontWeight: 700 }}>₹{bk.totalAmount}</td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <span style={{
                              fontSize: '0.72rem', padding: '0.2rem 0.5rem', borderRadius: '6px',
                              backgroundColor: bk.status === 'Pending' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                              color: bk.status === 'Pending' ? '#f59e0b' : '#10b981', fontWeight: 700
                            }}>{bk.status}</span>
                          </td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                            {bk.status === 'Pending' && (
                              <>
                                <button onClick={() => handleApproveBooking(bk._id || bk.id)} style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', marginRight: '0.5rem', fontWeight: 700 }}>Approve</button>
                                <button onClick={() => handleRejectBooking(bk._id || bk.id)} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}>Reject</button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'farmers' && (
                <div style={{ backgroundColor: '#131d35', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', textAlign: 'left' }}>
                        <th style={{ padding: '0.75rem 1rem' }}>Name</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Email</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Mobile</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {farmers.map((f) => (
                        <tr key={f._id || f.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>{f.name}</td>
                          <td style={{ padding: '0.75rem 1rem' }}>{f.email}</td>
                          <td style={{ padding: '0.75rem 1rem' }}>{f.mobile}</td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <span style={{
                              fontSize: '0.72rem', padding: '0.2rem 0.5rem', borderRadius: '6px',
                              backgroundColor: f.isApproved ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                              color: f.isApproved ? '#10b981' : '#ef4444', fontWeight: 700
                            }}>{f.isApproved ? 'Approved' : 'Pending Approval'}</span>
                          </td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                            {!f.isApproved && (
                              <button onClick={() => handleApproveFarmer(f._id || f.id)} style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}>Approve Farmer</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'invoices' && (() => {
                const paidInvoices = invoices.filter(i => i.paymentStatus === 'Paid');
                const totalRentAmount = paidInvoices.reduce((sum, i) => sum + i.totalAmount, 0);

                // Group rent per equipment
                const rentPerEquipment = {};
                paidInvoices.forEach(inv => {
                  const eqName = inv.booking?.equipment?.name || 'Unknown Machinery';
                  rentPerEquipment[eqName] = (rentPerEquipment[eqName] || 0) + inv.totalAmount;
                });

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Top Widgets Bar */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.5rem' }}>
                      <div style={{ backgroundColor: '#131d35', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Total State Cooperative Rent</span>
                          <span style={{ fontSize: '2.2rem', fontWeight: 800, color: '#10b981', display: 'block', marginTop: '0.3rem' }}>₹{totalRentAmount}</span>
                        </div>
                        <button
                          onClick={handleDownloadReport}
                          style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, transition: 'background 0.2s' }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#10b981'}
                        >
                          Download PDF Report
                        </button>
                      </div>
                      <div style={{ backgroundColor: '#131d35', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <span style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Total Billing Invoices</span>
                        <span style={{ fontSize: '2.2rem', fontWeight: 800, color: '#38bdf8', display: 'block', marginTop: '0.3rem' }}>{invoices.length} Invoices</span>
                      </div>
                    </div>

                    {/* Side-by-Side: Invoices Table & Per Equipment Rent Summary */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '2rem' }}>
                      {/* Left: Invoices list */}
                      <div style={{ backgroundColor: '#131d35', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <h4 style={{ marginBottom: '1.25rem', fontSize: '1.05rem', fontWeight: 700 }}>Cooperative Billing Ledger</h4>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', textAlign: 'left' }}>
                              <th style={{ padding: '0.75rem 1rem' }}>Invoice</th>
                              <th style={{ padding: '0.75rem 1rem' }}>Farmer</th>
                              <th style={{ padding: '0.75rem 1rem' }}>Total</th>
                              <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {invoices.map((inv) => (
                              <tr key={inv._id || inv.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>{inv.invoiceNumber}</td>
                                <td style={{ padding: '0.75rem 1rem' }}>{inv.booking?.farmer?.name || 'Farmer'}</td>
                                <td style={{ padding: '0.75rem 1rem', color: '#10b981', fontWeight: 800 }}>₹{inv.totalAmount}</td>
                                <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                                  <span style={{
                                    fontSize: '0.72rem', padding: '0.2rem 0.5rem', borderRadius: '6px',
                                    backgroundColor: 'rgba(16,185,129,0.1)',
                                    color: '#10b981', fontWeight: 700
                                  }}>{inv.paymentStatus}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Right: Rent Breakdown per Equipment */}
                      <div style={{ backgroundColor: '#131d35', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <h4 style={{ marginBottom: '1.25rem', fontSize: '1.05rem', fontWeight: 700 }}>Rent collected per Equipment</h4>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', textAlign: 'left' }}>
                              <th style={{ padding: '0.75rem 1rem' }}>Equipment Model</th>
                              <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Rent Earned</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(rentPerEquipment).map(([name, sum]) => (
                              <tr key={name} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>{name}</td>
                                <td style={{ padding: '0.75rem 1rem', color: '#10b981', fontWeight: 800, textAlign: 'right' }}>₹{sum}</td>
                              </tr>
                            ))}
                            {Object.keys(rentPerEquipment).length === 0 && (
                              <tr>
                                <td colspan="2" style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8' }}>No rent data available yet.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {activeTab === 'maintenance' && (
                <div>
                  {/* Maintenance Metrics cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div style={{ backgroundColor: '#131d35', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem' }}>Total Service Events</span>
                      <span style={{ fontSize: '2.0rem', fontWeight: 800, color: '#38bdf8' }}>{maintenanceLogs.length} Events</span>
                    </div>
                    <div style={{ backgroundColor: '#131d35', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem' }}>Total Maintenance Cost Spent</span>
                      <span style={{ fontSize: '2.0rem', fontWeight: 800, color: '#10b981' }}>₹{maintenanceLogs.reduce((sum, m) => sum + (m.cost || 0), 0)}</span>
                    </div>
                    <div style={{ backgroundColor: '#131d35', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem' }}>Currently Under Service</span>
                      <span style={{ fontSize: '2.0rem', fontWeight: 800, color: '#ef4444' }}>{equipmentList.filter(e => e.status === 'Under Maintenance').length} Machines</span>
                    </div>
                  </div>

                  {/* Maintenance Logs Ledger Table */}
                  <div style={{ backgroundColor: '#131d35', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', textAlign: 'left' }}>
                          <th style={{ padding: '0.75rem 1rem' }}>Equipment</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Service Date</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Description / Details</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Cost Spent</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Next Service Due</th>
                          <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {maintenanceLogs.map((m, idx) => (
                          <tr key={m._id || m.id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <span style={{ fontWeight: 700, display: 'block' }}>{m.equipment?.name || 'Unknown Machinery'}</span>
                              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{m.equipment?.regNumber}</span>
                            </td>
                            <td style={{ padding: '0.75rem 1rem' }}>{new Date(m.serviceDate || m.createdAt).toLocaleDateString()}</td>
                            <td style={{ padding: '0.75rem 1rem' }}>{m.description}</td>
                            <td style={{ padding: '0.75rem 1rem', color: '#ef4444', fontWeight: 700 }}>₹{m.cost}</td>
                            <td style={{ padding: '0.75rem 1rem' }}>{m.nextServiceDate ? new Date(m.nextServiceDate).toLocaleDateString() : 'N/A'}</td>
                            <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                              {m.equipment?.status === 'Under Maintenance' && (
                                <button
                                  onClick={() => handleCompleteMaint(m.equipment._id || m.equipment.id)}
                                  style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}
                                >
                                  Complete Service
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'analytics' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    <div style={{ backgroundColor: '#131d35', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem' }}>State Districts</span>
                      <span style={{ fontSize: '2.0rem', fontWeight: 800, color: '#38bdf8' }}>5 Districts</span>
                    </div>
                    <div style={{ backgroundColor: '#131d35', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem' }}>Cooperative Hubs</span>
                      <span style={{ fontSize: '2.0rem', fontWeight: 800, color: '#10b981' }}>12 Hubs</span>
                    </div>
                    <div style={{ backgroundColor: '#131d35', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem' }}>State Revenue</span>
                      <span style={{ fontSize: '2.0rem', fontWeight: 800, color: '#10b981' }}>₹{invoices.filter(i => i.paymentStatus === 'Paid').reduce((sum, i) => sum + i.totalAmount, 0)}</span>
                    </div>
                    <div style={{ backgroundColor: '#131d35', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem' }}>Active Orders</span>
                      <span style={{ fontSize: '2.0rem', fontWeight: 800, color: '#38bdf8' }}>{bookings.filter(b => b.status === 'Approved' || b.status === 'Issued').length}</span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem' }}>
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

              {activeTab === 'users' && (
                <div>
                  {/* User Search Bar */}
                  <div style={{ backgroundColor: '#131d35', padding: '1.25rem', borderRadius: '16px', display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ flexGrow: 1, position: 'relative' }}>
                      <Search size={18} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="text"
                        placeholder="Search accounts by name, email, role, or cooperative..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.8rem', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', fontSize: '0.88rem', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#131d35', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', textAlign: 'left' }}>
                          <th style={{ padding: '0.75rem 1rem' }}>User Info</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Role</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Cooperative Hub</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                          <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((u) => (
                          <tr key={u._id || u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <span style={{ fontWeight: 700, display: 'block' }}>{u.name}</span>
                              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{u.email}</span>
                            </td>
                            <td style={{ padding: '0.75rem 1rem' }}>{u.role}</td>
                            <td style={{ padding: '0.75rem 1rem' }}>{u.cooperativeHub}</td>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <span style={{
                                fontSize: '0.72rem', padding: '0.2rem 0.5rem', borderRadius: '6px',
                                backgroundColor: u.isApproved ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                                color: u.isApproved ? '#10b981' : '#ef4444', fontWeight: 700
                              }}>{u.isApproved ? 'Active' : 'Suspended'}</span>
                            </td>
                            <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                              <button onClick={() => handleApproveUser(u._id || u.id, u.isApproved)} style={{ backgroundColor: 'rgba(56,189,248,0.15)', color: '#38bdf8', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', marginRight: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
                                {u.isApproved ? 'Suspend' : 'Activate'}
                              </button>
                              <button onClick={() => handleDeleteUser(u._id || u.id)} style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#ef4444', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer' }}>Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'audits' && (
                <div>
                  {/* Automated calculations widgets bar */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
                    <div style={{ backgroundColor: '#131d35', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8' }}>Total Logs Tracked</span>
                      <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8' }}>{auditStats.total}</span>
                    </div>
                    <div style={{ backgroundColor: '#131d35', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8' }}>Logins (Telemetry)</span>
                      <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981' }}>{auditStats.loginCount}</span>
                    </div>
                    <div style={{ backgroundColor: '#131d35', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8' }}>Bookings Requested</span>
                      <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b' }}>{auditStats.bookingCount}</span>
                    </div>
                    <div style={{ backgroundColor: '#131d35', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8' }}>Work Completed</span>
                      <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981' }}>{auditStats.workCompleted}</span>
                    </div>
                    <div style={{ backgroundColor: '#131d35', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8' }}>Unique IP Telemetry</span>
                      <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8' }}>{uniqueIPs}</span>
                    </div>
                  </div>

                  {/* Audit filtering toolbar */}
                  <div style={{ backgroundColor: '#131d35', padding: '1.25rem', borderRadius: '16px', display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ flexGrow: 1, position: 'relative' }}>
                      <Search size={18} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="text"
                        placeholder="Search logs by IP, User, Description..."
                        value={auditSearch}
                        onChange={(e) => setAuditSearch(e.target.value)}
                        style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.8rem', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.88rem' }}
                      />
                    </div>
                    <div>
                      <select
                        value={auditRoleFilter}
                        onChange={(e) => setAuditRoleFilter(e.target.value)}
                        style={{ padding: '0.65rem 1rem', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.88rem' }}
                      >
                        <option value="All" style={{ backgroundColor: '#131d35' }}>All Roles</option>
                        <option value="Farmer" style={{ backgroundColor: '#131d35' }}>Farmer</option>
                        <option value="Operator" style={{ backgroundColor: '#131d35' }}>Operator</option>
                        <option value="Admin" style={{ backgroundColor: '#131d35' }}>Admin</option>
                      </select>
                    </div>
                    <div>
                      <select
                        value={auditActionFilter}
                        onChange={(e) => setAuditActionFilter(e.target.value)}
                        style={{ padding: '0.65rem 1rem', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.88rem' }}
                      >
                        <option value="All" style={{ backgroundColor: '#131d35' }}>All Actions</option>
                        <option value="Login" style={{ backgroundColor: '#131d35' }}>Login</option>
                        <option value="Registration" style={{ backgroundColor: '#131d35' }}>Registration</option>
                        <option value="Booking Request" style={{ backgroundColor: '#131d35' }}>Booking Request</option>
                        <option value="Booking Approval" style={{ backgroundColor: '#131d35' }}>Booking Approval</option>
                        <option value="Work Started" style={{ backgroundColor: '#131d35' }}>Work Started</option>
                        <option value="Work Completed" style={{ backgroundColor: '#131d35' }}>Work Completed</option>
                        <option value="Payment Received" style={{ backgroundColor: '#131d35' }}>Payment Received</option>
                      </select>
                    </div>
                  </div>

                  {/* Audit Logs Table */}
                  <div style={{ backgroundColor: '#131d35', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', textAlign: 'left' }}>
                            <th style={{ padding: '0.75rem 1rem' }}>User / Role</th>
                            <th style={{ padding: '0.75rem 1rem' }}>Action</th>
                            <th style={{ padding: '0.75rem 1rem' }}>IP Address</th>
                            <th style={{ padding: '0.75rem 1rem' }}>Timestamp</th>
                            <th style={{ padding: '0.75rem 1rem' }}>Telemetry Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredAudits.map((log, idx) => (
                            <tr key={log._id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              <td style={{ padding: '0.75rem 1rem' }}>
                                <span style={{ fontWeight: 700 }}>{log.user}</span>
                                <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8' }}>{log.role}</span>
                              </td>
                              <td style={{ padding: '0.75rem 1rem' }}>
                                <span style={{ color: '#10b981', fontWeight: 600 }}>{log.action}</span>
                              </td>
                              <td style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>{log.ipAddress}</td>
                              <td style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>{new Date(log.timestamp).toLocaleString()}</td>
                              <td style={{ padding: '0.75rem 1rem' }}>{log.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        </main>
      </div>

      {/* Add Equipment Modal */}
      <AddEquipmentModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAddEquipment={handleAddEquipment}
      />

      {/* Edit Equipment Modal */}
      <EditEquipmentModal
        equipment={editingItem}
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        onSaveEdit={handleSaveEdit}
      />

      {/* Details modal */}
      <EquipmentDetailsModal
        equipment={detailsItem}
        isOpen={!!detailsItem}
        onClose={() => setDetailsItem(null)}
      />

      {/* Upload Image Modal */}
      <UploadImageModal
        equipment={uploadItem}
        isOpen={!!uploadItem}
        onClose={() => setUploadItem(null)}
        onUploadImage={handleUploadImage}
      />

      {/* Maintenance modal */}
      {maintItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: '#131d35', padding: '2rem', borderRadius: '16px', maxWidth: '450px', width: '100%', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ marginBottom: '1rem', color: '#ef4444' }}>Send {maintItem.name} to Maintenance</h3>
            <form onSubmit={handleScheduleMaintSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem' }}>Reason / Service Details</label>
                <textarea required value={maintDesc} onChange={(e) => setMaintDesc(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem' }}>Estimated Cost (₹)</label>
                <input type="number" required value={maintCost} onChange={(e) => setMaintCost(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="submit" style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}>Confirm Maintenance</button>
                <button type="button" onClick={() => setMaintItem(null)} style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
