import React from 'react';
import { Table, Button, Tag, Space, message, Card, Statistic, Row, Col, Modal } from 'antd';
import { FilePdfOutlined, SafetyCertificateOutlined, FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined, TeamOutlined } from '@ant-design/icons';
import { useMockData } from '../context/MockDataContext';
import { generateOpeningRecord } from '../utils/generateOpeningRecord';

const OperatorOpeningHall = () => {
    const { projects, openProject, currentUser, users } = useMockData();

    // Show only projects created by this operator that don't require auditor opening
    const myOpeningProjects = projects.filter(p =>
        (p.createdBy === currentUser.username || p.created_by_name === currentUser.username) &&
        !p.requires_auditor_opening &&
        (p.status === 'Ended' || p.status === 'Opened')
    );

    const stats = {
        totalProjects: myOpeningProjects.length,
        endedProjects: myOpeningProjects.filter(p => p.status === 'Ended').length,
        openedProjects: myOpeningProjects.filter(p => p.status === 'Opened').length,
    };

    const handleAttachmentClick = (fileName, supplier, projectTitle) => {
        Modal.info({
            title: '附件資訊',
            content: (
                <div>
                    <p><strong>檔案名稱:</strong> {fileName}</p>
                    <p><strong>供應商:</strong> {supplier}</p>
                    <p><strong>專案:</strong> {projectTitle}</p>
                    <p className="mt-4 text-gray-500">
                        註：這是模擬系統，實際檔案需要整合檔案儲存服務（如 S3, 本地儲存等）才能下載。
                    </p>
                </div>
            ),
            okText: '關閉',
        });
    };

    const handleOpenBid = (project) => {
        try {
            const allBids = project.bids || [];
            const sortedBids = allBids.sort((a, b) =>
                new Date(a.timestamp || a.submittedAt) - new Date(b.timestamp || b.submittedAt)
            );

            const bidData = sortedBids.map(bid => {
                const supplierUsername = bid.supplier || bid.supplierId;
                const supplierUser = users.find(u => u.username === supplierUsername);

                return {
                    id: supplierUsername,
                    name: supplierUser ? supplierUser.name : supplierUsername,
                    hasBid: true,
                    bidTime: bid.timestamp || bid.submittedAt,
                    price: bid.amount || bid.price,
                    attachments: bid.attachments || []
                };
            });

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
                                    onClick={() => handleAttachmentClick(file, bidRecord.supplier || bidRecord.supplierId, record.title)}
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
            <h2 className="text-2xl font-bold mb-6">My Opening Hall</h2>

            {/* Statistics Cards */}
            <Row gutter={16} className="mb-6">
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Total Projects"
                            value={stats.totalProjects}
                            prefix={<FileTextOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Awaiting Opening"
                            value={stats.endedProjects}
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Opened"
                            value={stats.openedProjects}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card className="mb-4 bg-blue-50 border-blue-200">
                <p>這裡顯示您建立且<b>未勾選「需要由 Auditor 進行開標」</b>的專案。只有截止時間已過的專案才會出現在此處。</p>
            </Card>

            <Table
                dataSource={myOpeningProjects}
                columns={columns}
                rowKey="id"
                expandable={{ expandedRowRender, rowExpandable: record => record.bids.length > 0 }}
            />
        </div>
    );
};

export default OperatorOpeningHall;
