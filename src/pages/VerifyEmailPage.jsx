import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Typography, Spin, Result, Button, Alert } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const VerifyEmailPage = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('verifying');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('驗證連結無效');
            return;
        }

        // Use sessionStorage to prevent duplicate verification
        const storageKey = `verified_${token}`;
        const alreadyVerified = sessionStorage.getItem(storageKey);

        if (alreadyVerified === 'success') {
            setStatus('success');
            setMessage('Email 驗證成功！');
            return;
        }

        if (alreadyVerified === 'info') {
            setStatus('info');
            setMessage(sessionStorage.getItem(`${storageKey}_msg`) || '驗證連結已使用');
            return;
        }

        if (alreadyVerified === 'error') {
            setStatus('error');
            setMessage(sessionStorage.getItem(`${storageKey}_msg`) || '驗證失敗');
            return;
        }

        const verifyEmail = async () => {
            try {
                const response = await fetch(`http://localhost:3000/api/verify-email?token=${token}`);
                const data = await response.json();

                if (response.ok && data.success) {
                    setStatus('success');
                    setMessage(data.message || 'Email 驗證成功！');
                    sessionStorage.setItem(storageKey, 'success');
                } else if (data.code === 'TOKEN_USED_OR_EXPIRED') {
                    // Token was already used - show as info, not error
                    setStatus('info');
                    setMessage(data.message || '驗證連結已使用或已過期。\n您的帳號在完成驗證後尚需要管理員核准後才能登入，我們已通知管理員，請耐心等候。');
                    sessionStorage.setItem(storageKey, 'info');
                } else {
                    setStatus('error');
                    setMessage(data.message || '驗證失敗');
                    sessionStorage.setItem(storageKey, 'error');
                    sessionStorage.setItem(`${storageKey}_msg`, data.message || '驗證失敗');
                }
            } catch (error) {
                setStatus('error');
                setMessage('驗證失敗，請稍後再試');
                sessionStorage.setItem(storageKey, 'error');
                sessionStorage.setItem(`${storageKey}_msg`, '驗證失敗，請稍後再試');
            }
        };

        verifyEmail();
    }, [token]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <Card className="w-full max-w-md shadow-lg rounded-xl">
                {status === 'verifying' && (
                    <div className="text-center py-8">
                        <Spin size="large" />
                        <Title level={4} className="mt-4">驗證中...</Title>
                        <p className="text-gray-500">請稍候</p>
                    </div>
                )}

                {status === 'success' && (
                    <Result
                        icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                        title="Email 驗證成功！"
                        subTitle={
                            <div>
                                <Paragraph>{message}</Paragraph>
                                <Alert
                                    message="等待管理員審核"
                                    description="您的帳號需要管理員核准後才能登入。我們已通知管理員，請耐心等候。"
                                    type="info"
                                    showIcon
                                    className="mt-4 text-left"
                                />
                            </div>
                        }
                        extra={[
                            <Button type="primary" key="login" onClick={() => navigate('/login')}>
                                前往登入頁面
                            </Button>
                        ]}
                    />
                )}

                {status === 'info' && (
                    <Result
                        status="info"
                        title="驗證連結已使用"
                        subTitle={message}
                        extra={[
                            <Button type="primary" key="login" onClick={() => navigate('/login')}>
                                前往登入
                            </Button>
                        ]}
                    />
                )}

                {status === 'error' && (
                    <Result
                        icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
                        title="驗證失敗"
                        subTitle={message}
                        extra={[
                            <Button key="register" onClick={() => navigate('/register')}>
                                重新註冊
                            </Button>,
                            <Button type="primary" key="login" onClick={() => navigate('/login')}>
                                返回登入
                            </Button>
                        ]}
                    />
                )}
            </Card>
        </div>
    );
};

export default VerifyEmailPage;
