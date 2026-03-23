import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCase } from '../hooks/useCases.js';
import { outreachService } from '../services/outreachService.js';
import UrgencyBadge from '../components/cases/UrgencyBadge.js';
import OutreachTimeline from '../components/outreach/OutreachTimeline.js';
import LoadingSpinner from '../components/common/LoadingSpinner.js';
import ErrorMessage from '../components/common/ErrorMessage.js';

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </span>
      <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
        {value ?? '—'}
      </span>
    </div>
  );
}

function formatDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function CaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { caseData, loading, error, refresh } = useCase(id);

  const [sending, setSending] = useState(null);
  const [sendResult, setSendResult] = useState(null);

  async function sendOutreach(channel) {
    setSending(channel);
    setSendResult(null);
    try {
      await outreachService.send(caseData.id, channel);
      setSendResult({ type: 'success', message: `${channel} sent successfully.` });
      refresh();
    } catch {
      setSendResult({ type: 'error', message: `Failed to send ${channel}. Please try again.` });
    } finally {
      setSending(null);
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '80px' }}>
        <LoadingSpinner size={40} />
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div style={{ maxWidth: 600, margin: '40px auto' }}>
        <ErrorMessage message={error ?? 'Case not found.'} onRetry={refresh} />
      </div>
    );
  }

  const c = caseData;
  const canSendSms = !!c.clientPhone;
  const canSendEmail = !!c.clientEmail;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Back + header */}
      <div>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'none', border: 'none',
            color: 'var(--color-text-secondary)',
            fontSize: '0.875rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '0 0 12px',
          }}
        >
          ← Back to Dashboard
        </button>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Case #{c.caseNumber}</h2>
              <UrgencyBadge level={c.urgencyLevel} daysUntilDue={c.daysUntilDue} />
              {c.isAtRisk && (
                <span style={{
                  background: '#E74C3C', color: '#fff',
                  padding: '3px 10px', borderRadius: '12px',
                  fontSize: '0.72rem', fontWeight: 700,
                }}>
                  AT RISK
                </span>
              )}
            </div>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
              {c.clientFullName} · SAR-7 due {formatDate(c.sarDueDate)}
            </p>
          </div>

          {/* Send outreach buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              disabled={!canSendSms || sending === 'Sms'}
              onClick={() => sendOutreach('Sms')}
              style={{
                padding: '9px 18px',
                background: canSendSms ? '#1B3A6B' : '#E9ECEF',
                color: canSendSms ? '#fff' : '#ADB5BD',
                border: 'none', borderRadius: '8px',
                fontWeight: 600, fontSize: '0.875rem',
                cursor: canSendSms ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              {sending === 'Sms' ? <LoadingSpinner size={14} color="#fff" /> : '💬'}
              Send SMS
            </button>
            <button
              disabled={!canSendEmail || sending === 'Email'}
              onClick={() => sendOutreach('Email')}
              style={{
                padding: '9px 18px',
                background: canSendEmail ? '#2A5298' : '#E9ECEF',
                color: canSendEmail ? '#fff' : '#ADB5BD',
                border: 'none', borderRadius: '8px',
                fontWeight: 600, fontSize: '0.875rem',
                cursor: canSendEmail ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              {sending === 'Email' ? <LoadingSpinner size={14} color="#fff" /> : '✉️'}
              Send Email
            </button>
          </div>
        </div>

        {sendResult && (
          <div style={{
            marginTop: '12px',
            padding: '10px 16px',
            borderRadius: '8px',
            background: sendResult.type === 'success' ? '#D4EDDA' : '#F8D7DA',
            color: sendResult.type === 'success' ? '#155724' : '#721C24',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}>
            {sendResult.message}
          </div>
        )}
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Client info */}
        <div style={{
          background: '#fff', borderRadius: '14px',
          padding: '24px', boxShadow: 'var(--shadow-sm)',
        }}>
          <h3 style={{ fontWeight: 700, marginBottom: '20px', fontSize: '1rem' }}>Client Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <InfoRow label="Full Name" value={c.clientFullName} />
            <InfoRow label="Preferred Language" value={c.preferredLanguage === 'es' ? 'Spanish' : 'English'} />
            <InfoRow label="Phone" value={c.clientPhone} />
            <InfoRow label="Email" value={c.clientEmail} />
          </div>
        </div>

        {/* Case details */}
        <div style={{
          background: '#fff', borderRadius: '14px',
          padding: '24px', boxShadow: 'var(--shadow-sm)',
        }}>
          <h3 style={{ fontWeight: 700, marginBottom: '20px', fontSize: '1rem' }}>Case Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <InfoRow label="Status" value={c.status.replace(/([A-Z])/g, ' $1').trim()} />
            <InfoRow label="SAR-7 Due Date" value={formatDate(c.sarDueDate)} />
            <InfoRow label="Outreach Attempts" value={c.outreachAttempts} />
            <InfoRow label="Last Contact" value={formatDate(c.lastOutreachAt)} />
            <InfoRow label="Submitted At" value={formatDate(c.submittedAt)} />
          </div>
        </div>
      </div>

      {/* Outreach timeline */}
      <div style={{
        background: '#fff', borderRadius: '14px',
        padding: '24px', boxShadow: 'var(--shadow-sm)',
      }}>
        <h3 style={{ fontWeight: 700, marginBottom: '20px', fontSize: '1rem' }}>
          Outreach History
          <span style={{ marginLeft: '8px', fontSize: '0.8rem', fontWeight: 400, color: 'var(--color-text-secondary)' }}>
            {c.outreachHistory?.length ?? 0} touchpoints
          </span>
        </h3>
        <OutreachTimeline logs={c.outreachHistory ?? []} />
      </div>
    </div>
  );
}
