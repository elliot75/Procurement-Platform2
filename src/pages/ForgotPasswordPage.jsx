import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Alert, message, Steps } from 'antd';
import { UserOutlined, LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useMockData } from '../context/MockDataContext';

const { Title } = Typography;

const ForgotPasswordPage = () => {
    const [step, setStep] = useState(0);
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { requestPasswordReset, confirmPasswordReset } = useMockData();

    const onRequestCode = (values) => {
        setError('');
        const res = requestPasswordReset(values.username);
        if (res.success) {
            setUsername(values.username);
            message.success(`Verification Code Sent! (Mock Code: ${res.code})`, 10);
            setStep(1);
        } else {
            setError(res.message);
        }
    };

    const onResetPassword = (values) => {
        setError('');
        const res = confirmPasswordReset(username, values.code, values.password);
        if (res.success) {
            message.success('Password reset successfully! Please login.');
            navigate('/login');
        } else {
            setError(res.message);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <Card className="w-full max-w-md shadow-lg rounded-xl">
                <div className="text-center mb-6">
                    <Title level={2}>Account Recovery</Title>
                    <p className="text-gray-500">Reset your password</p>
                </div>

                <Steps current={step} size="small" className="mb-6">
                    <Steps.Step title="Identify" />
                    <Steps.Step title="Verify & Reset" />
                </Steps>

                {error && <Alert message={error} type="error" showIcon className="mb-4" />}

                {step === 0 && (
                    <Form
                        name="requestCode"
                        onFinish={onRequestCode}
                        size="large"
                        layout="vertical"
                    >
                        <Form.Item
                            name="username"
                            rules={[{ required: true, message: 'Please input your Username!' }]}
                        >
                            <Input prefix={<UserOutlined />} placeholder="Enter your Username" />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                                Send Verification Code
                            </Button>
                        </Form.Item>
                    </Form>
                )}

                {step === 1 && (
                    <Form
                        name="resetPassword"
                        onFinish={onResetPassword}
                        size="large"
                        layout="vertical"
                    >
                        <div className="mb-4 text-center">
                            <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-sm">
                                Resetting for: <b>{username}</b>
                            </span>
                        </div>

                        <Form.Item
                            name="code"
                            rules={[{ required: true, message: 'Please input the code!' }]}
                        >
                            <Input prefix={<SafetyCertificateOutlined />} placeholder="6-Digit Verification Code" />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={[{ required: true, message: 'Please input your new password!' }]}
                        >
                            <Input.Password prefix={<LockOutlined />} placeholder="New Password" />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" className="w-full bg-green-600 hover:bg-green-700">
                                Reset Password
                            </Button>
                        </Form.Item>

                        <Button type="link" onClick={() => setStep(0)} className="w-full">
                            Back
                        </Button>
                    </Form>
                )}

                <div className="text-center mt-4">
                    <Link to="/login" className="text-gray-500 hover:text-blue-600">Back to Login</Link>
                </div>
            </Card>
        </div>
    );
};

export default ForgotPasswordPage;
