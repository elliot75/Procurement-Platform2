import React, { useState } from 'react';
import { Card, Button, Modal, InputNumber, Upload, Tag, Statistic, Badge, Row, Col, message } from 'antd';
import { UploadOutlined, ClockCircleOutlined, ShoppingOutlined, CheckCircleOutlined, DollarOutlined } from '@ant-design/icons';
import { useMockData } from '../context/MockDataContext';
import useCountDown from '../hooks/useCountDown';
import { useTranslation } from 'react-i18next';

const { Countdown } = Statistic;

const ProjectCard = ({ project, onBid, currentUser }) => {
    const { t } = useTranslation();
    // Check if I already bid (get latest bid if any)
    const myBids = project.bids.filter(b => b.supplier === currentUser.username || b.supplierId === currentUser.username);
    const hasBid = myBids.length > 0;

    const { days, hours, minutes, seconds, isExpired } = useCountDown(project.endTime);

    return (
        <Card
            title={project.title}
            extra={<Tag color={isExpired ? 'red' : 'green'}>{isExpired ? t('status.Completed') : t('status.Active')}</Tag>}
            className="mb-4 shadow-sm hover:shadow-md transition-shadow"
            actions={[
                <Button
                    type="primary"
                    disabled={isExpired} // Allow re-bid until expired
                    onClick={() => onBid(project)}
                >
                    {hasBid ? t('project.updateBid') : isExpired ? t('time.expired') : t('project.placeBid')}
                </Button>
            ]}
        >
            <p className="text-gray-500 mb-4">{project.description}</p>
            <div className="text-xs text-gray-400 mb-2">{t('project.currency')}: {project.currency || 'TWD'}</div>

            <Row gutter={16}>
                <Col span={12}>
                    <Statistic
                        title={t('project.endTime')}
                        value={new Date(project.endTime).toLocaleString()}
                        prefix={<ClockCircleOutlined />}
                        valueStyle={{ fontSize: '1rem' }}
                    />
                </Col>
                <Col span={12}>
                    {!isExpired ? (
                        <div className="text-center bg-blue-50 p-2 rounded">
                            <div className="text-xs text-blue-500 uppercase font-bold">{t('time.timeRemaining')}</div>
                            <div className="text-lg font-mono text-blue-700">
                                {days}d {hours}h {minutes}m {seconds}s
                            </div>
                        </div>
                    ) : (
                        <div className="text-center bg-red-50 p-2 rounded text-red-500 font-bold">
                            {t('project.biddingClosed')}
                        </div>
                    )}
                </Col>
            </Row>
        </Card>
    );
};

const SupplierDashboard = () => {
    const { t } = useTranslation();
    const { projects, placeBid, currentUser } = useMockData();
    const [selectedProject, setSelectedProject] = useState(null);
    const [bidAmount, setBidAmount] = useState(0);
    const [fileList, setFileList] = useState([]);

    // Filter projects where I am invited
    const myInvites = projects.filter(p =>
        (currentUser.role === 'Admin' || (p.invitedSuppliers && p.invitedSuppliers.includes(currentUser.username))) &&
        p.status !== 'Opened'
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

    const handleSubmitBid = () => {
        if (bidAmount <= 0) return message.error('Enter a valid amount');

        const attachments = fileList.map(file => file.name);

        // Call with correct signature: id, username, amount, attachments
        placeBid(selectedProject.id, currentUser.username, bidAmount, attachments);

        message.success('Bid Submitted Successfully!');
        setSelectedProject(null);
        setBidAmount(0);
        setFileList([]);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">{t('nav.dashboard')}</h2>

            {/* Statistics Cards */}
            <Row gutter={16} className="mb-6">
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title={t('dashboard.totalInvitations')}
                            value={stats.totalInvites}
                            prefix={<ShoppingOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title={t('dashboard.activeBidding')}
                            value={stats.activeBidding}
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title={t('dashboard.submittedBids')}
                            value={stats.submittedBids}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title={t('dashboard.pendingResponses')}
                            value={stats.pendingInvites}
                            prefix={<DollarOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Bidding Invitations */}
            <h3 className="text-lg font-semibold mb-4">{t('nav.biddingInvites')}</h3>
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
                okText={t('project.submitBid')}
            >
                <div className="space-y-4">
                    <p>You can update your bid price anytime before the deadline. History is recorded.</p>
                    <div>
                        <label className="block mb-2">Bid Amount ({selectedProject?.currency || 'TWD'})</label>
                        <InputNumber
                            className="w-full"
                            prefix={selectedProject?.currency === 'USD' ? '$' : selectedProject?.currency === 'VND' ? '₫' : 'NT$'}
                            min={1}
                            value={bidAmount}
                            onChange={setBidAmount}
                        />
                    </div>
                    <div>
                        <label className="block mb-2">附件 (支援多個檔案，單一檔案需小於 30MB)</label>
                        <Upload
                            multiple
                            fileList={fileList}
                            beforeUpload={(file) => {
                                const isLt30M = file.size / 1024 / 1024 < 30;
                                if (!isLt30M) {
                                    message.error(`${file.name} 檔案大小超過 30MB！`);
                                }
                                return isLt30M ? false : Upload.LIST_IGNORE;
                            }}
                            onChange={({ fileList }) => setFileList(fileList)}
                        >
                            <Button icon={<UploadOutlined />}>上傳附件</Button>
                        </Upload>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default SupplierDashboard;
