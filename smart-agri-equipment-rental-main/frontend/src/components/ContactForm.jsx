// src/components/ContactForm.jsx
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, CheckCircle2, Headphones } from 'lucide-react';

export default function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '', subject: 'General Inquiry' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', phone: '', message: '', subject: 'General Inquiry' });
    }, 4000);
  };

  return (
    <section id="contact" style={{ padding: '6rem 2rem', position: 'relative' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: '3rem', alignItems: 'center' }}>
          
          {/* Left Info Column */}
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              WE ARE HERE TO HELP
            </span>
            <h2 style={{ fontSize: '2.8rem', fontWeight: 800, color: '#ffffff', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
              Talk with an AgriRent Specialist
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2.5rem', lineHeight: 1.6 }}>
              Have questions about machine compatibility, RTK GPS setup, or long-term seasonal rates? Our team of certified agronomists is available 24/7.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(52, 211, 153, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Phone size={22} color="#34d399" />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>Direct Support Line</div>
                  <div style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 700 }}>+1 (800) 555-AGRI</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Mail size={22} color="#38bdf8" />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>Email Dispatch</div>
                  <div style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 700 }}>support@agrirent-smart.com</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(52, 211, 153, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin size={22} color="#34d399" />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>Regional Hub</div>
                  <div style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 700 }}>Midwest Logistics Center, Des Moines, IA</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form Card */}
          <div className="glass-panel" style={{
            padding: '2.8rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-glass)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
          }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <CheckCircle2 size={54} color="#34d399" style={{ margin: '0 auto 1.5rem' }} />
                <h3 style={{ fontSize: '1.6rem', color: '#fff', fontWeight: 700, marginBottom: '0.5rem' }}>
                  Message Transmitted!
                </h3>
                <p style={{ color: 'var(--text-muted)' }}>
                  Thank you, {formData.name || 'Valued Farmer'}. Our field team will contact you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
                  Send a Field Message
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid var(--border-glass)',
                        color: '#fff',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="jane@farm.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid var(--border-glass)',
                        color: '#fff',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>
                    Inquiry Topic
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      background: '#0d241a',
                      border: '1px solid var(--border-glass)',
                      color: '#fff',
                      outline: 'none'
                    }}
                  >
                    <option value="General Inquiry">General Equipment Inquiry</option>
                    <option value="Custom Fleet Booking">Custom Seasonal Fleet Reservation</option>
                    <option value="Technical Support">RTK / Telemetry Technical Support</option>
                    <option value="Partnerships">Equipment Fleet Partnership</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>
                    Message Details
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us about your farm acreage, crop type, and requested rental timeframe..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid var(--border-glass)',
                      color: '#fff',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <button type="submit" className="btn-primary" style={{ padding: '0.85rem', justifyContent: 'center', marginTop: '0.5rem' }}>
                  <span>Transmit Message</span>
                  <Send size={16} />
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
