import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_CONNECTION_STRING,
    ssl: { rejectUnauthorized: false }
});

const checkTimestamps = async () => {
    const client = await pool.connect();
    try {
        const res = await client.query("SELECT id, title, end_time, created_at FROM projects WHERE title = 'Closing Time Test' ORDER BY id DESC LIMIT 1");
        console.log("--- DB Raw Values ---");
        console.log(res.rows[0]);
        console.log("End Time Constructor:", new Date(res.rows[0].end_time).toISOString());
    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        pool.end();
    }
};

checkTimestamps();
