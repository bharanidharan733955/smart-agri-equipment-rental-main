// src/components/CostCalculator.jsx
import React, { useState } from 'react';
import { Calculator, Check, Info, Sparkles, DollarSign, Calendar, Shield } from 'lucide-react';

export default function CostCalculator({ onOpenRentalWithPreset }) {
  const [acres, setAcres] = useState(150);
  const [durationDays, setDurationDays] = useState(7);
  const [machineType, setMachineType] = useState('tractor');
  const [includeOperator, setIncludeOperator] = useState(true);
  const [includeInsurance, setIncludeInsurance] = useState(true);

  // Rates
  const baseRates = {
    drone: { perDay: 120, name: 'AI Scouting Drone' },
    tractor: { perDay: 450, name: 'AgriRover X7 Autonomous' },
    sensor: { perDay: 65, name: 'HydroSense IoT Hub' },
    harvester: { perDay: 680, name: 'TerraHarvest 9000 Combine' }
  };

  const selectedRate = baseRates[machineType].perDay;
  const rawCost = selectedRate * durationDays;
  
  // Weekly discount (15% if 7+ days)
  const discountRate = durationDays >= 7 ? 0.15 : 0;
  const discountedBase = rawCost * (1 - discountRate);

  const operatorCost = includeOperator ? 80 * durationDays : 0;
  const insuranceCost = includeInsurance ? 25 * durationDays : 0;

  const totalEstimate = Math.round(discountedBase + operatorCost + insuranceCost);

  return (
    <section id="calculator" style={{ padding: '6rem 2rem', position: 'relative' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        
        <div className="glass-panel" style={{
          borderRadius: 'var(--radius-lg)',
          padding: '3rem',
          border: '1px solid var(--border-glass)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Ambient Background Accent */}
          <div style={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.15), transparent 70%)',
            pointerEvents: 'none'
          }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '3rem', alignItems: 'center' }}>
            
            {/* Left Inputs */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#38bdf8' }}>
                <Calculator size={18} />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  INSTANT PRICE ESTIMATOR
                </span>
              </div>

              <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#fff', marginBottom: '1.5rem' }}>
                Calculate Your Rental Investment
              </h2>

              {/* Machine Type Selection */}
              <div style={{ marginBottom: '1.8rem' }}>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                  Select Machine Category
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                  {Object.entries(baseRates).map(([key, item]) => (
                    <button
                      key={key}
                      onClick={() => setMachineType(key)}
                      style={{
                        padding: '0.8rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        background: machineType === key ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                        border: machineType === key ? '1px solid #34d399' : '1px solid var(--border-glass)',
                        color: machineType === key ? '#34d399' : 'var(--text-main)',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span>{item.name}</span>
                      <span style={{ opacity: 0.8, fontSize: '0.8rem' }}>${item.perDay}/d</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration Slider */}
              <div style={{ marginBottom: '1.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
                    Rental Duration: <strong style={{ color: '#fff' }}>{durationDays} Days</strong>
                  </label>
                  {durationDays >= 7 && (
                    <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 700 }}>
                      🎉 15% Weekly Discount Applied!
                    </span>
                  )}
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={durationDays}
                  onChange={(e) => setDurationDays(parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    height: '8px',
                    borderRadius: '4px',
                    background: '#153e2d',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                />
              </div>

              {/* Addons Checkboxes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                  <input
                    type="checkbox"
                    checked={includeOperator}
                    onChange={(e) => setIncludeOperator(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#10b981' }}
                  />
                  <span>Include Certified Tele-Operator (+$80/day)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                  <input
                    type="checkbox"
                    checked={includeInsurance}
                    onChange={(e) => setIncludeInsurance(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#10b981' }}
                  />
                  <span>Full Field & Damage Protection Insurance (+$25/day)</span>
                </label>
              </div>

            </div>

            {/* Right Result Card */}
            <div style={{
              background: 'rgba(9, 19, 16, 0.9)',
              padding: '2.5rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-glow)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <Sparkles size={32} color="#34d399" style={{ margin: '0 auto 1rem' }} />
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Estimated Total Investment
              </div>
              <div style={{ fontSize: '3.4rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-heading)', margin: '0.5rem 0' }}>
                ${totalEstimate}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '2rem' }}>
                Includes free delivery, setup, and 24/7 technical hotline.
              </div>

              <button
                onClick={() => onOpenRentalWithPreset({
                  machine: baseRates[machineType].name,
                  days: durationDays,
                  estimatedTotal: totalEstimate
                })}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.9rem', fontSize: '1rem' }}
              >
                <span>Reserve This Estimate</span>
              </button>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
