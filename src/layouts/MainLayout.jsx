import React, { useState } from 'react';
import { Layout, Menu, Button, theme, Avatar, Dropdown, Space } from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    DashboardOutlined,
    PlusCircleOutlined,
    UnorderedListOutlined,
    OrderedListOutlined,
    ShoppingOutlined,
    FileDoneOutlined,
    TeamOutlined,
    UserOutlined,
    LogoutOutlined,
    LockOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useMockData } from '../context/MockDataContext';
import ChangePasswordModal from '../components/ChangePasswordModal';

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    const { currentUser, logout } = useMockData();

    if (!currentUser) return null; // Should be redirected by router

    const handleLogout = () => {
        logout();
        // message.success('Logged out successfully'); // Original line, commented out as message import was removed
        navigate('/login');
    };

    // Menu items based on Role
    const getMenuItems = () => {
        const baseItems = [
            { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' }
        ];

        if (currentUser.role === 'Operator' || currentUser.role === 'Admin') {
            baseItems.push({
                key: 'project-management',
                icon: <UnorderedListOutlined />,
                label: 'Project Management',
                children: [
                    { key: '/operator/create', icon: <PlusCircleOutlined />, label: 'Create Project' },
                    { key: '/operator/list', icon: <OrderedListOutlined />, label: 'My Projects' }
                ]
            });
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

    const userMenu = {
        items: [
            {
                key: 'profile',
                label: (
                    <div className="px-4 py-2">
                        <p className="font-bold">{currentUser?.name}</p>
                        <p className="text-gray-500 text-xs">{currentUser?.role}</p>
                    </div>
                ),
            },
            {
                type: 'divider',
            },
            {
                key: 'change-password',
                icon: <LockOutlined />,
                label: 'Change Password',
                onClick: () => setPasswordModalVisible(true),
            },
            {
                key: 'logout',
                icon: <LogoutOutlined />,
                label: 'Logout',
                onClick: handleLogout,
            },
        ],
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider trigger={null} collapsible collapsed={collapsed} breakpoint="lg" theme="dark">
                <div className="demo-logo-vertical" />
                <div className="text-white text-center py-4 font-bold text-lg truncate px-2">
                    {collapsed ? 'PBP' : 'Procurement Platform'}
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={[location.pathname]}
                    items={getMenuItems()}
                    onClick={({ key }) => navigate(key)}
                />
            </Sider>
            <Layout>
                <Header style={{ padding: 0, background: colorBgContainer }} className="flex justify-between items-center pr-6">
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            fontSize: '16px',
                            width: 64,
                            height: 64,
                        }}
                    />
                    <Dropdown menu={userMenu} placement="bottomRight">
                        <Space className="cursor-pointer hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors">
                            <Avatar icon={<UserOutlined />} className="bg-blue-500" />
                            <span className="hidden md:inline font-medium">{currentUser?.name}</span>
                        </Space>
                    </Dropdown>
                </Header>
                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 280,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    <Outlet />
                </Content>
                <ChangePasswordModal
                    visible={passwordModalVisible}
                    onClose={() => setPasswordModalVisible(false)}
                />
            </Layout>
        </Layout>
    );
};

export default MainLayout;
