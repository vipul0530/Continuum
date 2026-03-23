import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/reports':   'Reports',
};

export default function Header({ onMenuClick, sidebarOpen }) {
  const { worker, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const title = Object.entries(PAGE_TITLES).find(([path]) =>
    location.pathname.startsWith(path)
  )?.[1] ?? 'Continuum';

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: sidebarOpen ? 'var(--sidebar-width)' : 0,
      right: 0,
      height: 'var(--header-height)',
      background: 'var(--color-surface)',
      borderBottom: '1px solid var(--color-border)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      gap: '16px',
      zIndex: 50,
      transition: 'left 0.25s ease',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <button
        onClick={onMenuClick}
        aria-label="Toggle sidebar"
        style={{
          background: 'none',
          border: 'none',
          padding: '6px',
          borderRadius: '6px',
          color: 'var(--color-text-secondary)',
          fontSize: '1.1rem',
          display: 'flex',
          alignItems: 'center',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#F0F2F5'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >
        ☰
      </button>

      <h1 style={{
        fontSize: '1.1rem',
        fontWeight: 600,
        color: 'var(--color-text)',
        flex: 1,
      }}>
        {title}
      </h1>

      {worker && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: 36, height: 36,
            background: 'var(--color-primary)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff',
            fontSize: '0.8rem',
            fontWeight: 700,
          }}>
            {worker.fullName?.charAt(0) ?? 'W'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.2 }}>
              {worker.fullName}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', lineHeight: 1.2 }}>
              {worker.countyName} County
            </span>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: 'none',
              border: '1px solid var(--color-border)',
              borderRadius: '6px',
              padding: '5px 12px',
              fontSize: '0.8rem',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              marginLeft: '4px',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-danger)'; e.currentTarget.style.color = 'var(--color-danger)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
          >
            Sign out
          </button>
        </div>
      )}
    </header>
  );
}
