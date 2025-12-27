import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
    connectionString: process.env.DATABASE_CONNECTION_STRING,
    ssl: {
        rejectUnauthorized: false
    }
});

// Helper for single query
export const query = (text, params) => pool.query(text, params);
