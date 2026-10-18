import React from 'react';
import { Calendar, Tractor, TrendingUp, IndianRupee, Bell, MapPin, CheckCircle } from 'lucide-react';
import { getTaluksForDistrict } from '../../data/tnLocationData';

export default function FarmerDashboardView({ overviewData, equipmentList = [], farmerUser, onNavigate }) {
  const totalBookings = overviewData?.totalBookings || 0;
  const activeRentals = overviewData?.activeRentals || 0;
  const completed = overviewData?.completed || 0;
  const totalSpent = overviewData?.totalSpent || 0;
  const unreadNotifications = overviewData?.unreadNotifications || 0;

  const district = farmerUser?.district || 'Coimbatore';
  const validTaluks = getTaluksForDistrict(district);
  const taluk = (farmerUser?.taluk && validTaluks.includes(farmerUser.taluk))
    ? farmerUser.taluk
    : (validTaluks[0] || district);

  // Calculate available equipment units for farmer's location
  const availableItems = (equipmentList || []).filter(item => (item.availableQuantity ?? (item.status === 'Available' ? 1 : 0)) > 0);

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
      
      {/* Section Tag */}
      <span className="section-tag">FARMER OVERVIEW</span>

      {/* Main Greeting & Location Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
        <div>
          <h1
            style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              color: 'var(--color-text)',
              marginBottom: '0.4rem',
              letterSpacing: '-0.02em'
            }}
          >
            Here is your farm activity.
          </h1>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.95rem' }}>
            Smart Agri Equipment Rental Platform
          </p>
        </div>

        {/* Your Location Box */}
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '16px',
            padding: '1rem 1.4rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem'
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-success-bg)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <MapPin size={20} color="var(--color-primary)" />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Your Location
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text)' }}>
              {district} • {taluk}
            </div>
          </div>
        </div>
      </div>

      {/* Location Equipment Availability Card */}
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '20px',
          padding: '2rem 2.5rem',
          marginBottom: '2.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
              Available Equipment
            </h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginTop: '2px' }}>
              Inventory in {district} • {taluk}
            </div>
          </div>

          <button
            onClick={() => onNavigate && onNavigate('equipment')}
            className="btn-green"
            style={{ padding: '0.5rem 1.2rem', fontSize: '0.88rem' }}
          >
            View Full Catalog
          </button>
        </div>

        {availableItems.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '1.2rem'
            }}
          >
            {equipmentList.map(item => {
              const avail = item.availableQuantity ?? (item.status === 'Available' ? 1 : 0);
              return (
                <div
                  key={item._id || item.id}
                  style={{
                    backgroundColor: 'var(--color-bg)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '16px',
                    padding: '1.2rem 1.4rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--color-text)' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginTop: '2px' }}>
                      {item.category}
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      padding: '0.35rem 0.8rem',
                      borderRadius: '20px',
                      backgroundColor: avail > 0 ? 'var(--color-success-bg)' : 'rgba(239, 68, 68, 0.1)',
                      color: avail > 0 ? 'var(--color-primary)' : '#ef4444',
                      border: `1px solid ${avail > 0 ? 'var(--color-border)' : 'rgba(239, 68, 68, 0.3)'}`
                    }}
                  >
                    {avail > 0 ? `${avail} Available` : 'Unavailable'}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              padding: '2.5rem',
              textAlign: 'center',
              backgroundColor: 'var(--color-bg)',
              borderRadius: '16px',
              border: '1px dashed var(--color-border)',
              color: 'var(--color-muted)',
              fontSize: '1rem',
              fontWeight: 600
            }}
          >
            No equipment currently available in your area.
          </div>
        )}
      </div>

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
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '20px',
            padding: '1.8rem 1.5rem'
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-success-bg)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.4rem'
            }}
          >
            <Calendar size={22} color="var(--color-primary)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.1 }}>
            {totalBookings}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginTop: '0.4rem', fontWeight: 500 }}>
            Total Bookings
          </div>
        </div>

        {/* Card 2: Active Rentals */}
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '20px',
            padding: '1.8rem 1.5rem'
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-success-bg)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.4rem'
            }}
          >
            <Tractor size={22} color="var(--color-primary)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.1 }}>
            {activeRentals}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginTop: '0.4rem', fontWeight: 500 }}>
            Active Rentals
          </div>
        </div>

        {/* Card 3: Completed */}
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '20px',
            padding: '1.8rem 1.5rem'
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-success-bg)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.4rem'
            }}
          >
            <TrendingUp size={22} color="var(--color-primary)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.1 }}>
            {completed}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginTop: '0.4rem', fontWeight: 500 }}>
            Completed
          </div>
        </div>

        {/* Card 4: Total Spent */}
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '20px',
            padding: '1.8rem 1.5rem'
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-success-bg)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.4rem'
            }}
          >
            <IndianRupee size={22} color="var(--color-primary)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.1 }}>
            ₹{totalSpent}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginTop: '0.4rem', fontWeight: 500 }}>
            Total Spent
          </div>
        </div>

      </div>

      {/* Unread Notifications Panel */}
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '20px',
          padding: '2rem 2.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.2rem' }}>
          <Bell size={20} color="#38bdf8" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text)' }}>
            Unread notifications
          </h3>
        </div>

        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.6rem' }}>
          {unreadNotifications}
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--color-muted)', lineHeight: 1.5 }}>
          Head to Notifications to see the latest updates about your bookings.
        </p>
      </div>

    </div>
  );
}

