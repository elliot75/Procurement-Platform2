import React from 'react';
import { Card, Statistic, Row, Col } from 'antd';
import { UserOutlined, ProjectOutlined, DollarOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useMockData } from '../context/MockDataContext';

const AdminDashboard = () => {
    const { users, projects } = useMockData();

    const stats = {
        totalUsers: users.length,
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === 'Active').length,
        completedProjects: projects.filter(p => p.status === 'Ended').length,
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
            <Row gutter={16}>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Total Users"
                            value={stats.totalUsers}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Total Projects"
                            value={stats.totalProjects}
                            prefix={<ProjectOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Active Projects"
                            value={stats.activeProjects}
                            prefix={<DollarOutlined />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Completed Projects"
                            value={stats.completedProjects}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>
            </Row>

            <div className="mt-6">
                <Card title="Quick Actions" className="mb-4">
                    <p>Use the sidebar to navigate to:</p>
                    <ul className="list-disc list-inside mt-2">
                        <li>User Management - Manage user accounts and permissions</li>
                        <li>Project Management - View and manage all projects</li>
                        <li>Opening Hall - Review bidding results</li>
                    </ul>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;
