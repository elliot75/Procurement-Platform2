# 🐳 Docker 部署指南

使用 Docker 和 Docker Compose 快速部署 Procurement Bidding Platform。

## 📋 前置需求

- **Docker**: v20.10 或更高版本
- **Docker Compose**: v2.0 或更高版本

### 安裝 Docker

#### macOS
```bash
# 使用 Homebrew
brew install --cask docker

# 或下載 Docker Desktop
# https://www.docker.com/products/docker-desktop
```

#### Ubuntu/Debian
```bash
# 更新套件索引
sudo apt-get update

# 安裝必要套件
sudo apt-get install ca-certificates curl gnupg lsb-release

# 添加 Docker 官方 GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# 設定 repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安裝 Docker Engine
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 啟動 Docker
sudo systemctl start docker
sudo systemctl enable docker

# 將使用者加入 docker 群組（避免每次都要 sudo）
sudo usermod -aG docker $USER
newgrp docker
```

#### CentOS/RHEL
```bash
# 安裝必要套件
sudo yum install -y yum-utils

# 添加 Docker repository
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# 安裝 Docker
sudo yum install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 啟動 Docker
sudo systemctl start docker
sudo systemctl enable docker

# 將使用者加入 docker 群組
sudo usermod -aG docker $USER
newgrp docker
```

#### Windows
```powershell
# 下載並安裝 Docker Desktop
# https://www.docker.com/products/docker-desktop

# 或使用 Chocolatey
choco install docker-desktop
```

### 驗證安裝

```bash
# 檢查 Docker 版本
docker --version

# 檢查 Docker Compose 版本
docker compose version

# 測試 Docker 是否正常運作
docker run hello-world
```

---

## 🚀 快速開始

### 1. 克隆專案

```bash
git clone https://github.com/elliot75/Procurement-Platform2.git
cd Procurement-Platform2
```

### 2. 設定環境變數

```bash
# 複製環境變數範本
cp .env.docker .env

# 編輯環境變數（重要！）
nano .env
```

**必須修改的變數**:
```env
# 資料庫密碼（請使用強密碼）
DB_PASSWORD=your_strong_password_here

# JWT 密鑰（請使用長隨機字串）
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters

# 應用程式網址
APP_URL=http://localhost:3000
```

### 3. 啟動服務

```bash
# 啟動所有服務（背景執行）
docker compose up -d

# 查看啟動日誌
docker compose logs -f
```

### 4. 等待服務啟動

```bash
# 檢查服務狀態
docker compose ps

# 等待 health check 通過
# 當看到 "healthy" 狀態時即可使用
```

### 5. 訪問應用程式

開啟瀏覽器訪問: **http://localhost:3000**

**預設管理員帳號**:
- Email: `upvn.po@upvn.com.vn`
- Password: `(set DEFAULT_ADMIN_PASSWORD)`

---

## 📦 Docker Compose 服務說明

### 服務架構

```
┌─────────────────┐
│   Application   │  Port 3000
│   (Node.js)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   PostgreSQL    │  Port 5432
│   Database      │
└─────────────────┘
```

### 服務列表

1. **postgres** - PostgreSQL 15 資料庫
   - Port: 5432
   - Volume: `postgres_data`
   - 自動執行 schema.sql 初始化

2. **app** - Node.js 應用程式
   - Port: 3000
   - 包含前端和後端
   - 依賴 postgres 服務

3. **nginx** (選用) - Nginx 反向代理
   - Port: 80, 443
   - 需要使用 `--profile with-nginx` 啟動

---

## 🛠 常用指令

### 服務管理

```bash
# 啟動所有服務
docker compose up -d

# 停止所有服務
docker compose down

# 重啟服務
docker compose restart

# 停止並刪除所有容器、網路（保留資料）
docker compose down

# 停止並刪除所有容器、網路、資料卷（⚠️ 會刪除資料庫）
docker compose down -v
```

### 查看日誌

```bash
# 查看所有服務日誌
docker compose logs

# 即時查看日誌
docker compose logs -f

# 查看特定服務日誌
docker compose logs app
docker compose logs postgres

# 查看最近 100 行日誌
docker compose logs --tail=100
```

### 進入容器

```bash
# 進入應用程式容器
docker compose exec app sh

# 進入資料庫容器
docker compose exec postgres psql -U procurement_user -d procurement_db

# 以 root 身份進入容器
docker compose exec -u root app sh
```

### 資料庫管理

```bash
# 備份資料庫
docker compose exec postgres pg_dump -U procurement_user procurement_db > backup.sql

# 還原資料庫
docker compose exec -T postgres psql -U procurement_user -d procurement_db < backup.sql

# 查看資料庫資料表
docker compose exec postgres psql -U procurement_user -d procurement_db -c "\dt"

# 執行 SQL 查詢
docker compose exec postgres psql -U procurement_user -d procurement_db -c "SELECT * FROM users;"
```

