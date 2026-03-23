import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import LoadingSpinner from '../components/common/LoadingSpinner.js';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1B3A6B 0%, #2A5298 60%, #1E8449 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo / Brand */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: 60, height: 60,
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '16px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            fontWeight: 800,
            color: '#fff',
            backdropFilter: 'blur(8px)',
            marginBottom: '16px',
          }}>
            C
          </div>
          <h1 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
            Continuum
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: '6px', fontSize: '0.9rem' }}>
            SAR-7 Outreach — County Worker Portal
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#fff',
          borderRadius: '20px',
          padding: '36px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '24px', color: 'var(--color-text)' }}>
            Sign in to your account
          </h2>

          {error && (
            <div style={{
              padding: '12px 16px',
              background: '#FFF5F5',
              border: '1px solid #E74C3C',
              borderRadius: '8px',
              color: '#C0392B',
              fontSize: '0.875rem',
              marginBottom: '20px',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Email address
              </span>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@county.ca.gov"
                autoComplete="email"
                style={{
                  padding: '11px 14px',
                  border: '1.5px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => e.target.style.borderColor = '#1B3A6B'}
                onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Password
              </span>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                autoComplete="current-password"
                style={{
                  padding: '11px 14px',
                  border: '1.5px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => e.target.style.borderColor = '#1B3A6B'}
                onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '13px',
                background: loading ? '#ADB5BD' : 'var(--color-primary)',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'background 0.15s',
                marginTop: '4px',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#2A5298'; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = 'var(--color-primary)'; }}
            >
              {loading ? <LoadingSpinner size={20} color="#fff" /> : null}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div style={{
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid var(--color-border)',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
              County SSO (Azure AD / Office 365) can be enabled in settings.
            </p>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>
          © {new Date().getFullYear()} Waymark Lab · Continuum
        </p>
      </div>
    </div>
  );
}
