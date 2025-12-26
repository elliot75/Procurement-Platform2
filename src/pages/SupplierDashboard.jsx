import React, { useState } from 'react';
import { Card, Button, Modal, InputNumber, Upload, Tag, Statistic, Badge, Row, Col, message } from 'antd';
import { UploadOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useMockData } from '../context/MockDataContext';
import useCountDown from '../hooks/useCountDown';

const { Countdown } = Statistic;

const ProjectCard = ({ project, onBid, currentUser }) => {
    // Check if I already bid
    const myBid = project.bids.find(b => b.supplierId === currentUser.username);
    const { days, hours, minutes, seconds, isExpired } = useCountDown(project.endTime);
    // Note: useCountDown returns simple numbers, but we can also use AntD Statistic.Countdown for visual flair if we pass timestamp

    return (
        <Card
            title={project.title}
            extra={<Tag color={isExpired ? 'red' : 'green'}>{isExpired ? 'CLOSED' : 'OPEN'}</Tag>}
            className="mb-4 shadow-sm hover:shadow-md transition-shadow"
            actions={[
                <Button
                    type="primary"
                    disabled={isExpired || myBid}
                    onClick={() => onBid(project)}
                >
                    {myBid ? 'Bid Submitted' : isExpired ? 'Expired' : 'Place Bid'}
                </Button>
            ]}
        >
            <p className="text-gray-500 mb-4">{project.description}</p>

            <Row gutter={16}>
                <Col span={12}>
                    <Statistic
                        title="Deadline"
                        value={new Date(project.endTime).toLocaleString()}
                        prefix={<ClockCircleOutlined />}
                        valueStyle={{ fontSize: '1rem' }}
                    />
                </Col>
                <Col span={12}>
                    {!isExpired ? (
                        <div className="text-center bg-blue-50 p-2 rounded">
                            <div className="text-xs text-blue-500 uppercase font-bold">Time Remaining</div>
                            <div className="text-lg font-mono text-blue-700">
                                {days}d {hours}h {minutes}m {seconds}s
                            </div>
                        </div>
                    ) : (
                        <div className="text-center bg-red-50 p-2 rounded text-red-500 font-bold">
                            Bidding Closed
                        </div>
                    )}
                </Col>
            </Row>
        </Card>
    );
};

const SupplierDashboard = () => {
    const { projects, placeBid, currentUser } = useMockData();
    const [selectedProject, setSelectedProject] = useState(null);
    const [bidAmount, setBidAmount] = useState(0);

    // Filter projects where I am invited
    const myInvites = projects.filter(p =>
        (currentUser.role === 'Admin' || p.invitedSuppliers.includes(currentUser.username)) &&
        p.status !== 'Opened' // Hide opened ones from main list usually, or keep them for history
    );

    const handleSubmitBid = () => {
        if (bidAmount <= 0) return message.error('Enter a valid amount');

        placeBid(selectedProject.id, {
            supplierId: currentUser.username,
            price: bidAmount,
            submittedAt: new Date().toISOString()
        });

        message.success('Bid Submitted Successfully!');
        setSelectedProject(null);
        setBidAmount(0);
    };

    return (
        <div>
            <h2 className="text-xl font-bold mb-6">Bidding Invitations</h2>
            <Row gutter={[16, 16]}>
                {myInvites.map(p => (
                    <Col xs={24} md={12} lg={8} key={p.id}>
                        <ProjectCard project={p} onBid={setSelectedProject} currentUser={currentUser} />
                    </Col>
                ))}
            </Row>

            <Modal
                title={`Bid for: ${selectedProject?.title}`}
                open={!!selectedProject}
                onCancel={() => setSelectedProject(null)}
                onOk={handleSubmitBid}
                okText="Submit Sealed Bid"
            >
                <div className="space-y-4">
                    <p>Enter your best offer. Once submitted, it cannot be changed.</p>
                    <div>
                        <label className="block mb-2">Bid Amount (USD)</label>
                        <InputNumber
                            className="w-full"
                            prefix="$"
                            min={1}
                            value={bidAmount}
                            onChange={setBidAmount}
                        />
                    </div>
                    <div>
                        <label className="block mb-2">Technical Proposal (PDF Only)</label>
                        <Upload maxCount={1}>
                            <Button icon={<UploadOutlined />}>Click to Upload</Button>
                        </Upload>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default SupplierDashboard;
