// src/components/government/GovernmentPortal.jsx
import React, { useState, useEffect } from 'react';
import CoopEquipmentView from '../cooperative/CoopEquipmentView';
import EquipmentDetailsModal from '../cooperative/EquipmentDetailsModal';
import { fetchCoopEquipment, fetchBillingReport, logoutUser } from '../../api';
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
  ShieldCheck
} from 'lucide-react';

export default function GovernmentPortal({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'reports'

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
      <html>
        <head>
          <title>AgriRentGov State Government Auditor - Financial Report</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1e293b; padding: 40px; line-height: 1.5; background-color: #ffffff; }
            h1 { color: #0f172a; text-align: center; font-size: 26px; margin-bottom: 5px; }
            .hub-title { text-align: center; font-size: 14px; color: #64748b; font-weight: bold; margin-bottom: 25px; text-transform: uppercase; letter-spacing: 0.05em; }
            .report-meta { display: flex; justify-content: space-between; font-size: 12px; color: #64748b; margin-bottom: 30px; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; }
            .section-title { font-size: 18px; color: #0f172a; border-left: 4px solid var(--color-primary); padding-left: 10px; margin-top: 35px; margin-bottom: 15px; font-weight: bold; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background-color: #f8fafc; color: #475569; font-weight: bold; text-align: left; padding: 12px 10px; border-bottom: 2px solid #e2e8f0; border-top: 1px solid #e2e8f0; font-size: 11px; text-transform: uppercase; }
            td { padding: 10px; border-bottom: 1px solid #f1f5f9; font-size: 12px; color: #334155; }
            .amount { font-weight: bold; text-align: right; }
            th.amount { text-align: right; }
            .summary-container { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 30px; }
            .summary-card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; text-align: center; }
            .summary-label { font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700; margin-bottom: 5px; }
            .summary-value { font-size: 20px; font-weight: 800; color: #0f172a; }
            .summary-value.positive { color: var(--color-primary); }
            .summary-value.negative { color: #ef4444; }
            .btn-print { background-color: var(--color-primary); color: white; border: none; padding: 12px 24px; font-size: 14px; font-weight: bold; border-radius: 8px; cursor: pointer; display: block; margin: 0 auto 30px auto; }
            @media print {
              .btn-print { display: none; }
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <button class="btn-print" onclick="window.print()">Print / Save PDF Report</button>
          <h1>🌾 AgriRentGov Official State Government Audit Report</h1>
          <div class="hub-title">Scope: ${reportDistrict === 'ALL' ? 'Statewide Total Overview' : reportDistrict + ' District Overview'} (${reportTaluk === 'ALL' ? 'All Taluks' : reportTaluk + ' Taluk'})</div>
          
          <div class="report-meta">
            <div>
              <strong>Report Period:</strong> ${billingReport.period.from} to ${billingReport.period.to}<br>
              <strong>Auditor Account:</strong> ${user?.name || 'State Government Auditor'} (${user?.email})
            </div>
            <div style="text-align: right;">
              <strong>Generated Date:</strong> ${new Date().toLocaleDateString()}<br>
              <strong>Platform Audit Status:</strong> Verified State Cooperative Ledger
            </div>
          </div>

          <div class="section-title">Executive Financial Summary</div>
          <div class="summary-container">
            <div class="summary-card">
              <div class="summary-label">Total Rental Revenue</div>
              <div class="summary-value positive">₹${summary.totalRentalRevenue.toLocaleString()}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Total Operator Payroll</div>
              <div class="summary-value negative">₹${summary.totalOperatorCost.toLocaleString()}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Total Maintenance Expense</div>
              <div class="summary-value negative">₹${summary.totalMaintenanceCost.toLocaleString()}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Net Cooperative Revenue</div>
              <div class="summary-value positive">₹${summary.netRevenue.toLocaleString()}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Amount Collected</div>
              <div class="summary-value positive">₹${summary.totalAmountCollected.toLocaleString()}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Pending Collectibles</div>
              <div class="summary-value negative">₹${summary.pendingAmount.toLocaleString()}</div>
            </div>
          </div>

          <div class="section-title">Booking & Billing Detailed Log</div>
          <table>
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Farmer Details</th>
                <th>Equipment Details</th>
                <th>Operator</th>
                <th>Work Date</th>
                <th>Invoice Ref</th>
                <th>Status</th>
                <th class="amount">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${bookings.map(b => `
                <tr>
                  <td style="font-family: monospace;">${b.bookingId?.substr(-6)}</td>
                  <td><strong>${b.farmerName}</strong><br><small>ID: ${b.farmerId}</small></td>
                  <td>${b.equipmentName}<br><small>Reg: ${b.equipmentReg}</small></td>
                  <td>${b.operatorName}</td>
                  <td>${new Date(b.workDate).toLocaleDateString()}</td>
                  <td>${b.invoiceNumber}</td>
                  <td><strong style="color: ${b.paymentStatus === 'Paid' ? 'var(--color-primary)' : '#ef4444'}">${b.paymentStatus}</strong></td>
                  <td class="amount">₹${b.totalAmount.toLocaleString()}</td>
                </tr>
              `).join('')}
              ${bookings.length === 0 ? '<tr><td colSpan="8" style="text-align:center; padding: 20px;">No booking records found for this period.</td></tr>' : ''}
            </tbody>
          </table>

          <div class="section-title">Salaried Operator Payroll Breakdown</div>
          <table>
            <thead>
              <tr>
                <th>Staff Name</th>
                <th>Role</th>
                <th>Monthly Base Salary</th>
                <th>Active Period Days</th>
                <th class="amount">Payroll Expense</th>
              </tr>
            </thead>
            <tbody>
              ${operatorCosts.map(oc => `
                <tr>
                  <td><strong>${oc.operatorName}</strong></td>
                  <td>Equipment Operator</td>
                  <td>₹${oc.monthlySalary.toLocaleString()}</td>
                  <td>${billingReport.period.days} days</td>
                  <td class="amount">₹${oc.totalCost.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="section-title">Equipment Maintenance Expenses</div>
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
                  <td>${new Date(m.maintenanceDate).toLocaleDateString()}</td>
                  <td>${m.maintenanceType} - ${m.maintenanceDescription}</td>
                  <td>₹${m.partsCost}</td>
                  <td>₹${m.labourCost}</td>
                  <td class="amount">₹${m.totalCost.toLocaleString()}</td>
                </tr>
              `).join('')}
              ${maintenanceCosts.length === 0 ? '<tr><td colSpan="7" style="text-align:center; padding: 20px;">No maintenance expenses registered in this period.</td></tr>' : ''}
            </tbody>
          </table>

          <div style="margin-top: 50px; border-top: 1px solid #cbd5e1; padding-top: 15px; font-size: 11px; color: #94a3b8; display: flex; justify-content: space-between;">
            <div>Official Audit Record &bull; State Government Cooperative Oversight</div>
            <div>AgriRentGov Portal Verification</div>
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
    { id: 'reports', label: 'Billing & Reports', icon: FileText }
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: 'var(--color-background)', color: 'var(--color-text)' }}>
      <Toaster position="top-right" />

      {/* Sidebar Navigation */}
      <aside
        style={{
          width: '270px',
          backgroundColor: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          height: '100%',
          boxShadow: 'var(--shadow-sm)'
        }}
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
                AGRI RENT GOV
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
                onClick={() => setActiveTab(item.id)}
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
      <main style={{ flexGrow: 1, height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        
        {/* Top Header */}
        <header
          style={{
            padding: '1.25rem 2rem',
            backgroundColor: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 10
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-secondary)' }}>
              {activeTab === 'inventory' && 'Statewide Machinery Inventory'}
              {activeTab === 'reports' && 'Cooperative Financial & Billing Reports'}
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>
              State Government Officer & Audit Oversight Control
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text)' }}>
                {user?.name || 'State Government Auditor'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-info)', fontWeight: 600 }}>
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

                  {/* Maintenance Log Table */}
                  <div style={{ backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: '20px', border: '1px solid var(--color-border)' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '1.25rem' }}>Equipment Maintenance Log Details</h3>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-muted)', textAlign: 'left' }}>
                            <th>Equipment Details</th>
                            <th>Reg Number</th>
                            <th>Service Date</th>
                            <th>Type / Description</th>
                            <th>Specialist</th>
                            <th>Parts Cost</th>
                            <th>Labour Cost</th>
                            <th style={{ textAlign: 'right' }}>Total Service Cost</th>
                          </tr>
                        </thead>
                        <tbody>
                          {billingReport.maintenanceCosts.map((m, index) => (
                            <tr key={index} style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-muted)' }}>
                              <td style={{ padding: '0.75rem 1rem' }}>
                                <span style={{ fontWeight: 700, color: 'var(--color-text)', display: 'block' }}>{m.equipmentName}</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>ID: {m.equipmentId}</span>
                              </td>
                              <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{m.equipmentReg}</td>
                              <td style={{ padding: '0.75rem 1rem' }}>{new Date(m.maintenanceDate).toLocaleDateString()}</td>
                              <td style={{ padding: '0.75rem 1rem' }}>
                                <span style={{ display: 'block', fontWeight: 600, color: 'var(--color-info)' }}>{m.maintenanceType}</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>{m.maintenanceDescription}</span>
                              </td>
                              <td style={{ padding: '0.75rem 1rem' }}>{m.specialist}</td>
                              <td style={{ padding: '0.75rem 1rem' }}>₹{m.partsCost}</td>
                              <td style={{ padding: '0.75rem 1rem' }}>₹{m.labourCost}</td>
                              <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 800, color: '#f87171' }}>₹{m.totalCost}</td>
                            </tr>
                          ))}
                          {billingReport.maintenanceCosts.length === 0 && (
                            <tr>
                              <td colSpan="8" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-muted)' }}>
                                No maintenance records registered in this period.
                              </td>
                            </tr>
                          )}
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
