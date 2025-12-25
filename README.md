# Procurement Bidding Platform

Enterprise-grade Procurement Bidding Platform designed with a focus on security, role-based access control, and auditability.

## 🚀 Features
- **Role-Based Access**: Specialized views for Admin, Operator, Auditor, and Suppliers.
- **Real-time Bidding**: Interactive countdown timers and sealed bid handling.
- **Security**: Environment variable protection, password hashing, and secure document handling.
- **Auditing**: Automated PDF generation for opening records.

## 🛠 Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/procurement-platform-2.git
   cd procurement-platform-2
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```
   > Note: We use `--legacy-peer-deps` due to React 19/Tailwind compatibility adjustments.

3. **Configure Environment**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_BASE_URL=http://localhost:3000
   ```

## 💻 Development

Start the development server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

- **Login Credentials (Mock)**: 
  - Username: `admin`
  - Password: `Admin@123`

## 🏗 Build & Deploy

### Manual Build
```bash
npm run build
```
The output will be in the `dist/` folder.

### Automated Deployment (GitHub Pages)
This project includes a GitHub Action workflow `.github/workflows/deploy.yml`.
1. Push code to `main` branch.
2. Go to GitHub Repo -> Settings -> Pages.
3. Select "GitHub Actions" as the source.
4. The workflow will automatically build and deploy.

## 🧪 Testing
Run the system initialization script to test backend logic:
```bash
node backend-mock/init-system.js
```

## 📂 Project Structure
```
├── src/
│   ├── hooks/            # Custom React Hooks (useCountDown)
│   ├── pages/            # Page Components (LoginPage)
│   ├── utils/            # Utilities (PDF Generation)
│   ├── App.jsx           # Main Router
│   └── index.css         # Tailwind directives
├── backend-mock/         # Simulation scripts
├── .github/workflows/    # CI/CD configurations
└── package.json          # Project metadata
```

## 📝 License
Proprietary / Internal Use Only
