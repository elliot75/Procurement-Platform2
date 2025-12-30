import React from 'react';
import { Card, Row, Col, Statistic, Button, List, Tag, Typography } from 'antd';
import {
    ProjectOutlined,
    FileTextOutlined,
    ClockCircleOutlined,
    TeamOutlined,
    RocketOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useMockData } from '../context/MockDataContext';

const { Title, Text } = Typography;

const Dashboard = () => {
    const { currentUser, projects, users } = useMockData();
    const navigate = useNavigate();

    // Helper to filter projects
    const myProjects = projects.filter(p => currentUser.role === 'Admin' || p.createdBy === currentUser.username);
    const activeProjects = myProjects.filter(p => p.status === 'Active');
    const endedProjects = myProjects.filter(p => p.status === 'Ended');

    // Supplier specific
    const myInvites = projects.filter(p =>
        (p.invitedSuppliers && p.invitedSuppliers.includes(currentUser.username)) &&
        p.status === 'Active'
    );
    const myBids = projects.filter(p =>
        p.bids && p.bids.some(b => b.supplier === currentUser.username || b.supplierId === currentUser.username)
    );

    // Auditor specific
    const pendingOpening = projects.filter(p => p.status === 'Ended');
    const completedOpening = projects.filter(p => p.status === 'Opened');

    const renderOperatorView = () => (
        <>
            <Row gutter={[16, 16]} className="mb-8">
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Active Projects"
                            value={activeProjects.length}
                            prefix={<ProjectOutlined className="text-blue-500" />}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Total Bids Received"
                            value={myProjects.reduce((acc, p) => acc + (p.bids ? p.bids.length : 0), 0)}
                            prefix={<FileTextOutlined className="text-green-500" />}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Projects Ending Soon"
                            value={activeProjects.filter(p => {
                                const diff = new Date(p.endTime) - new Date();
                                return diff > 0 && diff < 24 * 60 * 60 * 1000;
                            }).length}
                            prefix={<ClockCircleOutlined className="text-orange-500" />}
                        />
                    </Card>
                </Col>
            </Row>

            <Card title="Quick Actions" className="mb-8">
                <Button type="primary" size="large" icon={<RocketOutlined />} onClick={() => navigate('/operator/create')}>
                    Create New Project
                </Button>
            </Card>

            <Card title="Recent Active Projects">
                <List
                    dataSource={activeProjects.slice(0, 5)}
                    renderItem={item => (
                        <List.Item
                            actions={[<Button type="link" onClick={() => navigate('/operator/list')}>View</Button>]}
                        >
                            <List.Item.Meta
                                title={item.title}
                                description={`Ends: ${new Date(item.endTime).toLocaleString()}`}
                            />
                            <Tag color="green">Active</Tag>
                        </List.Item>
                    )}
                />
            </Card>
        </>
    );

    const renderSupplierView = () => (
        <>
            <Row gutter={[16, 16]} className="mb-8">
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Open Invitations"
                            value={myInvites.length}
                            prefix={<ExclamationCircleOutlined className="text-blue-500" />}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Bids Submitted"
                            value={myBids.length}
                            prefix={<CheckCircleOutlined className="text-green-500" />}
                        />
                    </Card>
                </Col>
            </Row>

            <Card title="Projects Open for Bidding">
                <List
                    dataSource={myInvites}
                    renderItem={item => (
                        <List.Item
                            actions={[<Button type="primary" onClick={() => navigate('/supplier/invites')}>Bid Now</Button>]}
                        >
                            <List.Item.Meta
                                title={item.title}
                                description={item.description}
                            />
                            <Text type="secondary">Ends: {new Date(item.endTime).toLocaleString()}</Text>
                        </List.Item>
                    )}
                />
            </Card>
        </>
    );

    const renderAuditorView = () => (
        <>
            <Row gutter={[16, 16]} className="mb-8">
                <Col span={12}>
                    <Card>
                        <Statistic
                            title="Pending Opening"
                            value={pendingOpening.length}
                            prefix={<ClockCircleOutlined className="text-orange-500" />}
                        />
                    </Card>
                </Col>
                <Col span={12}>
                    <Card>
                        <Statistic
                            title="Completed Openings"
                            value={completedOpening.length}
                            prefix={<CheckCircleOutlined className="text-green-500" />}
                        />
                    </Card>
                </Col>
            </Row>

            <Card title="Pending Opening Actions">
                <List
                    dataSource={pendingOpening}
                    renderItem={item => (
                        <List.Item
                            actions={[<Button type="primary" onClick={() => navigate('/auditor/opening')}>Open Bid</Button>]}
                        >
                            <List.Item.Meta
                                title={item.title}
                                description={`Ended: ${new Date(item.endTime).toLocaleString()}`}
                            />
                            <Tag color="orange">Ended</Tag>
                        </List.Item>
                    )}
                />
            </Card>
        </>
    );

    const renderAdminView = () => (
        <>
            <Row gutter={[16, 16]} className="mb-8">
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Total Users"
                            value={users.length}
                            prefix={<TeamOutlined className="text-purple-500" />}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Total Projects"
                            value={projects.length}
                            prefix={<ProjectOutlined className="text-blue-500" />}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Active Projects"
                            value={projects.filter(p => p.status === 'Active').length}
                            prefix={<RocketOutlined className="text-green-500" />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Admin sees Operator view as well for management */}
            <Title level={4} className="mt-8">All System Projects</Title>
            {renderOperatorView()}
        </>
    );

    return (
        <div className="p-2">
            <div className="mb-6">
                <Title level={2}>Dashboard</Title>
                <Text type="secondary">Welcome back, {currentUser.name} ({currentUser.role})</Text>
            </div>

            {currentUser.role === 'Operator' && renderOperatorView()}
            {currentUser.role === 'Supplier' && renderSupplierView()}
            {currentUser.role === 'Auditor' && renderAuditorView()}
            {currentUser.role === 'Admin' && renderAdminView()}
        </div>
    );
};

export default Dashboard;
