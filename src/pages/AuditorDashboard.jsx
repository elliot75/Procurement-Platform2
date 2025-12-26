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
            // 1. Generate PDF
            // Mocking 'suppliers' structure from project.bids
            const suppliers = project.invitedSuppliers.map(sId => {
                const bid = project.bids.find(b => b.supplierId === sId);
                return {
                    id: sId,
                    name: `Company ${sId.toUpperCase()}`,
                    hasBid: !!bid,
                    bidTime: bid ? bid.submittedAt : null
                };
            });

            generateOpeningRecord(project, suppliers, currentUser);

            // 2. Update Status
            openProject(project.id, currentUser.name);
            message.success('Project Opened & Record Generated!');
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
                        <Button disabled icon={<FilePdfOutlined />}>
                            Record Generated
                        </Button>
                    )}
                </Space>
            )
        }
    ];

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Opening Hall</h2>
            <Card className="mb-4 bg-yellow-50 border-yellow-200">
                <p>Only projects that have passed their <b>Closing Time</b> will appear here for opening.</p>
            </Card>
            <Table dataSource={auditInfo} columns={columns} rowKey="id" />
        </div>
    );
};

export default AuditorDashboard;
