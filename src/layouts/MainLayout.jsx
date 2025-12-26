import React from 'react';
import { Layout, Menu, Button, message } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    DashboardOutlined,
    PlusCircleOutlined,
    UnorderedListOutlined,
    TeamOutlined,
    LogoutOutlined,
    FileDoneOutlined,
    ShoppingOutlined
} from '@ant-design/icons';
import { useMockData } from '../context/MockDataContext';

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser, logout } = useMockData();

    if (!currentUser) return null; // Should be redirected by router

    const handleLogout = () => {
        logout();
        message.success('Logged out successfully');
        navigate('/login');
    };

    // Menu items based on Role
    const getMenuItems = () => {
        const baseItems = [
            { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' }
        ];

        if (currentUser.role === 'Operator' || currentUser.role === 'Admin') {
            baseItems.push(
                { key: '/operator/create', icon: <PlusCircleOutlined />, label: 'Create Project' },
                { key: '/operator/list', icon: <UnorderedListOutlined />, label: 'My Projects' }
            );
        }

        if (currentUser.role === 'Supplier' || currentUser.role === 'Admin') {
            baseItems.push(
                { key: '/supplier/invites', icon: <ShoppingOutlined />, label: 'Bidding Invites' }
            );
        }

        if (currentUser.role === 'Auditor' || currentUser.role === 'Admin') {
            baseItems.push(
                { key: '/auditor/opening', icon: <FileDoneOutlined />, label: 'Opening Hall' }
            );
        }

        // Admin Only
        if (currentUser.role === 'Admin') {
            baseItems.push(
                { key: '/admin/users', icon: <TeamOutlined />, label: 'User Management' }
            );
        }

        return baseItems;
    };

    return (
        <Layout className="min-h-screen">
            <Sider collapsible breakpoint="lg" theme="dark">
                <div className="h-16 flex items-center justify-center text-white text-lg font-bold bg-opacity-20 bg-white m-2 rounded">
                    ProcureSys
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={getMenuItems()}
                    onClick={({ key }) => navigate(key)}
                />
            </Sider>
            <Layout>
                <Header className="bg-white px-6 flex justify-between items-center shadow-sm">
                    <h2 className="text-xl font-semibold m-0 capitalize">
                        {currentUser.role} Portal
                    </h2>
                    <div className="flex items-center gap-4">
                        <span>Welcome, <b>{currentUser.name}</b></span>
                        <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout} danger>
                            Logout
                        </Button>
                    </div>
                </Header>
                <Content className="m-6 p-6 bg-white rounded-lg shadow min-h-[280px]">
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;
