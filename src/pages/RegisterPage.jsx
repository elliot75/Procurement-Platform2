import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Select, Alert, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useMockData } from '../context/MockDataContext';

const { Title } = Typography;
const { Option } = Select;

const RegisterPage = () => {
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { register } = useMockData();

    const onFinish = (values) => {
        setError('');
        const { name, username, password } = values;

        const newUser = {
            name,
            username,
            password
        };

        const success = register(newUser);

        if (success) {
            message.success('Registration successful! Please wait for Admin approval.');
            navigate('/login');
        } else {
            setError('Username already exists. Please choose another.');
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <Card className="w-full max-w-md shadow-lg rounded-xl">
                <div className="text-center mb-6">
                    <Title level={2}>Create Account</Title>
                    <p className="text-gray-500">Join the Procurement Platform</p>
                </div>

                {error && <Alert message={error} type="error" showIcon className="mb-4" />}

                <Form
                    name="register"
                    onFinish={onFinish}
                    size="large"
                    layout="vertical"
                >
                    <Form.Item
                        name="name"
                        rules={[{ required: true, message: 'Please input your Full Name!' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Full Name" />
                    </Form.Item>

                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: 'Please input your Username!' }]}
                    >
                        <Input prefix={<MailOutlined />} placeholder="Username / Email" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Please input your Password!' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                    </Form.Item>



                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                            Register
                        </Button>
                    </Form.Item>

                    <div className="text-center">
                        <span className="text-gray-500">Already have an account? </span>
                        <Link to="/login" className="text-blue-600 hover:underline">Sign In</Link>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default RegisterPage;
