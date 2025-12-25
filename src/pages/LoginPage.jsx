// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

const { Title } = Typography;

const LoginPage = () => {
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // ACCESSING ENV VARIABLE
    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

    const onFinish = async (values) => {
        setError('');
        const { email, password } = values;

        try {
            console.log(`Attempting login to ${API_URL}/auth/login with`, email);

            // MOCK LOGIN FOR DEMONSTRATION
            if (email === 'admin' && password === 'Admin@123') {
                // Success
                localStorage.setItem('token', 'mock-jwt-token');
                localStorage.setItem('user', JSON.stringify({ name: 'Administrator', role: 'Admin' }));
                navigate('/dashboard');
                return;
            }

            // Real API Call (commented out for now if backend not running)
            /*
            const response = await fetch(`${API_URL}/auth/login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password }),
            });
      
            if (!response.ok) {
              throw new Error('Invalid credentials');
            }
      
            const data = await response.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            navigate('/dashboard');
            */

            throw new Error('Invalid credentials (Try: admin / Admin@123)');

        } catch (err) {
            console.error("Login failed:", err);
            setError(err.message || "Login failed. Please check your credentials.");
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
                        <Button type="primary" htmlType="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                            Sign In
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default LoginPage;
