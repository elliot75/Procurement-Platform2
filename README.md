# 🏢 Procurement Bidding Platform

An enterprise-grade procurement bidding platform focused on security, role-based access control (RBAC), and auditability.

> 🐳 **Quick Deployment**: Deploy in one click using Docker! Refer to [DOCKER.md](DOCKER.md)  
> 📖 **Quick Start**: 5-minute deployment guide is available at [QUICKSTART.md](QUICKSTART.md)  
> 🌐 **Chinese Version**: Please refer to [README.zh-TW.md](README.zh-TW.md)

## ✨ Key Features

### 🔐 Role-Based Access Control (RBAC)
- **Admin**: User management, business category management, system configurations.
- **Operator (Procurement)**: Create projects, invite suppliers, manage bids, open bids.
- **Supplier**: View invitations, submit bids (quotes), manage business categories.
- **Auditor**: Execute bid opening operations, generate bid opening reports.

### 📦 Core Capabilities
- ✅ **Project Management**: Create procurement projects, set deadlines, upload attachments.
- ✅ **Supplier Filtering**: Search suppliers by business category or company name.
- ✅ **Bidding System**: Real-time countdown timer, sealed bidding, attachment uploads.
- ✅ **Opening Mechanism**: Supports either Operator-led or Auditor-led bid opening.
- ✅ **Email Notifications**: Automated registration verification, account approval, and bid invitation notifications.
- ✅ **PDF Reports**: Automatically generate bid opening record PDFs.
- ✅ **Business Categories**: Suppliers can maintain categories for easy filtering.

### 🎨 UI/UX Highlights
- 🌓 Light/Dark Mode toggle.
- 📱 Responsive design.
- 🎯 Modern SaaS-style dashboard interface.
- ⚡ Real-time data updates.

---

## 🛠 Tech Stack

### Frontend
- **React 18** - UI Library
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **Ant Design** - Component Library
- **Radix UI** - Accessible primitives
- **Recharts** - Data visualization
- **jsPDF** - PDF generation

### Backend
- **Node.js** - Runtime
- **Express** - Web Framework
- **PostgreSQL** - Database
- **Nodemailer** - Mailer Service

---

## 💻 Local Setup Guide

### Step 1: Clone the Repository
```bash
git clone https://github.com/elliot75/Procurement-Platform2.git
cd Procurement-Platform2
```

### Step 2: Install Dependencies
```bash
npm install --legacy-peer-deps
```
> 💡 `--legacy-peer-deps` is recommended due to compatibility adjustments with React 19.

### Step 3: Database Setup

#### 3.1 Create PostgreSQL Database
```bash
# Login to PostgreSQL
psql -U postgres

# Create Database
CREATE DATABASE procurement_db;

# Create User (Optional)
CREATE USER procurement_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE procurement_db TO procurement_user;

# Exit
\q
```

#### 3.2 Initialize Schema
```bash
# Method 1: Using psql CLI
psql -U postgres -d procurement_db -f database/schema.sql

# Method 2: Using npm script
npm run db:setup
```

### Step 4: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Edit `.env` and fill in the values:
```env
VITE_API_BASE_URL=http://localhost:3000
DATABASE_CONNECTION_STRING=postgresql://username:password@localhost:5432/procurement_db
JWT_SECRET=your_super_secret_jwt_key_change_this
APP_URL=http://localhost:5173

SMTP_HOST=mail.example.com
SMTP_PORT=25
SMTP_USER=noreply@example.com
SMTP_PASS=your_smtp_password
SMTP_FROM=noreply@example.com
```

### Step 5: Run the Application
Open two terminal windows:

**Terminal 1 - Backend Server**:
```bash
npm run start:server
```

**Terminal 2 - Frontend Development Server**:
```bash
npm run dev
```

---

## 👤 Default Accounts

### Administrator
- **Email**: `upvn.po@upvn.com.vn`
- **Username**: `upvn`
- **Password**: `pwd4upvn`
- **Role**: Admin

---

## 📝 License & Contact
- **License**: MIT / Apache 2.0
- **Contact**: upvn.po@upvn.com.vn
