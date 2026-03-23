import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

const NAV_ITEMS = [
  { to: '/dashboard', icon: '◼', label: 'Dashboard' },
  { to: '/reports',   icon: '◈', label: 'Reports'   },
];

export default function Sidebar({ open, onClose }) {
  const { worker } = useAuth();
  const location = useLocation();

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          onClick={onClose}
          style={{
            display: 'none',
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 99,
          }}
          className="sidebar-overlay"
        />
      )}

      <aside style={{
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        width: 'var(--sidebar-width)',
        background: 'var(--color-primary)',
        display: 'flex',
        flexDirection: 'column',
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.25s ease',
        zIndex: 100,
        overflowY: 'auto',
      }}>
        {/* Brand */}
        <div style={{
          padding: '24px 20px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: 36, height: 36,
              background: 'var(--color-accent)',
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '16px', color: '#fff',
            }}>C</div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', lineHeight: 1.2 }}>
                Continuum
              </div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', lineHeight: 1.2 }}>
                SAR-7 Outreach
              </div>
            </div>
          </div>
        </div>

        {/* County badge */}
        {worker && (
          <div style={{
            margin: '16px 16px 8px',
            padding: '10px 14px',
            background: 'rgba(255,255,255,0.08)',
            borderRadius: '8px',
          }}>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
              County
            </div>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.875rem' }}>
              {worker.countyName}
            </div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px 12px' }}>
          {NAV_ITEMS.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 14px',
                borderRadius: '8px',
                marginBottom: '4px',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.65)',
                background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                fontWeight: isActive ? 600 : 400,
                fontSize: '0.9rem',
                transition: 'all 0.15s',
                textDecoration: 'none',
              })}
            >
              <span style={{ fontSize: '1rem', opacity: 0.9 }}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Worker info */}
        {worker && (
          <div style={{
            padding: '16px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
          }}>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', marginBottom: 4 }}>
              {worker.role}
            </div>
            <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 500 }}>
              {worker.fullName}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginTop: 2 }}>
              {worker.email}
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
