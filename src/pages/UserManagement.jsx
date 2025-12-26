import React, { useState } from 'react';
import { Table, Button, Tag, Space, message, Popconfirm, Modal, Form, Select, Input } from 'antd';
import { DeleteOutlined, UserAddOutlined, EditOutlined } from '@ant-design/icons';
import { useMockData } from '../context/MockDataContext';

const { Option } = Select;

const UserManagement = () => {
    const { users, deleteUser, updateUser, currentUser } = useMockData();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form] = Form.useForm();

    // Filter out self just in case, though usually admin can delete others
    const data = users.filter(u => u.username !== currentUser.username);

    const handleDelete = (username) => {
        deleteUser(username);
        message.success(`User ${username} deleted successfully`);
    };

    const handleEdit = (record) => {
        setEditingUser(record);
        form.setFieldsValue({
            role: record.role,
            password: '' // Reset password field
        });
        setIsModalVisible(true);
    };

    const handleUpdate = (values) => {
        const updates = { role: values.role };
        if (values.password) {
            updates.password = values.password;
        }
        updateUser(editingUser.username, updates);
        message.success(`User ${editingUser.username} updated successfully`);
        setIsModalVisible(false);
        setEditingUser(null);
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: text => <span className="font-medium">{text}</span>
        },
        {
            title: 'Username / Email',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: role => {
                let color = 'geekblue';
                if (role === 'Admin') color = 'red';
                if (role === 'Supplier') color = 'green';
                if (role === 'Auditor') color = 'orange';
                if (role === 'Pending') color = 'default';
                return (
                    <Tag color={color} key={role}>
                        {role.toUpperCase()}
                    </Tag>
                );
            }
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="default"
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleEdit(record)}
                    >
                        Edit
                    </Button>
                    {record.role !== 'Admin' && ( // Prevent deleting other admins for safety in this demo
                        <Popconfirm
                            title="Are you sure to delete this user?"
                            onConfirm={() => handleDelete(record.username)}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button type="primary" danger icon={<DeleteOutlined />} size="small">
                                Delete
                            </Button>
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold">User Management</h2>
                    <p className="text-gray-500">Manage system users and access roles</p>
                </div>
                {/* Future: Add User Modal */}
                {/* <Button type="primary" icon={<UserAddOutlined />}>Add User</Button> */}
            </div>

            <Table
                columns={columns}
                dataSource={data}
                rowKey="username"
                pagination={{ pageSize: 5 }}
            />

            <Modal
                title={`Edit User: ${editingUser?.username}`}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleUpdate}
                >
                    <Form.Item
                        name="role"
                        label="Role"
                        rules={[{ required: true, message: 'Please select a role' }]}
                    >
                        <Select>
                            <Option value="Pending">Pending</Option>
                            <Option value="Supplier">Supplier</Option>
                            <Option value="Operator">Operator</Option>
                            <Option value="Auditor">Auditor</Option>
                            <Option value="Admin">Admin</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="New Password (Optional)"
                        help="Leave blank to keep current password"
                    >
                        <Input.Password placeholder="Enter new password" />
                    </Form.Item>

                    <div className="flex justify-end gap-2 mt-4">
                        <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
                        <Button type="primary" htmlType="submit">Update User</Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default UserManagement;
