# 🏢 Procurement Bidding Platform

企業級採購投標平台，專注於安全性、角色權限控制和可審計性。

> 🐳 **快速部署**: 使用 Docker 一鍵部署！請參考 [DOCKER.md](DOCKER.md)  
> 📖 **快速開始**: 5 分鐘部署指南請參考 [QUICKSTART.md](QUICKSTART.md)  
> 🌐 **英文版本 (English Version)**: 請參考 [README.md](README.md)


## ✨ 主要功能

### 🔐 角色權限管理
- **Admin（管理員）**: 使用者管理、經營項目管理、系統設定
- **Operator（採購人員）**: 建立專案、邀請供應商、管理投標、開標
- **Supplier（供應商）**: 查看邀請、提交報價、管理經營項目
- **Auditor（稽核人員）**: 執行開標作業、生成開標報告

### � 核心功能
- ✅ **專案管理**: 建立採購專案、設定截止時間、上傳附件
- ✅ **供應商篩選**: 依經營項目、公司名稱搜尋供應商
- ✅ **投標系統**: 即時倒數計時、密封投標、附件上傳
- ✅ **開標機制**: 可選擇由 Operator 或 Auditor 執行開標
- ✅ **郵件通知**: 註冊驗證、帳號審核、投標邀請自動通知
- ✅ **PDF 報告**: 自動生成開標記錄 PDF
- ✅ **經營項目**: 供應商可維護經營項目，方便篩選

### 🎨 UI/UX 特色
- 🌓 深色/淺色模式切換
- 📱 響應式設計
- 🎯 現代化 SaaS 風格介面
- ⚡ 即時資料更新

---

## 🛠 技術棧

### 前端
- **React 18** - UI 框架
- **Vite** - 建置工具
- **Tailwind CSS** - 樣式框架
- **Ant Design** - UI 組件庫
- **Radix UI** - 無障礙組件
- **Recharts** - 圖表庫
- **jsPDF** - PDF 生成

### 後端
- **Node.js** - 執行環境
- **Express** - Web 框架
- **PostgreSQL** - 資料庫
- **Nodemailer** - 郵件服務

---

## � 系統需求

- **Node.js**: v18.0.0 或更高版本
- **npm**: v9.0.0 或更高版本
- **PostgreSQL**: v14.0 或更高版本

---

## � 本地部署指南

### 步驟 1: 克隆專案

```bash
git clone https://github.com/elliot75/Procurement-Platform2.git
cd Procurement-Platform2
```

### 步驟 2: 安裝依賴

```bash
npm install --legacy-peer-deps
```

> 💡 使用 `--legacy-peer-deps` 是因為 React 19 與某些套件的相容性調整

### 步驟 3: 設定資料庫

#### 3.1 建立 PostgreSQL 資料庫

```bash
# 登入 PostgreSQL
psql -U postgres

# 建立資料庫
CREATE DATABASE procurement_db;

# 建立使用者（選用）
CREATE USER procurement_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE procurement_db TO procurement_user;

# 退出
\q
```

#### 3.2 執行資料庫 Schema

```bash
# 方法 1: 使用 psql 命令
psql -U postgres -d procurement_db -f database/schema.sql

# 方法 2: 或使用 Node.js 腳本
npm run db:setup
```

**資料庫 Schema 包含**:
- ✅ `users` - 使用者資料表
- ✅ `business_categories` - 經營項目表
- ✅ `user_business_categories` - 使用者經營項目關聯表
- ✅ `projects` - 專案表
- ✅ `project_invites` - 專案邀請表
- ✅ `bids` - 投標表
- ✅ 預設 8 個經營項目
- ✅ 預設管理員帳號

### 步驟 4: 設定環境變數

複製 `.env.example` 並重新命名為 `.env`：

```bash
cp .env.example .env
```

編輯 `.env` 檔案，設定以下變數：

```env
# 前端 API 位址
VITE_API_BASE_URL=http://localhost:3000

# 資料庫連線字串
DATABASE_CONNECTION_STRING=postgresql://username:password@localhost:5432/procurement_db

# JWT 密鑰（請更改為隨機字串）
JWT_SECRET=your_super_secret_jwt_key_change_this

# 應用程式網址（用於郵件連結）
APP_URL=http://localhost:5173

# SMTP 郵件設定
SMTP_HOST=mail.example.com
SMTP_PORT=25
SMTP_USER=noreply@example.com
SMTP_PASS=your_smtp_password
SMTP_FROM=noreply@example.com
```

### 步驟 5: 啟動應用程式

開啟兩個終端視窗：

