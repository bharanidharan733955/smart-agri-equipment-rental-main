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
            color: '#ffffff',
            letterSpacing: '-0.02em',
            margin: 0
          }}
        >
          Equipment
        </h1>

        <div
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '12px',
            padding: '0.6rem 1.2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem'
          }}
        >
          <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600 }}>Total Vehicles Available:</span>
          <span style={{ color: '#10b981', fontSize: '1.25rem', fontWeight: 800 }}>{availableCount}</span>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div
        style={{
          backgroundColor: '#131d35',
          border: '1px solid rgba(255, 255, 255, 0.08)',
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
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
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
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#ffffff',
            fontSize: '0.92rem',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          {categories.map(cat => (
            <option key={cat} value={cat} style={{ backgroundColor: '#131d35', color: '#ffffff' }}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Equipment Cards Grid (4 columns) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}
      >
        {filteredItems.map(item => (
          <div
            key={item.id || item._id}
            style={{
              backgroundColor: '#131d35',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              padding: '1.6rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
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
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Tractor size={22} color="#10b981" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.25 }}>
                    {item.name}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                    {item.category}
                  </div>
                </div>
              </div>

              {/* Location */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '0.6rem' }}>
                <MapPin size={14} color="#94a3b8" />
                <span>{item.location || item.cooperativeHub || 'Ludhiana Hub'}</span>
              </div>

              {/* Price */}
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginBottom: '1rem' }}>
                ₹ {item.pricePerDay || item.rentalRate || item.price || 0}<span style={{ fontSize: '0.82rem', fontWeight: 500, color: '#94a3b8' }}>/day</span>
              </div>

              {/* Badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.6rem' }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.65rem',
                    borderRadius: '20px',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    color: '#10b981',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                  }}
                >
                  {item.status || 'Available'}
                </span>

                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    padding: '0.2rem 0.65rem',
                    borderRadius: '20px',
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    color: '#cbd5e1',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  {item.condition || 'good'}
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
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
                {item.manufacturer || item.brand || 'Standard'}
              </span>

              <button
                onClick={() => onBookEquipment(item)}
                className="btn-green"
                style={{ padding: '0.45rem 1.1rem', fontSize: '0.82rem', borderRadius: '10px' }}
              >
                Book
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}

