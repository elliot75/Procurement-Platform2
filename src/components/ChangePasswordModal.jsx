import React, { useState } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import { useMockData } from '../context/MockDataContext';

const ChangePasswordModal = ({ visible, onClose }) => {
    const [form] = Form.useForm();
    const { changePassword, currentUser } = useMockData();
    const [loading, setLoading] = useState(false);

    const onFinish = (values) => {
        setLoading(true);
        // Simulate network delay
        setTimeout(() => {
            const res = changePassword(currentUser.username, values.oldPassword, values.newPassword);
            setLoading(false);

            if (res.success) {
                message.success('Password changed successfully!');
                form.resetFields();
                onClose();
            } else {
                message.error(res.message);
            }
        }, 500);
    };

    return (
        <Modal
            title="Change Password"
            open={visible}
            onCancel={onClose}
            footer={null}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
            >
                <Form.Item
                    name="oldPassword"
                    label="Current Password"
                    rules={[{ required: true, message: 'Please enter your current password' }]}
                >
                    <Input.Password placeholder="Current Password" />
                </Form.Item>

                <Form.Item
                    name="newPassword"
                    label="New Password"
                    rules={[
                        { required: true, message: 'Please enter a new password' },
                        { min: 6, message: 'Password must be at least 6 characters' }
                    ]}
                >
                    <Input.Password placeholder="New Password" />
                </Form.Item>

                <Form.Item
                    name="confirmPassword"
                    label="Confirm New Password"
                    dependencies={['newPassword']}
                    hasFeedback
                    rules={[
                        { required: true, message: 'Please confirm your new password' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('newPassword') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('The two passwords that you entered do not match!'));
                            },
                        }),
                    ]}
                >
                    <Input.Password placeholder="Confirm New Password" />
                </Form.Item>

                <div className="flex justify-end gap-2 text-right">
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Change Password
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default ChangePasswordModal;
