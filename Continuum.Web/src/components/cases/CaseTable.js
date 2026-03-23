import React from 'react';
import { useNavigate } from 'react-router-dom';
import UrgencyBadge from './UrgencyBadge.js';
import LoadingSpinner from '../common/LoadingSpinner.js';

const ROW_ACCENT = {
  Red:    'rgba(231, 76, 60, 0.06)',
  Yellow: 'rgba(243, 156, 18, 0.06)',
  Green:  'transparent',
};

const LEFT_BORDER = {
  Red:    '3px solid #E74C3C',
  Yellow: '3px solid #F39C12',
  Green:  '3px solid transparent',
};

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function CaseTable({ cases, loading, total, page, pageSize = 25, onPageChange }) {
  const navigate = useNavigate();
  const totalPages = Math.ceil(total / pageSize);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
        <LoadingSpinner size={36} />
      </div>
    );
  }

  if (!cases.length) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        color: 'var(--color-text-secondary)',
      }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📋</div>
        <div style={{ fontWeight: 600, marginBottom: '4px' }}>No cases found</div>
        <div style={{ fontSize: '0.85rem' }}>Try adjusting your filters</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
              {['Case #', 'Client', 'SAR-7 Due', 'Urgency', 'Status', 'Outreach', 'Last Contact', 'Submitted'].map(h => (
                <th key={h} style={{
                  padding: '10px 16px',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: 'var(--color-text-secondary)',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cases.map((c) => (
              <tr
                key={c.id}
                onClick={() => navigate(`/cases/${c.id}`)}
                style={{
                  borderBottom: '1px solid var(--color-border)',
                  background: ROW_ACCENT[c.urgencyLevel] ?? 'transparent',
                  borderLeft: LEFT_BORDER[c.urgencyLevel] ?? '3px solid transparent',
                  cursor: 'pointer',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(27,58,107,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = ROW_ACCENT[c.urgencyLevel] ?? 'transparent'}
              >
                <td style={{ padding: '12px 16px', fontWeight: 600, fontFamily: 'monospace', fontSize: '0.85rem' }}>
                  {c.caseNumber}
                  {c.isAtRisk && (
                    <span style={{
                      marginLeft: '6px',
                      fontSize: '0.65rem',
                      background: '#E74C3C',
                      color: '#fff',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      fontFamily: 'sans-serif',
                      fontWeight: 700,
                    }}>
                      AT RISK
                    </span>
                  )}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontWeight: 500 }}>{c.clientFullName}</div>
                  <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.78rem' }}>
                    {c.clientPhone ?? c.clientEmail ?? 'No contact info'}
                  </div>
                </td>
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontWeight: 500 }}>
                  {formatDate(c.sarDueDate)}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <UrgencyBadge level={c.urgencyLevel} daysUntilDue={c.daysUntilDue} size="sm" />
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <StatusPill status={c.status} />
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                  {c.outreachAttempts}
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
                  {formatDate(c.lastOutreachAt)}
                </td>
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
                  {c.submittedAt
                    ? <span style={{ color: '#1E8449', fontWeight: 500 }}>{formatDate(c.submittedAt)}</span>
                    : <span style={{ color: 'var(--color-text-muted)' }}>—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 0 0',
          fontSize: '0.85rem',
          color: 'var(--color-text-secondary)',
        }}>
          <span>
            Showing {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} of {total}
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <PageBtn disabled={page === 1} onClick={() => onPageChange(page - 1)}>← Prev</PageBtn>
            <PageBtn disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>Next →</PageBtn>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }) {
  const cfg = {
    Active:           { bg: '#EBF5FB', color: '#1A5276' },
    PendingSubmission:{ bg: '#FFF3CD', color: '#856404' },
    Submitted:        { bg: '#D4EDDA', color: '#155724' },
    Terminated:       { bg: '#F8D7DA', color: '#721C24' },
    Reinstated:       { bg: '#D1ECF1', color: '#0C5460' },
  }[status] ?? { bg: '#F8F9FA', color: '#495057' };

  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 9px',
      borderRadius: '20px',
      background: cfg.bg,
      color: cfg.color,
      fontSize: '0.75rem',
      fontWeight: 600,
    }}>
      {status.replace(/([A-Z])/g, ' $1').trim()}
    </span>
  );
}

function PageBtn({ children, disabled, onClick }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{
        padding: '6px 14px',
        border: '1px solid var(--color-border)',
        borderRadius: '7px',
        background: disabled ? 'var(--color-bg)' : '#fff',
        color: disabled ? 'var(--color-text-muted)' : 'var(--color-text)',
        cursor: disabled ? 'default' : 'pointer',
        fontSize: '0.82rem',
      }}
    >
      {children}
    </button>
  );
}
