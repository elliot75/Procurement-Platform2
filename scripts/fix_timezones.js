import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_CONNECTION_STRING,
    ssl: { rejectUnauthorized: false }
});

const migrateTimezones = async () => {
    const client = await pool.connect();
    try {
        console.log("Migrating 'end_time' to TIMESTAMPTZ...");

        // Alter projects table
        await client.query("ALTER TABLE projects ALTER COLUMN end_time TYPE TIMESTAMP WITH TIME ZONE");
        await client.query("ALTER TABLE projects ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE");
        await client.query("ALTER TABLE projects ALTER COLUMN opened_at TYPE TIMESTAMP WITH TIME ZONE");

        // Alter users table
        await client.query("ALTER TABLE users ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE");

        // Alter bids table
        await client.query("ALTER TABLE bids ALTER COLUMN submitted_at TYPE TIMESTAMP WITH TIME ZONE");

        console.log("Migration complete.");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        client.release();
        pool.end();
    }
};

migrateTimezones();
