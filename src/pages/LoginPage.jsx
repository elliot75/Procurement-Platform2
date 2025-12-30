import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Alert, message } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
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
            const result = await loginMock(email, password);

            if (result && result.error) {
                if (result.error === 'EMAIL_NOT_VERIFIED') {
                    setError('Email 尚未驗證。請檢查您的信箱並完成驗證。');
                } else if (result.error === 'Pending Approval') {
                    setError('您的帳號尚未經管理員審核。');
                } else {
                    setError('Email 或密碼錯誤');
                }
                return;
            }

            if (result && !result.error) {
                message.success(`歡迎回來，${result.name}`);
                navigate('/dashboard');
            } else {
                throw new Error('Invalid credentials');
            }

        } catch (err) {
            console.error("Login failed:", err);
            setError("登入失敗。請檢查您的 Email 和密碼。");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <Card className="w-full max-w-md shadow-lg rounded-xl">
                <div className="text-center mb-6">
                    <Title level={2}>採購平台</Title>
                    <p className="text-gray-500">登入您的帳號</p>
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
                        label="Email"
                        rules={[
                            { required: true, message: '請輸入您的 Email' },
                            { type: 'email', message: 'Email 格式不正確' }
                        ]}
                    >
                        <Input prefix={<MailOutlined />} placeholder="your.email@example.com" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="密碼"
                        rules={[{ required: true, message: '請輸入密碼' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="請輸入密碼" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                            登入
                        </Button>
                        <div className="text-center mt-4">
                            <span className="text-gray-500">還沒有帳號嗎？ </span>
                            <Link to="/register" className="text-blue-600 hover:underline">註冊</Link>
                        </div>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default LoginPage;
