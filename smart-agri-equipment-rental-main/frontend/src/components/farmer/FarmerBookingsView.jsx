// src/components/farmer/FarmerBookingsView.jsx
import React, { useState } from 'react';

export default function FarmerBookingsView({ bookingsList, onCancelBooking }) {
  const [activeFilter, setActiveFilter] = useState('All');

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
          color: '#ffffff',
          marginBottom: '2rem',
          letterSpacing: '-0.02em'
        }}
      >
        My Bookings
      </h1>

      {/* Filter Tabs Box */}
      <div
        style={{
          backgroundColor: '#131d35',
          border: '1px solid rgba(255, 255, 255, 0.08)',
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
                backgroundColor: isActive ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                border: isActive ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
                color: isActive ? '#10b981' : '#94a3b8',
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
          backgroundColor: '#131d35',
          border: '1px solid rgba(255, 255, 255, 0.08)',
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
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: '#64748b',
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
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    fontSize: '0.9rem'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: '#ffffff' }}>{eqName}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>{b.location || b.equipment?.cooperativeHub}</div>
                  </div>
                  <div>
                    <div style={{ color: '#ffffff' }}>{new Date(b.startDate).toLocaleDateString()}</div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{b.durationDays || b.days} Days</div>
                  </div>
                  <div style={{ fontWeight: 700, color: '#10b981' }}>
                    ₹{b.totalAmount}
                  </div>
                  <div>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.25rem 0.75rem',
                        borderRadius: 'var(--radius-pill)',
                        backgroundColor: b.status === 'Returned' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                        color: b.status === 'Returned' ? '#10b981' : '#38bdf8',
                        border: b.status === 'Returned' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(56, 189, 248, 0.3)'
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
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#ef4444',
                          padding: '0.35rem 0.85rem',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    )}
                    {isReturned && (
                      <button
                        onClick={() => {
                          const rating = prompt('Rate from 1 to 5:');
                          const comments = prompt('Any comments?');
                          if (rating) {
                            import('../../api').then(m => {
                              m.submitFarmerFeedback(b._id || b.id, rating, comments).then(() => {
                                alert('Feedback submitted successfully!');
                              });
                            });
                          }
                        }}
                        style={{
                          background: '#10b981',
                          border: 'none',
                          color: '#ffffff',
                          padding: '0.35rem 0.85rem',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          fontWeight: 700
                        }}
                      >
                        Feedback
                      </button>
                    )}
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
              color: '#94a3b8',
              fontSize: '0.95rem'
            }}
          >
            No bookings yet.
          </div>
        )}
      </div>

    </div>
  );
}
