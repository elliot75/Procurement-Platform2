import React from 'react';
import { Card, Statistic, Row, Col, Table, Tag } from 'antd';
import { ShoppingOutlined, CheckCircleOutlined, ClockCircleOutlined, DollarOutlined } from '@ant-design/icons';
import { useMockData } from '../context/MockDataContext';

const SupplierDashboard = () => {
    const { projects, currentUser } = useMockData();

    // Filter projects where supplier is invited
    const myInvites = projects.filter(p =>
        p.invitedSuppliers && p.invitedSuppliers.includes(currentUser.username)
    );

    // Filter bids submitted by this supplier
    const myBids = myInvites.filter(p =>
        p.bids.some(bid => bid.supplier === currentUser.username)
    );

    const stats = {
        totalInvites: myInvites.length,
        activeBidding: myInvites.filter(p => p.status === 'Active').length,
        submittedBids: myBids.length,
        pendingInvites: myInvites.filter(p =>
            p.status === 'Active' && !p.bids.some(bid => bid.supplier === currentUser.username)
        ).length,
    };

    const activeInvites = myInvites.filter(p => p.status === 'Active').slice(0, 5);

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
                <Tag color={status === 'Active' ? 'green' : 'red'}>
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
            title: 'Your Bid',
            key: 'bid',
            render: (_, record) => {
                const bid = record.bids.find(b => b.supplier === currentUser.username);
                return bid ? (
                    <Tag color="blue">Submitted</Tag>
                ) : (
                    <Tag color="orange">Pending</Tag>
                );
            }
        },
    ];

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Supplier Dashboard</h2>

            <Row gutter={16} className="mb-6">
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Invitations"
                            value={stats.totalInvites}
                            prefix={<ShoppingOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Active Bidding"
                            value={stats.activeBidding}
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Submitted Bids"
                            value={stats.submittedBids}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Pending Responses"
                            value={stats.pendingInvites}
                            prefix={<DollarOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card title="Active Bidding Opportunities" className="mb-4">
                <Table
                    dataSource={activeInvites}
                    columns={columns}
                    rowKey="id"
                    pagination={false}
                    size="small"
                />
            </Card>

            <Card title="Quick Actions">
                <p className="mb-2">Use the sidebar to:</p>
                <ul className="list-disc list-inside space-y-1">
                    <li>View all bidding invitations</li>
                    <li>Submit bids for active projects</li>
                    <li>Track your bid submissions</li>
                </ul>
            </Card>
        </div>
    );
};

export default SupplierDashboard;
