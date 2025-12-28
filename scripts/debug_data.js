import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_CONNECTION_STRING,
    ssl: { rejectUnauthorized: false }
});

const debugData = async () => {
    const client = await pool.connect();
    try {
        console.log("--- USERS ---");
        const users = await client.query('SELECT id, username, role, password FROM users');
        console.table(users.rows);

        console.log("\n--- PROJECTS ---");
        const projects = await client.query('SELECT id, title, created_by, status FROM projects');
        console.table(projects.rows);

        console.log("\n--- INVITES ---");
        const invites = await client.query('SELECT * FROM project_invites');
        console.table(invites.rows);

        console.log("\n--- JOIN CHECK ---");
        const joinCheck = await client.query(`
            SELECT p.title, u.username as supplier
            FROM project_invites pi
            JOIN projects p ON pi.project_id = p.id
            JOIN users u ON pi.supplier_id = u.id
        `);
        console.table(joinCheck.rows);

    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        pool.end();
    }
};

debugData();
