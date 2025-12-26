import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MockDataProvider } from './context/MockDataContext';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import OperatorDashboard from './pages/OperatorDashboard';
import SupplierDashboard from './pages/SupplierDashboard';
import AuditorDashboard from './pages/AuditorDashboard';
import { Button } from 'antd';

// Default Generic Dashboard for any role
const GeneralDashboard = () => {
  return (
    <div className="text-center p-10">
      <h1 className="text-2xl font-bold text-gray-700">Welcome to the Dashboard</h1>
      <p className="mt-4 text-gray-500">Please select an action from the sidebar menu.</p>
    </div>
  );
};

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
            <Route path="dashboard" element={<GeneralDashboard />} />

            {/* Role Specific Routes */}
            <Route path="operator/create" element={<OperatorDashboard />} />
            <Route path="operator/list" element={<OperatorDashboard />} /> {/* Reusing same component for demo */}

            <Route path="supplier/invites" element={<SupplierDashboard />} />

            <Route path="auditor/opening" element={<AuditorDashboard />} />
          </Route>
        </Routes>
      </Router>
    </MockDataProvider>
  );
}

export default App;
