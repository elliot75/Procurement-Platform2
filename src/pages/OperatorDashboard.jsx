import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, Select, Tag, Space, message, Upload, Popconfirm } from 'antd';
import { PlusOutlined, UploadOutlined, UserAddOutlined, StopOutlined } from '@ant-design/icons';
import { useMockData } from '../context/MockDataContext';

const { TextArea } = Input;
const { Option } = Select;

const OperatorDashboard = () => {
    const { projects, createProject, currentUser, autoAddSupplier, cancelProject } = useMockData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);
    const [currentProject, setCurrentProject] = useState(null);
    const [form] = Form.useForm();
    const [supplierForm] = Form.useForm();

    // Filter projects created by this operator
    const myProjects = projects.filter(p => currentUser.role === 'Admin' || p.createdBy === currentUser.username);

    const handleCreate = async (values) => {
        const newProject = {
            title: values.title,
            description: values.description,
            endTime: values.endTime.toISOString(),
            createdBy: currentUser.username,
            invitedSuppliers: values.suppliers,
            currency: values.currency,
            attachment: values.attachment ? values.attachment.file.name : null // Mock saving file name
        };
        const success = await createProject(newProject);
        if (success) {
            message.success('Bidding Project Created Successfully!');
            setIsModalOpen(false);
            form.resetFields();
        } else {
            message.error('Failed to create project. Please try again.');
        }
    };

    const handleAddSupplier = (values) => {
        // Handle multiple suppliers if array
        const suppliers = Array.isArray(values.supplier) ? values.supplier : [values.supplier];
        suppliers.forEach(s => autoAddSupplier(currentProject.id, s));
        message.success('Supplier(s) added successfully');
        setIsAddSupplierModalOpen(false);
        supplierForm.resetFields();
    };

    const onCancelProject = (id) => {
        cancelProject(id);
        message.success('Project Cancelled');
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
        { title: 'Currency', dataIndex: 'currency', key: 'currency' },
        {
            title: 'Bids Received',
            key: 'bids',
            render: (_, record) => record.bids.length
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    {/* Operator: Add Supplier to Active Project */}
                    {currentUser.role === 'Operator' && record.status === 'Active' && (
                        <Button
                            icon={<UserAddOutlined />}
                            size="small"
                            onClick={() => {
                                setCurrentProject(record);
                                setIsAddSupplierModalOpen(true);
                            }}
                        >
                            Add Supplier
                        </Button>
                    )}

                    {/* Admin: Cancel Active Project with 0 bids */}
                    {currentUser.role === 'Admin' && record.status === 'Active' && record.bids.length === 0 && (
                        <Popconfirm
                            title="Cancel Project?"
                            description="Are you sure you want to cancel this project?"
                            onConfirm={() => onCancelProject(record.id)}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button danger icon={<StopOutlined />} size="small">Cancel</Button>
                        </Popconfirm>
                    )}
                </Space>
            )
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

            {/* Create Project Modal */}
            <Modal
                title="Create New Bidding Project"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleCreate} initialValues={{ currency: 'TWD' }}>
                    <Form.Item name="title" label="Project Title" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="description" label="Description">
                        <TextArea rows={3} />
                    </Form.Item>
                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item name="currency" label="Currency" rules={[{ required: true }]}>
                            <Select>
                                <Option value="TWD">TWD</Option>
                                <Option value="USD">USD</Option>
                                <Option value="JPY">JPY</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item name="endTime" label="Bidding Deadline" rules={[{ required: true }]}>
                            <DatePicker showTime className="w-full" />
                        </Form.Item>
                    </div>

                    <Form.Item name="attachment" label="Attachment">
                        <Upload beforeUpload={() => false} maxCount={1}>
                            <Button icon={<UploadOutlined />}>Click to Upload</Button>
                        </Upload>
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

            {/* Add Supplier Modal */}
            <Modal
                title="Add Supplier"
                open={isAddSupplierModalOpen}
                onCancel={() => setIsAddSupplierModalOpen(false)}
                footer={null}
            >
                <Form form={supplierForm} layout="vertical" onFinish={handleAddSupplier}>
                    <Form.Item name="supplier" label="Select Supplier" rules={[{ required: true }]}>
                        <Select mode="tags" placeholder="Enter supplier codes">
                            <Option value="supplier1">Supplier 1</Option>
                            <Option value="supplier2">Supplier 2</Option>
                            <Option value="supplier3">Supplier 3</Option>
                            <Option value="supplier4">Supplier 4</Option>
                        </Select>
                    </Form.Item>
                    <Button type="primary" htmlType="submit" block>Add Supplier</Button>
                </Form>
            </Modal>
        </div>
    );
};

export default OperatorDashboard;
