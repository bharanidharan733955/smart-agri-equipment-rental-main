// src/components/farmer/FarmerDashboardView.jsx
import React from 'react';
import { Calendar, Tractor, TrendingUp, IndianRupee, Bell } from 'lucide-react';

export default function FarmerDashboardView({ overviewData, onNavigate }) {
  const totalBookings = overviewData?.totalBookings || 0;
  const activeRentals = overviewData?.activeRentals || 0;
  const completed = overviewData?.completed || 0;
  const totalSpent = overviewData?.totalSpent || 0;
  const unreadNotifications = overviewData?.unreadNotifications || 0;

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
      
      {/* Section Tag */}
      <span className="section-tag">FARMER OVERVIEW</span>

      {/* Main Greeting */}
      <h1
        style={{
          fontSize: '2.5rem',
          fontWeight: 800,
          color: '#ffffff',
          marginBottom: '2.5rem',
          letterSpacing: '-0.02em'
        }}
      >
        Namaste — here is your farm activity.
      </h1>

      {/* 4 Stat Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1.5rem',
          marginBottom: '2.5rem'
        }}
      >
        {/* Card 1: Total Bookings */}
        <div
          style={{
            backgroundColor: '#131d35',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            padding: '1.8rem 1.5rem'
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.4rem'
            }}
          >
            <Calendar size={22} color="#10b981" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.1 }}>
            {totalBookings}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.4rem', fontWeight: 500 }}>
            Total Bookings
          </div>
        </div>

        {/* Card 2: Active Rentals */}
        <div
          style={{
            backgroundColor: '#131d35',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            padding: '1.8rem 1.5rem'
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.4rem'
            }}
          >
            <Tractor size={22} color="#10b981" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.1 }}>
            {activeRentals}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.4rem', fontWeight: 500 }}>
            Active Rentals
          </div>
        </div>

        {/* Card 3: Completed */}
        <div
          style={{
            backgroundColor: '#131d35',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            padding: '1.8rem 1.5rem'
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.4rem'
            }}
          >
            <TrendingUp size={22} color="#10b981" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.1 }}>
            {completed}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.4rem', fontWeight: 500 }}>
            Completed
          </div>
        </div>

        {/* Card 4: Total Spent */}
        <div
          style={{
            backgroundColor: '#131d35',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            padding: '1.8rem 1.5rem'
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.4rem'
            }}
          >
            <IndianRupee size={22} color="#10b981" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.1 }}>
            ₹{totalSpent}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.4rem', fontWeight: 500 }}>
            Total Spent
          </div>
        </div>

      </div>

      {/* Unread Notifications Panel */}
      <div
        style={{
          backgroundColor: '#131d35',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          padding: '2rem 2.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.2rem' }}>
          <Bell size={20} color="#38bdf8" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
            Unread notifications
          </h3>
        </div>

        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.6rem' }}>
          {unreadNotifications}
        </div>

        <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.5 }}>
          Head to Notifications to see the latest updates about your bookings.
        </p>
      </div>

    </div>
  );
}
