import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, message, Select, Tabs, Card } from 'antd';
import { useMockData } from '../context/MockDataContext';

const { Option } = Select;
const { TabPane } = Tabs;
const API_URL = 'http://localhost:3000/api';

const ProfileManagementModal = ({ visible, onClose }) => {
    const { currentUser, changePassword } = useMockData();
    const [passwordForm] = Form.useForm();
    const [profileForm] = Form.useForm();
    const [businessCategories, setBusinessCategories] = useState([]);
    const [userCategories, setUserCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            fetchBusinessCategories();
            fetchUserCategories();
        }
    }, [visible]);

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

    const fetchUserCategories = async () => {
        if (!currentUser) return;

        try {
            const res = await fetch(`${API_URL}/users`);
            if (res.ok) {
                const users = await res.json();
                const user = users.find(u => u.username === currentUser.username);
                if (user && user.businessCategories) {
                    const categoryIds = user.businessCategories.map(c => c.id);
                    setUserCategories(categoryIds);
                    profileForm.setFieldsValue({ businessCategories: categoryIds });
                }
            }
        } catch (err) {
            console.error('Failed to fetch user categories:', err);
        }
    };

    const handlePasswordChange = async (values) => {
        setLoading(true);
        try {
            const result = await changePassword(
                currentUser.username,
                values.oldPassword,
                values.newPassword
            );

            if (result.success) {
                message.success('密碼已更新');
                passwordForm.resetFields();
            } else {
                message.error(result.message || '密碼更新失敗');
            }
        } catch (err) {
            message.error('密碼更新失敗');
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (values) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/users/${currentUser.username}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    businessCategories: values.businessCategories || []
                })
            });

            if (res.ok) {
                message.success('經營項目已更新');
                setUserCategories(values.businessCategories || []);
            } else {
                message.error('更新失敗');
            }
        } catch (err) {
            message.error('更新失敗');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="個人帳號管理"
            open={visible}
            onCancel={onClose}
            footer={null}
            width={600}
        >
            <Tabs defaultActiveKey="password">
                <TabPane tab="修改密碼" key="password">
                    <Form
                        form={passwordForm}
                        layout="vertical"
                        onFinish={handlePasswordChange}
                    >
                        <Form.Item
                            name="oldPassword"
                            label="舊密碼"
                            rules={[{ required: true, message: '請輸入舊密碼' }]}
                        >
                            <Input.Password />
                        </Form.Item>

                        <Form.Item
                            name="newPassword"
                            label="新密碼"
                            rules={[
                                { required: true, message: '請輸入新密碼' },
                                { min: 8, message: '密碼至少需要 8 個字元' },
                                {
                                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                                    message: '密碼必須包含大寫、小寫英文字母及數字'
                                }
                            ]}
                        >
                            <Input.Password />
                        </Form.Item>

                        <Form.Item
                            name="confirmPassword"
                            label="確認新密碼"
                            dependencies={['newPassword']}
                            rules={[
                                { required: true, message: '請確認新密碼' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('newPassword') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('兩次輸入的密碼不一致'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password />
                        </Form.Item>

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border rounded hover:bg-gray-50"
                            >
                                取消
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading ? '更新中...' : '更新密碼'}
                            </button>
                        </div>
                    </Form>
                </TabPane>

                {currentUser?.role === 'Supplier' && (
                    <TabPane tab="經營項目" key="categories">
                        <Form
                            form={profileForm}
                            layout="vertical"
                            onFinish={handleProfileUpdate}
                        >
                            <Form.Item
                                name="businessCategories"
                                label="我的經營項目"
                                tooltip="請選擇您公司的經營項目，可複選"
                            >
                                <Select
                                    mode="multiple"
                                    placeholder="請選擇經營項目"
                                    allowClear
                                >
                                    {businessCategories.map(category => (
                                        <Option key={category.id} value={category.id}>
                                            {category.name}
                                            {category.description && (
                                                <span className="text-gray-400 text-xs ml-2">
                                                    ({category.description})
                                                </span>
                                            )}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <div className="bg-blue-50 p-3 rounded mb-4">
                                <p className="text-sm text-blue-800">
                                    💡 提示：選擇正確的經營項目可以幫助採購人員更快找到您的公司
                                </p>
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 border rounded hover:bg-gray-50"
                                >
                                    取消
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {loading ? '更新中...' : '更新經營項目'}
                                </button>
                            </div>
                        </Form>
                    </TabPane>
                )}
            </Tabs>
        </Modal>
    );
};

export default ProfileManagementModal;
