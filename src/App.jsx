import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import { Button } from 'antd';

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const logout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p>Welcome, {user.name} ({user.role})</p>
      <Button onClick={logout} danger className="mt-4">Logout</Button>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
