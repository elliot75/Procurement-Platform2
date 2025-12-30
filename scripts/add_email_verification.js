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

async function addEmailVerification() {
    const client = await pool.connect();
    try {
        console.log('Starting email verification migration...');

        // 1. Add columns to users table
        console.log('Adding columns to users table...');

        await client.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS email VARCHAR(255),
            ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS verification_token TEXT,
            ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP;
        `);

        // 2. Update existing users with legacy emails
        console.log('Updating existing users...');

        const existingUsers = await client.query(
            'SELECT id, username FROM users WHERE email IS NULL'
        );

        for (const user of existingUsers.rows) {
            let email;

            // Special handling for admin
            if (user.username === 'upvn') {
                email = 'upvn.po@upvn.com.vn';
            } else {
                // Generate legacy email for existing users
                email = `${user.username}@legacy.local`;
            }

            await client.query(
                `UPDATE users 
                 SET email = $1, email_verified = TRUE 
                 WHERE id = $2`,
                [email, user.id]
            );

            console.log(`Updated user ${user.username} with email: ${email}`);
        }

        // 3. Make email column required and unique
        console.log('Adding constraints...');

        await client.query(`
            ALTER TABLE users 
            ALTER COLUMN email SET NOT NULL;
        `);

        await client.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique 
            ON users(email);
        `);

        console.log('✅ Migration completed successfully!');
        console.log('Admin email is now: upvn.po@upvn.com.vn');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

addEmailVerification();
