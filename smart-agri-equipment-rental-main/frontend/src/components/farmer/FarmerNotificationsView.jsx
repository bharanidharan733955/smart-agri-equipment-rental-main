// src/components/farmer/FarmerNotificationsView.jsx
import React from 'react';
import { Bell, CheckCircle2 } from 'lucide-react';

export default function FarmerNotificationsView({ notificationsList }) {
  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
      
      {/* Section Tag */}
      <span className="section-tag">INBOX</span>

      {/* Heading */}
      <h1
        style={{
          fontSize: '2.5rem',
          fontWeight: 800,
          color: '#ffffff',
          marginBottom: '2.5rem',
          letterSpacing: '-0.02em'
        }}
      >
        Notifications
      </h1>

      {/* Container Box */}
      <div
        style={{
          backgroundColor: '#131d35',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          overflow: 'hidden'
        }}
      >
        {notificationsList.length > 0 ? (
          <div style={{ padding: '1rem 0' }}>
            {notificationsList.map((n, i) => (
              <div
                key={n._id || n.id || i}
                style={{
                  padding: '1.4rem 2rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem'
                }}
              >
                <div style={{ marginTop: '2px' }}>
                  <Bell size={20} color="#10b981" />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
                    {n.title}
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.5 }}>
                    {n.message}
                  </p>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>
                    {new Date(n.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State matching Screenshot 5 */
          <div
            style={{
              padding: '7rem 2rem',
              textAlign: 'center',
              color: '#94a3b8',
              fontSize: '0.95rem'
            }}
          >
            You are all caught up.
          </div>
        )}
      </div>

    </div>
  );
}
