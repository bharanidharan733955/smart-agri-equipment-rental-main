// src/components/farmer/FarmerBookingsView.jsx
import React, { useState } from 'react';
import { Star, FileText, MessageSquare, Printer, X } from 'lucide-react';
import { submitFarmerFeedback } from '../../api';
import toast from 'react-hot-toast';

export default function FarmerBookingsView({ bookingsList, onCancelBooking }) {
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
    const baseAmt = booking.totalAmount;
    const tax = Math.round(baseAmt * 0.18);
    const penalty = booking.penalty || 0;
    const grandTotal = baseAmt + tax + penalty;
    const invoiceNum = booking.invoiceNumber || `INV-${booking._id?.toString()?.substr(-6)?.toUpperCase() || 'TEMP'}`;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>AgriRentGov - Farmer Invoice ${invoiceNum}</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1e293b; padding: 40px; line-height: 1.5; background-color: #ffffff; }
            .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05); }
            h1 { color: var(--color-primary); font-size: 28px; margin: 0 0 10px 0; }
            .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .meta-table td { padding: 5px 0; font-size: 13px; color: #64748b; }
            .meta-table td.strong { font-weight: bold; color: #0f172a; text-align: right; }
            .section-title { font-size: 16px; font-weight: bold; text-transform: uppercase; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; margin-top: 30px; margin-bottom: 10px; }
            .data-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .data-table th { background-color: #f8fafc; color: #475569; font-weight: bold; text-align: left; padding: 10px; font-size: 12px; border-bottom: 2px solid #e2e8f0; }
            .data-table td { padding: 12px 10px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #334155; }
            .amount { text-align: right; font-weight: bold; }
            th.amount { text-align: right; }
            .totals-table { width: 250px; margin-left: auto; margin-top: 20px; border-collapse: collapse; }
            .totals-table td { padding: 8px 5px; font-size: 13px; color: #64748b; }
            .totals-table tr.grand-total td { font-size: 16px; font-weight: 800; color: var(--color-primary); border-top: 2px solid #e2e8f0; padding-top: 12px; }
            .btn-print { background-color: var(--color-primary); color: white; border: none; padding: 10px 20px; font-size: 14px; font-weight: bold; border-radius: 6px; cursor: pointer; display: block; margin: 0 auto 20px auto; }
            @media print {
              .btn-print { display: none; }
              body { padding: 0; }
              .invoice-box { border: none; box-shadow: none; padding: 0; }
            }
          </style>
        </head>
        <body>
          <button class="btn-print" onclick="window.print()">Print / Download Invoice PDF</button>
          <div class="invoice-box">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
              <div>
                <h1>🌾 AgriRentGov Invoice</h1>
                <div style="font-size: 12px; color: #64748b;">State Government Sponsored Rent Audited Log Ledger</div>
              </div>
              <div style="text-align: right; font-size: 13px; color: #475569;">
                <strong>Invoice Number:</strong> ${invoiceNum}<br>
                <strong>Date:</strong> ${new Date(booking.createdAt).toLocaleDateString()}
              </div>
            </div>
            
            <table class="meta-table">
              <tr>
                <td>
                  <strong>Billed To:</strong><br>
                  Farmer Name: ${booking.farmerName || 'Registered Farmer'}<br>
                  Farmer ID: ${booking.farmerId || 'N/A'}<br>
                  Contact: ${booking.farmer?.mobile || 'N/A'}
                </td>
                <td style="text-align: right; vertical-align: top;">
                  <strong>Cooperative Provider:</strong><br>
                  Ludhiana Central Hub #1<br>
                  State Agriculture Department
                </td>
              </tr>
            </table>

            <div class="section-title">Rental Specifications</div>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Equipment Description</th>
                  <th>Rental Duration</th>
                  <th class="amount">Unit Rate</th>
                  <th class="amount">Total Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>${booking.equipmentName || booking.equipment?.name || 'Agri Equipment'}</strong><br>
                    <small>Category: ${booking.equipment?.category || 'Tractor'}</small>
                  </td>
                  <td>${booking.durationDays || booking.days} Days</td>
                  <td class="amount">₹${booking.rentalRate || booking.equipment?.rentalRate}/day</td>
                  <td class="amount">₹${baseAmt.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>

            <table class="totals-table">
              <tr>
                <td>Subtotal Base:</td>
                <td class="amount">₹${baseAmt.toLocaleString()}</td>
              </tr>
              <tr>
                <td>CGST & SGST (18%):</td>
                <td class="amount">₹${tax.toLocaleString()}</td>
              </tr>
              <tr>
                <td>Late Penalties:</td>
                <td class="amount">₹${penalty.toLocaleString()}</td>
              </tr>
              <tr class="grand-total">
                <td>Grand Total:</td>
                <td class="amount">₹${grandTotal.toLocaleString()}</td>
              </tr>
            </table>

            <div style="margin-top: 50px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px;">
              Thank you for renting with AgriRent. This invoice is auto-audited and digitally encrypted in compliance with the State Cooperative Registry.
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
          fontSize: '2.5rem',
          fontWeight: 800,
          color: 'var(--color-text)',
          marginBottom: '2rem',
          letterSpacing: '-0.02em'
        }}
      >
        My Bookings
      </h1>

      {/* Filter Tabs Box */}
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '16px',
          padding: '0.8rem 1rem',
          display: 'flex',
          gap: '0.6rem',
          marginBottom: '2rem'
        }}
      >
        {filterTabs.map(tab => {
          const isActive = activeFilter === tab;

          return (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              style={{
                padding: '0.55rem 1.3rem',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: isActive ? 'var(--color-success-bg)' : 'transparent',
                border: isActive ? '1px solid rgba(21, 128, 61, 0.3)' : '1px solid transparent',
                color: isActive ? 'var(--color-primary)' : '#94a3b8',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Bookings Table Container */}
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '20px',
          overflow: 'hidden'
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
                  <div style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                    ₹{b.totalAmount}
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
                        border: b.status === 'Returned' ? '1px solid rgba(21, 128, 61, 0.3)' : '1px solid rgba(56, 189, 248, 0.3)'
                      }}
                    >
                      {b.status}
                    </span>
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

      {/* Modern High-Fidelity Feedback Modal */}
      {feedbackBooking && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, backgroundColor: 'var(--color-surface)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifycontent: 'center', padding: '1.5rem' }}>
          <div style={{ margin: 'auto', width: '100%', maxWidth: '500px', backgroundColor: 'var(--color-surface)', borderRadius: '24px', padding: '2rem', border: '1px solid var(--color-border)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', position: 'relative' }}>
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
