import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, Select, Tag, Space, message, Upload, Popconfirm, Card, Statistic, Row, Col } from 'antd';
import { PlusOutlined, UploadOutlined, UserAddOutlined, StopOutlined, ProjectOutlined, CheckCircleOutlined, ClockCircleOutlined, DollarOutlined, FilterOutlined } from '@ant-design/icons';
import { useMockData } from '../context/MockDataContext';
import { useTranslation } from 'react-i18next';

const { TextArea } = Input;
const { Option } = Select;
const API_URL = 'http://localhost:3000/api';

const OperatorDashboard = () => {
    const { t } = useTranslation();
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

    // Separate filter states for Add Supplier modal
    const [addSupplierSearchText, setAddSupplierSearchText] = useState('');
    const [addSupplierSelectedCategories, setAddSupplierSelectedCategories] = useState([]);

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

    // Filter suppliers for Add Supplier modal
    const [filteredSuppliersForAdd, setFilteredSuppliersForAdd] = useState([]);

    useEffect(() => {
        let filtered = suppliers;

        // Filter by search text
        if (addSupplierSearchText) {
            filtered = filtered.filter(s =>
                s.name.toLowerCase().includes(addSupplierSearchText.toLowerCase()) ||
                s.email.toLowerCase().includes(addSupplierSearchText.toLowerCase())
            );
        }

        // Filter by business categories
        if (addSupplierSelectedCategories.length > 0) {
            filtered = filtered.filter(s => {
                if (!s.businessCategories || s.businessCategories.length === 0) return false;
                const supplierCategoryIds = s.businessCategories.map(c => c.id);
                return addSupplierSelectedCategories.some(catId => supplierCategoryIds.includes(catId));
            });
        }

        // Exclude already invited suppliers
        if (currentProject) {
            filtered = filtered.filter(s => !currentProject.invitedSuppliers.includes(s.username));
        }

        setFilteredSuppliersForAdd(filtered);
    }, [addSupplierSearchText, addSupplierSelectedCategories, suppliers, currentProject]);

    const stats = {
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === 'Active').length,
        completedProjects: projects.filter(p => p.status === 'Completed' || p.status === 'Opened').length,
        totalBids: projects.reduce((sum, p) => sum + p.bids.length, 0),
    };

    const handleCreateProject = () => {
        setIsModalOpen(true);
        form.resetFields();
        setFileList([]);
    };

    const handleOk = () => {
        form.validateFields().then(values => {
            const newProject = {
                title: values.title,
                description: values.description,
                endTime: values.endTime.toISOString(),
                currency: values.currency,
                invitedSuppliers: values.invitedSuppliers || [],
                requiresAuditorOpening: values.requiresAuditorOpening || false,
                attachment: fileList.length > 0 ? fileList[0].name : null,
            };

            createProject(newProject);
            message.success(t('project.projectCreated') || '專案建立成功！');
            setIsModalOpen(false);
            form.resetFields();
            setFileList([]);
        });
    };

    const handleAddSupplier = (project) => {
        setCurrentProject(project);
        setIsAddSupplierModalOpen(true);
        supplierForm.resetFields();
        setAddSupplierSearchText('');
        setAddSupplierSelectedCategories([]);
    };

    const handleAddSupplierOk = () => {
        supplierForm.validateFields().then(values => {
            const selectedSuppliers = values.suppliers || [];
            if (selectedSuppliers.length === 0) {
                message.warning(t('messages.selectAtLeastOne'));
                return;
            }

            selectedSuppliers.forEach(supplierId => {
                autoAddSupplier(currentProject.id, supplierId);
            });

            message.success(t('project.supplierAdded'));
            setIsAddSupplierModalOpen(false);
            supplierForm.resetFields();
            setCurrentProject(null);
        });
    };

    const handleCancelProject = (projectId) => {
        cancelProject(projectId);
        message.success(t('project.projectCancelled'));
    };

    const columns = [
        {
            title: t('project.projectID') || '專案 ID',
            dataIndex: 'id',
            key: 'id',
            width: 100,
        },
        {
            title: t('project.projectTitle'),
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: t('project.status'),
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'green';
                if (status === 'Completed') color = 'blue';
                if (status === 'Cancelled') color = 'red';
                if (status === 'Opened') color = 'purple';
                return <Tag color={color}>{t(`status.${status}`)}</Tag>;
            },
        },
        {
            title: t('project.endTime'),
            dataIndex: 'endTime',
            key: 'endTime',
            render: (time) => new Date(time).toLocaleString(),
        },
        {
            title: t('project.currency'),
            dataIndex: 'currency',
            key: 'currency',
            render: (currency) => currency || 'TWD',
        },
        {
            title: t('project.bidsReceived'),
            dataIndex: 'bids',
            key: 'bids',
            render: (bids) => bids.length,
        },
        {
            title: t('project.invitedSuppliers'),
            dataIndex: 'invitedSuppliers',
            key: 'invitedSuppliers',
            render: (invitedSuppliers) => invitedSuppliers.length,
        },
        {
            title: t('project.actions'),
            key: 'actions',
            render: (_, record) => (
                <Space>
                    {record.status === 'Active' && (
                        <>
                            <Button
                                type="link"
                                icon={<UserAddOutlined />}
                                onClick={() => handleAddSupplier(record)}
                            >
                                {t('project.addSupplier')}
                            </Button>
                            <Popconfirm
                                title={t('messages.confirmCancel')}
                                onConfirm={() => handleCancelProject(record.id)}
                                okText={t('common.yes')}
                                cancelText={t('common.no')}
                            >
                                <Button type="link" danger icon={<StopOutlined />}>
                                    {t('project.cancelProject')}
                                </Button>
                            </Popconfirm>
                        </>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">{t('nav.dashboard')}</h2>

            {/* Statistics Cards */}
            <Row gutter={16} className="mb-6">
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title={t('dashboard.totalProjects')}
                            value={stats.totalProjects}
                            prefix={<ProjectOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title={t('dashboard.activeProjects')}
                            value={stats.activeProjects}
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title={t('dashboard.completedProjects')}
                            value={stats.completedProjects}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title={t('dashboard.totalBids')}
                            value={stats.totalBids}
                            prefix={<DollarOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Project Management Section */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">{t('project.projectManagement')}</h3>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateProject}>
                    {t('project.createProject')}
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={projects}
                rowKey="id"
                pagination={{ pageSize: 10 }}
            />

            {/* Create Project Modal */}
            <Modal
                title={t('project.createProject')}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={() => setIsModalOpen(false)}
                width={600}
                okText={t('common.submit')}
                cancelText={t('common.cancel')}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="title"
                        label={t('project.projectTitle')}
                        rules={[{ required: true, message: t('messages.requiredField') }]}
                    >
                        <Input placeholder={t('project.enterTitle') || '請輸入專案標題'} />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label={t('project.description')}
                        rules={[{ required: true, message: t('messages.requiredField') }]}
                    >
                        <TextArea rows={4} placeholder={t('project.enterDescription') || '請輸入專案說明'} />
                    </Form.Item>

                    <Form.Item
                        name="endTime"
                        label={t('project.endTime')}
                        rules={[{ required: true, message: t('messages.requiredField') }]}
                    >
                        <DatePicker showTime className="w-full" />
                    </Form.Item>

                    <Form.Item
                        name="currency"
                        label={t('project.currency')}
                        initialValue="VND"
                        rules={[{ required: true, message: t('messages.requiredField') }]}
                    >
                        <Select>
                            <Option value="USD">USD</Option>
                            <Option value="VND">VND</Option>
                            <Option value="TWD">TWD</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="attachment"
                        label={t('project.attachment')}
                    >
                        <Upload
                            fileList={fileList}
                            beforeUpload={() => false}
                            onChange={({ fileList }) => setFileList(fileList)}
                            maxCount={1}
                        >
                            <Button icon={<UploadOutlined />}>{t('project.uploadAttachment')}</Button>
                        </Upload>
                    </Form.Item>

                    <Form.Item
                        name="invitedSuppliers"
                        label={t('project.inviteSuppliers')}
                    >
                        <div className="space-y-2 mb-2">
                            <Input
                                placeholder={t('project.searchByName')}
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                prefix={<FilterOutlined />}
                            />
                            <Select
                                mode="multiple"
                                placeholder={t('project.selectCategories')}
                                value={selectedCategories}
                                onChange={setSelectedCategories}
                                allowClear
                            >
                                {businessCategories.map(cat => (
                                    <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                                ))}
                            </Select>
                            <div className="text-sm text-gray-500">
                                {t('project.foundSuppliers', { count: filteredSuppliers.length })}
                            </div>
                        </div>
                        <Select
                            mode="multiple"
                            placeholder={t('project.selectSuppliers')}
                            style={{ width: '100%' }}
                        >
                            {filteredSuppliers.map(supplier => (
                                <Option key={supplier.username} value={supplier.username}>
                                    {supplier.name} ({supplier.email})
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="requiresAuditorOpening"
                        valuePropName="checked"
                    >
                        <label>
                            <input type="checkbox" className="mr-2" />
                            {t('project.requiresAuditorOpening')}
                        </label>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Add Supplier Modal */}
            <Modal
                title={`${t('project.addSupplier')}: ${currentProject?.title}`}
                open={isAddSupplierModalOpen}
                onOk={handleAddSupplierOk}
                onCancel={() => {
                    setIsAddSupplierModalOpen(false);
                    setCurrentProject(null);
                }}
                width={600}
                okText={t('common.submit')}
                cancelText={t('common.cancel')}
            >
                <Form form={supplierForm} layout="vertical">
                    <div className="space-y-2 mb-4">
                        <Input
                            placeholder={t('project.searchByName')}
                            value={addSupplierSearchText}
                            onChange={(e) => setAddSupplierSearchText(e.target.value)}
                            prefix={<FilterOutlined />}
                        />
                        <Select
                            mode="multiple"
                            placeholder={t('project.selectCategories')}
                            value={addSupplierSelectedCategories}
                            onChange={setAddSupplierSelectedCategories}
                            allowClear
                            style={{ width: '100%' }}
                        >
                            {businessCategories.map(cat => (
                                <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                            ))}
                        </Select>
                        <div className="text-sm text-gray-500">
                            {t('project.foundSuppliers', { count: filteredSuppliersForAdd.length })}
                        </div>
                    </div>

                    <Form.Item
                        name="suppliers"
                        label={t('project.selectSuppliers')}
                        rules={[{ required: true, message: t('messages.selectAtLeastOne') }]}
                    >
                        <Select
                            mode="multiple"
                            placeholder={t('project.selectSuppliers')}
                            style={{ width: '100%' }}
                        >
                            {filteredSuppliersForAdd.map(supplier => (
                                <Option key={supplier.username} value={supplier.username}>
                                    {supplier.name} ({supplier.email})
                                    {supplier.businessCategories && supplier.businessCategories.length > 0 && (
                                        <span className="text-xs text-gray-400 ml-2">
                                            - {supplier.businessCategories.map(c => c.name).join(', ')}
                                        </span>
                                    )}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default OperatorDashboard;
