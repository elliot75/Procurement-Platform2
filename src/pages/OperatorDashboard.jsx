import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, Select, Tag, Space, message, Upload, Popconfirm, Card, Statistic, Row, Col } from 'antd';
import { PlusOutlined, UploadOutlined, UserAddOutlined, StopOutlined, ProjectOutlined, CheckCircleOutlined, ClockCircleOutlined, DollarOutlined } from '@ant-design/icons';
import { useMockData } from '../context/MockDataContext';

const { TextArea } = Input;
const { Option } = Select;

const OperatorDashboard = () => {
    const { projects, createProject, currentUser, autoAddSupplier, cancelProject, users } = useMockData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);
    const [currentProject, setCurrentProject] = useState(null);
    const [form] = Form.useForm();
    const [supplierForm] = Form.useForm();
    const [suppliers, setSuppliers] = useState([]);
    const [fileList, setFileList] = useState([]);

    // Fetch supplier list
    useEffect(() => {
        const supplierUsers = users.filter(u => u.role === 'Supplier');
        setSuppliers(supplierUsers);
    }, [users]);

    // Filter projects created by this operator
    const myProjects = projects.filter(p => currentUser.role === 'Admin' || p.createdBy === currentUser.username);

    // Statistics
    const stats = {
        totalProjects: myProjects.length,
        activeProjects: myProjects.filter(p => p.status === 'Active').length,
        completedProjects: myProjects.filter(p => p.status === 'Ended').length,
        totalBids: myProjects.reduce((sum, p) => sum + p.bids.length, 0),
    };

    const handleCreate = async (values) => {
        const newProject = {
            title: values.title,
            description: values.description,
            endTime: values.endTime.toISOString(),
            createdBy: currentUser.username,
            invitedSuppliers: values.suppliers,
            currency: values.currency,
            attachment: fileList.map(f => f.name).join(', ') // Store multiple filenames
        };
        const success = await createProject(newProject);
        if (success) {
            message.success('Bidding Project Created Successfully!');
            setIsModalOpen(false);
            form.resetFields();
            setFileList([]);
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
            title: 'Invited Suppliers',
            dataIndex: 'invitedSuppliers',
            key: 'invitedSuppliers',
            render: suppliers => (
                <>
                    {suppliers && suppliers.length > 0 ? (
                        suppliers.map(s => <Tag key={s} color="purple">{s}</Tag>)
                    ) : (
                        <span className="text-gray-400">None</span>
                    )}
                </>
            )
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
            <h2 className="text-2xl font-bold mb-6">Operator Dashboard</h2>

            {/* Statistics Cards */}
            <Row gutter={16} className="mb-6">
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Projects"
                            value={stats.totalProjects}
                            prefix={<ProjectOutlined />}
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
                            title="Completed Projects"
                            value={stats.completedProjects}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Bids Received"
                            value={stats.totalBids}
                            prefix={<DollarOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Project Management Section */}
            <div className="flex justify-between mb-4">
                <h3 className="text-lg font-semibold">Project Management</h3>
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
                <Form form={form} layout="vertical" onFinish={handleCreate} initialValues={{ currency: 'VND' }}>
                    <Form.Item name="title" label="Project Title" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="description" label="Description">
                        <TextArea rows={3} />
                    </Form.Item>
                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item name="currency" label="Currency" rules={[{ required: true }]}>
                            <Select>
                                <Option value="VND">VND</Option>
                                <Option value="USD">USD</Option>
                                <Option value="TWD">TWD</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item name="endTime" label="Bidding Deadline" rules={[{ required: true }]}>
                            <DatePicker showTime className="w-full" />
                        </Form.Item>
                    </div>

                    <Form.Item name="attachment" label="附件 (支援多個檔案，單一檔案需小於 30MB)">
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
                    </Form.Item>

                    <Form.Item name="suppliers" label="Invite Suppliers" rules={[{ required: true }]}>
                        <Select mode="multiple" placeholder="選擇供應商">
                            {suppliers.map(supplier => (
                                <Option key={supplier.username} value={supplier.username}>
                                    {supplier.name} ({supplier.email})
                                </Option>
                            ))}
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
                        <Select mode="multiple" placeholder="選擇供應商">
                            {suppliers.map(supplier => (
                                <Option key={supplier.username} value={supplier.username}>
                                    {supplier.name} ({supplier.email})
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Button type="primary" htmlType="submit" block>Add Supplier</Button>
                </Form>
            </Modal>
        </div>
    );
};

export default OperatorDashboard;
