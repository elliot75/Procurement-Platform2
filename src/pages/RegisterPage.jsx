import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Alert, message, Progress, Select } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { Moon, Sun } from 'lucide-react';
import { useMockData } from '../context/MockDataContext';
import { Button as UIButton } from '../components/ui/button';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';

const { Title, Text } = Typography;
const { Option } = Select;
const API_URL = 'http://localhost:3000/api';

const RegisterPage = () => {
    const [error, setError] = useState('');
    const [password, setPassword] = useState('');
    const [isDark, setIsDark] = useState(false);
    const [businessCategories, setBusinessCategories] = useState([]);
    const navigate = useNavigate();
    const { register } = useMockData();
    const { t } = useTranslation();

    useEffect(() => {
        fetchBusinessCategories();
    }, []);

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

    const toggleTheme = () => {
        setIsDark(!isDark);
        document.documentElement.classList.toggle('dark');
    };

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
        const { email, password, name, businessCategories: selectedCategories } = values;

        try {
            const result = await register(email, password, name, selectedCategories || []);

            if (result.success) {
                message.success(t('auth.registrationSuccess') || '註冊成功！請檢查您的 Email 以完成驗證。');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError(result.error || t('auth.registrationFailed') || '註冊失敗');
            }
        } catch (err) {
            console.error("Registration failed:", err);
            setError(t('auth.registrationFailed') || "註冊失敗。請稍後再試。");
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            {/* Theme Toggle and Language Switcher */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
                <LanguageSwitcher />
                <UIButton variant="ghost" size="icon" onClick={toggleTheme}>
                    {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </UIButton>
            </div>

            <Card className="w-full max-w-md shadow-lg">
                <div className="text-center mb-6">
                    <Title level={2} className="!mb-2">{t('auth.registerTitle')}</Title>
                    <p className="text-gray-500">{t('auth.registerSubtitle') || '建立您的帳號'}</p>
                </div>

                {error && (
                    <Alert
                        message={error}
                        type="error"
                        showIcon
                        closable
                        onClose={() => setError('')}
                        className="mb-4"
                    />
                )}

                <Form
                    name="register"
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                >
                    <Form.Item
                        name="name"
                        label={t('auth.name')}
                        tooltip={t('auth.nameHint')}
                        rules={[{ required: true, message: t('messages.requiredField') }]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder={t('auth.namePlaceholder') || '請輸入姓名或公司名稱'}
                        />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label={t('auth.email')}
                        rules={[
                            { required: true, message: t('messages.requiredField') },
                            { type: 'email', message: t('messages.invalidEmail') }
                        ]}
                    >
                        <Input
                            prefix={<MailOutlined />}
                            placeholder={t('auth.emailPlaceholder') || '請輸入 Email'}
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label={t('auth.password')}
                        rules={[
                            { required: true, message: t('messages.requiredField') },
                            { min: 6, message: t('messages.passwordTooShort') }
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder={t('auth.passwordPlaceholder') || '請輸入密碼'}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </Form.Item>

                    {password && (
                        <div className="mb-4">
                            <Text type="secondary" className="text-sm">
                                {t('auth.passwordStrength') || '密碼強度'}:
                            </Text>
                            <Progress
                                percent={passwordStrength}
                                strokeColor={getStrengthColor()}
                                showInfo={false}
                                size="small"
                            />
                        </div>
                    )}

                    <Form.Item
                        name="confirmPassword"
                        label={t('auth.confirmPassword')}
                        dependencies={['password']}
                        rules={[
                            { required: true, message: t('messages.requiredField') },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error(t('messages.passwordMismatch')));
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder={t('auth.confirmPasswordPlaceholder') || '請再次輸入密碼'}
                        />
                    </Form.Item>

                    <Form.Item
                        name="businessCategories"
                        label={t('auth.businessCategories')}
                        tooltip={t('auth.businessCategoriesHint') || '供應商請選擇經營項目'}
                    >
                        <Select
                            mode="multiple"
                            placeholder={t('auth.selectBusinessCategories') || '選擇經營項目（選填）'}
                            allowClear
                        >
                            {businessCategories.map(cat => (
                                <Option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            {t('auth.registerButton')}
                        </Button>
                    </Form.Item>

                    <div className="text-center">
                        <span className="text-gray-600">{t('auth.haveAccount')} </span>
                        <Link to="/login" className="text-blue-500 hover:text-blue-600">
                            {t('auth.loginNow')}
                        </Link>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default RegisterPage;
