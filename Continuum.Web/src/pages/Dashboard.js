import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useCases } from '../hooks/useCases.js';
import { reportService } from '../services/reportService.js';
import { caseService } from '../services/caseService.js';
import CaseTable from '../components/cases/CaseTable.js';
import CaseFilters from '../components/cases/CaseFilters.js';
import ErrorMessage from '../components/common/ErrorMessage.js';
import LoadingSpinner from '../components/common/LoadingSpinner.js';

function StatCard({ label, value, sub, accent, icon }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: '14px',
      padding: '20px 24px',
      boxShadow: 'var(--shadow-sm)',
      borderTop: `4px solid ${accent}`,
      flex: '1 1 180px',
      minWidth: 0,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
            {label}
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-text)', lineHeight: 1 }}>
            {value ?? '—'}
          </div>
          {sub && (
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              {sub}
            </div>
          )}
        </div>
        <span style={{ fontSize: '1.5rem', opacity: 0.8 }}>{icon}</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { worker } = useAuth();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({});
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [importFile, setImportFile] = useState(null);
  const [importStatus, setImportStatus] = useState(null);
  const [importing, setImporting] = useState(false);

  const { cases, total, loading, error, page, setPage, refresh } = useCases(filters);

  useEffect(() => {
    if (!worker) return;
    setSummaryLoading(true);
    reportService.getSummary(worker.countyId)
      .then(setSummary)
      .catch(() => {})
      .finally(() => setSummaryLoading(false));
  }, [worker]);

  async function handleImport(e) {
    e.preventDefault();
    if (!importFile) return;
    setImporting(true);
    setImportStatus(null);
    try {
      const result = await caseService.importCases(importFile);
      setImportStatus({ type: 'success', message: `Imported ${result.imported} new cases (${result.total} total in file).` });
      setImportFile(null);
      refresh();
    } catch {
      setImportStatus({ type: 'error', message: 'Import failed. Please check the CSV format and try again.' });
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px' }}>
            Case Dashboard
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            {worker?.countyName} County · SAR-7 compliance overview
          </p>
        </div>

        {/* Import CSV */}
        <form onSubmit={handleImport} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <label style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 14px',
            border: '1.5px dashed var(--color-border)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            color: 'var(--color-text-secondary)',
            background: '#fff',
            transition: 'border-color 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
          >
            📁 {importFile ? importFile.name : 'Import CalSAWS CSV'}
            <input type="file" accept=".csv" hidden onChange={e => setImportFile(e.target.files[0])} />
          </label>
          {importFile && (
            <button
              type="submit"
              disabled={importing}
              style={{
                padding: '8px 16px',
                background: 'var(--color-primary)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: importing ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              {importing ? <LoadingSpinner size={14} color="#fff" /> : null}
              {importing ? 'Importing…' : 'Upload'}
            </button>
          )}
        </form>
      </div>

      {importStatus && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          background: importStatus.type === 'success' ? '#D4EDDA' : '#F8D7DA',
          color: importStatus.type === 'success' ? '#155724' : '#721C24',
          fontSize: '0.875rem',
          fontWeight: 500,
        }}>
          {importStatus.message}
        </div>
      )}

      {/* Summary stats */}
      {summaryLoading
        ? <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}><LoadingSpinner /></div>
        : summary && (
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <StatCard label="Total Active Cases" value={summary.totalActiveCases} icon="📋" accent="var(--color-primary)" />
            <StatCard label="Urgent (0–7 days)" value={summary.totalRedCases} icon="🔴" accent="var(--color-danger)"
              sub={`${Math.round(summary.totalRedCases / (summary.totalActiveCases || 1) * 100)}% of active`} />
            <StatCard label="Soon (8–14 days)" value={summary.totalYellowCases} icon="🟡" accent="var(--color-warning)" />
            <StatCard label="On Track (15+ days)" value={summary.totalGreenCases} icon="🟢" accent="var(--color-accent)" />
            <StatCard label="Submitted This Month" value={summary.totalSubmittedThisMonth} icon="✅" accent="var(--color-accent)"
              sub={`${summary.complianceRate}% compliance rate`} />
            <StatCard label="Est. Cost Savings" value={`$${summary.estimatedCostSavings.toLocaleString()}`} icon="💰" accent="#8E44AD"
              sub="vs. unassisted terminations" />
          </div>
        )}

      {/* Filters + Table */}
      <div style={{
        background: '#fff',
        borderRadius: '14px',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div style={{ fontWeight: 600, fontSize: '1rem' }}>
            Cases
            <span style={{ marginLeft: '8px', fontSize: '0.8rem', fontWeight: 400, color: 'var(--color-text-secondary)' }}>
              {total} total
            </span>
          </div>
          <CaseFilters filters={filters} onChange={f => { setFilters(f); setPage(1); }} />
        </div>

        <div style={{ padding: '0 4px' }}>
          {error
            ? <div style={{ padding: '20px' }}><ErrorMessage message={error} onRetry={refresh} /></div>
            : <CaseTable
                cases={cases}
                loading={loading}
                total={total}
                page={page}
                onPageChange={setPage}
              />
          }
        </div>
      </div>
    </div>
  );
}
