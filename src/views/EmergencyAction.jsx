import React from 'react';
import QRCode from 'react-qr-code';

/* ── Read user name safely from localStorage (no hooks needed) ── */
function getSafeUserName() {
  try {
    const raw = localStorage.getItem('serene_mock_user');
    if (raw) {
      const u = JSON.parse(raw);
      return u.displayName || u.email || 'Patient';
    }
  } catch (_) { }
  return 'Patient';
}

const CONTACTS = [
  {
    name: 'Ambulance',
    role: 'National Emergency',
    phone: '112',
    sms: null,
    emoji: '🚑',
    color: '#DC2626',
    shadow: 'rgba(220,38,38,0.5)',
  },
  {
    name: 'Police',
    role: 'Law Enforcement',
    phone: '100',
    sms: null,
    emoji: '🚔',
    color: '#2563EB',
    shadow: 'rgba(37,99,235,0.5)',
  },
  {
    name: 'Crisis Helpline',
    role: 'iCall — Mental Health 24/7',
    phone: '9152987821',
    sms: '9152987821',
    smsBody: 'I need urgent mental health support. Please help me.',
    emoji: '💬',
    color: '#7C3AED',
    shadow: 'rgba(124,58,237,0.5)',
  },
  {
    name: 'Fire Brigade',
    role: 'Fire & Rescue',
    phone: '101',
    sms: null,
    emoji: '🔥',
    color: '#EA580C',
    shadow: 'rgba(234,88,12,0.5)',
  },
];

export default function EmergencyAction() {
  const userName = getSafeUserName();

  const qrData =
    'MEDICAL EMERGENCY\n' +
    'Patient: ' + userName + '\n' +
    'Blood Type: O+\n' +
    'Allergies: Penicillin\n' +
    'HR: 72 bpm | SpO2: 98%\n' +
    'Emergency: 112\n' +
    'Crisis Line: 9152987821';

  return (
    <div style={{
      maxWidth: 760,
      margin: '0 auto',
      paddingBottom: 48,
      fontFamily: 'inherit',
      color: 'inherit',
    }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 14, flexShrink: 0,
            background: 'rgba(239,68,68,0.18)',
            border: '1px solid rgba(239,68,68,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22,
          }}>
            🛡️
          </div>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 900, margin: 0, letterSpacing: '-0.03em' }}>
              Emergency &amp; Safety
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>
              One-tap call &amp; text access to emergency services
            </p>
          </div>
        </div>
      </div>

      {/* ── Alert banner ── */}
      <div style={{
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid rgba(239,68,68,0.35)',
        background: 'linear-gradient(135deg, rgba(239,68,68,0.13), rgba(239,68,68,0.05))',
        marginBottom: 28,
      }}>
        <div style={{
          background: 'rgba(239,68,68,0.28)',
          padding: '6px 16px',
          textAlign: 'center',
        }}>
          <span style={{
            fontSize: 11, fontWeight: 800,
            color: '#fca5a5',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
          }}>
            ⚠️ Safety Alert System — Always Active
          </span>
        </div>
        <div style={{
          padding: '18px 20px',
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <span style={{ fontSize: 40, flexShrink: 0 }}>🚨</span>
          <div>
            <p style={{ fontWeight: 800, fontSize: 16, margin: '0 0 4px' }}>
              Emergency Response Ready
            </p>
            <p style={{ fontSize: 13, color: '#f87171', margin: 0 }}>
              Tap any button below to immediately call or message emergency services.
            </p>
          </div>
        </div>
      </div>

      {/* ── Contact cards ── */}
      <p style={{
        fontSize: 11, fontWeight: 800, color: '#64748b',
        textTransform: 'uppercase', letterSpacing: '0.18em',
        marginBottom: 14, marginTop: 0,
      }}>
        Emergency Contacts
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
        gap: 14,
        marginBottom: 32,
      }}>
        {CONTACTS.map(function (c, i) {
          var dialPhone = c.phone;
          return (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 18,
              padding: '18px 20px',
            }}>
              {/* Contact info row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: c.color + '22',
                  border: '1.5px solid ' + c.color + '55',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22,
                }}>
                  {c.emoji}
                </div>
                <div>
                  <p style={{ fontWeight: 800, fontSize: 14, margin: 0 }}>{c.name}</p>
                  <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>{c.role}</p>
                </div>
              </div>

              {/* Call button */}
              <a
                href={'tel:' + dialPhone}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  width: '100%',
                  padding: '13px 0',
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, ' + c.color + ', ' + c.color + 'cc)',
                  boxShadow: '0 8px 20px ' + c.shadow,
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: 15,
                  textDecoration: 'none',
                  marginBottom: c.sms ? 8 : 0,
                  boxSizing: 'border-box',
                  display: 'flex',
                }}
              >
                📞 Call {dialPhone}
              </a>

              {/* SMS button — only for crisis line */}
              {c.sms && (
                <a
                  href={'sms:' + c.sms + (c.smsBody ? '?body=' + encodeURIComponent(c.smsBody) : '')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    width: '100%',
                    padding: '11px 0',
                    borderRadius: 12,
                    background: 'rgba(124,58,237,0.15)',
                    border: '1px solid rgba(124,58,237,0.35)',
                    color: '#c4b5fd',
                    fontWeight: 700,
                    fontSize: 14,
                    textDecoration: 'none',
                    boxSizing: 'border-box',
                  }}
                >
                  ✉️ Text for Help (opens Messages app)
                </a>
              )}
            </div>
          );
        })}
      </div>

      {/* ── QR Code ── */}
      <p style={{
        fontSize: 11, fontWeight: 800, color: '#64748b',
        textTransform: 'uppercase', letterSpacing: '0.18em',
        marginBottom: 14, marginTop: 0,
      }}>
        Paramedic QR Code
      </p>

      <div style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 20,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
      }}>
        <p style={{ fontSize: 13, color: '#94a3b8', margin: 0, textAlign: 'center' }}>
          Show this to paramedics — contains your vitals &amp; emergency contacts
        </p>

        <div style={{
          padding: 16,
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        }}>
          <QRCode
            value={qrData}
            size={176}
            fgColor="#0F172A"
            bgColor="#FFFFFF"
          />
        </div>

        {/* Vitals grid */}
        <div style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
        }}>
          {[
            { emoji: '👤', label: 'Patient', val: userName },
            { emoji: '🩸', label: 'Blood Type', val: 'O+' },
            { emoji: '❤️', label: 'Heart Rate', val: '72 bpm' },
            { emoji: '🫁', label: 'SpO2', val: '98%' },
          ].map(function (row, i) {
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 12px',
                borderRadius: 12,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}>
                <span style={{ fontSize: 14 }}>{row.emoji}</span>
                <span style={{
                  fontSize: 10, color: '#94a3b8', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.1em', flex: 1,
                }}>
                  {row.label}
                </span>
                <span style={{ fontSize: 12, fontWeight: 900 }}>{row.val}</span>
              </div>
            );
          })}
        </div>

        <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, textAlign: 'center' }}>
          ❤️ You are not alone. Help is always available.
        </p>
      </div>
    </div>
  );
}
