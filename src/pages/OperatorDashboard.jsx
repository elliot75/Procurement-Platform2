import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, Select, Tag, Space, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useMockData } from '../context/MockDataContext';

const { TextArea } = Input;
const { Option } = Select;

const OperatorDashboard = () => {
    const { projects, createProject, currentUser } = useMockData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    // Filter projects created by this operator
    const myProjects = projects.filter(p => currentUser.role === 'Admin' || p.createdBy === currentUser.username);

    const handleCreate = (values) => {
        const newProject = {
            title: values.title,
            description: values.description,
            endTime: values.endTime.toISOString(),
            createdBy: currentUser.username,
            invitedSuppliers: values.suppliers
        };
        createProject(newProject);
        message.success('Bidding Project Created Successfully!');
        setIsModalOpen(false);
        form.resetFields();
    };

    const columns = [
        { title: 'Project ID', dataIndex: 'id', key: 'id' },
        { title: 'Title', dataIndex: 'title', key: 'title' },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: status => (
                <Tag color={status === 'Active' ? 'green' : status === 'Ended' ? 'red' : 'blue'}>
                    {status.toUpperCase()}
                </Tag>
            )
        },
        { title: 'Closing Time', dataIndex: 'endTime', key: 'endTime', render: t => new Date(t).toLocaleString() },
        {
            title: 'Bids Received',
            key: 'bids',
            render: (_, record) => record.bids.length
        }
    ];

    return (
        <div>
            <div className="flex justify-between mb-4">
                <h2 className="text-xl font-bold">Project Management</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
                    Create Project
                </Button>
            </div>

            <Table dataSource={myProjects} columns={columns} rowKey="id" />

            <Modal
                title="Create New Bidding Project"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleCreate}>
                    <Form.Item name="title" label="Project Title" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="description" label="Description">
                        <TextArea rows={3} />
                    </Form.Item>
                    <Form.Item name="endTime" label="Bidding Deadline" rules={[{ required: true }]}>
                        <DatePicker showTime className="w-full" />
                    </Form.Item>
                    <Form.Item name="suppliers" label="Invite Suppliers" rules={[{ required: true }]}>
                        <Select mode="tags" placeholder="Enter supplier codes">
                            <Option value="supplier1">Supplier 1</Option>
                            <Option value="supplier2">Supplier 2</Option>
                            <Option value="supplier3">Supplier 3</Option>
                        </Select>
                    </Form.Item>
                    <Button type="primary" htmlType="submit" block>Launch Project</Button>
                </Form>
            </Modal>
        </div>
    );
};

export default OperatorDashboard;
