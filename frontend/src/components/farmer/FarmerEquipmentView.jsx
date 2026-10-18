// src/components/farmer/FarmerEquipmentView.jsx
import React, { useState } from 'react';
import { Search, Tractor, MapPin } from 'lucide-react';

export default function FarmerEquipmentView({ equipmentList, onBookEquipment }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All categories');

  const categories = ['All categories', 'Tractor', 'Cultivator', 'Rotavator', 'Thresher', 'Seed Drill'];

  const filteredItems = equipmentList.filter(item => {
    const matchesCat = selectedCategory === 'All categories' || item.category.toLowerCase() === selectedCategory.toLowerCase();
    const locationStr = item.location || item.cooperativeHub || '';
    const manufacturerStr = item.manufacturer || item.brand || '';
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      manufacturerStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      locationStr.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Count total available vehicles in the list
  const availableCount = equipmentList.filter(item => (item.status || '').toLowerCase() === 'available').length;

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

      {/* Section Tag */}
      <span className="section-tag">CATALOG</span>

      {/* Heading and Availability Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1
          style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            color: 'var(--color-text)',
            letterSpacing: '-0.02em',
            margin: 0
          }}
        >
          Equipment
        </h1>

        <div
          style={{
            backgroundColor: 'var(--color-success-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            padding: '0.6rem 1.2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem'
          }}
        >
          <span style={{ color: 'var(--color-muted)', fontSize: '0.9rem', fontWeight: 600 }}>Total Vehicles Available:</span>
          <span style={{ color: 'var(--color-primary)', fontSize: '1.25rem', fontWeight: 800 }}>{availableCount}</span>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '16px',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '2.5rem'
        }}
      >
        {/* Search Input Container */}
        <div style={{ position: 'relative', flexGrow: 1 }}>
          <Search
            size={18}
            color="#64748b"
            style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Search by name, manufacturer, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.8rem',
              borderRadius: '12px',
              backgroundColor: 'var(--color-border)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
              fontSize: '0.92rem',
              outline: 'none'
            }}
          />
        </div>

        {/* Dropdown Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '12px',
            backgroundColor: 'var(--color-border)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
            fontSize: '0.92rem',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          {categories.map(cat => (
            <option key={cat} value={cat} style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Equipment Cards Grid (4 columns) */}
      {filteredItems.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}
        >
          {filteredItems.map(item => {
            const avail = item.availableQuantity ?? (item.status === 'Available' ? 1 : 0);
            const total = item.totalQuantity ?? item.totalUnits ?? 1;
            const locationDisplay = item.district && item.taluk ? `${item.district} • ${item.taluk}` : (item.location || item.cooperativeHub || 'Tamil Nadu Hub');

            return (
              <div
                key={item.id || item._id}
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '20px',
                  padding: '1.6rem 1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div>
                  {/* Header Icon + Title */}
                  <div style={{ display: 'flex', gap: '0.9rem', marginBottom: '1.2rem' }}>
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
                        flexShrink: 0
                      }}
                    >
                      <Tractor size={22} color="var(--color-primary)" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.25 }}>
                        {item.name}
                      </h3>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginTop: '2px' }}>
                        {item.category}
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--color-muted)', marginBottom: '0.6rem' }}>
                    <MapPin size={14} color="#94a3b8" />
                    <span>{locationDisplay}</span>
                  </div>

                  {/* Price */}
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '1rem' }}>
                    ₹ {item.pricePerDay || item.rentalRate || item.price || 0}<span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--color-muted)' }}>/day</span>
                  </div>

                  {/* Badges & Inventory Count */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.6rem', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.65rem',
                        borderRadius: '20px',
                        backgroundColor: avail > 0 ? 'var(--color-success-bg)' : 'rgba(239, 68, 68, 0.1)',
                        color: avail > 0 ? 'var(--color-primary)' : '#ef4444',
                        border: `1px solid ${avail > 0 ? 'var(--color-border)' : 'rgba(239, 68, 68, 0.3)'}`
                      }}
                    >
                      {avail > 0 ? `${avail} Available` : '0 Available'}
                    </span>
                  </div>
                </div>

                {/* Bottom Row: Manufacturer & Book Button */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '1rem'
                  }}
                >
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)', fontWeight: 500 }}>
                    {item.manufacturer || item.brand || 'Standard'}
                  </span>

                  <button
                    onClick={() => onBookEquipment(item)}
                    disabled={avail === 0}
                    className="btn-green"
                    style={{
                      padding: '0.45rem 1.1rem',
                      fontSize: '0.82rem',
                      borderRadius: '10px',
                      opacity: avail === 0 ? 0.5 : 1,
                      cursor: avail === 0 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {avail > 0 ? 'Book' : 'Unavailable'}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div
          style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            backgroundColor: 'var(--color-surface)',
            borderRadius: '20px',
            border: '1px border var(--color-border)',
            color: 'var(--color-muted)',
            fontSize: '1.1rem',
            fontWeight: 600
          }}
        >
          No equipment currently available in your area.
        </div>
      )}

    </div>
  );
}

