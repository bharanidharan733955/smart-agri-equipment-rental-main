// src/components/farmer/FarmerComplaintsView.jsx
import React, { useState } from 'react';
import { Plus, X, CheckCircle2 } from 'lucide-react';

export default function FarmerComplaintsView({ complaintsList, onFileComplaint }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Machine Breakdown');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onFileComplaint({ subject, category, description });
    setSubject('');
    setDescription('');
    setIsModalOpen(false);
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
      
      {/* Top Header Row with Section Tag & File Complaint Button */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <span className="section-tag">SUPPORT</span>
          <h1
            style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.02em'
            }}
          >
            Complaints
          </h1>
        </div>

        {/* Right Green Button matching Screenshot 4 */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-green"
          style={{ padding: '0.65rem 1.4rem', fontSize: '0.88rem', borderRadius: 'var(--radius-pill)' }}
        >
          <Plus size={16} />
          <span>File complaint</span>
        </button>
      </div>

      {/* Complaints Table Container */}
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
            gridTemplateColumns: '2fr 1.5fr 1.5fr 1.2fr 1fr 1fr',
            padding: '1.2rem 1.8rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: '#64748b',
            textTransform: 'uppercase'
          }}
        >
          <div>SUBJECT</div>
          <div>CATEGORY</div>
          <div>FARMER</div>
          <div>FILED</div>
          <div>STATUS</div>
          <div>ACTIONS</div>
        </div>

        {/* Table Body */}
        {complaintsList.length > 0 ? (
          <div>
            {complaintsList.map(c => (
              <div
                key={c.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1.5fr 1.5fr 1.2fr 1fr 1fr',
                  padding: '1.4rem 1.8rem',
                  alignItems: 'center',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                  fontSize: '0.9rem'
                }}
              >
                <div style={{ fontWeight: 700, color: '#ffffff' }}>{c.subject}</div>
                <div style={{ color: '#94a3b8' }}>{c.category}</div>
                <div style={{ color: '#cbd5e1' }}>{c.farmerName}</div>
                <div style={{ color: '#94a3b8' }}>{c.filedAt}</div>
                <div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.25rem 0.75rem',
                      borderRadius: 'var(--radius-pill)',
                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                      color: '#10b981',
                      border: '1px solid rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    {c.status}
                  </span>
                </div>
                <div style={{ color: '#38bdf8', cursor: 'pointer', fontSize: '0.85rem' }}>View</div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State matching Screenshot 4 */
          <div
            style={{
              padding: '6rem 2rem',
              textAlign: 'center',
              color: '#94a3b8',
              fontSize: '0.95rem'
            }}
          >
            No complaints filed.
          </div>
        )}
      </div>

      {/* File Complaint Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            backgroundColor: 'rgba(8, 14, 28, 0.85)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '520px',
              backgroundColor: '#131d35',
              borderRadius: '20px',
              padding: '2.2rem',
              position: 'relative',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)'
            }}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: '#ffffff',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>

            <span className="section-tag">SUPPORT & HELP DESK</span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginBottom: '1.2rem' }}>
              File a Complaint / Issue
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '0.35rem', fontWeight: 600 }}>
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Delay in Tractor Delivery / Engine Fault"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.9rem',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '0.35rem', fontWeight: 600 }}>
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.9rem',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="Machine Breakdown" style={{ backgroundColor: '#131d35' }}>Machine Breakdown</option>
                  <option value="Delivery Delay" style={{ backgroundColor: '#131d35' }}>Delivery Delay</option>
                  <option value="Billing / Payment Issue" style={{ backgroundColor: '#131d35' }}>Billing / Payment Issue</option>
                  <option value="Cooperative Hub Support" style={{ backgroundColor: '#131d35' }}>Cooperative Hub Support</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '0.35rem', fontWeight: 600 }}>
                  Detailed Description *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your issue in detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.9rem',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              <button type="submit" className="btn-green" style={{ padding: '0.85rem', marginTop: '0.4rem', justifyContent: 'center' }}>
                Submit Complaint to Support Desk
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
