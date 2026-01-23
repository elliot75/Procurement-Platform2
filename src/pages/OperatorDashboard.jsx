import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, Select, Tag, Space, message, Upload, Popconfirm, Card, Statistic, Row, Col } from 'antd';
import { PlusOutlined, UploadOutlined, UserAddOutlined, StopOutlined, ProjectOutlined, CheckCircleOutlined, ClockCircleOutlined, DollarOutlined, FilterOutlined } from '@ant-design/icons';
import { useMockData } from '../context/MockDataContext';

const { TextArea } = Input;
const { Option } = Select;
const API_URL = 'http://localhost:3000/api';

const OperatorDashboard = () => {
    const { projects, createProject, currentUser, autoAddSupplier, cancelProject, users } = useMockData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);
    const [currentProject, setCurrentProject] = useState(null);
    const [form] = Form.useForm();
    const [supplierForm] = Form.useForm();
    const [suppliers, setSuppliers] = useState([]);
    const [filteredSuppliers, setFilteredSuppliers] = useState([]);
    const [fileList, setFileList] = useState([]);
    const [businessCategories, setBusinessCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [searchText, setSearchText] = useState('');

    // Fetch supplier list and business categories
    useEffect(() => {
        const supplierUsers = users.filter(u => u.role === 'Supplier');
        setSuppliers(supplierUsers);
        setFilteredSuppliers(supplierUsers);
        fetchBusinessCategories();
    }, [users]);

    const fetchBusinessCategories = async () => {
        try {
            const res = await fetch(`${API_URL}/business-categories`);
            if (res.ok) {
                const data = await res.json();
                setBusinessCategories(data);
            }
        } catch (err) {
            console.error('Failed to fetch business categories:', err);
        }
    };

    // Filter suppliers based on search and categories
    useEffect(() => {
        let filtered = suppliers;

        // Filter by search text (name or email)
        if (searchText) {
            filtered = filtered.filter(s =>
                s.name.toLowerCase().includes(searchText.toLowerCase()) ||
                s.email.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        // Filter by business categories
        if (selectedCategories.length > 0) {
            filtered = filtered.filter(s => {
                if (!s.businessCategories || s.businessCategories.length === 0) return false;
                const supplierCategoryIds = s.businessCategories.map(c => c.id);
                return selectedCategories.some(catId => supplierCategoryIds.includes(catId));
            });
        }

        setFilteredSuppliers(filtered);
    }, [searchText, selectedCategories, suppliers]);

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
            attachment: fileList.map(f => f.name).join(', '), // Store multiple filenames
            requiresAuditorOpening: values.requiresAuditorOpening || false
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
                width={700}
            >
                <Form form={form} layout="vertical" onFinish={handleCreate} initialValues={{ currency: 'VND', requiresAuditorOpening: false }}>
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
                        <div className="space-y-3">
                            {/* Filter Section */}
                            <div className="bg-gray-50 p-3 rounded border border-gray-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <FilterOutlined className="text-gray-500" />
                                    <span className="font-medium text-sm">篩選供應商</span>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <Input
                                        placeholder="搜尋姓名或公司名"
                                        value={searchText}
                                        onChange={(e) => setSearchText(e.target.value)}
                                        allowClear
                                    />
                                    <Select
                                        mode="multiple"
                                        placeholder="選擇經營項目"
                                        value={selectedCategories}
                                        onChange={setSelectedCategories}
                                        allowClear
                                    >
                                        {businessCategories.map(cat => (
                                            <Option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </Option>
                                        ))}
                                    </Select>
                                </div>

                                <div className="text-xs text-gray-500 mt-2">
                                    找到 {filteredSuppliers.length} 位供應商
                                </div>
                            </div>

                            {/* Supplier Selection */}
                            <Select mode="multiple" placeholder="選擇供應商">
                                {filteredSuppliers.map(supplier => (
                                    <Option key={supplier.username} value={supplier.username}>
                                        <div className="flex flex-col">
                                            <span>{supplier.name} ({supplier.email})</span>
                                            {supplier.businessCategories && supplier.businessCategories.length > 0 && (
                                                <span className="text-xs text-gray-400">
                                                    {supplier.businessCategories.map(c => c.name).join(', ')}
                                                </span>
                                            )}
                                        </div>
                                    </Option>
                                ))}
                            </Select>
                        </div>
                    </Form.Item>

                    <Form.Item name="requiresAuditorOpening" valuePropName="checked">
                        <div className="flex items-start space-x-2 p-3 bg-gray-50 rounded border border-gray-200">
                            <input type="checkbox" id="requiresAuditorOpening" className="mt-1" />
                            <label htmlFor="requiresAuditorOpening" className="cursor-pointer">
                                <div className="font-medium text-gray-900">需要由 Auditor 進行開標</div>
                                <div className="text-xs text-gray-500 mt-1">
                                    勾選此選項後，只有 Auditor 可以執行開標作業。<br />
                                    若不勾選，則由專案建立者自行開標。
                                </div>
                            </label>
                        </div>
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
