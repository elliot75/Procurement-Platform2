-- Procurement Bidding Platform Database Schema
-- PostgreSQL Database Setup Script

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    email VARCHAR(255) UNIQUE,
    role VARCHAR(20) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    verification_token_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token);

-- ============================================
-- 2. BUSINESS CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS business_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. USER BUSINESS CATEGORIES (Many-to-Many)
-- ============================================
CREATE TABLE IF NOT EXISTS user_business_categories (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES business_categories(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, category_id)
);

-- ============================================
-- 4. PROJECTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'Active',
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    currency VARCHAR(10) DEFAULT 'VND',
    attachment TEXT,
    opened_by INTEGER REFERENCES users(id),
    opened_at TIMESTAMP,
    requires_auditor_opening BOOLEAN DEFAULT FALSE
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
CREATE INDEX IF NOT EXISTS idx_projects_end_time ON projects(end_time);

-- ============================================
-- 5. PROJECT INVITES (Many-to-Many)
-- ============================================
CREATE TABLE IF NOT EXISTS project_invites (
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    supplier_id INTEGER REFERENCES users(id),
    PRIMARY KEY (project_id, supplier_id)
);

-- ============================================
-- 6. BIDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bids (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    supplier_id INTEGER REFERENCES users(id),
    amount DECIMAL(15, 2) NOT NULL,
    attachments TEXT[],
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for bid queries
CREATE INDEX IF NOT EXISTS idx_bids_project_id ON bids(project_id);
CREATE INDEX IF NOT EXISTS idx_bids_supplier_id ON bids(supplier_id);

-- ============================================
-- 7. INSERT DEFAULT BUSINESS CATEGORIES
-- ============================================
INSERT INTO business_categories (name, description) VALUES
    ('建築工程', '建築、土木工程相關'),
    ('機電設備', '機械、電氣設備供應與安裝'),
    ('資訊科技', 'IT設備、軟體、系統整合'),
    ('辦公用品', '文具、辦公設備、耗材'),
    ('清潔服務', '清潔、環境維護服務'),
    ('保全服務', '保全、安全管理服務'),
    ('餐飲服務', '餐飲、團膳服務'),
    ('運輸物流', '運輸、倉儲、物流服務')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 8. CREATE DEFAULT ADMIN USER
-- ============================================
-- Password: pwd4upvn (plaintext for demo, use hashing in production)
INSERT INTO users (username, email, password, name, role, email_verified)
VALUES ('upvn', 'upvn.po@upvn.com.vn', 'pwd4upvn', 'Admin User', 'Admin', TRUE)
ON CONFLICT (username) DO NOTHING;

-- ============================================
-- 9. GRANT PERMISSIONS (Optional)
-- ============================================
-- If you need to grant permissions to a specific database user:
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_db_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_db_user;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify the setup:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
-- SELECT * FROM users;
-- SELECT * FROM business_categories;
