import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_CONNECTION_STRING,
    ssl: {
        rejectUnauthorized: false
    }
});

const setupDatabase = async () => {
    const client = await pool.connect();
    try {
        console.log("Connected to database. Starting setup...");

        // 1. Users Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                name VARCHAR(100),
                role VARCHAR(20) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Verified 'users' table.");

        // 2. Projects Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS projects (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                status VARCHAR(20) DEFAULT 'Active',
                created_by INTEGER REFERENCES users(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                end_time TIMESTAMP,
                currency VARCHAR(10) DEFAULT 'TWD',
                attachment TEXT,
                opened_by INTEGER REFERENCES users(id),
                opened_at TIMESTAMP
            );
        `);
        console.log("Verified 'projects' table.");

        // 3. Project Invites (Many-to-Many)
        await client.query(`
            CREATE TABLE IF NOT EXISTS project_invites (
                project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
                supplier_id INTEGER REFERENCES users(id),
                PRIMARY KEY (project_id, supplier_id)
            );
        `);
        console.log("Verified 'project_invites' table.");

        // 4. Bids
        await client.query(`
            CREATE TABLE IF NOT EXISTS bids (
                id SERIAL PRIMARY KEY,
                project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
                supplier_id INTEGER REFERENCES users(id),
                amount DECIMAL(15, 2) NOT NULL,
                submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Verified 'bids' table.");

        // Seed Admin User
        const adminUsername = 'upvn';
        const adminPassword = 'pwd4upvn';
        const adminRole = 'Admin';

        // Check if admin exists
        const res = await client.query('SELECT * FROM users WHERE username = $1', [adminUsername]);

        if (res.rows.length === 0) {
            await client.query(`
                INSERT INTO users (username, password, name, role)
                VALUES ($1, $2, $3, $4)
            `, [adminUsername, adminPassword, 'Admin User', adminRole]);
            console.log(`Created admin user: ${adminUsername}`);
        } else {
            console.log(`Admin user ${adminUsername} already exists.`);
        }

    } catch (err) {
        console.error("Error setting up database:", err);
    } finally {
        client.release();
        await pool.end();
    }
};

setupDatabase();
