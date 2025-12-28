import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_CONNECTION_STRING,
    ssl: { rejectUnauthorized: false }
});

const addBidsAttachments = async () => {
    const client = await pool.connect();
    try {
        console.log("Adding 'attachments' column to 'bids' table...");

        // Add attachments column as TEXT array
        await client.query("ALTER TABLE bids ADD COLUMN IF NOT EXISTS attachments TEXT[]");

        console.log("Migration complete.");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        client.release();
        pool.end();
    }
};

addBidsAttachments();
