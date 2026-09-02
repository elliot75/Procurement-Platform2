import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

function buildSslConfig() {
    if (process.env.DATABASE_SSL === 'disable') {
        return false;
    }
    // Default to verifying certificates. Set DB_SSL_REJECT_UNAUTHORIZED=false only if required.
    return {
        rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
    };
}

export const pool = new Pool({
    connectionString: process.env.DATABASE_CONNECTION_STRING,
    ssl: buildSslConfig()
});

// Helper for single query
export const query = (text, params) => pool.query(text, params);
