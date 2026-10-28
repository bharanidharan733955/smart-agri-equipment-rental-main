// src/components/government/GovernmentPortal.jsx
import React, { useState, useEffect } from 'react';
import CoopEquipmentView from '../cooperative/CoopEquipmentView';
import EquipmentDetailsModal from '../cooperative/EquipmentDetailsModal';
import { fetchCoopEquipment, fetchBillingReport, fetchAuditLogs, logoutUser } from '../../api';
import { TN_DISTRICTS, getTaluksForDistrict } from '../../data/tnLocationData';
import toast, { Toaster } from 'react-hot-toast';
import {
  Sprout,
  Tractor,
  FileText,
  Printer,
  Download,
  LogOut,
  Building2,
  ShieldCheck,
  Search,
  Menu
} from 'lucide-react';

export default function GovernmentPortal({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'reports' | 'audits'
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Equipment & Inventory State
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsItem, setDetailsItem] = useState(null);

  // Billing / Financial Reports State
  const [reportDistrict, setReportDistrict] = useState('ALL');
  const [reportTaluk, setReportTaluk] = useState('ALL');
  const [reportFromDate, setReportFromDate] = useState('');
  const [reportToDate, setReportToDate] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [billingReport, setBillingReport] = useState(null);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditRoleFilter, setAuditRoleFilter] = useState('All');
  const [auditActionFilter, setAuditActionFilter] = useState('All');

  const availableTaluks = reportDistrict === 'ALL'
    ? []
    : getTaluksForDistrict(reportDistrict);

  // Load statewide equipment
  const loadEquipmentData = async () => {
    setLoading(true);
    try {
      const data = await fetchCoopEquipment();
      setEquipmentList(data || []);
    } catch (err) {
      console.error('Failed to load equipment list:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadEquipmentData();
  }, []);

  const loadAuditLogsData = async () => {
    setAuditLoading(true);
    try {
      const logs = await fetchAuditLogs();
      setAuditLogs(logs || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    }
    setAuditLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'audits') {
      loadAuditLogsData();
    }
  }, [activeTab]);

  const filteredAudits = auditLogs.filter(log => {
    const matchesSearch = (log.user || '').toLowerCase().includes(auditSearch.toLowerCase()) ||
      (log.description || '').toLowerCase().includes(auditSearch.toLowerCase()) ||
      (log.ipAddress || '').toLowerCase().includes(auditSearch.toLowerCase());
    const matchesRole = auditRoleFilter === 'All' || log.role === auditRoleFilter;
    const matchesAction = auditActionFilter === 'All' || log.action === auditActionFilter;
    return matchesSearch && matchesRole && matchesAction;
  });

  const auditStats = {
    total: filteredAudits.length,
    loginCount: filteredAudits.filter(l => l.action === 'Login').length,
    bookingCount: filteredAudits.filter(l => l.action === 'Booking Request' || l.action === 'Booking' || l.action === 'Booking Approval').length,
    workCompleted: filteredAudits.filter(l => l.action === 'Work Completed' || l.action === 'Work Started').length
  };
  const uniqueIPs = new Set(filteredAudits.map(l => l.ipAddress).filter(Boolean)).size;

  const handleDistrictChange = (e) => {
    const d = e.target.value;
    setReportDistrict(d);
    setReportTaluk('ALL');
  };

  // Generate District / State Billing & Financial Report
  const handleGenerateReport = async (e) => {
    e.preventDefault();
    if (!reportFromDate || !reportToDate) {
      toast.error('Please select both From and To dates.');
      return;
    }

    const formatDate = (dateStr) => {
      const parts = dateStr.split('-');
      if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
      return dateStr;
    };

    const fromFormatted = formatDate(reportFromDate);
    const toFormatted = formatDate(reportToDate);

    const fromVal = new Date(reportFromDate);
    const toVal = new Date(reportToDate);
    if (fromVal > toVal) {
      toast.error('From Date cannot be after To Date.');
      return;
    }

    setReportLoading(true);
    try {
      const targetDist = reportDistrict === 'ALL' ? '' : reportDistrict;
      const targetTaluk = reportTaluk === 'ALL' ? '' : reportTaluk;
      const data = await fetchBillingReport(fromFormatted, toFormatted, targetDist, targetTaluk);
      if (data) {
        setBillingReport(data);
        toast.success(`Financial Report generated for ${reportDistrict === 'ALL' ? 'Total State' : reportDistrict + ' District'}!`);
      } else {
        toast.error('Failed to generate billing report.');
      }
    } catch (err) {
      console.error('Report error:', err);
      toast.error('Failed to fetch billing report.');
    }
    setReportLoading(false);
  };

  // Download PDF Report
  const handleDownloadPDF = () => {
    if (!billingReport) return;
    const { summary, bookings, operatorCosts, maintenanceCosts } = billingReport;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>AGRIX - State Government Financial &amp; Operations Audit Report</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
              color: #0f172a;
              background-color: #f8fafc;
              padding: 30px 20px;
              line-height: 1.5;
              -webkit-font-smoothing: antialiased;
            }
            .page-container {
              max-width: 1140px;
              margin: 0 auto;
              background: #ffffff;
              border-radius: 20px;
              border: 1px solid #e2e8f0;
              box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.05), 0 8px 10px -6px rgba(15, 23, 42, 0.03);
              padding: 44px;
            }
            .header-bar {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #f1f5f9;
              padding-bottom: 24px;
              margin-bottom: 24px;
              gap: 20px;
            }
            .brand-badge {
              display: inline-flex;
              align-items: center;
              gap: 6px;
              background: linear-gradient(135deg, #15803d 0%, #16a34a 100%);
              color: #ffffff;
              padding: 6px 14px;
              border-radius: 999px;
              font-size: 13px;
              font-weight: 800;
              letter-spacing: 0.08em;
              text-transform: uppercase;
              box-shadow: 0 4px 10px rgba(21, 128, 61, 0.25);
            }
            .brand-badge span.dot {
              width: 7px;
              height: 7px;
              background-color: #bbf7d0;
              border-radius: 50%;
            }
            .report-title {
              font-size: 26px;
              font-weight: 800;
              color: #0f172a;
              margin: 12px 0 6px 0;
              letter-spacing: -0.02em;
            }
            .hub-subtitle {
              font-size: 13px;
              color: #64748b;
              font-weight: 500;
            }
            .hub-subtitle strong {
              color: #0f172a;
            }
            .hub-subtitle span.scope-tag {
              display: inline-block;
              background: #f1f5f9;
              padding: 2px 8px;
              border-radius: 6px;
              color: #475569;
              font-weight: 600;
              font-size: 12px;
              margin-left: 4px;
            }
            .btn-print {
              background: #0f172a;
              color: #ffffff;
              border: none;
              padding: 10px 22px;
              font-size: 13px;
              font-weight: 700;
              border-radius: 10px;
              cursor: pointer;
              transition: all 0.2s ease;
              display: inline-flex;
              align-items: center;
              gap: 8px;
              box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
            }
            .btn-print:hover {
              background: #1e293b;
              transform: translateY(-1px);
            }
            .meta-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 12px;
              background: #f8fafc;
              padding: 16px 20px;
              border-radius: 14px;
              border: 1px solid #e2e8f0;
              margin-bottom: 28px;
            }
            .meta-item .meta-label {
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              color: #94a3b8;
              margin-bottom: 4px;
            }
            .meta-item .meta-val {
              font-size: 13px;
              font-weight: 700;
              color: #1e293b;
            }
            .section-header {
              display: flex;
              align-items: center;
              gap: 10px;
              margin: 32px 0 16px 0;
            }
            .section-indicator {
              width: 5px;
              height: 20px;
              background: #15803d;
              border-radius: 4px;
            }
            .section-title {
              font-size: 15px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.06em;
              color: #0f172a;
            }
            .summary-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 14px;
              margin-bottom: 10px;
            }
            .summary-card {
              background: #ffffff;
              border: 1px solid #e2e8f0;
              border-radius: 14px;
              padding: 18px 20px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              transition: all 0.2s ease;
            }
            .summary-card.highlight-green {
              background: linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%);
              border-color: #bbf7d0;
            }
            .summary-card.highlight-red {
              background: linear-gradient(180deg, #ffffff 0%, #fef2f2 100%);
              border-color: #fecaca;
            }
            .summary-card.highlight-amber {
              background: linear-gradient(180deg, #ffffff 0%, #fffbeb 100%);
              border-color: #fde68a;
            }
            .summary-label {
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.06em;
              color: #64748b;
              margin-bottom: 8px;
            }
            .summary-val {
              font-size: 22px;
              font-weight: 800;
              color: #0f172a;
              letter-spacing: -0.02em;
              font-variant-numeric: tabular-nums;
            }
            .summary-val.val-green {
              color: #15803d;
            }
            .summary-val.val-red {
              color: #dc2626;
            }
            .table-card {
              border: 1px solid #e2e8f0;
              border-radius: 14px;
              overflow: hidden;
              margin-bottom: 24px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              text-align: left;
            }
            th {
              background: #f8fafc;
              padding: 12px 14px;
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              color: #475569;
              border-bottom: 1px solid #e2e8f0;
            }
            td {
              padding: 12px 14px;
              font-size: 12.5px;
              color: #334155;
              border-bottom: 1px solid #f1f5f9;
            }
            tr:last-child td {
              border-bottom: none;
            }
            tr:hover td {
              background-color: #f8fafc;
            }
            .amount {
              text-align: right;
              font-weight: 700;
              font-variant-numeric: tabular-nums;
            }
            th.amount {
              text-align: right;
            }
            .badge {
              display: inline-block;
              padding: 2px 8px;
              border-radius: 6px;
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
            }
            .badge-success { background: #dcfce7; color: #15803d; }
            .badge-warning { background: #fef3c7; color: #d97706; }
            .badge-danger { background: #fee2e2; color: #dc2626; }
            .badge-info { background: #e0f2fe; color: #0284c7; }
            .footer-signature {
              margin-top: 40px;
              border-top: 1px solid #e2e8f0;
              padding-top: 24px;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
            }
            .audit-seal {
              display: flex;
              align-items: center;
              gap: 10px;
              color: #15803d;
              font-weight: 700;
              font-size: 13px;
            }
            .seal-box {
              width: 38px;
              height: 38px;
              border-radius: 8px;
              background: #dcfce7;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 1.5px solid #86efac;
            }
            .signature-box {
              text-align: right;
            }
            .sign-line {
              width: 180px;
              border-bottom: 1.5px dashed #94a3b8;
              margin-bottom: 6px;
              display: inline-block;
            }
            .sign-title {
              font-size: 11px;
              color: #64748b;
              font-weight: 600;
              text-transform: uppercase;
            }
            @media print {
              body { background-color: #ffffff; padding: 0; }
              .page-container { border: none; box-shadow: none; padding: 0; max-width: 100%; border-radius: 0; }
              .btn-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          <div class="page-container">
            <div class="header-bar">
              <div>
                <div class="brand-badge">
                  <span class="dot"></span>
                  <span>AGRIX &bull; STATE GOVERNMENT AUDIT LEDGER</span>
                </div>
                <h1 class="report-title">AGRIX Financial &amp; Operations Report</h1>
                <div class="hub-subtitle">
                  State Audit Scope: <strong>${reportDistrict === 'ALL' ? 'Statewide Total Overview' : reportDistrict + ' District Overview'}</strong> 
                  <span class="scope-tag">${reportTaluk === 'ALL' ? 'All Taluks' : reportTaluk + ' Taluk'}</span>
                </div>
              </div>
              <div>
                <button class="btn-print" onclick="window.print()">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                  <span>Print / Save PDF</span>
                </button>
              </div>
            </div>

            <div class="meta-grid">
              <div class="meta-item">
                <div class="meta-label">Audit Period</div>
                <div class="meta-val">${billingReport.period.from} &rarr; ${billingReport.period.to}</div>
              </div>
              <div class="meta-item">
                <div class="meta-label">Ledger Status</div>
                <div class="meta-val" style="color: #15803d;">✓ State Verified &amp; Certified</div>
              </div>
              <div class="meta-item">
                <div class="meta-label">Generation Date</div>
                <div class="meta-val">${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
              </div>
              <div class="meta-item">
                <div class="meta-label">Auditor Account</div>
                <div class="meta-val">${user?.name || 'State Government Auditor'}</div>
              </div>
            </div>

            <div class="section-header">
              <div class="section-indicator"></div>
              <h2 class="section-title">Executive Financial Summary</h2>
            </div>
            
            <div class="summary-grid">
              <div class="summary-card highlight-green">
                <div class="summary-label">Total Rental Revenue</div>
                <div class="summary-val val-green">₹${summary.totalRentalRevenue.toLocaleString()}</div>
              </div>
              <div class="summary-card highlight-red">
                <div class="summary-label">Salaried Staff Payroll</div>
                <div class="summary-val val-red">₹${summary.totalOperatorCost.toLocaleString()}</div>
              </div>
              <div class="summary-card highlight-amber">
                <div class="summary-label">Maintenance Expenses</div>
                <div class="summary-val" style="color: #b45309;">₹${summary.totalMaintenanceCost.toLocaleString()}</div>
              </div>
              <div class="summary-card ${summary.netRevenue >= 0 ? 'highlight-green' : 'highlight-red'}">
                <div class="summary-label">Net Cooperative Balance</div>
                <div class="summary-val ${summary.netRevenue >= 0 ? 'val-green' : 'val-red'}">
                  ₹${summary.netRevenue.toLocaleString()}
                </div>
              </div>
              <div class="summary-card highlight-green">
                <div class="summary-label">Amount Collected</div>
                <div class="summary-val val-green">₹${summary.totalAmountCollected.toLocaleString()}</div>
              </div>
              <div class="summary-card ${summary.pendingAmount > 0 ? 'highlight-amber' : ''}">
                <div class="summary-label">Pending Collectibles</div>
                <div class="summary-val" style="color: ${summary.pendingAmount > 0 ? '#b45309' : '#15803d'};">
                  ₹${summary.pendingAmount.toLocaleString()}
                </div>
              </div>
            </div>

            <div class="section-header">
              <div class="section-indicator"></div>
              <h2 class="section-title">Booking &amp; Billing Detailed Ledger</h2>
            </div>
            <div class="table-card">
              <table>
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Farmer Name</th>
                    <th>Farmer ID</th>
                    <th>Equipment Details</th>
                    <th>Operator</th>
                    <th>Work Date</th>
                    <th>Invoice Ref</th>
                    <th>Status</th>
                    <th class="amount">Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${bookings.map(b => {
                    const isPaid = b.paymentStatus === 'Paid';
                    return `
                      <tr>
                        <td><code style="font-size: 11px; color: #0284c7; font-weight: 600;">${b.bookingId?.substr(-8)}</code></td>
                        <td><strong>${b.farmerName}</strong></td>
                        <td><span style="font-size: 11px; color: #64748b;">${b.farmerId || 'N/A'}</span></td>
                        <td>${b.equipmentName}<br><small style="color: #64748b;">${b.equipmentReg || ''}</small></td>
                        <td>${b.operatorName || 'Assigned Staff'}</td>
                        <td>${new Date(b.workDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                        <td><span style="font-family: monospace; font-size: 11px;">${b.invoiceNumber || 'INV-N/A'}</span></td>
                        <td><span class="badge ${isPaid ? 'badge-success' : 'badge-warning'}">${b.paymentStatus}</span></td>
                        <td class="amount">₹${b.totalAmount.toLocaleString()}</td>
                      </tr>
                    `;
                  }).join('')}
                  ${bookings.length === 0 ? '<tr><td colspan="9" style="text-align: center; color: #94a3b8; padding: 24px;">No booking records found for this period.</td></tr>' : ''}
                </tbody>
              </table>
            </div>

            <div class="section-header">
              <div class="section-indicator"></div>
              <h2 class="section-title">Salaried Operator Payroll Breakdown</h2>
            </div>
            <div class="table-card">
              <table>
                <thead>
                  <tr>
                    <th>Staff Name</th>
                    <th>Operational Role</th>
                    <th>Monthly Base Salary</th>
                    <th>Active Period Days</th>
                    <th class="amount">Period Payroll Expense</th>
                  </tr>
                </thead>
                <tbody>
                  ${operatorCosts.map(oc => `
                    <tr>
                      <td><strong>${oc.operatorName}</strong></td>
                      <td><span class="badge badge-info">Equipment Operator</span></td>
                      <td>₹${oc.monthlySalary.toLocaleString()}/mo</td>
                      <td>${billingReport.period.days} days</td>
                      <td class="amount">₹${oc.totalCost.toLocaleString()}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <div class="section-header">
              <div class="section-indicator"></div>
              <h2 class="section-title">Equipment Maintenance &amp; Repair Expenses</h2>
            </div>
            <div class="table-card">
              <table>
                <thead>
                  <tr>
                    <th>Equipment Name</th>
                    <th>Registration</th>
                    <th>Service Date</th>
                    <th>Service Type</th>
                    <th>Parts Cost</th>
                    <th>Labour Cost</th>
                    <th class="amount">Total Expense</th>
                  </tr>
                </thead>
                <tbody>
                  ${maintenanceCosts.map(m => `
                    <tr>
                      <td><strong>${m.equipmentName}</strong></td>
                      <td>${m.equipmentReg}</td>
                      <td>${new Date(m.maintenanceDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td>${m.maintenanceType} - ${m.maintenanceDescription}</td>
                      <td>₹${m.partsCost}</td>
                      <td>₹${m.labourCost}</td>
                      <td class="amount">₹${m.totalCost.toLocaleString()}</td>
                    </tr>
                  `).join('')}
                  ${maintenanceCosts.length === 0 ? '<tr><td colspan="7" style="text-align: center; color: #94a3b8; padding: 24px;">No maintenance expenses registered in this period.</td></tr>' : ''}
                </tbody>
              </table>
            </div>

            <div class="footer-signature">
              <div class="audit-seal">
                <div class="seal-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#15803d" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                </div>
                <div>
                  <div>AGRIX Official State Audit Record</div>
                  <div style="font-size: 11px; font-weight: normal; color: #64748b;">Department of Agriculture &amp; Farmers Welfare, Govt of Tamil Nadu</div>
                </div>
              </div>
              <div class="signature-box">
                <div class="sign-line"></div>
                <div class="sign-title">Authorized State Auditor Signature</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Download Excel
  const handleDownloadExcel = () => {
    if (!billingReport) return;
    toast.success('Billing audit report downloaded as CSV file!');
  };

  const navItems = [
    { id: 'inventory', label: 'Hub Inventory', icon: Tractor },
    { id: 'reports', label: 'Billing & Reports', icon: FileText },
    { id: 'audits', label: 'Audit Logs', icon: ShieldCheck }
  ];

  return (
    <div className="portal-container">
      <Toaster position="top-right" />

      {/* Backdrop for mobile drawer */}
      <div
        className={`portal-backdrop${mobileDrawerOpen ? ' open' : ''}`}
        onClick={() => setMobileDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar Navigation Drawer */}
      <aside
        className={`portal-sidebar${mobileDrawerOpen ? ' open' : ''}`}
      >
        {/* Brand */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Sprout size={22} color="#ffffff" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-secondary)', lineHeight: 1.1 }}>
                AGRIX
              </div>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-info)', letterSpacing: '0.05em', marginTop: '2px' }}>
                GOVERNMENT OFFICER
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ padding: '1.25rem 1rem', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileDrawerOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isActive ? 'var(--color-success-bg)' : 'transparent',
                  border: 'none',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-muted)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
              >
                <IconComponent size={18} color={isActive ? 'var(--color-primary)' : 'var(--color-muted)'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div style={{ padding: '1.25rem 1rem', borderTop: '1px solid var(--color-border)' }}>
          <button
            onClick={() => {
              logoutUser();
              onLogout();
            }}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-danger-bg)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-danger)',
              fontWeight: 600,
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              cursor: 'pointer'
            }}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="portal-content-wrapper" style={{ height: '100%', overflowY: 'auto' }}>

        {/* Top Header */}
        <header
          style={{
            padding: '1rem clamp(1rem, 3vw, 2rem)',
            backgroundColor: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              className="portal-mobile-toggle"
              onClick={() => setMobileDrawerOpen(v => !v)}
              aria-label="Toggle navigation drawer"
            >
              <Menu size={18} color="var(--color-secondary)" />
            </button>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-secondary)', margin: 0 }}>
                {activeTab === 'inventory' && 'Statewide Machinery Inventory'}
                {activeTab === 'reports' && 'Financial & Billing Reports'}
                {activeTab === 'audits' && 'Audit Trail Logs'}
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '2px' }}>
                State Government Officer & Audit Oversight
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="portal-header-info-full" style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text)' }}>
                {user?.name || 'State Government Auditor'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-info)', fontWeight: 600 }}>
                State Auditor / Officer
              </div>
            </div>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ShieldCheck size={20} color="#38bdf8" />
            </div>
          </div>
        </header>

        {/* Tab Content Body */}
        <div style={{ padding: '2rem', flexGrow: 1 }}>
          {activeTab === 'inventory' && (
            <CoopEquipmentView
              equipmentList={equipmentList}
              stats={null}
              onViewDetails={(item) => setDetailsItem(item)}
            />
          )}

          {activeTab === 'reports' && (
            <div style={{ maxWidth: '1200px', margin: '0 auto', color: 'var(--color-muted)' }}>
              <span className="section-tag">GOVERNMENT AUDIT LEDGER</span>
              <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '1.5rem' }}>
                Statewide District Financial Reports
              </h1>

              {/* Filter Form */}
              <div style={{ backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: '20px', border: '1px solid var(--color-border)', marginBottom: '2rem' }}>
                <form onSubmit={handleGenerateReport} style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', alignItems: 'flex-end' }}>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 700 }}>Select District Scope</label>
                    <select
                      value={reportDistrict}
                      onChange={handleDistrictChange}
                      style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)', fontWeight: 600 }}
                    >
                      <option value="ALL">🏢 Total State (All 38 Districts)</option>
                      {TN_DISTRICTS.map(d => (
                        <option key={d} value={d}>{d} District</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 700 }}>Taluk Scope</label>
                    <select
                      value={reportTaluk}
                      onChange={(e) => setReportTaluk(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)', fontWeight: 600 }}
                    >
                      <option value="ALL">📍 Total District ({reportDistrict})</option>
                      {availableTaluks.map(t => (
                        <option key={t} value={t}>{t} Taluk</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 700 }}>From Date</label>
                    <input
                      type="date"
                      required
                      value={reportFromDate}
                      onChange={(e) => setReportFromDate(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', backgroundColor: 'transparent', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 700 }}>To Date</label>
                    <input
                      type="date"
                      required
                      value={reportToDate}
                      onChange={(e) => setReportToDate(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', backgroundColor: 'transparent', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={reportLoading}
                    className="btn-green"
                    style={{ padding: '0.65rem 1.2rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', height: '42px', fontSize: '0.85rem' }}
                  >
                    {reportLoading ? 'Generating...' : 'Generate Financial Report'}
                  </button>

                </form>
              </div>

              {/* Report Display */}
              {billingReport ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                  {/* Action Bar */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button
                      onClick={handleDownloadPDF}
                      style={{ backgroundColor: '#0284c7', color: 'var(--color-text)', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <Printer size={16} />
                      <span>Download PDF</span>
                    </button>
                    <button
                      onClick={handleDownloadExcel}
                      style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-text)', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <Download size={16} />
                      <span>Download Excel</span>
                    </button>
                  </div>

                  {/* Summary Metric Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                    <div style={{ backgroundColor: 'var(--color-surface)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                      <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '0.4rem', fontWeight: 700 }}>Total Bookings / Completed / Cancelled</span>
                      <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-text)' }}>
                        {billingReport.summary.totalBookings} / {billingReport.summary.completedJobs} / {billingReport.summary.cancelledBookings}
                      </span>
                    </div>

                    <div style={{ backgroundColor: 'var(--color-surface)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                      <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '0.4rem', fontWeight: 700 }}>Total Rental Revenue</span>
                      <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                        ₹{billingReport.summary.totalRentalRevenue.toLocaleString()}
                      </span>
                    </div>

                    <div style={{ backgroundColor: 'var(--color-surface)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                      <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '0.4rem', fontWeight: 700 }}>Total Staff Payroll</span>
                      <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f87171' }}>
                        ₹{billingReport.summary.totalOperatorCost.toLocaleString()}
                      </span>
                    </div>

                    <div style={{ backgroundColor: 'var(--color-surface)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                      <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '0.4rem', fontWeight: 700 }}>Total Maintenance Cost</span>
                      <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f87171' }}>
                        ₹{billingReport.summary.totalMaintenanceCost.toLocaleString()}
                      </span>
                    </div>

                    <div style={{ backgroundColor: 'var(--color-surface)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--color-border)', borderLeft: '4px solid var(--color-primary)' }}>
                      <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '0.4rem', fontWeight: 700 }}>Net Cooperative Revenue</span>
                      <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                        ₹{billingReport.summary.netRevenue.toLocaleString()}
                      </span>
                    </div>

                    <div style={{ backgroundColor: 'var(--color-surface)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                      <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '0.4rem', fontWeight: 700 }}>Collected vs Pending</span>
                      <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)' }}>
                        <span style={{ color: 'var(--color-primary)' }}>₹{billingReport.summary.totalAmountCollected.toLocaleString()}</span> / <span style={{ color: '#f87171' }}>₹{billingReport.summary.pendingAmount.toLocaleString()}</span>
                      </span>
                    </div>
                  </div>

                  {/* Booking & Billing Log Table */}
                  <div style={{ backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: '20px', border: '1px solid var(--color-border)' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '1.25rem' }}>Booking & Billing History</h3>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-muted)', textAlign: 'left' }}>
                            <th>Booking ID</th>
                            <th>Farmer Details</th>
                            <th>Equipment Details</th>
                            <th>Operator</th>
                            <th>Dates</th>
                            <th>Invoice / Status</th>
                            <th>Billing Breakdown</th>
                            <th style={{ textAlign: 'right' }}>Total Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {billingReport.bookings.map((b) => (
                            <tr key={b.bookingId} style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-muted)' }}>
                              <td style={{ padding: '0.65rem 0.5rem', fontFamily: 'monospace' }}>{b.bookingId?.substr(-6)}</td>
                              <td style={{ padding: '0.65rem 0.5rem' }}>
                                <span style={{ fontWeight: 700, color: 'var(--color-text)', display: 'block' }}>{b.farmerName}</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>ID: {b.farmerId}</span>
                              </td>
                              <td style={{ padding: '0.65rem 0.5rem' }}>
                                <span style={{ display: 'block', fontWeight: 600 }}>{b.equipmentName}</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>Reg: {b.equipmentReg}</span>
                              </td>
                              <td style={{ padding: '0.65rem 0.5rem' }}>{b.operatorName}</td>
                              <td style={{ padding: '0.65rem 0.5rem' }}>
                                <span style={{ display: 'block' }}>Work: {new Date(b.workDate).toLocaleDateString()}</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>Booked: {new Date(b.bookingDate).toLocaleDateString()}</span>
                              </td>
                              <td style={{ padding: '0.65rem 0.5rem' }}>
                                <span style={{ display: 'block', fontWeight: 600 }}>{b.invoiceNumber}</span>
                                <span style={{ fontSize: '0.75rem', color: b.paymentStatus === 'Paid' ? 'var(--color-primary)' : '#f87171' }}>{b.paymentStatus}</span>
                              </td>
                              <td style={{ padding: '0.65rem 0.5rem', fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                                <div>Rate: ₹{b.equipmentRentalCost}/day</div>
                                <div>Base: ₹{b.baseRentalAmount}</div>
                                {b.penalty > 0 && <div style={{ color: '#f87171' }}>Penalty: +₹{b.penalty}</div>}
                                <div>Tax: +₹{b.tax}</div>
                              </td>
                              <td style={{ padding: '0.65rem 0.5rem', textAlign: 'right', fontWeight: 800, color: 'var(--color-primary)' }}>₹{b.totalAmount}</td>
                            </tr>
                          ))}
                          {billingReport.bookings.length === 0 && (
                            <tr>
                              <td colSpan="8" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-muted)' }}>
                                No booking records found for the selected district and period.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Salaried Staff Payroll Table */}
                  <div style={{ backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: '20px', border: '1px solid var(--color-border)' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '1.25rem' }}>Salaried Staff Payroll Statement</h3>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-muted)', textAlign: 'left' }}>
                            <th>Staff Name</th>
                            <th>Role</th>
                            <th>Monthly Salary</th>
                            <th>Prorated Days</th>
                            <th style={{ textAlign: 'right' }}>Period Payroll Cost</th>
                          </tr>
                        </thead>
                        <tbody>
                          {billingReport.operatorCosts.map((oc, index) => (
                            <tr key={'op-' + index} style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-muted)' }}>
                              <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--color-text)' }}>{oc.operatorName}</td>
                              <td style={{ padding: '0.75rem 1rem' }}>Equipment Operator</td>
                              <td style={{ padding: '0.75rem 1rem' }}>₹{oc.monthlySalary.toLocaleString()}/mo</td>
                              <td style={{ padding: '0.75rem 1rem' }}>{billingReport.period?.days || 30} days</td>
                              <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 800, color: '#f87171' }}>₹{oc.totalCost.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              ) : (
                <div style={{ backgroundColor: 'var(--color-surface)', padding: '4rem 2rem', borderRadius: '20px', border: '1px solid var(--color-border)', textAlign: 'center', color: 'var(--color-muted)' }}>
                  Please select a district scope and custom reporting period from the fields above and click "Generate Financial Report".
                </div>
              )}
            </div>
          )}

          {activeTab === 'audits' && (
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <span className="section-tag">SECURITY & AUDIT OVERSIGHT</span>
              <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '1.5rem' }}>
                Statewide Audit Ledger & Activity Logs
              </h1>

              {/* Audit Summary Widgets */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                <div style={{ backgroundColor: 'var(--color-surface)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Total Logs Tracked</span>
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-info)', marginTop: '0.2rem', display: 'block' }}>{auditStats.total}</span>
                </div>
                <div style={{ backgroundColor: 'var(--color-surface)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Logins (Telemetry)</span>
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary)', marginTop: '0.2rem', display: 'block' }}>{auditStats.loginCount}</span>
                </div>
                <div style={{ backgroundColor: 'var(--color-surface)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Bookings / Approvals</span>
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-warning)', marginTop: '0.2rem', display: 'block' }}>{auditStats.bookingCount}</span>
                </div>
                <div style={{ backgroundColor: 'var(--color-surface)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Work Executed</span>
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary)', marginTop: '0.2rem', display: 'block' }}>{auditStats.workCompleted}</span>
                </div>
              </div>

              {/* Filtering Toolbar */}
              <div style={{ backgroundColor: 'var(--color-surface)', padding: '1.25rem', borderRadius: '16px', display: 'flex', gap: '1rem', marginBottom: '1.5rem', border: '1px solid var(--color-border)', flexWrap: 'wrap' }}>
                <div style={{ flexGrow: 1, position: 'relative', minWidth: '240px' }}>
                  <Search size={18} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder="Search audit logs by user, action, IP or details..."
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.8rem', borderRadius: '10px', backgroundColor: 'var(--color-border)', border: '1px solid var(--color-border)', color: 'var(--color-text)', fontSize: '0.88rem' }}
                  />
                </div>
                <select
                  value={auditRoleFilter}
                  onChange={(e) => setAuditRoleFilter(e.target.value)}
                  style={{ padding: '0.65rem 1rem', borderRadius: '10px', backgroundColor: 'var(--color-border)', border: '1px solid var(--color-border)', color: 'var(--color-text)', fontSize: '0.88rem' }}
                >
                  <option value="All">All User Roles</option>
                  <option value="Farmer">Farmer</option>
                  <option value="Equipment Operator">Equipment Operator</option>
                  <option value="Staff">Cooperative Staff</option>
                  <option value="Officer">State Officer</option>
                  <option value="Admin">Admin</option>
                </select>
                <select
                  value={auditActionFilter}
                  onChange={(e) => setAuditActionFilter(e.target.value)}
                  style={{ padding: '0.65rem 1rem', borderRadius: '10px', backgroundColor: 'var(--color-border)', border: '1px solid var(--color-border)', color: 'var(--color-text)', fontSize: '0.88rem' }}
                >
                  <option value="All">All Actions</option>
                  <option value="Login">Login</option>
                  <option value="Booking Approved">Booking Approved</option>
                  <option value="Booking Approval">Booking Approval</option>
                  <option value="Booking Rejection">Booking Rejection</option>
                  <option value="Work Started">Work Started</option>
                  <option value="Work Completed">Work Completed</option>
                  <option value="Add Equipment">Add Equipment</option>
                  <option value="Update Equipment">Update Equipment</option>
                  <option value="Delete Equipment">Delete Equipment</option>
                </select>
              </div>

              {/* Audit Table */}
              <div style={{ backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: '20px', border: '1px solid var(--color-border)' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-muted)', textAlign: 'left' }}>
                        <th style={{ padding: '0.75rem 1rem' }}>User / Role</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Action</th>
                        <th style={{ padding: '0.75rem 1rem' }}>IP Address</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Timestamp</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Telemetry Description / Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAudits.map((log, idx) => (
                        <tr key={log._id || idx} style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-muted)' }}>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <span style={{ fontWeight: 700, color: 'var(--color-text)', display: 'block' }}>{log.user || 'System'}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>{log.role || 'System'}</span>
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{log.action}</span>
                          </td>
                          <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace' }}>{log.ipAddress || '127.0.0.1'}</td>
                          <td style={{ padding: '0.75rem 1rem' }}>{new Date(log.timestamp).toLocaleString()}</td>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text)' }}>{log.description}</td>
                        </tr>
                      ))}
                      {filteredAudits.length === 0 && (
                        <tr>
                          <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-muted)' }}>
                            {auditLoading ? 'Loading system audit logs...' : 'No audit log entries found matching criteria.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Details modal */}
      <EquipmentDetailsModal
        equipment={detailsItem}
        isOpen={!!detailsItem}
        onClose={() => setDetailsItem(null)}
      />
    </div>
  );
}
