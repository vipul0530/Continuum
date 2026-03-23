import React from 'react';

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div style={{
      padding: '16px 20px',
      background: '#FFF5F5',
      border: '1px solid #E74C3C',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      color: '#C0392B',
    }}>
      <span style={{ fontSize: '20px' }}>⚠️</span>
      <span style={{ flex: 1, fontSize: '0.9rem' }}>{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            background: 'none',
            border: '1px solid #E74C3C',
            borderRadius: '6px',
            padding: '4px 12px',
            color: '#C0392B',
            fontSize: '0.8rem',
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      )}
    </div>
  );
}
