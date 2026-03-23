import React from 'react';

const CONFIGS = {
  Red:    { label: 'Urgent',   bg: '#FFF5F5', color: '#C0392B', dot: '#E74C3C' },
  Yellow: { label: 'Soon',     bg: '#FFFBF0', color: '#D68910', dot: '#F39C12' },
  Green:  { label: 'On Track', bg: '#F0FFF4', color: '#1E8449', dot: '#2ECC71' },
};

export default function UrgencyBadge({ level, daysUntilDue, size = 'md' }) {
  const cfg = CONFIGS[level] ?? CONFIGS.Green;
  const isSmall = size === 'sm';

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: isSmall ? '5px' : '6px',
      padding: isSmall ? '3px 8px' : '4px 10px',
      borderRadius: '20px',
      background: cfg.bg,
      color: cfg.color,
      fontSize: isSmall ? '0.72rem' : '0.78rem',
      fontWeight: 600,
      whiteSpace: 'nowrap',
    }}>
      <span style={{
        width: isSmall ? 6 : 7,
        height: isSmall ? 6 : 7,
        borderRadius: '50%',
        background: cfg.dot,
        display: 'inline-block',
        flexShrink: 0,
      }} />
      {typeof daysUntilDue === 'number'
        ? daysUntilDue < 0
          ? `${Math.abs(daysUntilDue)}d overdue`
          : daysUntilDue === 0
            ? 'Due today'
            : `${daysUntilDue}d`
        : cfg.label}
    </span>
  );
}
