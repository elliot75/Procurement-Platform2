import React from 'react';
import { Card, Statistic, Row, Col, Table, Tag } from 'antd';
import { ProjectOutlined, DollarOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useMockData } from '../context/MockDataContext';

const OperatorDashboard = () => {
    const { projects, currentUser } = useMockData();

    // Filter projects created by this operator
    const myProjects = projects.filter(p => currentUser.role === 'Admin' || p.createdBy === currentUser.username);

    const stats = {
        totalProjects: myProjects.length,
        activeProjects: myProjects.filter(p => p.status === 'Active').length,
        completedProjects: myProjects.filter(p => p.status === 'Ended').length,
        totalBids: myProjects.reduce((sum, p) => sum + p.bids.length, 0),
    };

    const recentProjects = myProjects.slice(0, 5);

    const columns = [
        {
            title: 'Project Title',
            dataIndex: 'title',
            key: 'title',
            ellipsis: true,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: status => (
                <Tag color={status === 'Active' ? 'green' : status === 'Ended' ? 'red' : 'blue'}>
                    {status}
                </Tag>
            )
        },
        {
            title: 'Currency',
            dataIndex: 'currency',
            key: 'currency'
        },
        {
            title: 'Bids',
            key: 'bids',
            render: (_, record) => record.bids.length
        },
    ];

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Operator Dashboard</h2>

            <Row gutter={16} className="mb-6">
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Projects"
                            value={stats.totalProjects}
                            prefix={<ProjectOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Active Projects"
                            value={stats.activeProjects}
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Completed Projects"
                            value={stats.completedProjects}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Bids Received"
                            value={stats.totalBids}
                            prefix={<DollarOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <Card title="Recent Projects" className="mb-4">
                <Table
                    dataSource={recentProjects}
                    columns={columns}
                    rowKey="id"
                    pagination={false}
                    size="small"
                />
            </Card>

            <Card title="Quick Actions">
                <p className="mb-2">Use the sidebar to:</p>
                <ul className="list-disc list-inside space-y-1">
                    <li>Create a new bidding project</li>
                    <li>View and manage all your projects</li>
                    <li>Add suppliers to active projects</li>
                </ul>
            </Card>
        </div>
    );
};

export default OperatorDashboard;
