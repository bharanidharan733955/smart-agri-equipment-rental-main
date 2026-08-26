// src/components/cooperative/CoopPortal.jsx
import React, { useState, useEffect } from 'react';
import CoopStaffLayout from './CoopStaffLayout';
import CoopEquipmentView from './CoopEquipmentView';
import AddEquipmentModal from './AddEquipmentModal';
import EditEquipmentModal from './EditEquipmentModal';
import EquipmentDetailsModal from './EquipmentDetailsModal';
import UploadImageModal from './UploadImageModal';
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
  fetchFarmerFeedbackCoop,
  fetchBillingReport
} from '../../api';
import toast, { Toaster } from 'react-hot-toast';
import { 
  CheckCircle2, XCircle, UserCheck, Wrench, FileSpreadsheet, DollarSign, 
  MessageSquare, Star, Printer, Calendar, ShieldCheck, Download, BarChart2 
} from 'lucide-react';

export default function CoopPortal({ onLogout }) {
  const [activeTab, setActiveTab] = useState('inventory');
  const [equipmentList, setEquipmentList] = useState([]);
  const [stats, setStats] = useState(null);
  
  // Data lists
  const [bookings, setBookings] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [operators, setOperators] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [billingReport, setBillingReport] = useState(null);
  const [reportFromDate, setReportFromDate] = useState('');
  const [reportToDate, setReportToDate] = useState('');
  const [reportLoading, setReportLoading] = useState(false);

  // Feedback filter state
  const [filterRating, setFilterRating] = useState('All');
  const [filterEquipment, setFilterEquipment] = useState('All');
  const [filterOperator, setFilterOperator] = useState('All');
  const [filterFarmer, setFilterFarmer] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [detailsItem, setDetailsItem] = useState(null);
  const [uploadItem, setUploadItem] = useState(null);
  const [maintItem, setMaintItem] = useState(null);

  // Maintenance form state
  const [maintDesc, setMaintDesc] = useState('');
  const [maintCost, setMaintCost] = useState('');
  const [selectedUnit, setSelectedUnit] = useState(null);

  // Generate deterministic units for an equipment type (same logic as EquipmentDetailsModal)
  const generateUnits = (eq) => {
    const seed = eq._id || eq.id || 'default';
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Array.from({ length: 15 }, (_, index) => {
      const unitNum = index + 1;
      const baseHours = eq.totalUsageHours || 12;
      const factor = Math.abs(Math.sin(hash + unitNum * 17));
      const hours = Math.round((factor * 370) * 10) / 10;
      let status = 'Available';
      if (hours >= 360) {
        status = 'Under Maintenance';
      } else {
        const randStatus = Math.cos(hash + unitNum * 23);
        if (randStatus > 0.4) status = 'Rented';
        else if (randStatus < -0.6) status = 'Reserved';
      }
      return {
        unitNum,
        serial: `${eq.regNumber || 'PB-10-AT-8821'}-${String(unitNum).padStart(2, '0')}`,
        hours,
        status
      };
    });
  };

  useEffect(() => {
    loadCoopData();
  }, [activeTab]);

  const loadCoopData = async () => {
    // Always fetch equipment + stats in parallel
    const [list, st] = await Promise.all([
      fetchCoopEquipment(),
      fetchCoopStats(),
    ]);
    setEquipmentList(list || []);
    if (st) setStats(st);

    // Tab-specific parallel fetches
    if (activeTab === 'requests') {
      const [bks, ops] = await Promise.all([fetchFarmerBookings(), fetchCoopOperators()]);
      setBookings(bks || []);
      setOperators(ops || []);
    } else if (activeTab === 'farmers') {
      const frms = await fetchCoopFarmers();
      setFarmers(frms || []);
    } else if (activeTab === 'invoices') {
      const invs = await fetchCoopInvoices();
      setInvoices(invs || []);
    } else if (activeTab === 'feedback') {
      const fbs = await fetchFarmerFeedbackCoop();
      setFeedbacks(fbs || []);
      const ops = await fetchCoopOperators();
      setOperators(ops || []);
    }
  };

  // Add Equipment Handler
  const handleAddEquipment = async (payload) => {
    const res = await addCoopEquipment(payload);
    if (res.success) {
      toast.success('Equipment added successfully!');
      setIsAddOpen(false);
      loadCoopData();
    } else {
      toast.error(res.message || 'Failed to add equipment.');
    }
  };

  // Edit Equipment Handler
  const handleSaveEdit = async (id, payload) => {
    const res = await editCoopEquipment(id, payload);
    if (res.success) {
      toast.success('Equipment updated successfully!');
      setEditingItem(null);
      loadCoopData();
    } else {
      toast.error(res.message || 'Failed to update equipment.');
    }
  };

  // Delete Equipment Handler
  const handleDeleteEquipment = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name} from Hub Inventory?`)) {
      await deleteCoopEquipment(id);
      toast.success('Equipment deleted.');
      loadCoopData();
    }
  };

  const handleUpdateStatus = async (id, status) => {
    await updateCoopEquipmentStatus(id, status);
    loadCoopData();
  };

  const handleUpdateCondition = async (id, condition) => {
    await updateCoopEquipmentCondition(id, condition);
    loadCoopData();
  };

  const handleUploadImage = async (id, imageUrl) => {
    await uploadCoopEquipmentImage(id, imageUrl);
    loadCoopData();
  };

  // Booking Approve / Reject
  const handleApproveBooking = async (id) => {
    const res = await approveRentalBooking(id);
    if (res.success) {
      toast.success('Booking approved! Operator assigned automatically.');
      loadCoopData();
    } else {
      toast.error(res.message || 'Failed to approve booking.');
    }
  };

  const handleRejectBooking = async (id) => {
    const res = await rejectRentalBooking(id);
    if (res.success) {
      toast.success('Booking rejected.');
      loadCoopData();
    } else {
      toast.error(res.message || 'Failed to reject booking.');
    }
  };

  // Farmer Approve
  const handleApproveFarmer = async (id) => {
    const res = await approveFarmerApi(id);
    if (res.success) {
      toast.success('Farmer account approved successfully!');
      loadCoopData();
    } else {
      toast.error('Failed to approve farmer.');
    }
  };

  // Maintenance Submit
  const handleScheduleMaintSubmit = async (e) => {
    e.preventDefault();
    const res = await scheduleMaintenance(maintItem._id || maintItem.id, {
      description: maintDesc,
      cost: 0
    });
    if (res.success) {
      toast.success('Equipment sent to Under Maintenance.');
      setMaintItem(null);
      setMaintDesc('');
      setMaintCost('');
      loadCoopData();
    }
  };

  const handleCompleteMaint = async (id) => {
    const res = await completeMaintenance(id);
    if (res.success) {
      toast.success('Equipment maintenance completed. Available for rent.');
      loadCoopData();
    }
  };

  // Pay Invoice
  const handlePayInvoice = async (id) => {
    const res = await payInvoice(id);
    if (res.success) {
      toast.success('Invoice marked as paid!');
      loadCoopData();
    }
  };

  // Report Handlers
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
      const data = await fetchBillingReport(fromFormatted, toFormatted);
      if (data) {
        setBillingReport(data);
        toast.success('Billing report generated successfully!');
      } else {
        toast.error('Failed to generate billing report.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch billing report.');
    }
    setReportLoading(false);
  };

  const handleDownloadPDF = () => {
    if (!billingReport) return;
    const { summary, bookings, operatorCosts, maintenanceCosts } = billingReport;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>AgriRentGov - Financial Operations & Billing Report</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1e293b; padding: 40px; line-height: 1.5; background-color: #ffffff; }
            h1 { color: #0f172a; text-align: center; font-size: 26px; margin-bottom: 5px; }
            .hub-title { text-align: center; font-size: 14px; color: #64748b; font-weight: bold; margin-bottom: 25px; text-transform: uppercase; letter-spacing: 0.05em; }
            .report-meta { display: flex; justify-content: space-between; font-size: 12px; color: #64748b; margin-bottom: 30px; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; }
            .section-title { font-size: 18px; color: #0f172a; border-left: 4px solid #10b981; padding-left: 10px; margin-top: 35px; margin-bottom: 15px; font-weight: bold; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background-color: #f8fafc; color: #475569; font-weight: bold; text-align: left; padding: 12px 10px; border-bottom: 2px solid #e2e8f0; border-top: 1px solid #e2e8f0; font-size: 11px; text-transform: uppercase; }
            td { padding: 10px; border-bottom: 1px solid #f1f5f9; font-size: 12px; color: #334155; }
            .amount { font-weight: bold; text-align: right; }
            th.amount { text-align: right; }
            .summary-container { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 30px; }
            .summary-card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; text-align: center; }
            .summary-label { font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700; margin-bottom: 5px; }
            .summary-value { font-size: 20px; font-weight: 800; color: #0f172a; }
            .summary-value.positive { color: #10b981; }
            .summary-value.negative { color: #ef4444; }
            .btn-print { background-color: #10b981; color: white; border: none; padding: 12px 24px; font-size: 14px; font-weight: bold; border-radius: 8px; cursor: pointer; display: block; margin: 0 auto 30px auto; }
            @media print {
              .btn-print { display: none; }
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <button class="btn-print" onclick="window.print()">Print / Save PDF Report</button>
          <h1>🌾 AgriRentGov Financial & Operations Report</h1>
          <div class="hub-title">Cooperative Hub: Ludhiana Central Hub #1</div>
          
          <div class="report-meta">
            <div>
              <strong>Report Period:</strong> ${billingReport.period.from} to ${billingReport.period.to}<br>
              <strong>Status:</strong> State Cooperative Audited Ledger
            </div>
            <div>
              <strong>Generation Date:</strong> ${new Date().toLocaleDateString()}<br>
              <strong>Generated By:</strong> Cooperative Manager / Staff
            </div>
          </div>
          
          <div class="section-title">Financial Summary</div>
          <div class="summary-container">
            <div class="summary-card">
              <div class="summary-label">Total Bookings</div>
              <div class="summary-value">${summary.totalBookings}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Completed Jobs</div>
              <div class="summary-value">${summary.completedJobs}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Cancelled Bookings</div>
              <div class="summary-value">${summary.cancelledBookings}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Total Rental Revenue</div>
              <div class="summary-value positive">₹${summary.totalRentalRevenue.toLocaleString()}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Total Salaried Staff Payroll</div>
              <div class="summary-value negative">₹${summary.totalOperatorCost.toLocaleString()}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Total Maintenance Cost</div>
              <div class="summary-value negative">₹${summary.totalMaintenanceCost.toLocaleString()}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Net Cooperative Revenue</div>
              <div class="summary-value positive" style="color: ${summary.netRevenue >= 0 ? '#10b981' : '#ef4444'}">₹${summary.netRevenue.toLocaleString()}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Total Amount Collected</div>
              <div class="summary-value positive">₹${summary.totalAmountCollected.toLocaleString()}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Pending Collectibles</div>
              <div class="summary-value negative">₹${summary.pendingAmount.toLocaleString()}</div>
            </div>
          </div>
          
          <div class="section-title">Booking Details</div>
          <table>
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Farmer Name</th>
                <th>Farmer ID</th>
                <th>Equipment Name</th>
                <th>Cooperative</th>
                <th>Work Date</th>
                <th>Status</th>
                <th class="amount">Base Amt</th>
              </tr>
            </thead>
            <tbody>
              ${bookings.map(b => `
                <tr>
                  <td>${b.bookingId}</td>
                  <td>${b.farmerName}</td>
                  <td>${b.farmerId}</td>
                  <td>${b.equipmentName}</td>
                  <td>${b.cooperative}</td>
                  <td>${new Date(b.workDate).toLocaleDateString()}</td>
                  <td>${b.bookingStatus}</td>
                  <td class="amount">₹${b.baseRentalAmount.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="section-title">Salaried Staff Payroll Expense Statement</div>
          <table>
            <thead>
              <tr>
                <th>Staff Name</th>
                <th>Role</th>
                <th>Monthly Salary</th>
                <th>Prorated Days</th>
                <th class="amount">Period Payroll Cost</th>
              </tr>
            </thead>
            <tbody>
              ${operatorCosts.map(oc => `
                <tr>
                  <td>${oc.operatorName}</td>
                  <td>Equipment Operator</td>
                  <td>₹${oc.monthlySalary.toLocaleString()}/mo</td>
                  <td>${billingReport.period?.days || 30} days</td>
                  <td class="amount">₹${oc.totalCost.toLocaleString()}</td>
                </tr>
              `).join('')}
              ${(billingReport.specialistCosts || []).map(sc => `
                <tr>
                  <td>${sc.specialistName}</td>
                  <td>Maintenance Specialist</td>
                  <td>₹${sc.monthlySalary.toLocaleString()}/mo</td>
                  <td>${billingReport.period?.days || 30} days</td>
                  <td class="amount">₹${sc.totalCost.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="section-title">Equipment Maintenance Expenses</div>
          <table>
            <thead>
              <tr>
                <th>Equipment Name</th>
                <th>Reg Number</th>
                <th>Maintenance Date</th>
                <th>Type</th>
                <th>Specialist</th>
                <th>Parts Cost</th>
                <th>Labour Cost</th>
                <th class="amount">Total Cost</th>
              </tr>
            </thead>
            <tbody>
              ${maintenanceCosts.map(m => `
                <tr>
                  <td>${m.equipmentName}</td>
                  <td>${m.equipmentReg}</td>
                  <td>${new Date(m.maintenanceDate).toLocaleDateString()}</td>
                  <td>${m.maintenanceType}</td>
                  <td>${m.specialist}</td>
                  <td>₹${m.partsCost.toLocaleString()}</td>
                  <td>₹${m.labourCost.toLocaleString()}</td>
                  <td class="amount">₹${m.totalCost.toLocaleString()}</td>
                </tr>
              `).join('')}
              ${maintenanceCosts.length === 0 ? '<tr><td colspan="8" style="text-align: center; color: #64748b;">No maintenance expenses in this period.</td></tr>' : ''}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadExcel = () => {
    if (!billingReport) return;
    const { summary, bookings, operatorCosts, maintenanceCosts } = billingReport;
    
    let xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
  <Worksheet ss:Name="Summary">
    <Table>
      <Row><Cell><Data ss:Type="String">Financial Summary</Data></Cell></Row>
      <Row><Cell><Data ss:Type="String">Period:</Data></Cell><Cell><Data ss:Type="String">${billingReport.period.from} to ${billingReport.period.to}</Data></Cell></Row>
      <Row><Cell><Data ss:Type="String">Total Bookings</Data></Cell><Cell><Data ss:Type="Number">${summary.totalBookings}</Data></Cell></Row>
      <Row><Cell><Data ss:Type="String">Completed Jobs</Data></Cell><Cell><Data ss:Type="Number">${summary.completedJobs}</Data></Cell></Row>
      <Row><Cell><Data ss:Type="String">Cancelled Bookings</Data></Cell><Cell><Data ss:Type="Number">${summary.cancelledBookings}</Data></Cell></Row>
      <Row><Cell><Data ss:Type="String">Total Rental Revenue</Data></Cell><Cell><Data ss:Type="Number">${summary.totalRentalRevenue}</Data></Cell></Row>
      <Row><Cell><Data ss:Type="String">Total Salaried Staff Payroll</Data></Cell><Cell><Data ss:Type="Number">${summary.totalOperatorCost}</Data></Cell></Row>
      <Row><Cell><Data ss:Type="String">Total Maintenance Cost</Data></Cell><Cell><Data ss:Type="Number">${summary.totalMaintenanceCost}</Data></Cell></Row>
      <Row><Cell><Data ss:Type="String">Total Penalties</Data></Cell><Cell><Data ss:Type="Number">${summary.totalPenalties}</Data></Cell></Row>
      <Row><Cell><Data ss:Type="String">Total Taxes</Data></Cell><Cell><Data ss:Type="Number">${summary.totalTaxes}</Data></Cell></Row>
      <Row><Cell><Data ss:Type="String">Net Revenue</Data></Cell><Cell><Data ss:Type="Number">${summary.netRevenue}</Data></Cell></Row>
      <Row><Cell><Data ss:Type="String">Total Amount Collected</Data></Cell><Cell><Data ss:Type="Number">${summary.totalAmountCollected}</Data></Cell></Row>
      <Row><Cell><Data ss:Type="String">Pending Amount</Data></Cell><Cell><Data ss:Type="Number">${summary.pendingAmount}</Data></Cell></Row>
    </Table>
  </Worksheet>
  
  <Worksheet ss:Name="Bookings">
    <Table>
      <Row>
        <Cell><Data ss:Type="String">Booking ID</Data></Cell>
        <Cell><Data ss:Type="String">Farmer Name</Data></Cell>
        <Cell><Data ss:Type="String">Farmer ID</Data></Cell>
        <Cell><Data ss:Type="String">Equipment Name</Data></Cell>
        <Cell><Data ss:Type="String">Cooperative Hub</Data></Cell>
        <Cell><Data ss:Type="String">Booking Date</Data></Cell>
        <Cell><Data ss:Type="String">Rental Rate</Data></Cell>
        <Cell><Data ss:Type="String">Base Amount</Data></Cell>
        <Cell><Data ss:Type="String">Status</Data></Cell>
      </Row>
      ${bookings.map(b => `
      <Row>
        <Cell><Data ss:Type="String">${b.bookingId}</Data></Cell>
        <Cell><Data ss:Type="String">${b.farmerName}</Data></Cell>
        <Cell><Data ss:Type="String">${b.farmerId}</Data></Cell>
        <Cell><Data ss:Type="String">${b.equipmentName}</Data></Cell>
        <Cell><Data ss:Type="String">${b.cooperative}</Data></Cell>
        <Cell><Data ss:Type="String">${new Date(b.bookingDate).toLocaleDateString()}</Data></Cell>
        <Cell><Data ss:Type="Number">${b.equipmentRentalCost}</Data></Cell>
        <Cell><Data ss:Type="Number">${b.baseRentalAmount}</Data></Cell>
        <Cell><Data ss:Type="String">${b.bookingStatus}</Data></Cell>
      </Row>`).join('')}
    </Table>
  </Worksheet>

  <Worksheet ss:Name="Staff Payroll">
    <Table>
      <Row>
        <Cell><Data ss:Type="String">Staff Name</Data></Cell>
        <Cell><Data ss:Type="String">Role</Data></Cell>
        <Cell><Data ss:Type="String">Monthly Salary</Data></Cell>
        <Cell><Data ss:Type="String">Prorated Days</Data></Cell>
        <Cell><Data ss:Type="String">Period Cost</Data></Cell>
      </Row>
      ${operatorCosts.map(oc => `
      <Row>
        <Cell><Data ss:Type="String">${oc.operatorName}</Data></Cell>
        <Cell><Data ss:Type="String">Equipment Operator</Data></Cell>
        <Cell><Data ss:Type="Number">${oc.monthlySalary}</Data></Cell>
        <Cell><Data ss:Type="Number">${billingReport.period?.days || 30}</Data></Cell>
        <Cell><Data ss:Type="Number">${oc.totalCost}</Data></Cell>
      </Row>`).join('')}
      ${(billingReport.specialistCosts || []).map(sc => `
      <Row>
        <Cell><Data ss:Type="String">${sc.specialistName}</Data></Cell>
        <Cell><Data ss:Type="String">Maintenance Specialist</Data></Cell>
        <Cell><Data ss:Type="Number">${sc.monthlySalary}</Data></Cell>
        <Cell><Data ss:Type="Number">${billingReport.period?.days || 30}</Data></Cell>
        <Cell><Data ss:Type="Number">${sc.totalCost}</Data></Cell>
      </Row>`).join('')}
    </Table>
  </Worksheet>

  <Worksheet ss:Name="Maintenance Costs">
    <Table>
      <Row>
        <Cell><Data ss:Type="String">Equipment Name</Data></Cell>
        <Cell><Data ss:Type="String">Equipment Reg</Data></Cell>
        <Cell><Data ss:Type="String">Date</Data></Cell>
        <Cell><Data ss:Type="String">Type</Data></Cell>
        <Cell><Data ss:Type="String">Parts Cost</Data></Cell>
        <Cell><Data ss:Type="String">Labour Cost</Data></Cell>
        <Cell><Data ss:Type="String">Total Cost</Data></Cell>
        <Cell><Data ss:Type="String">Specialist</Data></Cell>
        <Cell><Data ss:Type="String">Status</Data></Cell>
      </Row>
      ${maintenanceCosts.map(m => `
      <Row>
        <Cell><Data ss:Type="String">${m.equipmentName}</Data></Cell>
        <Cell><Data ss:Type="String">${m.equipmentReg}</Data></Cell>
        <Cell><Data ss:Type="String">${new Date(m.maintenanceDate).toLocaleDateString()}</Data></Cell>
        <Cell><Data ss:Type="String">${m.maintenanceType}</Data></Cell>
        <Cell><Data ss:Type="Number">${m.partsCost}</Data></Cell>
        <Cell><Data ss:Type="Number">${m.labourCost}</Data></Cell>
        <Cell><Data ss:Type="Number">${m.totalCost}</Data></Cell>
        <Cell><Data ss:Type="String">${m.specialist}</Data></Cell>
        <Cell><Data ss:Type="String">${m.status}</Data></Cell>
      </Row>`).join('')}
    </Table>
  </Worksheet>

  <Worksheet ss:Name="Payments">
    <Table>
      <Row>
        <Cell><Data ss:Type="String">Invoice Number</Data></Cell>
        <Cell><Data ss:Type="String">Booking ID</Data></Cell>
        <Cell><Data ss:Type="String">Farmer Name</Data></Cell>
        <Cell><Data ss:Type="String">Amount</Data></Cell>
        <Cell><Data ss:Type="String">Tax (GST)</Data></Cell>
        <Cell><Data ss:Type="String">Penalty</Data></Cell>
        <Cell><Data ss:Type="String">Grand Total</Data></Cell>
        <Cell><Data ss:Type="String">Status</Data></Cell>
        <Cell><Data ss:Type="String">Payment Date</Data></Cell>
      </Row>
      ${bookings.map(b => `
      <Row>
        <Cell><Data ss:Type="String">${b.invoiceNumber}</Data></Cell>
        <Cell><Data ss:Type="String">${b.bookingId}</Data></Cell>
        <Cell><Data ss:Type="String">${b.farmerName}</Data></Cell>
        <Cell><Data ss:Type="Number">${b.baseRentalAmount}</Data></Cell>
        <Cell><Data ss:Type="Number">${b.tax}</Data></Cell>
        <Cell><Data ss:Type="Number">${b.penalty}</Data></Cell>
        <Cell><Data ss:Type="Number">${b.totalAmount}</Data></Cell>
        <Cell><Data ss:Type="String">${b.paymentStatus}</Data></Cell>
        <Cell><Data ss:Type="String">${new Date(b.paymentDate).toLocaleDateString()}</Data></Cell>
      </Row>`).join('')}
    </Table>
  </Worksheet>
</Workbook>`;

    const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `billing_report_${billingReport.period.from}_to_${billingReport.period.to}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Excel report downloaded successfully!');
  };

  return (
    <CoopStaffLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onLogout={onLogout}
      onOpenAddModal={() => setIsAddOpen(true)}
    >
      <Toaster position="top-right" />
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
        <div style={{ maxWidth: '1200px', margin: '0 auto', color: '#cbd5e1' }}>
          <span className="section-tag">COOPERATIVE DISPATCH</span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '1.5rem' }}>
            Farmer Rental Applications
          </h1>
          <div style={{ backgroundColor: '#131d35', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Farmer</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Equipment</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Start Date</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Duration</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Total Cost</th>
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
                    <td style={{ padding: '0.75rem 1rem' }}>{bk.durationDays} Days</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#10b981', fontWeight: 700 }}>₹{bk.totalAmount}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '6px',
                        backgroundColor: bk.status === 'Pending' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                        color: bk.status === 'Pending' ? '#f59e0b' : '#10b981',
                        fontWeight: 700
                      }}>
                        {bk.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      {bk.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleApproveBooking(bk._id || bk.id)}
                            style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', marginRight: '0.5rem', fontWeight: 700 }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectBooking(bk._id || bk.id)}
                            style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'farmers' && (
        <div style={{ maxWidth: '1200px', margin: '0 auto', color: '#cbd5e1' }}>
          <span className="section-tag">COOPERATIVE MEMBERS</span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '1.5rem' }}>
            Registered Farmers
          </h1>
          <div style={{ backgroundColor: '#131d35', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Name</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Email</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Mobile</th>
                  <th style={{ padding: '0.75rem 1rem' }}>District</th>
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
                    <td style={{ padding: '0.75rem 1rem' }}>{f.district}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '6px',
                        backgroundColor: f.isApproved ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        color: f.isApproved ? '#10b981' : '#ef4444',
                        fontWeight: 700
                      }}>
                        {f.isApproved ? 'Approved' : 'Pending Approval'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      {!f.isApproved && (
                        <button
                          onClick={() => handleApproveFarmer(f._id || f.id)}
                          style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}
                        >
                          Approve Farmer
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

      {activeTab === 'invoices' && (
        <div style={{ maxWidth: '1200px', margin: '0 auto', color: '#cbd5e1' }}>
          <span className="section-tag">FINANCES</span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '1.5rem' }}>
            Billing & Invoices
          </h1>
          <div style={{ backgroundColor: '#131d35', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Invoice Number</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Farmer</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Tax (18% GST)</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Total Amount</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv._id || inv.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>{inv.invoiceNumber}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ display: 'block', fontWeight: 600 }}>{inv.booking?.farmer?.name || 'Farmer'}</span>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{inv.booking?.equipment?.name}</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>₹{inv.tax}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#10b981', fontWeight: 800 }}>₹{inv.totalAmount}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(16,185,129,0.1)',
                        color: '#10b981',
                        fontWeight: 700
                      }}>✓ Paid at Booking</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'feedback' && (
        <div style={{ maxWidth: '1200px', margin: '0 auto', color: '#cbd5e1' }}>
          <span className="section-tag">FEEDBACK LEDGER</span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '1.5rem' }}>
            Farmer Feedback & Reviews
          </h1>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginBottom: '2rem' }}>
            <div style={{ backgroundColor: '#131d35', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.5rem' }}>Average Rating</span>
              <span style={{ fontSize: '3.5rem', fontWeight: 800, color: '#f59e0b', lineHeight: 1 }}>
                {(feedbacks.reduce((sum, f) => sum + f.rating, 0) / (feedbacks.length || 1)).toFixed(1)}
              </span>
              <div style={{ display: 'flex', gap: '2px', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                {Array.from({ length: 5 }, (_, i) => {
                  const avg = feedbacks.reduce((sum, f) => sum + f.rating, 0) / (feedbacks.length || 1);
                  return <Star key={i} size={18} fill={i < Math.round(avg) ? '#f59e0b' : 'none'} color="#f59e0b" />;
                })}
              </div>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Based on {feedbacks.length} Reviews</span>
            </div>

            <div style={{ backgroundColor: '#131d35', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '0.6rem', justifyContent: 'center' }}>
              {[5, 4, 3, 2, 1].map(stars => {
                const count = feedbacks.filter(f => f.rating === stars).length;
                const pct = feedbacks.length ? (count / feedbacks.length) * 100 : 0;
                return (
                  <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem' }}>
                    <span style={{ width: '45px', color: '#94a3b8', fontWeight: 600 }}>{stars} Stars</span>
                    <div style={{ flexGrow: 1, height: '8px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, backgroundColor: '#f59e0b', borderRadius: '99px' }} />
                    </div>
                    <span style={{ width: '40px', textAlign: 'right', color: '#ffffff', fontWeight: 700 }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ backgroundColor: '#131d35', padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: 700 }}>Filter Rating</label>
              <select value={filterRating} onChange={(e) => setFilterRating(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
                <option value="All">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: 700 }}>Filter Equipment</label>
              <select value={filterEquipment} onChange={(e) => setFilterEquipment(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
                <option value="All">All Equipment</option>
                {Array.from(new Set(feedbacks.map(f => f.booking?.equipment?.name).filter(Boolean))).map(eq => (
                  <option key={eq} value={eq}>{eq}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: 700 }}>Filter Operator</label>
              <select value={filterOperator} onChange={(e) => setFilterOperator(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
                <option value="All">All Operators</option>
                {Array.from(new Set(feedbacks.map(f => f.operatorName).filter(Boolean))).map(op => (
                  <option key={op} value={op}>{op}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: 700 }}>Farmer Search</label>
              <input type="text" placeholder="Search farmer name..." value={filterFarmer} onChange={(e) => setFilterFarmer(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: 700 }}>Filter Date</label>
              <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>
          </div>

          <div style={{ backgroundColor: '#131d35', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Farmer</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Booking ID</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Equipment</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Operator</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Ratings</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Farmer Comment & Operator Feedback</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {feedbacks
                  .filter(f => {
                    if (filterRating !== 'All' && f.rating !== parseInt(filterRating)) return false;
                    if (filterEquipment !== 'All' && f.booking?.equipment?.name !== filterEquipment) return false;
                    if (filterOperator !== 'All' && f.operatorName !== filterOperator) return false;
                    if (filterFarmer && !f.farmer?.name?.toLowerCase().includes(filterFarmer.toLowerCase())) return false;
                    if (filterDate && new Date(f.createdAt).toLocaleDateString() !== new Date(filterDate).toLocaleDateString()) return false;
                    return true;
                  })
                  .map((f) => (
                    <tr key={f._id || f.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#cbd5e1' }}>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{ fontWeight: 700, color: '#ffffff', display: 'block' }}>{f.farmer?.name}</span>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ID: {f.farmer?.farmerId || 'N/A'}</span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace' }}>{f.booking?._id?.toString()?.substr(-6) || f.booking?.id?.toString()?.substr(-6)}</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{f.booking?.equipment?.name}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>{f.operatorName || 'N/A'}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 700 }}>Overall: {f.rating}★</span>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Equipment: {f.equipmentRating || f.rating}★</span>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Service: {f.serviceRating || f.rating}★</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem' }}>
                        <div style={{ color: '#ffffff', fontWeight: 500 }}>"{f.comments || 'No comment provided.'}"</div>
                        {f.operatorFeedback && (
                          <div style={{ fontSize: '0.75rem', color: '#38bdf8', marginTop: '4px' }}>Operator feedback: "{f.operatorFeedback}"</div>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#94a3b8' }}>
                        {new Date(f.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                {feedbacks.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                      No feedback submissions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div style={{ maxWidth: '1200px', margin: '0 auto', color: '#cbd5e1' }}>
          <span className="section-tag">COOPERATIVE LEDGER</span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '1.5rem' }}>
            Billing & Invoices Financial Reports
          </h1>

          <div style={{ backgroundColor: '#131d35', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '2rem' }}>
            <form onSubmit={handleGenerateReport} style={{ display: 'flex', alignItems: 'flex-end', gap: '1.5rem' }}>
              <div style={{ flexGrow: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 700 }}>From Date</label>
                <input type="date" required value={reportFromDate} onChange={(e) => setReportFromDate(e.target.value)} style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
              <div style={{ flexGrow: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 700 }}>To Date</label>
                <input type="date" required value={reportToDate} onChange={(e) => setReportToDate(e.target.value)} style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
              <button type="submit" disabled={reportLoading} className="btn-green" style={{ padding: '0.65rem 1.8rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', height: '42px', fontSize: '0.9rem' }}>
                {reportLoading ? 'Generating...' : 'Generate Report'}
              </button>
            </form>
          </div>

          {billingReport ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button onClick={handleDownloadPDF} style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Printer size={16} />
                  <span>Download PDF</span>
                </button>
                <button onClick={handleDownloadExcel} style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Download size={16} />
                  <span>Download Excel</span>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                <div style={{ backgroundColor: '#131d35', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: 700 }}>Total Bookings / Completed / Cancelled</span>
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }}>
                    {billingReport.summary.totalBookings} / {billingReport.summary.completedJobs} / {billingReport.summary.cancelledBookings}
                  </span>
                </div>
                <div style={{ backgroundColor: '#131d35', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: 700 }}>Total Rental Revenue</span>
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981' }}>₹{billingReport.summary.totalRentalRevenue.toLocaleString()}</span>
                </div>
                <div style={{ backgroundColor: '#131d35', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: 700 }}>Total Staff Payroll</span>
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f87171' }}>₹{billingReport.summary.totalOperatorCost.toLocaleString()}</span>
                </div>
                <div style={{ backgroundColor: '#131d35', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: 700 }}>Total Maintenance Cost</span>
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f87171' }}>₹{billingReport.summary.totalMaintenanceCost.toLocaleString()}</span>
                </div>
                <div style={{ backgroundColor: '#131d35', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', borderLeft: '4px solid #10b981' }}>
                  <span style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: 700 }}>Net Cooperative Revenue</span>
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981' }}>₹{billingReport.summary.netRevenue.toLocaleString()}</span>
                </div>
                <div style={{ backgroundColor: '#131d35', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: 700 }}>Collected vs Pending</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>
                    <span style={{ color: '#10b981' }}>₹{billingReport.summary.totalAmountCollected.toLocaleString()}</span> / <span style={{ color: '#f87171' }}>₹{billingReport.summary.pendingAmount.toLocaleString()}</span>
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ backgroundColor: '#131d35', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '1.25rem' }}>Booking & Billing History</h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', textAlign: 'left' }}>
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
                          <tr key={b.bookingId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#cbd5e1' }}>
                            <td style={{ padding: '0.65rem 0.5rem', fontFamily: 'monospace' }}>{b.bookingId?.substr(-6)}</td>
                            <td style={{ padding: '0.65rem 0.5rem' }}>
                              <span style={{ fontWeight: 700, color: '#ffffff', display: 'block' }}>{b.farmerName}</span>
                              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ID: {b.farmerId}</span>
                            </td>
                            <td style={{ padding: '0.65rem 0.5rem' }}>
                              <span style={{ display: 'block', fontWeight: 600 }}>{b.equipmentName}</span>
                              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Reg: {b.equipmentReg}</span>
                            </td>
                            <td style={{ padding: '0.65rem 0.5rem' }}>{b.operatorName}</td>
                            <td style={{ padding: '0.65rem 0.5rem' }}>
                              <span style={{ display: 'block' }}>Work: {new Date(b.workDate).toLocaleDateString()}</span>
                              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Booked: {new Date(b.bookingDate).toLocaleDateString()}</span>
                            </td>
                            <td style={{ padding: '0.65rem 0.5rem' }}>
                              <span style={{ display: 'block', fontWeight: 600 }}>{b.invoiceNumber}</span>
                              <span style={{ fontSize: '0.75rem', color: b.paymentStatus === 'Paid' ? '#10b981' : '#f87171' }}>{b.paymentStatus}</span>
                            </td>
                            <td style={{ padding: '0.65rem 0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                              <div>Rate: ₹{b.equipmentRentalCost}/day</div>
                              <div>Base: ₹{b.baseRentalAmount}</div>
                              {b.penalty > 0 && <div style={{ color: '#f87171' }}>Penalty: +₹{b.penalty}</div>}
                              <div>Tax: +₹{b.tax}</div>
                            </td>
                            <td style={{ padding: '0.65rem 0.5rem', textAlign: 'right', fontWeight: 800, color: '#10b981' }}>₹{b.totalAmount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div style={{ backgroundColor: '#131d35', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '1.25rem' }}>Salaried Staff Payroll Statement</h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', textAlign: 'left' }}>
                          <th>Staff Name</th>
                          <th>Role</th>
                          <th>Monthly Salary</th>
                          <th>Prorated Days</th>
                          <th style={{ textAlign: 'right' }}>Period Payroll Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {billingReport.operatorCosts.map((oc, index) => (
                          <tr key={'op-' + index} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#cbd5e1' }}>
                            <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#ffffff' }}>{oc.operatorName}</td>
                            <td style={{ padding: '0.75rem 1rem' }}>Equipment Operator</td>
                            <td style={{ padding: '0.75rem 1rem' }}>₹{oc.monthlySalary.toLocaleString()}/mo</td>
                            <td style={{ padding: '0.75rem 1rem' }}>{billingReport.period?.days || 30} days</td>
                            <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 800, color: '#f87171' }}>₹{oc.totalCost.toLocaleString()}</td>
                          </tr>
                        ))}
                        {(billingReport.specialistCosts || []).map((sc, index) => (
                          <tr key={'sp-' + index} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#cbd5e1' }}>
                            <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#ffffff' }}>{sc.specialistName}</td>
                            <td style={{ padding: '0.75rem 1rem' }}>Maintenance Specialist</td>
                            <td style={{ padding: '0.75rem 1rem' }}>₹{sc.monthlySalary.toLocaleString()}/mo</td>
                            <td style={{ padding: '0.75rem 1rem' }}>{billingReport.period?.days || 30} days</td>
                            <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 800, color: '#f87171' }}>₹{sc.totalCost.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div style={{ backgroundColor: '#131d35', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '1.25rem' }}>Equipment Maintenance Log Details</h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', textAlign: 'left' }}>
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
                          <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#cbd5e1' }}>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <span style={{ fontWeight: 700, color: '#ffffff', display: 'block' }}>{m.equipmentName}</span>
                              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ID: {m.equipmentId}</span>
                            </td>
                            <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{m.equipmentReg}</td>
                            <td style={{ padding: '0.75rem 1rem' }}>{new Date(m.maintenanceDate).toLocaleDateString()}</td>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <span style={{ display: 'block', fontWeight: 600, color: '#38bdf8' }}>{m.maintenanceType}</span>
                              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{m.maintenanceDescription}</span>
                            </td>
                            <td style={{ padding: '0.75rem 1rem' }}>{m.specialist}</td>
                            <td style={{ padding: '0.75rem 1rem' }}>₹{m.partsCost}</td>
                            <td style={{ padding: '0.75rem 1rem' }}>₹{m.labourCost}</td>
                            <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 800, color: '#f87171' }}>₹{m.totalCost}</td>
                          </tr>
                        ))}
                        {billingReport.maintenanceCosts.length === 0 && (
                          <tr>
                            <td colSpan="8" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                              No maintenance records registered in this period.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ backgroundColor: '#131d35', padding: '4rem 2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center', color: '#94a3b8' }}>
              Please select a custom reporting period from the fields above and click "Generate Report".
            </div>
          )}
        </div>
      )}

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

      {/* Equipment Details Modal */}
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

      {/* Maintenance modal – shows all units of the selected equipment type */}
      {maintItem && (() => {
        const units = maintItem.units && maintItem.units.length > 0 ? maintItem.units : generateUnits(maintItem);
        const availableUnits = units.filter(u => u.status === 'Available');
        return (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <div style={{ backgroundColor: '#131d35', padding: '2rem', borderRadius: '16px', maxWidth: '600px', width: '100%', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '90vh', overflowY: 'auto' }}>
              <h3 style={{ marginBottom: '0.5rem', color: '#ef4444', fontSize: '1.25rem', fontWeight: 800 }}>Send to Maintenance</h3>
              <div style={{ marginBottom: '0.75rem', fontSize: '0.9rem', color: '#94a3b8', fontWeight: 700 }}>
                Equipment: <span style={{ color: '#fff' }}>{maintItem.name}</span> &bull; Type: <span style={{ color: '#38bdf8' }}>{maintItem.category}</span>
              </div>

              {/* Unit Selection */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: '#cbd5e1', fontWeight: 700 }}>Select a Unit to Send for Maintenance *</label>
                {availableUnits.length === 0 ? (
                  <div style={{ padding: '1rem', backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', color: '#f87171', textAlign: 'center', fontSize: '0.88rem' }}>
                    No available units for this equipment type. All units are currently rented, reserved, or already under maintenance.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                    {availableUnits.map(unit => {
                      const isSelected = selectedUnit && selectedUnit.unitNum === unit.unitNum;
                      return (
                        <div
                          key={unit.unitNum}
                          onClick={() => setSelectedUnit(unit)}
                          style={{
                            padding: '0.7rem',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            border: isSelected ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                            backgroundColor: isSelected ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.03)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <div style={{ fontWeight: 700, color: isSelected ? '#10b981' : '#fff', fontSize: '0.82rem' }}>Unit #{unit.unitNum}</div>
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>{unit.serial}</div>
                          <div style={{ fontSize: '0.72rem', color: '#38bdf8', marginTop: '2px', fontWeight: 600 }}>{unit.hours} hrs</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Reason textarea (only show if a unit is selected) */}
              {selectedUnit && (
                <form onSubmit={handleScheduleMaintSubmit}>
                  <div style={{ marginBottom: '0.5rem', padding: '0.6rem 0.8rem', backgroundColor: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px', fontSize: '0.82rem', color: '#10b981', fontWeight: 600 }}>
                    Selected: Unit #{selectedUnit.unitNum} — {selectedUnit.serial} ({selectedUnit.hours} hrs)
                  </div>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: '#cbd5e1', fontWeight: 600 }}>Reason / Service Details (Explain the issue) *</label>
                    <textarea required placeholder="Describe the fault or service needed..." value={maintDesc} onChange={(e) => setMaintDesc(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', minHeight: '80px', outline: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <button type="submit" style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}>Confirm Maintenance</button>
                    <button type="button" onClick={() => { setMaintItem(null); setSelectedUnit(null); }} style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                  </div>
                </form>
              )}

              {/* Cancel button when no unit selected */}
              {!selectedUnit && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button type="button" onClick={() => { setMaintItem(null); setSelectedUnit(null); }} style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </CoopStaffLayout>
  );
}
