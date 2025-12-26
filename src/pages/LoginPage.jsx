// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Alert, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useMockData } from '../context/MockDataContext';

const { Title } = Typography;

const LoginPage = () => {
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { loginMock } = useMockData();

    const onFinish = async (values) => {
        setError('');
        const { email, password } = values;

        try {
            console.log(`Attempting login...`);

            // Use Mock Login from Context
            const result = loginMock(email, password);

            if (result && result.error === 'Pending Approval') {
                setError('Your account is pending Admin approval.');
                return;
            }

            if (result) {
                message.success(`Welcome back, ${result.name}`);
                navigate('/dashboard');
            } else {
                throw new Error('Invalid credentials');
            }

        } catch (err) {
            console.error("Login failed:", err);
            setError("Login failed. Check your username.");
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <Card className="w-full max-w-md shadow-lg rounded-xl">
                <div className="text-center mb-6">
                    <Title level={2}>Procurement Platform</Title>
                    <p className="text-gray-500">Sign in to your account</p>
                </div>

                {error && <Alert message={error} type="error" showIcon className="mb-4" />}

                <Form
                    name="login"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    size="large"
                    layout="vertical"
                >
                    <Form.Item
                        name="email"
                        rules={[{ required: true, message: 'Please input your Username or Email!' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Username / Email" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Please input your Password!' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                    </Form.Item>

                    <Form.Item>
                        <div className="flex justify-between items-center mb-4">
                            <a href="/forgot-password" className="text-gray-500 hover:text-blue-600 text-sm">Forgot Password?</a>
                        </div>
                        <Button type="primary" htmlType="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                            Sign In
                        </Button>
                        <div className="text-center mt-4">
                            <span className="text-gray-500">Don't have an account? </span>
                            <a href="/register" className="text-blue-600 hover:underline">Register</a>
                        </div>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default LoginPage;
