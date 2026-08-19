// src/components/cooperative/CoopEquipmentView.jsx
import React, { useState } from 'react';
import { 
  PlusCircle, 
  Search, 
  Eye, 
  Edit3, 
  Trash2, 
  Image, 
  CheckCircle2, 
  Wrench, 
  Sliders, 
  Tractor,
  Building2,
  Clock
} from 'lucide-react';

export default function CoopEquipmentView({
  equipmentList,
  stats,
  onOpenAddModal,
  onViewDetails,
  onEditEquipment,
  onDeleteEquipment,
  onUploadImage,
  onUpdateStatus,
  onUpdateCondition,
  onScheduleMaint,
  onCompleteMaint
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const statusTabs = ['All', 'Available', 'Under Maintenance', 'Rented'];

  const filteredItems = equipmentList.filter(item => {
    const matchesStatus = statusFilter === 'All' || item.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.manufacturer && item.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
      
      {/* Top Header Row with Title & Add Equipment Button */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <span className="section-tag">HUB EQUIPMENT MANAGEMENT</span>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Equipment Inventory
          </h1>
        </div>

        <button
          onClick={onOpenAddModal}
          className="btn-green"
          style={{ padding: '0.75rem 1.6rem', fontSize: '0.92rem', borderRadius: 'var(--radius-pill)' }}
        >
          <PlusCircle size={18} />
          <span>Add Equipment</span>
        </button>
      </div>

      {/* Overview Stat Cards Row */}
      {(() => {
        const totalUnitsSum = equipmentList.reduce((sum, e) => sum + (e.totalUnits || 0), 0);
        const totalTypes = equipmentList.length;
        const availableCount = equipmentList.filter(e => e.status === 'Available').length;
        const maintCount = equipmentList.filter(e => e.status === 'Under Maintenance').length;
        const rentedCount = equipmentList.filter(e => e.status === 'In Use' || e.status === 'Rented' || e.status === 'Reserved').length;
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2.5rem' }}>
            {/* Card 1: Types */}
            <div style={{ backgroundColor: '#131d35', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '1.4rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Equipment Types</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>{totalTypes}</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>Unique categories</div>
            </div>

            {/* Card 2: Total Units */}
            <div style={{ backgroundColor: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '16px', padding: '1.4rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600, textTransform: 'uppercase' }}>Total Units</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981', marginTop: '0.2rem' }}>{totalUnitsSum}</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>15 units × {totalTypes} types</div>
            </div>

            {/* Card 3: Under Maintenance */}
            <div style={{ backgroundColor: '#131d35', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '1.4rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 600, textTransform: 'uppercase' }}>Under Maintenance</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.2rem' }}>
                {stats?.underMaintenance ?? maintCount}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>Equipment types</div>
            </div>

            {/* Card 4: Active Rentals */}
            <div style={{ backgroundColor: '#131d35', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '1.4rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 600, textTransform: 'uppercase' }}>Active Rentals</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.2rem' }}>
                {stats?.activeRentals ?? rentedCount}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>Currently in use</div>
            </div>
          </div>
        );
      })()}

      {/* Filter & Search Bar */}
      <div
        style={{
          backgroundColor: '#131d35',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}
      >
        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {statusTabs.map(tab => {
            const isActive = statusFilter === tab;

            return (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                style={{
                  padding: '0.5rem 1.2rem',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: isActive ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                  border: isActive ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent',
                  color: isActive ? '#38bdf8' : '#94a3b8',
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

        {/* Search Bar */}
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={18} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search equipment by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 1rem 0.65rem 2.8rem',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              fontSize: '0.88rem',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Equipment Items Grid / Table */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        {filteredItems.map(item => {
          const isAvailable = item.status === 'Available';
          const isMaintenance = item.status === 'Under Maintenance';

          return (
            <div
              key={item._id || item.id}
              style={{
                backgroundColor: '#131d35',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '20px',
                padding: '1.5rem 1.8rem',
                display: 'grid',
                gridTemplateColumns: '120px 1.5fr 1fr 1fr 2.2fr',
                alignItems: 'center',
                gap: '1.8rem',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)')}
            >
              {/* Image Preview (Clickable to view details) */}
              <div
                onClick={() => onViewDetails(item)}
                style={{
                  width: '120px',
                  height: '85px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  position: 'relative',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  cursor: 'pointer'
                }}
              >
                <img
                  src={item.imageUrl || 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=400&q=80'}
                  alt={item.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <button
                  title="Upload Image"
                  onClick={() => onUploadImage(item)}
                  style={{
                    position: 'absolute',
                    bottom: '4px',
                    right: '4px',
                    backgroundColor: 'rgba(15, 25, 48, 0.85)',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#ffffff',
                    padding: '3px 6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <Image size={12} />
                </button>
              </div>

              {/* Title & Hub info (Clickable to view details) */}
              <div>
                <h3 
                  onClick={() => onViewDetails(item)}
                  style={{ 
                    fontSize: '1.15rem', 
                    fontWeight: 800, 
                    color: '#ffffff', 
                    marginBottom: '4px',
                    cursor: 'pointer',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#10b981')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#ffffff')}
                >
                  {item.name}
                </h3>
                <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                  Category: <span style={{ color: '#ffffff', fontWeight: 600 }}>{item.category}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '5px' }}>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: 'rgba(16,185,129,0.12)',
                    border: '1px solid rgba(16,185,129,0.25)',
                    color: '#10b981'
                  }}>
                    {item.totalUnits || 15} units
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{item.cooperativeHub || item.location}</span>
                </div>
              </div>

              {/* Rate & Serial */}
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>
                  ₹{item.price || item.pricePerDay}<span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 400 }}>/day</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                  Brand: {item.manufacturer || 'Standard'}
                </div>
              </div>

              {/* Status Badge + Usage Hours Progress */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {/* Status Badge */}
                <div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.25rem 0.75rem',
                      borderRadius: 'var(--radius-pill)',
                      backgroundColor: isAvailable ? 'rgba(16, 185, 129, 0.15)' : isMaintenance ? 'rgba(245, 158, 11, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                      color: isAvailable ? '#10b981' : isMaintenance ? '#f59e0b' : '#38bdf8',
                      border: isAvailable ? '1px solid rgba(16, 185, 129, 0.3)' : isMaintenance ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(56, 189, 248, 0.3)'
                    }}
                  >
                    {item.status}
                  </span>
                </div>

                {/* Usage Hours Progress toward 350hr threshold */}
                {(() => {
                  const THRESHOLD = 350;
                  const hours = item.totalUsageHours || 0;
                  const pct = Math.min((hours / THRESHOLD) * 100, 100);
                  const nearLimit = pct >= 80;
                  const barColor = pct >= 100 ? '#ef4444' : nearLimit ? '#f59e0b' : '#10b981';
                  return (
                    <div style={{ minWidth: '130px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                        <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Usage hrs</span>
                        <span style={{ fontSize: '0.68rem', color: barColor, fontWeight: 700 }}>{hours} / {THRESHOLD}h</span>
                      </div>
                      <div style={{ height: '5px', borderRadius: '99px', backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, backgroundColor: barColor, borderRadius: '99px', transition: 'width 0.4s ease' }} />
                      </div>
                      {nearLimit && (
                        <div style={{ fontSize: '0.65rem', color: '#f59e0b', marginTop: '3px', fontWeight: 600 }}>
                          ⚠ {pct >= 100 ? 'Sent to Maintenance' : `${THRESHOLD - hours}h to maintenance`}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Action Buttons Toolbar (View, Edit, Image, Mark Available, Mark Maintenance, Delete) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                
                {/* 👁️ View Details */}
                <button
                  title="View Details"
                  onClick={() => onViewDetails(item)}
                  style={{
                    backgroundColor: 'rgba(56, 189, 248, 0.12)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    color: '#38bdf8',
                    padding: '0.45rem 0.75rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.8rem',
                    fontWeight: 600
                  }}
                >
                  <Eye size={14} />
                  <span>View</span>
                </button>

                {/* ✏️ Edit Equipment */}
                <button
                  title="Edit Equipment"
                  onClick={() => onEditEquipment(item)}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    padding: '0.45rem 0.75rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.8rem',
                    fontWeight: 600
                  }}
                >
                  <Edit3 size={14} />
                  <span>Edit</span>
                </button>

                {/* Status Toggle Buttons */}
                {item.status !== 'Available' && (
                  <button
                    title="Mark Available"
                    onClick={() => onUpdateStatus(item._id || item.id, 'Available')}
                    style={{
                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: '#10b981',
                      padding: '0.45rem 0.75rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.8rem',
                      fontWeight: 600
                    }}
                  >
                    <CheckCircle2 size={14} />
                    <span>Available</span>
                  </button>
                )}

                {item.status !== 'Under Maintenance' && (
                  <button
                    title="Mark Under Maintenance"
                    onClick={() => onScheduleMaint ? onScheduleMaint(item) : onUpdateStatus(item._id || item.id, 'Under Maintenance')}
                    style={{
                      backgroundColor: 'rgba(245, 158, 11, 0.15)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      color: '#f59e0b',
                      padding: '0.45rem 0.75rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.8rem',
                      fontWeight: 600
                    }}
                  >
                    <Wrench size={14} />
                    <span>Maintenance</span>
                  </button>
                )}

                {item.status === 'Under Maintenance' && (
                  <button
                    title="Complete Maintenance"
                    onClick={() => onCompleteMaint ? onCompleteMaint(item._id || item.id) : onUpdateStatus(item._id || item.id, 'Available')}
                    style={{
                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: '#10b981',
                      padding: '0.45rem 0.75rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.8rem',
                      fontWeight: 600
                    }}
                  >
                    <CheckCircle2 size={14} />
                    <span>Complete Maint</span>
                  </button>
                )}

                {/* 🗑️ Delete Equipment */}
                <button
                  title="Delete Equipment"
                  onClick={() => onDeleteEquipment(item._id || item.id, item.name)}
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#ef4444',
                    padding: '0.45rem 0.65rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <Trash2 size={14} />
                </button>

              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
