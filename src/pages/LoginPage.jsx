import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Alert, message } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { Moon, Sun } from 'lucide-react';
import { useMockData } from '../context/MockDataContext';
import { Button as UIButton } from '../components/ui/button';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';

const { Title } = Typography;

const LoginPage = () => {
    const [error, setError] = useState('');
    const [isDark, setIsDark] = useState(false);
    const navigate = useNavigate();
    const { loginMock } = useMockData();
    const { t } = useTranslation();

    const toggleTheme = () => {
        setIsDark(!isDark);
        document.documentElement.classList.toggle('dark');
    };

    const onFinish = async (values) => {
        setError('');
        const { email, password } = values;

        try {
            const result = await loginMock(email, password);

            if (result && result.error) {
                if (result.error === 'EMAIL_NOT_VERIFIED') {
                    setError(t('auth.emailNotVerified') || 'Email 尚未驗證。請檢查您的信箱並完成驗證。');
                } else if (result.error === 'Pending Approval') {
                    setError(t('auth.waitingApproval'));
                } else {
                    setError(t('auth.invalidCredentials') || 'Email 或密碼錯誤');
                }
                return;
            }

            if (result && !result.error) {
                message.success(t('auth.welcomeBack', { name: result.name }) || `歡迎回來，${result.name}`);
                navigate('/dashboard');
            } else {
                throw new Error('Invalid credentials');
            }

        } catch (err) {
            console.error("Login failed:", err);
            setError(t('auth.loginFailed') || "登入失敗。請檢查您的 Email 和密碼。");
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
                    <Title level={2} className="!mb-2">{t('auth.loginTitle')}</Title>
                    <p className="text-gray-500">{t('auth.loginSubtitle') || '登入您的帳號'}</p>
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
                    name="login"
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                >
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
                        rules={[{ required: true, message: t('messages.requiredField') }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder={t('auth.passwordPlaceholder') || '請輸入密碼'}
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            {t('auth.loginButton')}
                        </Button>
                    </Form.Item>

                    <div className="text-center">
                        <span className="text-gray-600">{t('auth.noAccount')} </span>
                        <Link to="/register" className="text-blue-500 hover:text-blue-600">
                            {t('auth.registerNow')}
                        </Link>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default LoginPage;