### 重建服務

```bash
# 重建應用程式映像檔
docker compose build app

# 重建並重啟
docker compose up -d --build

# 強制重建（不使用快取）
docker compose build --no-cache app
```

---

## 🔧 進階配置

### 使用 Nginx 反向代理

```bash
# 創建 nginx 配置目錄
mkdir -p nginx

# 創建 nginx.conf
# （參考下方配置範例）

# 啟動包含 nginx 的服務
docker compose --profile with-nginx up -d
```

**nginx.conf 範例**:
```nginx
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3000;
    }

    server {
        listen 80;
        server_name localhost;

        location / {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

### 自訂 Port

編輯 `docker-compose.yml`:
```yaml
services:
  app:
    ports:
      - "8080:3000"  # 改為 8080
```

### 資料持久化

資料會自動儲存在 Docker Volume 中：
```bash
# 查看 volumes
docker volume ls

# 查看 volume 詳細資訊
docker volume inspect procurement-platform2_postgres_data

# 備份 volume
docker run --rm -v procurement-platform2_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-backup.tar.gz /data
```

---

## 🔍 故障排除

### 服務無法啟動

```bash
# 查看詳細錯誤訊息
docker compose logs app
docker compose logs postgres

# 檢查容器狀態
docker compose ps

# 重新啟動
docker compose restart
```

### 資料庫連線失敗

```bash
# 檢查 postgres 是否健康
docker compose ps postgres

# 查看 postgres 日誌
docker compose logs postgres

# 測試連線
docker compose exec app node -e "require('./server/db.js').query('SELECT 1')"
```

### Port 衝突

```bash
# 檢查 port 使用情況
lsof -i :3000
lsof -i :5432

# 修改 docker-compose.yml 中的 port 映射
```

### 清除並重新開始

```bash
# 停止所有服務
docker compose down

# 刪除所有資料（⚠️ 注意：會刪除資料庫）
docker compose down -v

# 刪除映像檔
docker rmi procurement-platform2-app

# 重新建置並啟動
docker compose up -d --build
```

---

## 📊 監控與維護

### 查看資源使用

```bash
# 查看容器資源使用情況
docker stats

# 查看特定容器
docker stats procurement-app procurement-db
```

### 定期備份

建議設定 cron job 定期備份：

```bash
# 編輯 crontab
crontab -e

# 每天凌晨 2 點備份
0 2 * * * cd /path/to/Procurement-Platform2 && docker compose exec -T postgres pg_dump -U procurement_user procurement_db > backups/backup-$(date +\%Y\%m\%d).sql
```

### 更新應用程式

```bash
# 拉取最新程式碼
git pull

# 重建並重啟
docker compose up -d --build

# 查看日誌確認更新成功
docker compose logs -f app
```

---

## 🔒 生產環境建議

### 安全性

1. **修改預設密碼**
   ```bash
   # 修改 .env 中的密碼
   DB_PASSWORD=use_strong_random_password
   JWT_SECRET=use_long_random_string
   ```

2. **使用 HTTPS**
   - 設定 SSL 憑證
   - 使用 nginx 反向代理
   - 啟用 HTTPS

3. **限制 Port 暴露**
   ```yaml
   # 不要暴露資料庫 port 到外部
   postgres:
     # ports:
     #   - "5432:5432"  # 註解掉
   ```

4. **使用 Docker Secrets**
   ```yaml
   services:
     app:
       secrets:
         - db_password
         - jwt_secret
   
   secrets:
     db_password:
       file: ./secrets/db_password.txt
     jwt_secret:
       file: ./secrets/jwt_secret.txt
   ```

### 效能優化

1. **資源限制**
   ```yaml
   services:
     app:
       deploy:
         resources:
           limits:
             cpus: '2'
             memory: 2G
           reservations:
             cpus: '1'
             memory: 1G
   ```

2. **使用 Production Build**
   - Dockerfile 已設定為 production mode
   - 使用 multi-stage build 減少映像檔大小

---

## 📝 檢查清單

部署前檢查：

- [ ] Docker 和 Docker Compose 已安裝
- [ ] `.env` 檔案已設定
- [ ] 資料庫密碼已修改
- [ ] JWT 密鑰已修改
- [ ] Port 3000 和 5432 未被佔用
- [ ] 有足夠的磁碟空間（至少 2GB）

部署後檢查：

- [ ] 所有容器狀態為 "healthy"
- [ ] 可以訪問 http://localhost:3000
- [ ] 可以使用預設帳號登入
- [ ] 資料庫連線正常
- [ ] 郵件服務設定正確（如需要）

---

## 🆘 需要幫助？

- 查看日誌: `docker compose logs -f`
- 檢查狀態: `docker compose ps`
- 重啟服務: `docker compose restart`
- 完整重置: `docker compose down -v && docker compose up -d --build`

更多資訊請參考 [README.md](README.md)
