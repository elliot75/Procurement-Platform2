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

const setupBusinessCategories = async () => {
    const client = await pool.connect();
    try {
        console.log("Connected to database. Setting up business categories...");

        // 1. Create business_categories table
        await client.query(`
            CREATE TABLE IF NOT EXISTS business_categories (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) UNIQUE NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Created 'business_categories' table.");

        // 2. Create user_business_categories junction table
        await client.query(`
            CREATE TABLE IF NOT EXISTS user_business_categories (
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                category_id INTEGER REFERENCES business_categories(id) ON DELETE CASCADE,
                PRIMARY KEY (user_id, category_id)
            );
        `);
        console.log("Created 'user_business_categories' table.");

        // 3. Insert some default categories
        const defaultCategories = [
            { name: '建築工程', description: '建築、土木工程相關' },
            { name: '機電設備', description: '機械、電氣設備供應與安裝' },
            { name: '資訊科技', description: 'IT設備、軟體、系統整合' },
            { name: '辦公用品', description: '文具、辦公設備、耗材' },
            { name: '清潔服務', description: '清潔、環境維護服務' },
            { name: '保全服務', description: '保全、安全管理服務' },
            { name: '餐飲服務', description: '餐飲、團膳服務' },
            { name: '運輸物流', description: '運輸、倉儲、物流服務' },
        ];

        for (const category of defaultCategories) {
            await client.query(
                `INSERT INTO business_categories (name, description) 
                 VALUES ($1, $2) 
                 ON CONFLICT (name) DO NOTHING`,
                [category.name, category.description]
            );
        }
        console.log("Inserted default business categories.");

    } catch (err) {
        console.error("Error setting up business categories:", err);
    } finally {
        client.release();
        await pool.end();
    }
};

setupBusinessCategories();
