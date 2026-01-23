# 🚀 快速部署指南

## 5 分鐘快速啟動

### 1️⃣ 安裝依賴 (1 分鐘)
```bash
npm install --legacy-peer-deps
```

### 2️⃣ 設定資料庫 (2 分鐘)

**建立資料庫**:
```bash
psql -U postgres
CREATE DATABASE procurement_db;
\q
```

**執行 Schema**:
```bash
psql -U postgres -d procurement_db -f database/schema.sql
```

### 3️⃣ 設定環境變數 (1 分鐘)

```bash
cp .env.example .env
```

編輯 `.env`，最少需要設定：
```env
DATABASE_CONNECTION_STRING=postgresql://postgres:your_password@localhost:5432/procurement_db
```

### 4️⃣ 啟動系統 (1 分鐘)

**終端 1 - 後端**:
```bash
npm run start:server
```

**終端 2 - 前端**:
```bash
npm run dev
```

### 5️⃣ 訪問系統

開啟瀏覽器: http://localhost:5173

**預設管理員帳號**:
- Email: `upvn.po@upvn.com.vn`
- Password: `pwd4upvn`

---

## ✅ 檢查清單

- [ ] Node.js v18+ 已安裝
- [ ] PostgreSQL 已安裝並啟動
- [ ] 資料庫已建立
- [ ] Schema 已執行
- [ ] .env 已設定
- [ ] 後端伺服器已啟動 (port 3000)
- [ ] 前端伺服器已啟動 (port 5173)
- [ ] 可以訪問 http://localhost:5173
- [ ] 可以使用預設帳號登入

---

## 🆘 遇到問題？

### 資料庫連線失敗
```bash
# 檢查 PostgreSQL 是否啟動
sudo service postgresql status

# 或 (macOS)
brew services list
```

### Port 已被佔用
```bash
# 查看 port 3000 使用情況
lsof -i :3000

# 查看 port 5173 使用情況
lsof -i :5173

# 終止佔用的程序
kill -9 <PID>
```

### 依賴安裝失敗
```bash
# 清除快取重新安裝
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

---

## 📚 下一步

1. ✅ 登入系統
2. ✅ 修改預設密碼
3. ✅ 建立測試使用者
4. ✅ 建立測試專案
5. ✅ 測試投標流程
6. ✅ 測試開標功能

詳細使用說明請參考 [README.md](README.md)
