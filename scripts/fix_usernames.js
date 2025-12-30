import dotenv from 'dotenv';
import pkg from 'pg';
const { Pool } = pkg;

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function fixUsernames() {
    const client = await pool.connect();
    try {
        console.log('Fixing usernames to use full email...');

        // Update all users where username doesn't contain '@' (i.e., not a full email)
        const result = await client.query(`
            UPDATE users 
            SET username = email 
            WHERE username NOT LIKE '%@%' 
            RETURNING id, username, email;
        `);

        console.log(`✅ Updated ${result.rowCount} user(s):`);
        result.rows.forEach(row => {
            console.log(`  - User ID ${row.id}: username set to ${row.username}`);
        });

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

fixUsernames();