**終端 1 - 啟動後端伺服器**:
```bash
npm run start:server
```

**終端 2 - 啟動前端開發伺服器**:
```bash
npm run dev
```

### 步驟 6: 訪問應用程式

開啟瀏覽器訪問：
- **前端**: [http://localhost:5173](http://localhost:5173)
- **後端 API**: [http://localhost:3000](http://localhost:3000)

---

## 👤 預設帳號

### 管理員帳號
- **Email**: `upvn.po@upvn.com.vn`
- **Username**: `upvn`
- **Password**: `(set DEFAULT_ADMIN_PASSWORD)`
- **角色**: Admin

> ⚠️ **安全提醒**: 首次登入後請立即修改密碼！

---

## � 使用指南

### 新使用者註冊流程

1. **註冊帳號**
   - 訪問註冊頁面
   - 填寫姓名/公司名、Email、密碼
   - 供應商可選擇經營項目
   - 提交註冊

2. **Email 驗證**
   - 檢查信箱收到驗證郵件
   - 點擊驗證連結
   - 系統自動通知管理員

3. **等待審核**
   - 管理員收到通知
   - 管理員設定使用者角色
   - 使用者收到審核通過郵件

4. **登入系統**
   - 使用 Email 和密碼登入
   - 根據角色查看對應功能

### Operator 工作流程

1. **建立專案**
   - 進入 "Project Management"
   - 點擊 "Create Project"
   - 填寫專案資訊（標題、說明、截止時間、貨幣）
   - 使用篩選功能選擇供應商
   - 選擇開標方式（自己或 Auditor）
   - 提交專案

2. **管理專案**
   - 查看專案列表和統計
   - 對 Active 專案添加供應商
   - 查看投標狀態

3. **開標作業**
   - 等待專案截止
   - 進入 "My Opening Hall"（如果自己開標）
   - 點擊 "Open Bid" 執行開標
   - 下載 PDF 報告

### Supplier 工作流程

1. **維護經營項目**
   - 點擊頭像 → 帳號管理
   - 切換到「經營項目」Tab
   - 選擇公司的經營項目
   - 更新

2. **查看邀請**
   - 收到投標邀請郵件
   - 登入系統
   - 進入 "Bidding Invites"
   - 查看專案詳情

3. **提交報價**
   - 點擊 "Place Bid"
   - 輸入報價金額
   - 上傳附件（選用）
   - 提交

### Auditor 工作流程

1. **查看待開標專案**
   - 進入 "Opening Hall"
   - 查看需要 Auditor 開標的專案

2. **執行開標**
   - 等待專案截止
   - 點擊 "Open Bid"
   - 系統生成 PDF 報告
   - 下載報告

### Admin 工作流程

1. **使用者管理**
   - 進入 "User Management"
   - 審核新註冊使用者
   - 設定角色（Operator/Supplier/Auditor）
   - 系統自動發送審核通過郵件

2. **經營項目管理**
   - 進入 "Business Categories"
   - 新增/編輯/刪除經營項目
   - 供應商可在註冊或個人設定中選擇

---

## 🗂 專案結構

```
Procurement-Platform2/
├── database/
│   └── schema.sql              # 資料庫 Schema
├── scripts/
│   ├── db-setup.js             # 資料庫初始化腳本
│   ├── add_email_verification.js
│   ├── add_requires_auditor_column.js
│   └── setup_business_categories.js
├── server/
│   ├── index.js                # Express 伺服器入口
│   ├── routes.js               # API 路由
│   ├── db.js                   # 資料庫連線
│   └── services/
│       └── emailService.js     # 郵件服務
├── src/
│   ├── components/
│   │   ├── ui/                 # UI 組件（Button, Card, etc.）
│   │   ├── AppSidebar.jsx      # 側邊欄
│   │   ├── TopBar.jsx          # 頂部導航
│   │   ├── ChangePasswordModal.jsx
│   │   └── ProfileManagementModal.jsx
│   ├── context/
│   │   └── MockDataContext.jsx # 資料管理 Context
│   ├── layouts/
│   │   └── MainLayout.jsx      # 主要版面
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── Dashboard.jsx       # 角色路由
│   │   ├── OperatorDashboard.jsx
│   │   ├── OperatorOpeningHall.jsx
│   │   ├── SupplierDashboard.jsx
│   │   ├── AuditorDashboard.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── UserManagement.jsx
│   │   └── BusinessCategoryManagement.jsx
│   ├── utils/
│   │   ├── generateOpeningRecord.js  # PDF 生成
│   │   └── fileUtils.js
│   ├── App.jsx                 # 路由設定
│   ├── index.css               # 全域樣式
│   └── main.jsx                # React 入口
├── .env.example                # 環境變數範本
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

---

## 🔧 開發指令

```bash
# 安裝依賴
npm install --legacy-peer-deps

# 啟動前端開發伺服器
npm run dev

# 啟動後端伺服器
npm run start:server

# 建置生產版本
npm run build

# 預覽生產建置
npm run preview

# 資料庫初始化
npm run db:setup
```

---

## 🌐 API 端點

### 認證
- `POST /api/auth/register` - 使用者註冊
- `POST /api/auth/login` - 使用者登入
- `GET /api/verify-email?token=xxx` - Email 驗證

### 使用者
- `GET /api/users` - 取得所有使用者
- `PUT /api/users/:username` - 更新使用者
- `DELETE /api/users/:username` - 刪除使用者

### 經營項目
- `GET /api/business-categories` - 取得所有經營項目
- `POST /api/business-categories` - 新增經營項目
- `PUT /api/business-categories/:id` - 更新經營項目
- `DELETE /api/business-categories/:id` - 刪除經營項目

### 專案
- `GET /api/projects` - 取得所有專案
- `POST /api/projects` - 建立專案
- `POST /api/projects/:id/invite` - 邀請供應商
- `POST /api/projects/:id/bid` - 提交投標
- `POST /api/projects/:id/status` - 更新專案狀態

---

## 📧 郵件通知

系統會在以下情況自動發送郵件：

1. **註冊驗證** - 使用者註冊後收到 Email 驗證連結
2. **管理員通知** - 使用者完成驗證後通知管理員審核
3. **審核通過** - 管理員核准後通知使用者
4. **投標邀請** - Operator 邀請供應商時自動發送

### 設定 SMTP

編輯 `.env` 檔案：

```env
SMTP_HOST=mail.example.com
SMTP_PORT=25
SMTP_USER=noreply@example.com
SMTP_PASS=your_password
SMTP_FROM=noreply@example.com
```

---

## 🔒 安全性建議

### 生產環境部署

1. **更改預設密碼**
   - 立即修改 Admin 預設密碼
   - 使用強密碼策略

2. **環境變數**
   - 不要將 `.env` 提交到版本控制
   - 使用強隨機字串作為 `JWT_SECRET`
   - 定期更換密鑰

3. **資料庫安全**
   - 使用強密碼
   - 限制資料庫訪問 IP
   - 定期備份

4. **HTTPS**
   - 生產環境必須使用 HTTPS
   - 設定 SSL 憑證

5. **密碼加密**
   - 目前使用明文密碼（僅供開發）
   - 生產環境應使用 bcrypt 加密

---

## 🐛 常見問題

### Q: 無法連線到資料庫？
**A**: 檢查 `.env` 中的 `DATABASE_CONNECTION_STRING` 是否正確，確認 PostgreSQL 服務已啟動。

### Q: 郵件無法發送？
**A**: 檢查 SMTP 設定是否正確，確認防火牆允許 SMTP 連線。

### Q: 前端無法連線到後端？
**A**: 確認後端伺服器已啟動（`npm run start:server`），檢查 `VITE_API_BASE_URL` 設定。

### Q: 註冊後無法登入？
**A**: 需要完成 Email 驗證並等待管理員審核通過。

### Q: 如何重置資料庫？
**A**: 
```bash
# 刪除所有資料表
psql -U postgres -d procurement_db -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# 重新執行 schema
psql -U postgres -d procurement_db -f database/schema.sql
```

---

## 📝 更新日誌

### v2.0.0 (2026-01-23)
- ✨ 新增經營項目管理功能
- ✨ 供應商篩選功能（依經營項目、名稱搜尋）
- ✨ 開標權限選擇（Operator 或 Auditor）
- ✨ 郵件通知系統（註冊、審核、邀請）
- ✨ 個人帳號管理頁面
- 🎨 UI/UX 全面改版為 SaaS 風格
- 🐛 修復表單驗證問題
- 📚 完整的部署文件

### v1.0.0
- 🎉 初始版本發布
- ✅ 基礎角色權限系統
- ✅ 專案管理功能
- ✅ 投標系統
- ✅ PDF 報告生成

---

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

---

## 🔒 授權

MIT / Apache 2.0

---

## 📞 聯絡方式

如有問題或建議，請聯絡：
- Email: upvn.po@upvn.com.vn
- GitHub Issues: [提交問題](https://github.com/your-username/Procurement-Platform2/issues)

---

**Built with ❤️ by UPVN Team**
