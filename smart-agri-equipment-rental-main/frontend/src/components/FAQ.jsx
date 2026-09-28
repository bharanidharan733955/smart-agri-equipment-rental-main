// src/components/FAQ.jsx
import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0); // First one expanded or collapsible

  const faqData = [
    {
      question: 'Who can use AgriRentGov?',
      answer: 'All registered farmers in the state with a valid ID and verified land/crop details can register and rent equipment at cooperative rates.'
    },
    {
      question: 'How are the rental rates decided?',
      answer: 'Rates on AgriRentGov are state cooperative rates (up to 40-60% off market rental rates) funded through state agricultural cooperative welfare programs.'
    },
    {
      question: 'How does the audit log work?',
      answer: 'Every single event — farmer registration, equipment request, approval, checkout, GPS location tracking, and maintenance check — is automatically recorded in an immutable digital ledger.'
    },
    {
      question: 'What if the equipment breaks down?',
      answer: 'On-field technical support is available 24/7. In the event of a breakdown, mobile repair units are dispatched immediately or a replacement machine is provided within 4 hours.'
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section id="faq" style={{ padding: '4rem 2.5rem 6rem 2.5rem' }}>
      <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
        
        {/* Heading */}
        <h2
          style={{
            fontSize: '2.4rem',
            fontWeight: 800,
            color: 'var(--color-text)',
            marginBottom: '2.5rem',
            letterSpacing: '-0.02em'
          }}
        >
          Frequently asked.
        </h2>

        {/* FAQ Accordion List */}
        <div style={{ maxWidth: '820px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {faqData.map((item, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={idx}
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease'
                }}
              >
                <button
                  onClick={() => toggleFAQ(idx)}
                  style={{
                    width: '100%',
                    padding: '1.4rem 1.8rem',
                    background: 'none',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <span
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      color: 'var(--color-text)',
                      fontFamily: 'var(--font-family)'
                    }}
                  >
                    {item.question}
                  </span>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-primary)',
                      flexShrink: 0,
                      marginLeft: '1rem'
                    }}
                  >
                    {isOpen ? <Minus size={18} strokeWidth={2.5} /> : <Plus size={18} strokeWidth={2.5} />}
                  </div>
                </button>

                {isOpen && (
                  <div
                    style={{
                      padding: '0 1.8rem 1.5rem 1.8rem',
                      fontSize: '0.92rem',
                      color: 'var(--color-muted)',
                      lineHeight: 1.6,
                      borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                      paddingTop: '1rem'
                    }}
                  >
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
