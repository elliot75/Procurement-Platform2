import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const API_URL = 'http://localhost:3000/api';

const BusinessCategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch(`${API_URL}/business-categories`);
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
            }
        } catch (err) {
            console.error('Failed to fetch categories:', err);
        }
    };

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const url = editingCategory
                ? `${API_URL}/business-categories/${editingCategory.id}`
                : `${API_URL}/business-categories`;

            const method = editingCategory ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values)
            });

            if (res.ok) {
                message.success(editingCategory ? '經營項目已更新' : '經營項目已新增');
                setIsModalOpen(false);
                setEditingCategory(null);
                form.resetFields();
                fetchCategories();
            } else {
                const error = await res.json();
                message.error(error.message || '操作失敗');
            }
        } catch (err) {
            message.error('操作失敗');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const res = await fetch(`${API_URL}/business-categories/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                message.success('經營項目已刪除');
                fetchCategories();
            } else {
                message.error('刪除失敗');
            }
        } catch (err) {
            message.error('刪除失敗');
            console.error(err);
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        form.setFieldsValue(category);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingCategory(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
        },
        {
            title: '經營項目名稱',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: '說明',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: '操作',
            key: 'actions',
            width: 150,
            render: (_, record) => (
                <div className="flex gap-2">
                    <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        編輯
                    </Button>
                    <Popconfirm
                        title="確定要刪除此經營項目嗎？"
                        description="刪除後將無法復原"
                        onConfirm={() => handleDelete(record.id)}
                        okText="確定"
                        cancelText="取消"
                    >
                        <Button
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                        >
                            刪除
                        </Button>
                    </Popconfirm>
                </div>
            ),
        },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">經營項目管理</h2>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                >
                    新增經營項目
                </Button>
            </div>

            <Card>
                <Table
                    dataSource={categories}
                    columns={columns}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <Modal
                title={editingCategory ? '編輯經營項目' : '新增經營項目'}
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    setEditingCategory(null);
                    form.resetFields();
                }}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="name"
                        label="經營項目名稱"
                        rules={[{ required: true, message: '請輸入經營項目名稱' }]}
                    >
                        <Input placeholder="例如：建築工程" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="說明"
                    >
                        <TextArea rows={3} placeholder="簡短說明此經營項目" />
                    </Form.Item>

                    <div className="flex justify-end gap-2">
                        <Button onClick={() => {
                            setIsModalOpen(false);
                            setEditingCategory(null);
                            form.resetFields();
                        }}>
                            取消
                        </Button>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            {editingCategory ? '更新' : '新增'}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default BusinessCategoryManagement;
