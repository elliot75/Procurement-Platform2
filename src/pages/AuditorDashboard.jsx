import React from 'react';
import { Table, Button, Tag, Space, message, Card, Statistic, Row, Col } from 'antd';
import { FilePdfOutlined, SafetyCertificateOutlined, FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined, TeamOutlined } from '@ant-design/icons';
import { useMockData } from '../context/MockDataContext';
import { generateOpeningRecord } from '../utils/generateOpeningRecord';

const AuditorDashboard = () => {
    const { projects, openProject, currentUser, users } = useMockData();

    // Auditor sees Ended or Opened projects
    const auditInfo = projects.filter(p => p.status === 'Ended' || p.status === 'Opened');

    const stats = {
        totalProjects: projects.length,
        endedProjects: projects.filter(p => p.status === 'Ended').length,
        activeProjects: projects.filter(p => p.status === 'Active').length,
        totalBids: projects.reduce((sum, p) => sum + p.bids.length, 0),
    };

    const handleOpenBid = (project) => {
        try {
            // 1. Generate PDF Data with ALL bids (not just latest)
            const allBids = project.bids || [];

            // Sort all bids by submission time (earliest first for PDF display)
            const sortedBids = allBids.sort((a, b) =>
                new Date(a.timestamp || a.submittedAt) - new Date(b.timestamp || b.submittedAt)
            );

            // Map each bid to include supplier real name from users table
            const bidData = sortedBids.map(bid => {
                const supplierUsername = bid.supplier || bid.supplierId;
                const supplierUser = users.find(u => u.username === supplierUsername);

                return {
                    id: supplierUsername,
                    name: supplierUser ? supplierUser.name : supplierUsername, // Use real name
                    hasBid: true,
                    bidTime: bid.timestamp || bid.submittedAt,
                    price: bid.amount || bid.price,
                    attachments: bid.attachments || []
                };
            });

            // Also include invited suppliers who didn't bid
            const invitees = project.invitedSuppliers || [];
            const bidderUsernames = bidData.map(b => b.id);
            const nonBidders = invitees
                .filter(supplierId => !bidderUsernames.includes(supplierId))
                .map(supplierId => {
                    const supplierUser = users.find(u => u.username === supplierId);
                    return {
                        id: supplierId,
                        name: supplierUser ? supplierUser.name : supplierId,
                        hasBid: false,
                        bidTime: null,
                        price: null,
                        attachments: []
                    };
                });

            const suppliers = [...bidData, ...nonBidders];

            console.log("Generating PDF for:", project.title, "Total bid entries:", suppliers.length);
            generateOpeningRecord(project, suppliers, currentUser);

            // 2. Update Status (only if not already opened, else just download)
            if (project.status !== 'Opened') {
                openProject(project.id, currentUser.name);
                message.success('Project Opened & Record Generated!');
            } else {
                message.success('Report Downloaded!');
            }
        } catch (error) {
            console.error("PDF Generation Error:", error);
            message.error(`Failed to generate record: ${error.message}`);
        }
    };

    const columns = [
        { title: 'Project ID', dataIndex: 'id', key: 'id' },
        { title: 'Title', dataIndex: 'title', key: 'title' },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: status => (
                <Tag color={status === 'Opened' ? 'blue' : 'orange'}>
                    {status.toUpperCase()}
                </Tag>
            )
        },
        { title: 'Closing Time', dataIndex: 'endTime', key: 'endTime', render: t => new Date(t).toLocaleString() },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space>
                    {record.status === 'Ended' && (
                        <Button
                            type="primary"
                            icon={<SafetyCertificateOutlined />}
                            onClick={() => handleOpenBid(record)}
                        >
                            Open Bid
                        </Button>
                    )}
                    {record.status === 'Opened' && (
                        <Button
                            icon={<FilePdfOutlined />}
                            onClick={() => handleOpenBid(record)}
                        >
                            Download Report
                        </Button>
                    )}
                </Space>
            )
        }
    ];

    const expandedRowRender = (record) => {
        const handleAttachmentClick = (fileName, supplier) => {
            // Since this is a mock system without actual file storage,
            // we'll show a modal with file information
            Modal.info({
                title: '附件資訊',
                content: (
                    <div>
                        <p><strong>檔案名稱:</strong> {fileName}</p>
                        <p><strong>供應商:</strong> {supplier}</p>
                        <p><strong>專案:</strong> {record.title}</p>
                        <p className="mt-4 text-gray-500">
                            註：這是模擬系統，實際檔案需要整合檔案儲存服務（如 S3, 本地儲存等）才能下載。
                        </p>
                    </div>
                ),
                okText: '關閉',
            });
        };

        const historyColumns = [
            { title: 'Supplier', dataIndex: 'supplier', key: 'supplier', render: (text, row) => text || row.supplierId },
            { title: 'Bid Amount', dataIndex: 'amount', key: 'amount', render: (val, row) => `${record.currency || 'TWD'} ${(val || row.price).toLocaleString()}` },
            { title: 'Submission Time', dataIndex: 'timestamp', key: 'timestamp', render: (t, row) => new Date(t || row.submittedAt).toLocaleString() },
            {
                title: 'Attachments',
                dataIndex: 'attachments',
                key: 'attachments',
                render: (files, bidRecord) => (
                    files && files.length > 0 ? (
                        <div className="flex flex-col gap-1">
                            {files.map((file, index) => (
                                <Tag
                                    key={index}
                                    icon={<FilePdfOutlined />}
                                    color="blue"
                                    className="cursor-pointer hover:bg-blue-600 transition-colors"
                                    onClick={() => handleAttachmentClick(file, bidRecord.supplier || bidRecord.supplierId)}
                                >
                                    {file}
                                </Tag>
                            ))}
                        </div>
                    ) : <span className="text-gray-400">No Attachments</span>
                )
            }
        ];

        return (
            <div className="bg-gray-50 p-4 rounded">
                <h4 className="font-bold mb-2">Detailed Bid History</h4>
                <Table
                    columns={historyColumns}
                    dataSource={record.bids}
                    pagination={false}
                    rowKey={(r, i) => i}
                    size="small"
                />
            </div>
        );
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Auditor Dashboard</h2>

            {/* Statistics Cards */}
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

            {/* Opening Hall */}
            <h3 className="text-lg font-semibold mb-4">Opening Hall</h3>
            <Card className="mb-4 bg-yellow-50 border-yellow-200">
                <p>Only projects that have passed their <b>Closing Time</b> will appear here for opening.</p>
            </Card>
            <Table
                dataSource={auditInfo}
                columns={columns}
                rowKey="id"
                expandable={{ expandedRowRender, rowExpandable: record => record.bids.length > 0 }}
            />
        </div>
    );
};

export default AuditorDashboard;
