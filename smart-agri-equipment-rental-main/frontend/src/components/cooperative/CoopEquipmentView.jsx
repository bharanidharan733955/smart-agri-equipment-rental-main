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

  const statusTabs = ['All', 'Available', 'Rented'];

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
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
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
        const rentedCount = equipmentList.filter(e => e.status === 'In Use' || e.status === 'Rented' || e.status === 'Reserved').length;
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '2.5rem' }}>
            {/* Card 1: Types */}
            <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '1.4rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Equipment Types</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text)', marginTop: '0.2rem' }}>{totalTypes}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)', marginTop: '4px' }}>Unique categories</div>
            </div>

            {/* Card 2: Total Units */}
            <div style={{ backgroundColor: 'rgba(21, 128, 61,0.07)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '1.4rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 600, textTransform: 'uppercase' }}>Total Units</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)', marginTop: '0.2rem' }}>{totalUnitsSum}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)', marginTop: '4px' }}>15 units × {totalTypes} types</div>
            </div>

            {/* Card 3: Active Rentals */}
            <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '1.4rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-info)', fontWeight: 600, textTransform: 'uppercase' }}>Active Rentals</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-info)', marginTop: '0.2rem' }}>
                {stats?.activeRentals ?? rentedCount}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)', marginTop: '4px' }}>Currently in use</div>
            </div>
          </div>
        );
      })()}

      {/* Filter & Search Bar */}
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
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
                  backgroundColor: isActive ? 'var(--color-info-bg)' : 'transparent',
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
              backgroundColor: 'var(--color-border)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
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
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '20px',
                padding: '1.5rem 1.8rem',
                display: 'grid',
                gridTemplateColumns: '1.5fr 1fr 1fr 2.2fr',
                alignItems: 'center',
                gap: '1.8rem',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
            >
              {/* Title & Hub info (Clickable to view details) */}
              <div>
                <h3
                  onClick={() => onViewDetails(item)}
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    color: 'var(--color-text)',
                    marginBottom: '4px',
                    cursor: 'pointer',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#ffffff')}
                >
                  {item.name}
                </h3>
                <div style={{ fontSize: '0.82rem', color: 'var(--color-muted)' }}>
                  Category: <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>{item.category}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '5px' }}>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: 'var(--color-success-bg)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-primary)'
                  }}>
                    {item.units ? item.units.filter(u => u.status === 'Available').length : (item.totalUnits || 15)} units available
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>{item.cooperativeHub || item.location}</span>
                </div>
              </div>

              {/* Rate & Serial */}
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                  ₹{item.rentalRate || item.price || item.pricePerDay}<span style={{ fontSize: '0.8rem', color: 'var(--color-muted)', fontWeight: 400 }}>/day</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '2px' }}>
                  Brand: {item.manufacturer || 'Standard'}
                </div>
              </div>

              {/* Status Badge */}
              <div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.25rem 0.75rem',
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: isAvailable ? 'var(--color-success-bg)' : isMaintenance ? 'var(--color-warning-bg)' : 'var(--color-info-bg)',
                    color: isAvailable ? 'var(--color-primary)' : isMaintenance ? '#f59e0b' : '#38bdf8',
                    border: isAvailable ? '1px solid rgba(21, 128, 61, 0.3)' : isMaintenance ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(56, 189, 248, 0.3)'
                  }}
                >
                  {item.status}
                </span>
              </div>

              {/* Action Buttons Toolbar (View, Edit, Mark Available, Delete) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>

                {/* 👁️ View Details */}
                <button
                  title="View Details"
                  onClick={() => onViewDetails(item)}
                  style={{
                    backgroundColor: 'var(--color-info-bg)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-info)',
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
                    backgroundColor: 'var(--color-border)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
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

                {/* Status Toggle Button */}
                {item.status !== 'Available' && (
                  <button
                    title="Mark Available"
                    onClick={() => onUpdateStatus(item._id || item.id, 'Available')}
                    style={{
                      backgroundColor: 'var(--color-success-bg)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-primary)',
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

                {/* 🗑️ Delete Equipment */}
                <button
                  title="Delete Equipment"
                  onClick={() => onDeleteEquipment(item._id || item.id, item.name)}
                  style={{
                    backgroundColor: 'var(--color-danger-bg)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-danger)',
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
