import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import ProtectedRoute from './components/common/ProtectedRoute.js';
import Layout from './components/layout/Layout.js';
import Login from './pages/Login.js';
import Dashboard from './pages/Dashboard.js';
import CaseDetail from './pages/CaseDetail.js';
import SarForm from './pages/SarForm.js';
import Reports from './pages/Reports.js';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/sar/:token" element={<SarForm />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="cases/:id" element={<CaseDetail />} />
            <Route path="reports" element={<Reports />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
