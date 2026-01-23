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

const addRequiresAuditorColumn = async () => {
    const client = await pool.connect();
    try {
        console.log("Connected to database. Adding requires_auditor_opening column...");

        // Add requires_auditor_opening column to projects table
        await client.query(`
            ALTER TABLE projects 
            ADD COLUMN IF NOT EXISTS requires_auditor_opening BOOLEAN DEFAULT FALSE;
        `);

        console.log("Column 'requires_auditor_opening' added successfully.");

        // Set all existing projects to require auditor opening (maintain current behavior)
        await client.query(`
            UPDATE projects 
            SET requires_auditor_opening = TRUE 
            WHERE requires_auditor_opening IS NULL;
        `);

        console.log("Existing projects updated to require auditor opening.");

    } catch (err) {
        console.error("Error adding column:", err);
    } finally {
        client.release();
        await pool.end();
    }
};

addRequiresAuditorColumn();
