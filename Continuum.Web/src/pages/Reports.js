import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { reportService } from '../services/reportService.js';
import { RadialBarChart, RadialBar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import LoadingSpinner from '../components/common/LoadingSpinner.js';
import ErrorMessage from '../components/common/ErrorMessage.js';

function MetricCard({ label, value, sub, color = 'var(--color-primary)', icon }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: '14px',
      padding: '22px 24px',
      boxShadow: 'var(--shadow-sm)',
      borderLeft: `5px solid ${color}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
            {label}
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 700, color: 'var(--color-text)', lineHeight: 1 }}>
            {value}
          </div>
          {sub && (
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '5px' }}>
              {sub}
            </div>
          )}
        </div>
        {icon && <span style={{ fontSize: '1.6rem', opacity: 0.7 }}>{icon}</span>}
      </div>
    </div>
  );
}

const URGENCY_BAR_DATA = (s) => [
  { name: 'Urgent (0–7d)',   value: s.totalRedCases,    fill: '#E74C3C' },
  { name: 'Soon (8–14d)',    value: s.totalYellowCases, fill: '#F39C12' },
  { name: 'On Track (15+d)', value: s.totalGreenCases,  fill: '#2ECC71' },
];

export default function Reports() {
  const { worker } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function load() {
    if (!worker) return;
    setLoading(true);
    setError(null);
    reportService.getSummary(worker.countyId)
      .then(setSummary)
      .catch(() => setError('Failed to load report data. Please try again.'))
      .finally(() => setLoading(false));
  }

  useEffect(load, [worker]);

  function exportCsv() {
    if (!summary) return;
    const rows = [
      ['Metric', 'Value'],
      ['County', summary.countyName],
      ['Total Active Cases', summary.totalActiveCases],
      ['Urgent (0–7 days)', summary.totalRedCases],
      ['Soon (8–14 days)', summary.totalYellowCases],
      ['On Track (15+ days)', summary.totalGreenCases],
      ['Submitted This Month', summary.totalSubmittedThisMonth],
      ['Terminated This Month', summary.totalTerminatedThisMonth],
      ['Outreach Sent This Month', summary.totalOutreachSentThisMonth],
      ['Compliance Rate (%)', summary.complianceRate],
      ['Estimated Cost Savings ($)', summary.estimatedCostSavings],
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `continuum-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '80px' }}><LoadingSpinner size={40} /></div>;
  }

  if (error || !summary) {
    return <div style={{ maxWidth: 600, margin: '40px auto' }}><ErrorMessage message={error ?? 'No data.'} onRetry={load} /></div>;
  }

  const complianceData = [
    { name: 'Compliance', value: summary.complianceRate, fill: '#2ECC71' },
    { name: 'Remaining', value: 100 - summary.complianceRate, fill: '#F0F2F5' },
  ];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px' }}>Reports</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            {summary.countyName} County · {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button
          onClick={exportCsv}
          style={{
            padding: '9px 18px',
            background: 'var(--color-primary)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}
        >
          ⬇ Export CSV
        </button>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
        <MetricCard label="Total Active Cases"      value={summary.totalActiveCases}         color="var(--color-primary)" icon="📋" />
        <MetricCard label="Submitted This Month"    value={summary.totalSubmittedThisMonth}  color="var(--color-accent)"  icon="✅"
          sub={`${summary.complianceRate}% compliance`} />
        <MetricCard label="Terminated This Month"   value={summary.totalTerminatedThisMonth} color="var(--color-danger)"  icon="⚠️"
          sub="Avoidable terminations" />
        <MetricCard label="Outreach Sent"           value={summary.totalOutreachSentThisMonth} color="#8E44AD"            icon="📨"
          sub="This month" />
        <MetricCard label="Est. Cost Savings"       value={`$${summary.estimatedCostSavings.toLocaleString()}`} color="var(--color-accent)" icon="💰"
          sub="@$175/avoided termination" />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Urgency distribution */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '20px', fontSize: '1rem' }}>Case Urgency Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={URGENCY_BAR_DATA(summary)} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip formatter={(v) => [`${v} cases`]} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {URGENCY_BAR_DATA(summary).map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Compliance gauge */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '8px', fontSize: '1rem' }}>Monthly Compliance Rate</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', marginBottom: '16px' }}>
            SAR-7 submissions / cases due
          </p>
          <div style={{ position: 'relative', height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                innerRadius="65%"
                outerRadius="90%"
                data={complianceData}
                startAngle={220}
                endAngle={-40}
              >
                <RadialBar dataKey="value" cornerRadius={8} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1 }}>
                {summary.complianceRate}%
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                compliance
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
