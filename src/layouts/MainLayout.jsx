import React, { useState } from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useMockData } from '../context/MockDataContext';
import ChangePasswordModal from '../components/ChangePasswordModal';
import { AppSidebar } from '../components/AppSidebar';
import { TopBar } from '../components/TopBar';

const MainLayout = () => {
    const navigate = useNavigate();
    const { currentUser, logout } = useMockData();
    const [collapsed, setCollapsed] = useState(false);
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);

    if (!currentUser) return <Navigate to="/login" replace />;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex min-h-screen bg-background text-foreground font-sans antialiased">
            <AppSidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                userRole={currentUser.role}
            />

            <div className="flex flex-1 flex-col transition-all duration-300 ease-in-out">
                <TopBar
                    user={currentUser}
                    onLogout={handleLogout}
                    onChangePassword={() => setPasswordModalVisible(true)}
                />
                <main className="flex-1 overflow-auto p-6">
                    <Outlet />
                </main>
            </div>

            <ChangePasswordModal
                visible={passwordModalVisible}
                onClose={() => setPasswordModalVisible(false)}
            />
        </div>
    );
};

export default MainLayout;
