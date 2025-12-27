import express from 'express';
import { query } from './db.js';

export const router = express.Router();

// --- Auth ---

router.post('/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        );

        // Fix: Schema only has username, let's stick to username for login or update query if email added.
        // Actually I checked the schema in setup script: 
        // CREATE TABLE IF NOT EXISTS users (... username VARCHAR(50) UNIQUE NOT NULL ... name ... role ...)
        // There is no email column in my setup script! 
        // Wait, MockDataContext has `loginMock` which checks `u.username === username || u.email === username`.
        // The setup script didn't add email. I should probably add it or just stick to username.
        // The user request didn't specify email field, and the "admin" creation didn't use it.
        // I will stick to username for now to be safe with the schema I created.

        const userResult = await query('SELECT * FROM users WHERE username = $1', [username]);
        const user = userResult.rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (user.role === 'Pending') {
            return res.status(403).json({ message: 'Pending Approval' });
        }

        // Simple plaintext password check as per user request flow/legacy mock.
        if (user.password !== password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Return user info (excluding password)
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.post('/auth/register', async (req, res) => {
    const { username, password, name, role, email } = req.body; // Accepting email but not storing it yet if column missing?
    // Let's add email to schema if I can? 
    // Actually, I'll just ignore email for now as it wasn't in my CREATE TABLE. 
    // Or I can ALTER table. 
    // For now, let's stick to what we have.

    try {
        const check = await query('SELECT * FROM users WHERE username = $1', [username]);
        if (check.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Force 'Pending' role for new registrations usually, but let's follow logic:
        // MockDataContext: const userWithRole = { ...newUser, role: 'Pending' };
        const assignedRole = 'Pending';

        const result = await query(
            'INSERT INTO users (username, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id, username, name, role',
            [username, password, name, assignedRole]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// --- Users ---

router.get('/users', async (req, res) => {
    try {
        const result = await query('SELECT id, username, name, role, created_at FROM users ORDER BY id');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/users/:username', async (req, res) => {
    const { username } = req.params;
    const updates = req.body;

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

    try {
        const result = await query(sql, values);
        res.json(result.rows[0]);
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
            p.createdby = p.created_by_name; // Map for frontend compatibility if needed

            // Get Bids
            const bidsRes = await query(
                `SELECT b.amount, b.submitted_at as "submittedAt", u.username as "supplierId" 
                 FROM bids b
                 JOIN users u ON b.supplier_id = u.id
                 WHERE b.project_id = $1`,
                [p.id]
            );

            // Format bids to match frontend expectation { supplierId, price, submittedAt }
            p.bids = bidsRes.rows.map(b => ({
                supplierId: b.supplierId,
                price: Number(b.amount),
                submittedAt: b.submittedAt
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
        // Handle invites? Ideally passed in body
        // if (p.invitedSuppliers) ... 

        res.json(newProject);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

// Actions

router.post('/projects/:id/bid', async (req, res) => {
    const { id } = req.params;
    const { supplier, amount } = req.body;
    try {
        const userRes = await query('SELECT id FROM users WHERE username = $1', [supplier]);
        if (userRes.rows.length === 0) return res.status(400).json({ message: 'Supplier not found' });
        const supplierId = userRes.rows[0].id;

        await query(
            'INSERT INTO bids (project_id, supplier_id, amount) VALUES ($1, $2, $3)',
            [id, supplierId, amount]
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

