import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import LoadingSpinner from './LoadingSpinner.js';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-fullscreen">
        <LoadingSpinner size={40} />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}
