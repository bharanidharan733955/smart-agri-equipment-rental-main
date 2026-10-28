// src/components/farmer/FarmerBookingsView.jsx
import React, { useState } from 'react';
import { Star, FileText, MessageSquare, Printer, X } from 'lucide-react';
import { submitFarmerFeedback } from '../../api';
import toast from 'react-hot-toast';

export default function FarmerBookingsView({ bookingsList, onCancelBooking, user }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [feedbackBooking, setFeedbackBooking] = useState(null);
  const [overallRating, setOverallRating] = useState(5);
  const [equipRating, setEquipRating] = useState(5);
  const [servRating, setServRating] = useState(5);
  const [feedbackComments, setFeedbackComments] = useState('');
  const [operatorFeedback, setOperatorFeedback] = useState('');

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackBooking) return;
    const bookingId = feedbackBooking._id || feedbackBooking.id;
    const res = await submitFarmerFeedback(
      bookingId,
      overallRating,
      feedbackComments,
      equipRating,
      servRating,
      operatorFeedback
    );
    if (res.success) {
      toast.success('Thank you! Feedback submitted successfully.');
      setFeedbackBooking(null);
      setOverallRating(5);
      setEquipRating(5);
      setServRating(5);
      setFeedbackComments('');
      setOperatorFeedback('');
    } else {
      toast.error('Failed to submit feedback.');
    }
  };

  const handleViewInvoice = (booking) => {
    const isFinal = booking.isFinalBilled || booking.status === 'Returned';
    const tentative = booking.tentativeBill || {
      baseAmount: (booking.rentalRate || 1800) * (booking.durationDays || 1),
      estimatedFuelLiters: (booking.durationDays || 1) * 6.0,
      fuelType: 'Diesel',
      fuelPricePerLiter: 95,
      estimatedFuelCost: Math.round((booking.durationDays || 1) * 6.0 * 95),
      tax: Math.round(((booking.rentalRate || 1800) * (booking.durationDays || 1) + (booking.durationDays || 1) * 6.0 * 95) * 0.18),
      tentativeTotal: booking.totalAmount
    };

    const final = booking.finalBill || (isFinal ? {
      baseAmount: tentative.baseAmount,
      actualFuelLiters: booking.jobDetails?.fuelUsed || tentative.estimatedFuelLiters,
      fuelType: booking.jobDetails?.fuelType || tentative.fuelType || 'Diesel',
      fuelPricePerLiter: tentative.fuelPricePerLiter || 95,
      actualFuelCost: Math.round((booking.jobDetails?.fuelUsed || tentative.estimatedFuelLiters) * (tentative.fuelPricePerLiter || 95)),
      fuelAdjustment: Math.round((booking.jobDetails?.fuelUsed || tentative.estimatedFuelLiters) * (tentative.fuelPricePerLiter || 95)) - tentative.estimatedFuelCost,
      tax: Math.round((tentative.baseAmount + (booking.jobDetails?.fuelUsed || tentative.estimatedFuelLiters) * 95) * 0.18),
      totalAmount: booking.totalAmount
    } : null);

    const invoiceNum = booking.invoiceNumber || `INV-${booking._id?.toString()?.substr(-6)?.toUpperCase() || 'TEMP'}`;

    // Resolve Farmer details with comprehensive fallbacks
    const farmerObj = (typeof booking.farmer === 'object' && booking.farmer !== null) ? booking.farmer : null;
    const sessionUser = user || JSON.parse(localStorage.getItem('agrirent_user') || '{}');

    const farmerName = booking.farmerName || farmerObj?.name || sessionUser.name || 'Registered Farmer';
    const farmerId = booking.farmerId || farmerObj?.farmerId || sessionUser.farmerId || 'GOV-FARMER-1001';
    const farmerMobile = booking.farmerMobile || farmerObj?.mobile || sessionUser.mobile || '9876543210';
    const farmerLocation = booking.farmerDistrict || farmerObj?.district || sessionUser.district || booking.location || 'Tamil Nadu';

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>AGRIX Customer Tax Invoice - ${invoiceNum}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
              color: #0f172a;
              background-color: #f8fafc;
              padding: 36px 20px;
              line-height: 1.5;
              -webkit-font-smoothing: antialiased;
            }
            .invoice-wrapper {
              max-width: 860px;
              margin: 0 auto;
              background: #ffffff;
              border-radius: 20px;
              border: 1px solid #e2e8f0;
              box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.05), 0 8px 10px -6px rgba(15, 23, 42, 0.03);
              padding: 40px;
            }
            .btn-print {
              background: #0f172a;
              color: #ffffff;
              border: none;
              padding: 10px 24px;
              font-size: 13px;
              font-weight: 700;
              border-radius: 10px;
              cursor: pointer;
              transition: all 0.2s ease;
              display: inline-flex;
              align-items: center;
              gap: 8px;
              box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
              margin: 0 auto 24px auto;
            }
            .btn-print:hover {
              background: #1e293b;
              transform: translateY(-1px);
            }
            .btn-container {
              text-align: center;
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
              font-size: 12px;
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
            .invoice-title {
              font-size: 26px;
              font-weight: 800;
              color: #0f172a;
              margin: 10px 0 4px 0;
              letter-spacing: -0.02em;
            }
            .invoice-subtitle {
              font-size: 13px;
              color: #64748b;
              font-weight: 500;
            }
            .badge-status {
              display: inline-flex;
              align-items: center;
              gap: 6px;
              padding: 6px 14px;
              border-radius: 999px;
              font-size: 12px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            .badge-final {
              background: #ecfdf5;
              color: #047857;
              border: 1px solid #a7f3d0;
            }
            .badge-tentative {
              background: #fffbeb;
              color: #b45309;
              border: 1px solid #fde68a;
            }
            .invoice-meta-box {
              text-align: right;
            }
            .invoice-num-text {
              font-family: monospace;
              font-size: 14px;
              font-weight: 700;
              color: #0f172a;
              margin-top: 8px;
            }
            .meta-cards-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 16px;
              margin-bottom: 28px;
            }
            .info-card {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 14px;
              padding: 18px 20px;
            }
            .info-card-label {
              font-size: 11px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.06em;
              color: #64748b;
              margin-bottom: 8px;
              display: flex;
              align-items: center;
              gap: 6px;
            }
            .info-card-name {
              font-size: 16px;
              font-weight: 700;
              color: #0f172a;
              margin-bottom: 4px;
            }
            .info-card-detail {
              font-size: 12.5px;
              color: #475569;
              line-height: 1.5;
            }
            .farmer-id-pill {
              display: inline-block;
              background: #dbeafe;
              color: #1e40af;
              font-size: 11px;
              font-weight: 700;
              padding: 2px 8px;
              border-radius: 6px;
              margin-top: 4px;
            }
            .section-heading {
              display: flex;
              align-items: center;
              gap: 8px;
              margin: 28px 0 14px 0;
            }
            .section-bar {
              width: 4px;
              height: 18px;
              background: #15803d;
              border-radius: 2px;
            }
            .section-title-text {
              font-size: 14px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.06em;
              color: #0f172a;
            }
            .items-table {
              width: 100%;
              border-collapse: separate;
              border-spacing: 0;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              overflow: hidden;
              margin-bottom: 20px;
            }
            .items-table th {
              background: #f8fafc;
              color: #475569;
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              padding: 12px 16px;
              text-align: left;
              border-bottom: 1px solid #e2e8f0;
            }
            .items-table td {
              padding: 12px 16px;
              font-size: 13px;
              color: #334155;
              border-bottom: 1px solid #f1f5f9;
            }
            .items-table tr:last-child td {
              border-bottom: none;
            }
            .items-table td.amount, .items-table th.amount {
              text-align: right;
              font-variant-numeric: tabular-nums;
            }
            .items-table td.bold {
              font-weight: 700;
              color: #0f172a;
            }
            .work-report-card {
              background: linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%);
              border: 1px solid #bbf7d0;
              border-radius: 14px;
              padding: 20px;
              margin-bottom: 24px;
            }
            .report-card-title {
              font-size: 13px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              color: #166534;
              margin-bottom: 14px;
              display: flex;
              align-items: center;
              gap: 6px;
            }
            .work-report-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 12px;
              margin-bottom: 14px;
            }
            .work-metric {
              background: #ffffff;
              border: 1px solid #dcfce7;
              border-radius: 10px;
              padding: 12px;
            }
            .work-metric-label {
              font-size: 11px;
              font-weight: 600;
              color: #64748b;
              text-transform: uppercase;
              margin-bottom: 4px;
            }
            .work-metric-val {
              font-size: 16px;
              font-weight: 800;
              color: #0f172a;
            }
            .variance-tag {
              display: inline-block;
              font-size: 11px;
              font-weight: 700;
              padding: 2px 8px;
              border-radius: 6px;
              margin-top: 4px;
            }
            .remarks-box {
              background: #ffffff;
              border: 1px solid #e2e8f0;
              border-radius: 10px;
              padding: 10px 14px;
              font-size: 12.5px;
              color: #475569;
            }
            .totals-container {
              display: flex;
              justify-content: flex-end;
              margin-top: 10px;
              margin-bottom: 24px;
            }
            .totals-box {
              width: 380px;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 14px;
              padding: 18px 22px;
            }
            .totals-row {
              display: flex;
              justify-content: space-between;
              padding: 6px 0;
              font-size: 13px;
              color: #64748b;
            }
            .totals-row span:last-child {
              font-weight: 600;
              color: #1e293b;
              font-variant-numeric: tabular-nums;
            }
            .totals-divider {
              height: 1px;
              background: #e2e8f0;
              margin: 8px 0;
            }
            .grand-total-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding-top: 8px;
              font-size: 16px;
              font-weight: 800;
              color: #0f172a;
            }
            .grand-total-val {
              font-size: 22px;
              font-weight: 800;
              color: #15803d;
              font-variant-numeric: tabular-nums;
            }
            .payment-card {
              border-radius: 14px;
              padding: 18px 22px;
              margin-bottom: 28px;
            }
            .payment-paid {
              background: #f0fdf4;
              border: 1.5px solid #86efac;
              color: #166534;
            }
            .payment-pending {
              background: #fffbeb;
              border: 1.5px solid #fde68a;
              color: #92400e;
            }
            .payment-header {
              font-size: 14px;
              font-weight: 800;
              letter-spacing: 0.04em;
              text-transform: uppercase;
              margin-bottom: 6px;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .payment-desc {
              font-size: 13px;
              line-height: 1.5;
            }
            .footer-strip {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-top: 1px solid #f1f5f9;
              padding-top: 20px;
              margin-top: 30px;
              font-size: 11.5px;
              color: #94a3b8;
            }
            .audit-seal-text {
              display: inline-flex;
              align-items: center;
              gap: 6px;
              color: #15803d;
              font-weight: 700;
            }
            @media print {
              body { background-color: #ffffff; padding: 0; }
              .invoice-wrapper { border: none; box-shadow: none; padding: 0; max-width: 100%; border-radius: 0; }
              .btn-container { display: none !important; }
            }
          </style>
        </head>
        <body>
          <div class="btn-container">
            <button class="btn-print" onclick="window.print()">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              <span>Print / Download Official Invoice PDF</span>
            </button>
          </div>

          <div class="invoice-wrapper">
            <!-- Header Bar -->
            <div class="header-bar">
              <div>
                <div class="brand-badge">
                  <span class="dot"></span>
                  <span>AGRIX &bull; STATE COOPERATIVE NETWORK</span>
                </div>
                <h1 class="invoice-title">Customer Tax Invoice</h1>
                <div class="invoice-subtitle">Department of Agriculture &amp; Farmers Welfare &bull; Machinery Lease Division</div>
              </div>
              <div class="invoice-meta-box">
                <span class="badge-status ${isFinal ? 'badge-final' : 'badge-tentative'}">
                  ${isFinal ? '✓ Final Settled Invoice' : '⏳ Tentative Booking Estimate'}
                </span>
                <div class="invoice-num-text">INV: ${invoiceNum}</div>
                <div style="font-size: 12px; color: #64748b; margin-top: 4px;">
                  Issued: <strong>${new Date(booking.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
                </div>
              </div>
            </div>

            <!-- Meta Cards Grid -->
            <div class="meta-cards-grid">
              <div class="info-card">
                <div class="info-card-label">
                  <span>👤 Billed To (Farmer)</span>
                </div>
                <div class="info-card-name">${farmerName}</div>
                <div class="info-card-detail">
                  <span class="farmer-id-pill">ID: ${farmerId}</span><br>
                  <strong>Mobile:</strong> ${farmerMobile}<br>
                  <strong>Location:</strong> ${farmerLocation}
                </div>
              </div>

              <div class="info-card">
                <div class="info-card-label">
                  <span>🏢 Cooperative Hub Provider</span>
                </div>
                <div class="info-card-name">${booking.equipment?.cooperativeHub || 'State Cooperative Hub'}</div>
                <div class="info-card-detail">
                  State Cooperative Agricultural Mechanization Society<br>
                  <strong>GSTIN:</strong> 33AGRIXCOOP01Z5 &bull; <strong>State Code:</strong> 33<br>
                  <strong>Support:</strong> support@agrix.gov.in
                </div>
              </div>
            </div>

            <!-- Section 1: Line Items -->
            <div class="section-heading">
              <div class="section-bar"></div>
              <div class="section-title-text">1. Equipment Lease &amp; Fuel Allocation Schedule</div>
            </div>

            <table class="items-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Duration / Units</th>
                  <th class="amount">Unit Rate</th>
                  <th class="amount">Subtotal (INR)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="bold">
                    ${booking.equipmentName || booking.equipment?.name || 'Agri Machinery'}<br>
                    <small style="color: #64748b; font-weight: normal;">Reg: ${booking.equipment?.registrationNumber || 'State Standard'}</small>
                  </td>
                  <td>${booking.durationDays || booking.days} Rental Day(s)</td>
                  <td class="amount">₹${(booking.rentalRate || booking.equipment?.rentalRate || 0).toLocaleString()}/day</td>
                  <td class="amount bold">₹${tentative.baseAmount.toLocaleString()}</td>
                </tr>
                <tr>
                  <td class="bold">
                    Estimated Baseline Fuel Allocation<br>
                    <small style="color: #64748b; font-weight: normal;">${tentative.fuelType || 'Diesel'} benchmark (6 Liters / rental day)</small>
                  </td>
                  <td>${tentative.estimatedFuelLiters.toFixed(1)} Liters</td>
                  <td class="amount">₹${tentative.fuelPricePerLiter || 95}/L</td>
                  <td class="amount bold">₹${tentative.estimatedFuelCost.toLocaleString()}</td>
                </tr>
                <tr>
                  <td class="bold">
                    Goods &amp; Services Tax (CGST 9% + SGST 9%)<br>
                    <small style="color: #64748b; font-weight: normal;">Standard GST on subsidized agri machinery lease</small>
                  </td>
                  <td>18.00%</td>
                  <td class="amount">18%</td>
                  <td class="amount bold">₹${tentative.tax.toLocaleString()}</td>
                </tr>
                <tr style="background: #f8fafc;">
                  <td colspan="3" class="bold" style="text-align: right; color: #475569;">Tentative Reservation Amount:</td>
                  <td class="amount bold" style="color: #d97706; font-size: 14px;">₹${tentative.tentativeTotal.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>

            <!-- Section 2: Operator Field Log (if final) -->
            ${isFinal && final ? `
              <div class="section-heading">
                <div class="section-bar"></div>
                <div class="section-title-text">2. Operator Field Work &amp; Fuel Consumption Audit</div>
              </div>

              <div class="work-report-card">
                <div class="report-card-title">
                  <span>✓ Verified Field Operator Job Completion</span>
                </div>
                <div class="work-report-grid">
                  <div class="work-metric">
                    <div class="work-metric-label">Actual Fuel Consumed</div>
                    <div class="work-metric-val">${final.actualFuelLiters} Liters</div>
                    <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${final.fuelType} @ ₹${final.fuelPricePerLiter}/L</div>
                  </div>
                  <div class="work-metric">
                    <div class="work-metric-label">Verified Fuel Cost</div>
                    <div class="work-metric-val">₹${final.actualFuelCost.toLocaleString()}</div>
                    <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Estimated: ₹${tentative.estimatedFuelCost.toLocaleString()}</div>
                  </div>
                  <div class="work-metric">
                    <div class="work-metric-label">Fuel Cost Variance</div>
                    <div class="work-metric-val" style="color: ${final.fuelAdjustment >= 0 ? '#b45309' : '#15803d'};">
                      ${final.fuelAdjustment >= 0 ? '+' : ''}₹${final.fuelAdjustment.toLocaleString()}
                    </div>
                    <span class="variance-tag" style="${final.fuelAdjustment >= 0 ? 'background: #fef3c7; color: #b45309;' : 'background: #dcfce7; color: #15803d;'}">
                      ${final.fuelAdjustment >= 0 ? 'Usage Adjustment' : 'Savings Credited'}
                    </span>
                  </div>
                </div>
                <div class="remarks-box">
                  <strong>Operator Field Remarks:</strong> ${booking.jobDetails?.remarks || 'Work completed satisfactorily under standard cooperative operating norms.'}
                </div>
              </div>

              <!-- Section 3: Final Totals -->
              <div class="section-heading">
                <div class="section-bar"></div>
                <div class="section-title-text">3. Final Settled Payable Breakdown</div>
              </div>

              <div class="totals-container">
                <div class="totals-box">
                  <div class="totals-row">
                    <span>Base Equipment Rental:</span>
                    <span>₹${final.baseAmount.toLocaleString()}</span>
                  </div>
                  <div class="totals-row">
                    <span>Verified Fuel Consumption (${final.actualFuelLiters}L):</span>
                    <span>₹${final.actualFuelCost.toLocaleString()}</span>
                  </div>
                  <div class="totals-row">
                    <span>Fuel Adjustment vs Tentative:</span>
                    <span style="color: ${final.fuelAdjustment >= 0 ? '#b45309' : '#15803d'}; font-weight: 700;">
                      ${final.fuelAdjustment >= 0 ? '+' : ''}₹${final.fuelAdjustment.toLocaleString()}
                    </span>
                  </div>
                  <div class="totals-row">
                    <span>Applicable GST (CGST 9% + SGST 9%):</span>
                    <span>₹${final.tax.toLocaleString()}</span>
                  </div>
                  <div class="totals-divider"></div>
                  <div class="grand-total-row">
                    <span>Final Settled Amount:</span>
                    <span class="grand-total-val">₹${final.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <!-- Payment Settlement Banner -->
              <div class="payment-card ${booking.paymentStatus === 'Paid' ? 'payment-paid' : 'payment-pending'}">
                <div class="payment-header">
                  ${booking.paymentStatus === 'Paid'
                    ? '<span>✓ Payment Received In Full</span>'
                    : '<span>⏳ Payment Pending — 7-Day Hub Settlement Window</span>'}
                </div>
                <div class="payment-desc">
                  ${booking.paymentStatus === 'Paid'
                    ? `Payment of <strong>₹${final.totalAmount.toLocaleString()}</strong> has been settled via <strong>${booking.paymentMethod || 'Spot Payment / UPI'}</strong>. Collected by: <strong>${booking.collectedBy || booking.paidByStaff || 'Assigned Operator / Hub Cashier'}</strong>. Transaction reference: <code style="background: rgba(0,0,0,0.06); padding: 2px 6px; border-radius: 4px;">TXN-${booking._id?.toString()?.substr(-8)?.toUpperCase()}</code>.`
                    : `Field work is completed. You have a <strong>7-day grace window</strong> to visit your Cooperative Hub (<strong>${booking.equipment?.cooperativeHub || 'Office'}</strong>) to settle the final amount of <strong>₹${final.totalAmount.toLocaleString()}</strong> in Cash, UPI, or Card. Hub Cashier desk is open Monday to Saturday, 9:00 AM – 5:00 PM.`}
                </div>
              </div>
            ` : `
              <!-- Work in Progress / Tentative Notice -->
              <div class="payment-card payment-pending" style="margin-top: 24px;">
                <div class="payment-header">
                  <span>ℹ️ Tentative Booking Estimate</span>
                </div>
                <div class="payment-desc">
                  This tentative bill confirms your machinery reservation. The final invoice will be reconciled upon job completion by the equipment operator based on verified fuel meter logs. Subsidized state cooperative rates guaranteed.
                </div>
              </div>
            `}

            <!-- Footer Strip -->
            <div class="footer-strip">
              <div>
                <span class="audit-seal-text">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                  AGRIX Digital Certified Invoice
                </span>
                &bull; Tamil Nadu Cooperative Agricultural Mechanization Society
              </div>
              <div style="font-family: monospace;">
                DIGITAL-REF: AGX-${booking._id?.toString()?.substr(-10)?.toUpperCase()}
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filterTabs = ['All', 'Pending', 'Approved', 'Issued', 'Returned', 'Cancelled'];

  const filteredBookings = bookingsList.filter(b => {
    if (activeFilter === 'All') return true;
    return b.status.toLowerCase() === activeFilter.toLowerCase();
  });

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
      
      {/* Section Tag */}
      <span className="section-tag">RENTALS</span>

      {/* Title */}
      <h1
        style={{
          fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
          fontWeight: 800,
          color: 'var(--color-text)',
          marginBottom: '1.5rem',
          letterSpacing: '-0.02em'
        }}
      >
        My Bookings
      </h1>

      {/* Filter Tabs Box (Swipeable on mobile) */}
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '16px',
          padding: '0.6rem 0.8rem',
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '2rem',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {filterTabs.map(tab => {
          const isActive = activeFilter === tab;

          return (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              style={{
                flexShrink: 0,
                padding: '0.5rem 1.1rem',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: isActive ? 'var(--color-success-bg)' : 'transparent',
                border: isActive ? '1px solid rgba(21, 128, 61, 0.3)' : '1px solid transparent',
                color: isActive ? 'var(--color-primary)' : '#94a3b8',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Bookings Table Container (Responsive) */}
      <div className="table-responsive">
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '20px',
            overflow: 'hidden',
            minWidth: '680px'
          }}
        >
        {/* Table Header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr',
            padding: '1.2rem 1.8rem',
            borderBottom: '1px solid var(--color-border)',
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: 'var(--color-muted)',
            textTransform: 'uppercase'
          }}
        >
          <div>EQUIPMENT</div>
          <div>DATES</div>
          <div>AMOUNT</div>
          <div>STATUS</div>
          <div>ACTIONS</div>
        </div>

        {/* Table Body */}
        {filteredBookings.length > 0 ? (
          <div>
            {filteredBookings.map(b => {
              const eqName = b.equipmentName || b.equipment?.name || 'Equipment';
              const isReturned = b.status === 'Returned';
              
              return (
                <div
                  key={b._id || b.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr',
                    padding: '1.4rem 1.8rem',
                    alignItems: 'center',
                    borderBottom: '1px solid var(--color-border)',
                    fontSize: '0.9rem'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--color-text)' }}>{eqName}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)', marginTop: '2px' }}>{b.location || b.equipment?.cooperativeHub}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--color-text)' }}>{new Date(b.startDate).toLocaleDateString()}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>{b.durationDays || b.days} Days</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, color: b.isFinalBilled || b.status === 'Returned' ? 'var(--color-primary)' : 'var(--color-warning)' }}>
                      ₹{b.totalAmount}
                    </div>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: b.isFinalBilled || b.status === 'Returned' ? 'var(--color-primary)' : '#f59e0b' }}>
                      {b.isFinalBilled || b.status === 'Returned' ? 'Final Settled' : 'Tentative Bill'}
                    </span>
                  </div>
                  <div>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.25rem 0.75rem',
                        borderRadius: 'var(--radius-pill)',
                        backgroundColor: b.status === 'Returned' ? 'var(--color-success-bg)' : 'var(--color-info-bg)',
                        color: b.status === 'Returned' ? 'var(--color-primary)' : '#38bdf8',
                        border: b.status === 'Returned' ? '1px solid rgba(21, 128, 61, 0.3)' : '1px solid rgba(56, 189, 248, 0.3)',
                        display: 'inline-block',
                        marginBottom: '4px'
                      }}
                    >
                      {b.status}
                    </span>
                    {b.paymentStatus === 'Paid' ? (
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>✓</span>
                        <span>{b.paymentCollectionMode === 'COLLECTED_ON_SPOT' || b.collectedByRole === 'Operator' ? 'Paid to Operator' : 'Paid at Office'}</span>
                      </div>
                    ) : b.status === 'Returned' ? (
                      <div style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 700, display: 'flex', flexDirection: 'column' }}>
                        <span>⏳ Pay at Hub Office</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--color-muted)', fontWeight: 500 }}>7-Day Grace Period</span>
                      </div>
                    ) : null}
                  </div>
                  <div>
                    {b.status === 'Pending' && (
                      <button
                        onClick={() => onCancelBooking(b._id || b.id)}
                        style={{
                          background: 'none',
                          border: '1px solid var(--color-border)',
                          color: 'var(--color-danger)',
                          padding: '0.35rem 0.85rem',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    )}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {(b.status === 'Returned' || b.status === 'Approved') && (
                        <button
                          onClick={() => handleViewInvoice(b)}
                          style={{
                            background: 'var(--color-info-bg)',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-info)',
                            padding: '0.35rem 0.65rem',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                        >
                          <FileText size={14} />
                          <span>Invoice</span>
                        </button>
                      )}
                      {isReturned && (
                        <button
                          onClick={() => {
                            setFeedbackBooking(b);
                            setOverallRating(5);
                            setEquipRating(5);
                            setServRating(5);
                            setFeedbackComments('');
                            setOperatorFeedback('');
                          }}
                          style={{
                            background: 'var(--color-primary)',
                            border: 'none',
                            color: 'var(--color-text)',
                            padding: '0.35rem 0.65rem',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                        >
                          <MessageSquare size={14} />
                          <span>Feedback</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State matching Screenshot 3 */
          <div
            style={{
              padding: '6rem 2rem',
              textAlign: 'center',
              color: 'var(--color-muted)',
              fontSize: '0.95rem'
            }}
          >
            No bookings yet.
          </div>
        )}
        </div>
      </div>

      {/* Modern High-Fidelity Feedback Modal */}
      {feedbackBooking && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(0.5rem, 3vw, 1.5rem)' }}>
          <div style={{ margin: 'auto', width: '100%', maxWidth: '500px', maxHeight: '92vh', overflowY: 'auto', backgroundColor: 'var(--color-surface)', borderRadius: '20px', padding: 'clamp(1.25rem, 4vw, 2rem)', border: '1px solid var(--color-border)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', position: 'relative' }}>
            <button onClick={() => setFeedbackBooking(null)} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'var(--color-border)', border: 'none', color: 'var(--color-text)', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={16} />
            </button>
            
            <span className="section-tag" style={{ color: 'var(--color-primary)' }}>SUBMIT RENTAL FEEDBACK</span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '1.5rem' }}>
              Share Your Experience
            </h3>
            
            <form onSubmit={handleSubmitFeedback} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '0.5rem', fontWeight: 700 }}>Overall Rating</label>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {[1, 2, 3, 4, 5].map(stars => (
                    <button type="button" key={stars} onClick={() => setOverallRating(stars)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      <Star size={24} fill={stars <= overallRating ? '#f59e0b' : 'none'} color="#f59e0b" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '0.5rem', fontWeight: 700 }}>Machinery Condition & Performance</label>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {[1, 2, 3, 4, 5].map(stars => (
                    <button type="button" key={stars} onClick={() => setEquipRating(stars)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      <Star size={22} fill={stars <= equipRating ? '#f59e0b' : 'none'} color="#f59e0b" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '0.5rem', fontWeight: 700 }}>Booking & Delivery Service</label>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {[1, 2, 3, 4, 5].map(stars => (
                    <button type="button" key={stars} onClick={() => setServRating(stars)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      <Star size={22} fill={stars <= servRating ? '#f59e0b' : 'none'} color="#f59e0b" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '0.4rem', fontWeight: 700 }}>Comments / Remarks</label>
                <textarea required placeholder="Write your review comments here..." value={feedbackComments} onChange={(e) => setFeedbackComments(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', backgroundColor: 'transparent', color: 'var(--color-text)', border: '1px solid var(--color-border)', minHeight: '60px' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '0.4rem', fontWeight: 700 }}>Feedback about assigned Operator (optional)</label>
                <textarea placeholder="How was the operator's service and behavior?" value={operatorFeedback} onChange={(e) => setOperatorFeedback(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', backgroundColor: 'transparent', color: 'var(--color-text)', border: '1px solid var(--color-border)', minHeight: '50px' }} />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn-green" style={{ flexGrow: 1, padding: '0.75rem', justifyContent: 'center', fontWeight: 700 }}>
                  Submit Feedback
                </button>
                <button type="button" onClick={() => setFeedbackBooking(null)} style={{ flexGrow: 1, backgroundColor: 'var(--color-border)', color: 'var(--color-text)', border: 'none', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
