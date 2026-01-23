import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MockDataProvider } from './context/MockDataContext';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import OperatorDashboard from './pages/OperatorDashboard';
import OperatorOpeningHall from './pages/OperatorOpeningHall';
import SupplierDashboard from './pages/SupplierDashboard';
import AuditorDashboard from './pages/AuditorDashboard';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import UserManagement from './pages/UserManagement';
import BusinessCategoryManagement from './pages/BusinessCategoryManagement';
import Dashboard from './pages/Dashboard';
import { Button } from 'antd';

// Default Generic Dashboard removed in favor of Dashboard.jsx

// Protected Route Wrapper could be added here, 
// but MainLayout handles basic redirection if no user.

function App() {
  return (
    <MockDataProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes inside MainLayout */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* Role Specific Routes */}
            <Route path="operator/create" element={<OperatorDashboard />} />
            <Route path="operator/list" element={<OperatorDashboard />} /> {/* Reusing same component for demo */}
            <Route path="operator/opening" element={<OperatorOpeningHall />} />

            <Route path="supplier/invites" element={<SupplierDashboard />} />

            <Route path="auditor/opening" element={<AuditorDashboard />} />

            {/* Admin Routes */}
            <Route path="admin/users" element={<UserManagement />} />
            <Route path="admin/business-categories" element={<BusinessCategoryManagement />} />
          </Route>

          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Routes>
      </Router>
    </MockDataProvider>
  );
}

export default App;
