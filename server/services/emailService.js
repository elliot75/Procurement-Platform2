import nodemailer from 'nodemailer';

// Email service for sending verification emails
class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'mail.upvn.com.vn',
            port: parseInt(process.env.SMTP_PORT || '25'),
            secure: false, // Use TLS  
            auth: {
                user: process.env.SMTP_USER || 'upvn.po@upvn.com.vn',
                pass: process.env.SMTP_PASS || 'Uni@12120011'
            },
            tls: {
                rejectUnauthorized: false // For development
            }
        });
    }

    /**
     * Send email verification link
     * @param {string} email - Recipient email
     * @param {string} token - Verification token
     */
    async sendVerificationEmail(email, token) {
        const verificationLink = `${process.env.APP_URL || 'http://localhost:5173'}/verify-email?token=${token}`;

        const mailOptions = {
            from: process.env.SMTP_FROM || 'upvn.po@upvn.com.vn',
            to: email,
            subject: '請驗證您的 Email',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #1890ff;">歡迎註冊採購平台</h2>
                    <p>請點擊下方連結來驗證您的 Email：</p>
                    <a href="${verificationLink}" 
                       style="display: inline-block; padding: 12px 24px; background-color: #1890ff; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
                        驗證 Email
                    </a>
                    <p style="color: #666; font-size: 14px;">
                        此連結將在 24 小時後失效。<br>
                        如果您沒有註冊帳號，請忽略此郵件。
                    </p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
                    <p style="color: #999; font-size: 12px;">
                        如果按鈕無法點擊，請複製此連結到瀏覽器：<br>
                        <span style="word-break: break-all;">${verificationLink}</span>
                    </p>
                </div>
            `
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Verification email sent:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Failed to send verification email:', error);
            throw new Error('無法發送驗證郵件，請稍後再試');
        }
    }

    /**
     * Send admin notification for new user registration
     * @param {string} userName - New user's name
     * @param {string} userEmail - New user's email
     */
    async sendAdminNotification(userName, userEmail) {
        const adminEmail = 'upvn.po@upvn.com.vn';
        const dashboardLink = `${process.env.APP_URL || 'http://localhost:5173'}/admin/users`;

        const mailOptions = {
            from: process.env.SMTP_FROM || 'upvn.po@upvn.com.vn',
            to: adminEmail,
            subject: '新用戶註冊通知 - 待審核',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #1890ff;">新用戶註冊通知</h2>
                    <p>有新用戶完成 Email 驗證，等待您的審核：</p>
                    <div style="background-color: #f5f5f5; padding: 16px; border-radius: 4px; margin: 16px 0;">
                        <p style="margin: 8px 0;"><strong>姓名：</strong>${userName}</p>
                        <p style="margin: 8px 0;"><strong>Email：</strong>${userEmail}</p>
                    </div>
                    <p>請前往管理後台審核此用戶的權限：</p>
                    <a href="${dashboardLink}" 
                       style="display: inline-block; padding: 12px 24px; background-color: #1890ff; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
                        前往用戶管理
                    </a>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
                    <p style="color: #999; font-size: 12px;">
                        如果按鈕無法點擊，請複製此連結到瀏覽器：<br>
                        <span style="word-break: break-all;">${dashboardLink}</span>
                    </p>
                </div>
            `
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Admin notification sent:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Failed to send admin notification:', error);
            // Don't throw error - notification is not critical
            return { success: false, error: error.message };
        }
    }

    /**
     * Send approval notification to user when admin approves their account
     * @param {string} userName - User's name
     * @param {string} userEmail - User's email
     * @param {string} userRole - Approved role
     */
    async sendApprovalNotification(userName, userEmail, userRole) {
        const loginLink = `${process.env.APP_URL || 'http://localhost:5173'}/login`;

        const mailOptions = {
            from: process.env.SMTP_FROM || 'upvn.po@upvn.com.vn',
            to: userEmail,
            subject: '帳號審核通過通知',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #52c41a;">帳號審核通過！</h2>
                    <p>親愛的 ${userName}：</p>
                    <p>恭喜您！您的帳號已經管理員審核通過。</p>
                    <div style="background-color: #f5f5f5; padding: 16px; border-radius: 4px; margin: 16px 0;">
                        <p style="margin: 8px 0;"><strong>Email：</strong>${userEmail}</p>
                        <p style="margin: 8px 0;"><strong>角色：</strong>${userRole}</p>
                    </div>
                    <p>您現在可以使用您的帳號登入系統：</p>
                    <a href="${loginLink}" 
                       style="display: inline-block; padding: 12px 24px; background-color: #1890ff; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
                        前往登入
                    </a>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
                    <p style="color: #999; font-size: 12px;">
                        如果按鈕無法點擊，請複製此連結到瀏覽器：<br>
                        <span style="word-break: break-all;">${loginLink}</span>
                    </p>
                </div>
            `
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Approval notification sent:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Failed to send approval notification:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Verify transporter connection
     */
    async verifyConnection() {
        try {
            await this.transporter.verify();
            console.log('Email service is ready');
            return true;
        } catch (error) {
            console.error('Email service verification failed:', error);
            return false;
        }
    }
}

export const emailService = new EmailService();
