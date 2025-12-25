/**
 * System Initialization Script (Mock Backend)
 * Usage: node init-system.js
 */

import dotenv from 'dotenv';
import bcrypt from 'bcryptjs'; // Using bcryptjs for easier install

dotenv.config();

async function initializeSystem() {
    console.log("Starting System Initialization...");

    // 1. Validate Critical Environment Variables
    const requiredEnvVars = ['DATABASE_CONNECTION_STRING', 'JWT_SECRET', 'API_BASE_URL'];
    const missingVars = requiredEnvVars.filter(key => !process.env[key]);

    if (missingVars.length > 0) {
        console.error(`FATAL: Missing environment variables: ${missingVars.join(', ')}`);
        // process.exit(1); // Commented out to allow demo to run without real env
    } else {
        console.log("Environment variables verified.");
    }

    try {
        // 2. Mock Database Check
        const adminUsername = 'administrator';
        console.log(`Checking for admin user '${adminUsername}'...`);

        // In a real DB, we would do: const existingAdmin = await User.findOne(...)
        const existingAdmin = false; // Simulating no admin

        if (!existingAdmin) {
            console.log(`Admin user '${adminUsername}' not found. Creating...`);

            // 3. Create Default Admin
            const defaultPassword = 'Admin@123';
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

            const adminUser = {
                username: adminUsername,
                passwordHash: hashedPassword,
                email: 'admin@system.local',
                role: 'Admin',
                status: 'Active',
                created_at: new Date()
            };

            console.log("SUCCESS: Default Administrator created in Mock DB.");
            console.log(adminUser);
            console.log(`Cleartext Password: ${defaultPassword}`);
        }

    } catch (error) {
        console.error("Initialization Failed:", error);
        process.exit(1);
    }
}

initializeSystem();
