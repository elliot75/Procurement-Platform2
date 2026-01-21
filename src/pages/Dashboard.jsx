import React from 'react';
import { useMockData } from '../context/MockDataContext';
import OperatorDashboard from './OperatorDashboard';
import SupplierDashboard from './SupplierDashboard';
import AuditorDashboard from './AuditorDashboard';
import AdminDashboard from './AdminDashboard';

export default function Dashboard() {
    const { currentUser } = useMockData();

    if (!currentUser) return null;

    switch (currentUser.role) {
        case 'Operator':
            return <OperatorDashboard />;
        case 'Supplier':
            return <SupplierDashboard />;
        case 'Auditor':
            return <AuditorDashboard />;
        case 'Admin':
            return <AdminDashboard />;
        default:
            return <OperatorDashboard />;
    }
}
