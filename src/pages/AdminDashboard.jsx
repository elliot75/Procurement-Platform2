import React from 'react';
import { Card, Statistic, Row, Col } from 'antd';
import { UserOutlined, ProjectOutlined, DollarOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useMockData } from '../context/MockDataContext';
import { useTranslation } from 'react-i18next';

const AdminDashboard = () => {
    const { t } = useTranslation();
    const { users, projects } = useMockData();

    const stats = {
        totalUsers: users.length,
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === 'Active').length,
        completedProjects: projects.filter(p => p.status === 'Ended').length,
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">{t('nav.dashboard')}</h2>
            <Row gutter={16}>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title={t('dashboard.totalUsers')}
                            value={stats.totalUsers}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title={t('dashboard.totalProjects')}
                            value={stats.totalProjects}
                            prefix={<ProjectOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title={t('dashboard.activeProjects')}
                            value={stats.activeProjects}
                            prefix={<DollarOutlined />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title={t('dashboard.completedProjects')}
                            value={stats.completedProjects}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>
            </Row>

            <div className="mt-6">
                <Card title={t('dashboard.quickActions') || '快速操作'} className="mb-4">
                    <p>{t('dashboard.useSidebar') || '使用側邊欄導航至：'}</p>
                    <ul className="list-disc list-inside mt-2">
                        <li>{t('nav.userManagement')} - {t('dashboard.manageUsers') || '管理使用者帳號和權限'}</li>
                        <li>{t('nav.projectManagement')} - {t('dashboard.viewProjects') || '查看和管理所有專案'}</li>
                        <li>{t('nav.openingHall')} - {t('dashboard.reviewBids') || '審查投標結果'}</li>
                    </ul>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;
