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

        // Return user info (excluding password and tokens  )
        const { password: _, verification_token: __, verification_token_expires: ___, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.post('/auth/register', async (req, res) => {
    const { email, password, name } = req.body;

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
        // Use full email as username to ensure uniqueness across domains
        const result = await query(
            `INSERT INTO users (username, email, password, name, role, email_verified, verification_token, verification_token_expires)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id, email, name, role`,
            [email, email, password, name, 'Pending', false, verificationToken, tokenExpires]
        );

        // 6. Send verification email
        try {
            await emailService.sendVerificationEmail(email, verificationToken);
        } catch (emailError) {
            console.error('Failed to send verification email:', emailError);
            // Don't fail registration if email fails
        }

        res.json({
            message: '註冊成功！驗證郵件已發送至您的信箱，請查收並完成驗證。',
            user: result.rows[0]
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
        // First, try to find user with valid token
        const result = await query(
            'SELECT * FROM users WHERE verification_token = $1 AND verification_token_expires > NOW()',
            [token]
        );

        if (result.rows.length === 0) {
            // Token not found or expired, check if this token was already used (user is verified)
            const verifiedCheck = await query(
                'SELECT * FROM users WHERE verification_token IS NULL AND email_verified = TRUE AND id IN (SELECT id FROM users WHERE id::text LIKE $1 OR email LIKE $1)',
                [`%${token.substring(0, 8)}%`]
            );

            // More reliable: just check if any user with this exact token pattern exists and is verified
            // Since we can't match old tokens, we'll accept this as "already verified"
            // Better approach: check by a more specific criteria

            // Actually, let's use a better strategy: 
            // When token is not found, it could mean:
            // 1. Invalid token (never existed)
            // 2. Already verified (token was cleared)
            // We can't distinguish between these without extra info
            // So, let's be lenient and return a different
            return res.status(200).json({
                message: '驗證連結已使用或已過期。\n您的帳號在完成驗證後尚需要管理員核准後才能登入，我們已通知管理員，請耐心等候。',
                success: false,
                code: 'TOKEN_USED_OR_EXPIRED'
            });
        }

        const user = result.rows[0];

        // Check if already verified (shouldn't happen but let's be safe)
        if (user.email_verified) {
            return res.json({
                message: 'Email 已經驗證過了！',
                success: true,
                code: 'ALREADY_VERIFIED'
            });
        }

        // Update user as verified
        await query(
            `UPDATE users 
             SET email_verified = TRUE, verification_token = NULL, verification_token_expires = NULL
             WHERE id = $1`,
            [user.id]
        );

        // Send notification to admin
        try {
            await emailService.sendAdminNotification(user.name, user.email);
            console.log('Admin notified about new user:', user.email);
        } catch (emailError) {
            console.error('Failed to notify admin:', emailError);
            // Don't fail verification if admin notification fails
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
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/users/:username', async (req, res) => {
    const { username } = req.params;
    const updates = req.body;

    try {
        // First, get the current user data to check if role is changing from Pending
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

        if (fields.length === 0) return res.json({ message: 'No updates' });

        values.push(username);
        const sql = `UPDATE users SET ${fields.join(', ')} WHERE username = $${idx} RETURNING *`;

        const result = await query(sql, values);
        const updatedUser = result.rows[0];

        // Check if role changed from Pending to an active role
        if (currentUser.role === 'Pending' && updates.role && updates.role !== 'Pending') {
            // Send approval notification email
            try {
                await emailService.sendApprovalNotification(
                    updatedUser.name,
                    updatedUser.email,
                    updatedUser.role
                );
                console.log('Approval email sent to:', updatedUser.email);
            } catch (emailError) {
                console.error('Failed to send approval email:', emailError);
                // Don't fail the update if email fails
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

// --- Projects ---

router.get('/projects', async (req, res) => {
    try {
        // Fetch projects with their bids and invited suppliers
        // This is complex in SQL.
        // Strategy: Fetch projects, then fetch related data, OR use JSON aggregation.

        const projectsQuery = `
            SELECT p.*, u.username as created_by_name 
            FROM projects p 
            LEFT JOIN users u ON p.created_by = u.id
            ORDER BY p.created_at DESC
        `;

        // Update status for expired active projects
        await query(`
            UPDATE projects 
            SET status = 'Ended' 
            WHERE status = 'Active' AND end_time < NOW()
        `);

        const projectsRes = await query(projectsQuery);
        const projects = projectsRes.rows;

        // Populate invitedSuppliers and bids for each project
        // Note: For production, use JOINs or more efficient queries.
        for (const p of projects) {
            // Get Invites
            const invitesRes = await query(
                `SELECT u.username FROM project_invites pi 
                 JOIN users u ON pi.supplier_id = u.id 
                 WHERE pi.project_id = $1`,
                [p.id]
            );
            p.invitedSuppliers = invitesRes.rows.map(r => r.username);
            p.createdBy = p.created_by_name; // Map for frontend compatibility if needed

            // Get Bids
            const bidsRes = await query(
                `SELECT b.amount, b.submitted_at as "submittedAt", u.username as "supplierId", b.attachments 
                 FROM bids b
                 JOIN users u ON b.supplier_id = u.id
                 WHERE b.project_id = $1`,
                [p.id]
            );

            // Format bids to match frontend expectation { supplierId, price, submittedAt }
            p.bids = bidsRes.rows.map(b => ({
                supplierId: b.supplierId,
                price: Number(b.amount),
                submittedAt: b.submittedAt,
                attachments: b.attachments || []
            }));

            // Format dates
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
        // Resolve createdBy username to ID
        const userRes = await query('SELECT id FROM users WHERE username = $1', [p.createdBy]);
        if (userRes.rows.length === 0) return res.status(400).json({ message: 'Invalid creator' });
        const userId = userRes.rows[0].id;

        const result = await query(
            `INSERT INTO projects (title, description, status, created_by, created_at, end_time, currency, attachment)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id, title, description, status, created_at, end_time, currency, attachment`,
            [p.title, p.description, 'Active', userId, new Date(), p.endTime, p.currency || 'TWD', p.attachment]
        );

        const newProject = result.rows[0];


        // Handle invites if provided
        if (p.invitedSuppliers && Array.isArray(p.invitedSuppliers) && p.invitedSuppliers.length > 0) {
            for (const supplierUsername of p.invitedSuppliers) {
                const supRes = await query('SELECT id FROM users WHERE username = $1', [supplierUsername]);
                if (supRes.rows.length > 0) {
                    await query(
                        'INSERT INTO project_invites (project_id, supplier_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                        [newProject.id, supRes.rows[0].id]
                    );
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
        const userRes = await query('SELECT id FROM users WHERE username = $1', [supplier]);
        if (userRes.rows.length === 0) return res.json({ message: 'Supplier not found' });
        const supplierId = userRes.rows[0].id;

        await query(
            'INSERT INTO project_invites (project_id, supplier_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [id, supplierId]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/projects/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status, openedBy } = req.body;

    // If opening, update opened info
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

