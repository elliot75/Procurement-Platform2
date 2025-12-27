import React from 'react';
import { Table, Button, Tag, Space, message, Card } from 'antd';
import { FilePdfOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useMockData } from '../context/MockDataContext';
import { generateOpeningRecord } from '../utils/generateOpeningRecord';

const AuditorDashboard = () => {
    const { projects, openProject, currentUser } = useMockData();

    // Auditor sees Ended or Opened projects
    const auditInfo = projects.filter(p => p.status === 'Ended' || p.status === 'Opened');

    const handleOpenBid = (project) => {
        try {
            // 1. Generate PDF Data
            // Map suppliers to their LATEST bid
            const suppliers = project.invitedSuppliers.map(sId => {
                // Get all bids from this supplier
                const supplierBids = project.bids.filter(b => b.supplier === sId || b.supplierId === sId);
                // Sort by time desc
                const latestBid = supplierBids.sort((a, b) => new Date(b.timestamp || b.submittedAt) - new Date(a.timestamp || a.submittedAt))[0];

                return {
                    id: sId,
                    name: `Company ${sId.toUpperCase()}`,
                    hasBid: !!latestBid,
                    bidTime: latestBid ? (latestBid.timestamp || latestBid.submittedAt) : null,
                    price: latestBid ? (latestBid.amount || latestBid.price) : null
                };
            });

            generateOpeningRecord(project, suppliers, currentUser);

            // 2. Update Status (only if not already opened, else just download)
            if (project.status !== 'Opened') {
                openProject(project.id, currentUser.name);
                message.success('Project Opened & Record Generated!');
            } else {
                message.success('Report Downloaded!');
            }
        } catch (error) {
            console.error(error);
            message.error('Failed to generate record');
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
            { title: 'Attachment', key: 'attachment', render: () => <a href="#">View Attachment</a> } // Mock attachment
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
            <h2 className="text-xl font-bold mb-4">Opening Hall</h2>
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
