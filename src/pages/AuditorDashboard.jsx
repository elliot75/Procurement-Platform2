import React from 'react';
import { Card, Statistic, Row, Col, Table, Tag } from 'antd';
import { FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined, TeamOutlined } from '@ant-design/icons';
import { useMockData } from '../context/MockDataContext';

const AuditorDashboard = () => {
    const { projects } = useMockData();

    const stats = {
        totalProjects: projects.length,
        endedProjects: projects.filter(p => p.status === 'Ended').length,
        activeProjects: projects.filter(p => p.status === 'Active').length,
        totalBids: projects.reduce((sum, p) => sum + p.bids.length, 0),
    };

    const endedProjects = projects.filter(p => p.status === 'Ended').slice(0, 5);

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
                <Tag color={status === 'Ended' ? 'red' : 'green'}>
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
        {
            title: 'Ended Time',
            dataIndex: 'endTime',
            key: 'endTime',
            render: t => new Date(t).toLocaleDateString()
        },
    ];

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Auditor Dashboard</h2>

            <Row gutter={16} className="mb-6">
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Projects"
                            value={stats.totalProjects}
                            prefix={<FileTextOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Projects to Audit"
                            value={stats.endedProjects}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#cf1322' }}
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
                            title="Total Bids"
                            value={stats.totalBids}
                            prefix={<TeamOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <Card title="Recent Ended Projects" className="mb-4">
                <Table
                    dataSource={endedProjects}
                    columns={columns}
                    rowKey="id"
                    pagination={false}
                    size="small"
                />
            </Card>

            <Card title="Quick Actions">
                <p className="mb-2">Use the sidebar to:</p>
                <ul className="list-disc list-inside space-y-1">
                    <li>Access the Opening Hall to audit bids</li>
                    <li>Review bidding results for ended projects</li>
                    <li>Generate audit reports and PDFs</li>
                </ul>
            </Card>
        </div>
    );
};

export default AuditorDashboard;
