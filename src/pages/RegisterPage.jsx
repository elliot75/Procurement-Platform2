import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Alert, message, Progress } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useMockData } from '../context/MockDataContext';

const { Title, Text } = Typography;

const RegisterPage = () => {
    const [error, setError] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { register } = useMockData();

    // Password strength calculator
    const getPasswordStrength = (pwd) => {
        let strength = 0;
        if (pwd.length >= 8) strength += 25;
        if (/[A-Z]/.test(pwd)) strength += 25;
        if (/[a-z]/.test(pwd)) strength += 25;
        if (/[0-9]/.test(pwd)) strength += 25;
        return strength;
    };

    const passwordStrength = getPasswordStrength(password);
    const getStrengthColor = () => {
        if (passwordStrength <= 25) return '#ff4d4f';
        if (passwordStrength <= 50) return '#faad14';
        if (passwordStrength <= 75) return '#1890ff';
        return '#52c41a';
    };

    const onFinish = async (values) => {
        setError('');
        const { name, email, password } = values;

        try {
            const result = await register({ name, email, password });

            if (result.success) {
                message.success(result.message || '註冊成功！驗證郵件已發送至您的信箱。');
                navigate('/login');
            } else {
                setError(result.message || '註冊失敗，請稍後再試');
            }
        } catch (err) {
            setError(err.message || '註冊失敗，請稍後再試');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <Card className="w-full max-w-md shadow-lg rounded-xl">
                <div className="text-center mb-6">
                    <Title level={2}>建立帳號</Title>
                    <p className="text-gray-500">加入採購平台</p>
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
                        label="姓名"
                        rules={[{ required: true, message: '請輸入您的姓名' }]}
                        tooltip={{
                            title: (
                                <div>
                                    <div>• 供應商：請填入公司名稱</div>
                                    <div>• 公司內部員工：請填入姓名並備註員工編號</div>
                                    <div style={{ marginTop: 4, fontSize: 11, opacity: 0.8 }}>範例：John(12120001)</div>
                                </div>
                            ),
                            icon: <UserOutlined />
                        }}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="供應商請填公司名 / 內部員工請填姓名(員工編號)"
                        />
                    </Form.Item>

                    <Alert
                        message="姓名欄位填寫說明"
                        description={
                            <div className="text-xs">
                                <p className="mb-1">📦 <strong>供應商</strong>：請填入公司名稱</p>
                                <p>👤 <strong>公司內部員工</strong> (Operator/Auditor)：請填入姓名並備註員工編號，例如：John(12120001)</p>
                            </div>
                        }
                        type="info"
                        showIcon
                        className="mb-4"
                    />

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
                        rules={[
                            { required: true, message: '請輸入密碼' },
                            { min: 8, message: '密碼至少需要 8 個字元' },
                            {
                                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                                message: '密碼必須包含大寫、小寫英文字母及數字'
                            }
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="請輸入密碼"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </Form.Item>

                    {password && (
                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-1">
                                <Text type="secondary" style={{ fontSize: 12 }}>密碼強度</Text>
                                <Text style={{ fontSize: 12, color: getStrengthColor() }}>
                                    {passwordStrength <= 25 && '弱'}
                                    {passwordStrength > 25 && passwordStrength <= 50 && '中等'}
                                    {passwordStrength > 50 && passwordStrength <= 75 && '良好'}
                                    {passwordStrength > 75 && '強'}
                                </Text>
                            </div>
                            <Progress
                                percent={passwordStrength}
                                strokeColor={getStrengthColor()}
                                showInfo={false}
                                size="small"
                            />
                        </div>
                    )}

                    <div className="mb-4 p-3 bg-blue-50 rounded">
                        <Text strong style={{ fontSize: 12 }}>密碼要求：</Text>
                        <ul className="mt-2 text-xs text-gray-600 space-y-1">
                            <li className={password.length >= 8 ? 'text-green-600' : ''}>
                                ✓ 至少 8 個字元
                            </li>
                            <li className={/[A-Z]/.test(password) ? 'text-green-600' : ''}>
                                ✓ 包含大寫英文字母
                            </li>
                            <li className={/[a-z]/.test(password) ? 'text-green-600' : ''}>
                                ✓ 包含小寫英文字母
                            </li>
                            <li className={/[0-9]/.test(password) ? 'text-green-600' : ''}>
                                ✓ 包含數字
                            </li>
                        </ul>
                    </div>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                            註冊
                        </Button>
                    </Form.Item>

                    <div className="text-center">
                        <span className="text-gray-500">已經有帳號？ </span>
                        <Link to="/login" className="text-blue-600 hover:underline">登入</Link>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default RegisterPage;
