import React from 'react';

const inputStyle = {
  padding: '8px 12px',
  border: '1px solid var(--color-border)',
  borderRadius: '8px',
  fontSize: '0.875rem',
  color: 'var(--color-text)',
  background: '#fff',
  outline: 'none',
  transition: 'border-color 0.15s',
  minWidth: 0,
};

export default function CaseFilters({ filters, onChange }) {
  function set(key, value) {
    onChange({ ...filters, [key]: value || undefined });
  }

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px',
      alignItems: 'center',
    }}>
      <select
        value={filters.urgencyLevel ?? ''}
        onChange={e => set('urgencyLevel', e.target.value)}
        style={inputStyle}
      >
        <option value="">All Urgency</option>
        <option value="Red">🔴 Urgent (0–7 days)</option>
        <option value="Yellow">🟡 Soon (8–14 days)</option>
        <option value="Green">🟢 On Track (15+ days)</option>
      </select>

      <select
        value={filters.status ?? ''}
        onChange={e => set('status', e.target.value)}
        style={inputStyle}
      >
        <option value="">All Statuses</option>
        <option value="Active">Active</option>
        <option value="PendingSubmission">Pending Submission</option>
        <option value="Submitted">Submitted</option>
        <option value="Terminated">Terminated</option>
      </select>

      <select
        value={filters.isAtRisk === true ? 'true' : filters.isAtRisk === false ? 'false' : ''}
        onChange={e => {
          const v = e.target.value;
          onChange({ ...filters, isAtRisk: v === 'true' ? true : v === 'false' ? false : undefined });
        }}
        style={inputStyle}
      >
        <option value="">All Cases</option>
        <option value="true">At-Risk Only</option>
        <option value="false">Not At-Risk</option>
      </select>

      <input
        type="date"
        placeholder="Due from"
        value={filters.dueDateFrom ?? ''}
        onChange={e => set('dueDateFrom', e.target.value)}
        style={{ ...inputStyle, width: '150px' }}
      />

      <input
        type="date"
        placeholder="Due to"
        value={filters.dueDateTo ?? ''}
        onChange={e => set('dueDateTo', e.target.value)}
        style={{ ...inputStyle, width: '150px' }}
      />

      {Object.values(filters).some(v => v !== undefined && v !== '') && (
        <button
          onClick={() => onChange({})}
          style={{
            padding: '8px 14px',
            background: 'none',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            fontSize: '0.8rem',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
          }}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
