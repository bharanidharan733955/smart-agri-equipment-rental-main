// src/components/EquipmentCatalog.jsx
import React, { useState } from 'react';
import { ArrowRight, Tractor, Sparkles, Sliders, Wrench, Sprout, Grid, Droplets, Wind } from 'lucide-react';

export const EQUIPMENT_LIST = [
  { id: 'eq-1', name: 'Mahindra Tractor', price: 1500, icon: Tractor, desc: 'Heavy duty & compact utility tractors for field plowing.' },
  { id: 'eq-2', name: 'John Deere Harvester', price: 2200, icon: Sparkles, desc: 'Multi-crop combine harvesters for grain harvesting.' },
  { id: 'eq-3', name: 'Sonalika Rotavator', price: 800, icon: Sliders, desc: 'Rotary tillers for secondary seedbed preparation.' },
  { id: 'eq-4', name: 'Power Tiller Pro', price: 600, icon: Wrench, desc: 'Walk-behind tillers ideal for small holdings & orchards.' },
  { id: 'eq-5', name: 'Seed Drill Max', price: 900, icon: Sprout, desc: 'Precision tractor-mounted seed sowing machinery.' },
  { id: 'eq-6', name: 'Tillage Cultivator', price: 700, icon: Grid, desc: 'Soil aeration implements for secondary tillage.' },
  { id: 'eq-7', name: 'Crop Sprayer', price: 500, icon: Droplets, desc: 'High pressure tractor mounted crop protection sprayers.' },
  { id: 'eq-8', name: 'Multi-Crop Thresher', price: 1100, icon: Wind, desc: 'High throughput crop threshing & grain separation.' },
  { id: 'eq-9', name: 'Laser Land Leveler', price: 1300, icon: Grid, desc: 'Laser guided precision soil land leveling machines.' },
  { id: 'eq-10', name: 'Happy Seeder', price: 950, icon: Sprout, desc: 'Straw management & sowing machines without tillage.' },
  { id: 'eq-11', name: 'Straw Baler', price: 1200, icon: Tractor, desc: 'High compaction crop residue straw baling machines.' },
  { id: 'eq-12', name: 'Crop Reaper', price: 750, icon: Sliders, desc: 'Crop harvesting and windrowing machines.' }
];

export default function EquipmentCatalog({ onSelectEquipment, onOpenFullCatalog }) {
  const [activeCard, setActiveCard] = useState('eq-7'); // Sprayer is active in screenshot 2!

  return (
    <section id="equipment" style={{ padding: '5rem 2.5rem 4rem 2.5rem' }}>
      <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
        
        {/* Section Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
          <div>
            <span className="section-tag">EQUIPMENT CATALOG</span>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
              Everything your farm needs.
            </h2>
          </div>
          <button
            onClick={onOpenFullCatalog}
            className="cyan-link"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.95rem' }}
          >
            <span>Explore full catalog</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* 8 Equipment Cards Grid (4 columns x 2 rows) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1.5rem'
          }}
        >
          {EQUIPMENT_LIST.map((item) => {
            const IconComp = item.icon;
            const isActive = activeCard === item.id;

            return (
              <div
                key={item.id}
                onClick={() => {
                  setActiveCard(item.id);
                  onSelectEquipment(item);
                }}
                style={{
                  backgroundColor: '#131d35',
                  border: isActive ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '1.8rem 1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  boxShadow: isActive ? '0 0 20px rgba(16, 185, 129, 0.15)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {/* Icon Container */}
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem'
                  }}
                >
                  <IconComp size={22} color="#10b981" />
                </div>

                {/* Title */}
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.35rem' }}>
                  {item.name}
                </h3>

                {/* Price */}
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>
                  From ₹{item.price}/day
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
