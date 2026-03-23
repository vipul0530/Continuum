import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('continuum_worker');
    const token = localStorage.getItem('continuum_token');
    if (stored && token) {
      setWorker(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password);
    localStorage.setItem('continuum_token', data.token);
    localStorage.setItem('continuum_worker', JSON.stringify(data.worker));
    setWorker(data.worker);
    return data.worker;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('continuum_token');
    localStorage.removeItem('continuum_worker');
    setWorker(null);
  }, []);

  return (
    <AuthContext.Provider value={{ worker, isAuthenticated: !!worker, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
