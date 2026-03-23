import React from 'react';

const CHANNEL_ICON = { Sms: '💬', Email: '✉️' };
const STATUS_COLOR = {
  Sent:      '#2A5298',
  Delivered: '#1E8449',
  Failed:    '#C0392B',
  Pending:   '#6C757D',
  Opened:    '#2ECC71',
  Clicked:   '#27AE60',
};

function formatDateTime(d) {
  if (!d) return '';
  return new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

export default function OutreachTimeline({ logs = [] }) {
  if (!logs.length) {
    return (
      <div style={{
        padding: '32px',
        textAlign: 'center',
        color: 'var(--color-text-secondary)',
        background: 'var(--color-bg)',
        borderRadius: '10px',
        fontSize: '0.875rem',
      }}>
        No outreach has been sent yet.
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Vertical line */}
      <div style={{
        position: 'absolute',
        left: '15px',
        top: '24px',
        bottom: '8px',
        width: '2px',
        background: 'var(--color-border)',
      }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {logs.map((log, i) => (
          <div key={log.id} style={{
            display: 'flex',
            gap: '16px',
            paddingBottom: i < logs.length - 1 ? '20px' : 0,
            position: 'relative',
          }}>
            {/* Dot */}
            <div style={{
              width: 32, height: 32,
              borderRadius: '50%',
              background: '#fff',
              border: `2px solid ${STATUS_COLOR[log.status] ?? '#CED4DA'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.9rem',
              flexShrink: 0,
              zIndex: 1,
            }}>
              {CHANNEL_ICON[log.channel] ?? '📨'}
            </div>

            {/* Content */}
            <div style={{
              flex: 1,
              background: '#fff',
              border: '1px solid var(--color-border)',
              borderRadius: '10px',
              padding: '12px 16px',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  {log.channel} — {log.daysBeforeDue > 0 ? `${log.daysBeforeDue}-day` : 'Manual'} reminder
                </div>
                <div style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: `${STATUS_COLOR[log.status] ?? '#CED4DA'}20`,
                  color: STATUS_COLOR[log.status] ?? '#6C757D',
                }}>
                  {log.status}
                </div>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                Sent {formatDateTime(log.sentAt)}
                {log.deliveredAt && ` · Delivered ${formatDateTime(log.deliveredAt)}`}
              </div>
              {log.errorMessage && (
                <div style={{
                  marginTop: '6px',
                  fontSize: '0.78rem',
                  color: '#C0392B',
                  background: '#FFF5F5',
                  padding: '4px 8px',
                  borderRadius: '4px',
                }}>
                  {log.errorMessage}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
