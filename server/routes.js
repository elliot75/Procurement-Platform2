import express from 'express';
import { query } from './db.js';
import { emailService } from './services/emailService.js';
import crypto from 'crypto';

export const router = express.Router();

// --- Auth ---

router.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const userResult = await query('SELECT * FROM users WHERE email = $1', [email]);
        const user = userResult.rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Email 或密碼錯誤' });
        }

        // Check email verification
        if (!user.email_verified) {
            return res.status(403).json({
                message: 'Email 尚未驗證。請檢查您的信箱並完成驗證。',
                code: 'EMAIL_NOT_VERIFIED'
            });
        }

        if (user.role === 'Pending') {
            return res.status(403).json({ message: '帳號尚未經管理員審核' });
        }

        // Simple plaintext password check
        if (user.password !== password) {
            return res.status(401).json({ message: 'Email 或密碼錯誤' });
        }

        // Get user's business categories
        const categoriesRes = await query(
            `SELECT bc.id, bc.name 
             FROM business_categories bc
             JOIN user_business_categories ubc ON bc.id = ubc.category_id
             WHERE ubc.user_id = $1`,
            [user.id]
        );

        // Return user info (excluding password and tokens)
        const { password: _, verification_token: __, verification_token_expires: ___, ...userWithoutPassword } = user;
        res.json({
            ...userWithoutPassword,
            businessCategories: categoriesRes.rows.map(c => c.id)
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.post('/auth/register', async (req, res) => {
    const { email, password, name, businessCategories } = req.body;

    try {
        // 1. Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Email 格式不正確' });
        }

        // 2. Validate password strength
        if (password.length < 8) {
            return res.status(400).json({ message: '密碼至少需要 8 個字元' });
        }
        if (!/[A-Z]/.test(password)) {
            return res.status(400).json({ message: '密碼必須包含至少一個大寫英文字母' });
        }
        if (!/[a-z]/.test(password)) {
            return res.status(400).json({ message: '密碼必須包含至少一個小寫英文字母' });
        }
        if (!/[0-9]/.test(password)) {
            return res.status(400).json({ message: '密碼必須包含至少一個數字' });
        }

        // 3. Check if email already exists
        const check = await query('SELECT * FROM users WHERE email = $1', [email]);
        if (check.rows.length > 0) {
            return res.status(400).json({ message: '此 Email 已被註冊' });
        }

        // 4. Generate verification token
        const verificationToken = crypto.randomUUID();
        const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // 5. Create user with Pending role and unverified email
        const result = await query(
            `INSERT INTO users (username, email, password, name, role, email_verified, verification_token, verification_token_expires)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id, email, name, role`,
            [email, email, password, name, 'Pending', false, verificationToken, tokenExpires]
        );

        const newUser = result.rows[0];

        // 6. Add business categories if provided
        if (businessCategories && Array.isArray(businessCategories) && businessCategories.length > 0) {
            for (const categoryId of businessCategories) {
                await query(
                    'INSERT INTO user_business_categories (user_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                    [newUser.id, categoryId]
                );
            }
        }

        // 7. Send verification email
        try {
            await emailService.sendVerificationEmail(email, verificationToken);
        } catch (emailError) {
            console.error('Failed to send verification email:', emailError);
        }

        res.json({
            message: '註冊成功！驗證郵件已發送至您的信箱，請查收並完成驗證。',
            user: newUser
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Email verification endpoint
router.get('/verify-email', async (req, res) => {
    const { token } = req.query;

    try {
        const result = await query(
            'SELECT * FROM users WHERE verification_token = $1 AND verification_token_expires > NOW()',
            [token]
        );

        if (result.rows.length === 0) {
            return res.status(200).json({
                message: '驗證連結已使用或已過期。\\n您的帳號在完成驗證後尚需要管理員核准後才能登入，我們已通知管理員，請耐心等候。',
                success: false,
                code: 'TOKEN_USED_OR_EXPIRED'
            });
        }

        const user = result.rows[0];

        if (user.email_verified) {
            return res.json({
                message: 'Email 已經驗證過了！',
                success: true,
                code: 'ALREADY_VERIFIED'
            });
        }

        await query(
            `UPDATE users 
             SET email_verified = TRUE, verification_token = NULL, verification_token_expires = NULL
             WHERE id = $1`,
            [user.id]
        );

        try {
            await emailService.sendAdminNotification(user.name, user.email);
            console.log('Admin notified about new user:', user.email);
        } catch (emailError) {
            console.error('Failed to notify admin:', emailError);
        }

        res.json({
            message: 'Email 驗證成功！',
            success: true
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// --- Users ---

router.get('/users', async (req, res) => {
    try {
        const result = await query('SELECT id, username, name, role, email, created_at FROM users ORDER BY id');

        // Get business categories for each user
        for (const user of result.rows) {
            const categoriesRes = await query(
                `SELECT bc.id, bc.name 
                 FROM business_categories bc
                 JOIN user_business_categories ubc ON bc.id = ubc.category_id
                 WHERE ubc.user_id = $1`,
                [user.id]
            );
            user.businessCategories = categoriesRes.rows;
        }

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/users/:username', async (req, res) => {
    const { username } = req.params;
    const updates = req.body;

    try {
        const currentUserResult = await query('SELECT * FROM users WHERE username = $1', [username]);
        if (currentUserResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const currentUser = currentUserResult.rows[0];

        // Construct dynamic update query
        const fields = [];
        const values = [];
        let idx = 1;

        for (const [key, value] of Object.entries(updates)) {
            if (['name', 'role', 'password'].includes(key)) {
                fields.push(`${key} = $${idx}`);
                values.push(value);
                idx++;
            }
        }

        if (fields.length > 0) {
            values.push(username);
            const sql = `UPDATE users SET ${fields.join(', ')} WHERE username = $${idx} RETURNING *`;
            const result = await query(sql, values);
            var updatedUser = result.rows[0];
        } else {
            var updatedUser = currentUser;
        }

        // Update business categories if provided
        if (updates.businessCategories !== undefined) {
            // Delete existing categories
            await query('DELETE FROM user_business_categories WHERE user_id = $1', [updatedUser.id]);

            // Insert new categories
            if (Array.isArray(updates.businessCategories) && updates.businessCategories.length > 0) {
                for (const categoryId of updates.businessCategories) {
                    await query(
                        'INSERT INTO user_business_categories (user_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                        [updatedUser.id, categoryId]
                    );
                }
            }
        }

        // Check if role changed from Pending to an active role
        if (currentUser.role === 'Pending' && updates.role && updates.role !== 'Pending') {
            try {
                await emailService.sendApprovalNotification(
                    updatedUser.name,
                    updatedUser.email,
                    updatedUser.role
                );
                console.log('Approval email sent to:', updatedUser.email);
            } catch (emailError) {
                console.error('Failed to send approval email:', emailError);
            }
        }

        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/users/:username', async (req, res) => {
    try {
        await query('DELETE FROM users WHERE username = $1', [req.params.username]);
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- Business Categories ---

router.get('/business-categories', async (req, res) => {
    try {
        const result = await query('SELECT * FROM business_categories ORDER BY name');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/business-categories', async (req, res) => {
    const { name, description } = req.body;
    try {
        const result = await query(
            'INSERT INTO business_categories (name, description) VALUES ($1, $2) RETURNING *',
            [name, description]
        );
        res.json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') { // Unique violation
            res.status(400).json({ message: '此經營項目已存在' });
        } else {
            res.status(500).json({ message: err.message });
        }
    }
});

router.put('/business-categories/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    try {
        const result = await query(
            'UPDATE business_categories SET name = $1, description = $2 WHERE id = $3 RETURNING *',
            [name, description, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') {
            res.status(400).json({ message: '此經營項目名稱已存在' });
        } else {
            res.status(500).json({ message: err.message });
        }
    }
});

router.delete('/business-categories/:id', async (req, res) => {
    try {
        await query('DELETE FROM business_categories WHERE id = $1', [req.params.id]);
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- Projects ---

router.get('/projects', async (req, res) => {
    try {
        const projectsQuery = `
            SELECT p.*, u.username as created_by_name 
            FROM projects p 
            LEFT JOIN users u ON p.created_by = u.id
            ORDER BY p.created_at DESC
        `;

        await query(`
            UPDATE projects 
            SET status = 'Ended' 
            WHERE status = 'Active' AND end_time < NOW()
        `);

        const projectsRes = await query(projectsQuery);
        const projects = projectsRes.rows;

        for (const p of projects) {
            const invitesRes = await query(
                `SELECT u.username FROM project_invites pi 
                 JOIN users u ON pi.supplier_id = u.id 
                 WHERE pi.project_id = $1`,
                [p.id]
            );
            p.invitedSuppliers = invitesRes.rows.map(r => r.username);
            p.createdBy = p.created_by_name;

            const bidsRes = await query(
                `SELECT b.amount, b.submitted_at as "submittedAt", u.username as "supplierId", b.attachments 
                 FROM bids b
                 JOIN users u ON b.supplier_id = u.id
                 WHERE b.project_id = $1`,
                [p.id]
            );

            p.bids = bidsRes.rows.map(b => ({
                supplierId: b.supplierId,
                price: Number(b.amount),
                submittedAt: b.submittedAt,
                attachments: b.attachments || []
            }));

            p.createdAt = p.created_at;
            p.endTime = p.end_time;
        }

        res.json(projects);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

router.post('/projects', async (req, res) => {
    const p = req.body;
    try {
        // Get creator info
        const userRes = await query('SELECT id, name FROM users WHERE username = $1', [p.createdBy]);
        if (userRes.rows.length === 0) return res.status(400).json({ message: 'Invalid creator' });
        const creator = userRes.rows[0];

        const result = await query(
            `INSERT INTO projects (title, description, status, created_by, created_at, end_time, currency, attachment, requires_auditor_opening)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING id, title, description, status, created_at, end_time, currency, attachment, requires_auditor_opening`,
            [p.title, p.description, 'Active', creator.id, new Date(), p.endTime, p.currency || 'TWD', p.attachment, p.requiresAuditorOpening || false]
        );

        const newProject = result.rows[0];

        if (p.invitedSuppliers && Array.isArray(p.invitedSuppliers) && p.invitedSuppliers.length > 0) {
            for (const supplierUsername of p.invitedSuppliers) {
                const supRes = await query('SELECT id, name, email FROM users WHERE username = $1', [supplierUsername]);
                if (supRes.rows.length > 0) {
                    const supplier = supRes.rows[0];

                    // Insert invitation
                    await query(
                        'INSERT INTO project_invites (project_id, supplier_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                        [newProject.id, supplier.id]
                    );

                    // Send email notification
                    try {
                        await emailService.sendBiddingInvitation(
                            supplier.name,
                            supplier.email,
                            {
                                title: newProject.title,
                                description: newProject.description,
                                endTime: newProject.end_time,
                                currency: newProject.currency
                            },
                            creator.name
                        );
                        console.log(`Invitation email sent to ${supplier.email}`);
                    } catch (emailError) {
                        console.error(`Failed to send invitation email to ${supplier.email}:`, emailError);
                        // Don't fail the request if email fails
                    }
                }
            }
        }

        res.json(newProject);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

// Actions

router.post('/projects/:id/bid', async (req, res) => {
    const { id } = req.params;
    const { supplier, amount, attachments } = req.body;
    try {
        const userRes = await query('SELECT id FROM users WHERE username = $1', [supplier]);
        if (userRes.rows.length === 0) return res.status(400).json({ message: 'Supplier not found' });
        const supplierId = userRes.rows[0].id;

        await query(
            'INSERT INTO bids (project_id, supplier_id, amount, attachments) VALUES ($1, $2, $3, $4)',
            [id, supplierId, amount, attachments]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/projects/:id/invite', async (req, res) => {
    const { id } = req.params;
    const { supplier } = req.body;
    try {
        // Get supplier info
        const userRes = await query('SELECT id, name, email FROM users WHERE username = $1', [supplier]);
        if (userRes.rows.length === 0) return res.json({ message: 'Supplier not found' });
        const supplierInfo = userRes.rows[0];

        // Get project info
        const projectRes = await query(
            `SELECT p.*, u.name as creator_name 
             FROM projects p 
             JOIN users u ON p.created_by = u.id 
             WHERE p.id = $1`,
            [id]
        );

        if (projectRes.rows.length === 0) return res.status(404).json({ message: 'Project not found' });
        const project = projectRes.rows[0];

        // Insert invitation
        await query(
            'INSERT INTO project_invites (project_id, supplier_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [id, supplierInfo.id]
        );

        // Send email notification
        try {
            await emailService.sendBiddingInvitation(
                supplierInfo.name,
                supplierInfo.email,
                {
                    title: project.title,
                    description: project.description,
                    endTime: project.end_time,
                    currency: project.currency
                },
                project.creator_name
            );
            console.log(`Invitation email sent to ${supplierInfo.email}`);
        } catch (emailError) {
            console.error(`Failed to send invitation email to ${supplierInfo.email}:`, emailError);
            // Don't fail the request if email fails
        }

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/projects/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status, openedBy } = req.body;

    if (status === 'Opened' && openedBy) {
        const userRes = await query('SELECT id FROM users WHERE username = $1', [openedBy]);
        const auditorId = userRes.rows[0]?.id;
        if (auditorId) {
            await query('UPDATE projects SET status = $1, opened_by = $2, opened_at = NOW() WHERE id = $3', [status, auditorId, id]);
            return res.json({ success: true });
        }
    }

    await query('UPDATE projects SET status = $1 WHERE id = $2', [status, id]);
    res.json({ success: true });
});
