# 貢獻指南 (CONTRIBUTING)

感謝您對「企業級採購投標平台」的關注！為維護程式碼品質與專案協作效率，請在提交任何修改前閱讀本指南。

## 🪵 分支命名規範 (Branch Naming)

請使用以下格式為您的 Git 分支命名：
- `feature/功能名稱`：新增功能（例如：`feature/mfa-auth`）
- `bugfix/修復說明`：修復 Bug（例如：`bugfix/pdf-wrap-issue`）
- `hotfix/緊急修復`：生產環境緊急修復
- `docs/文件說明`：純文件修改（例如：`docs/update-readme`）

## 💻 本地開發流程 (Local Workflow)

1. 克隆專案並切換至新分支：
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. 安裝依賴（由於 React 19 與部分套件相容性，必須加上關鍵參數）：
   ```bash
   npm install --legacy-peer-deps
   ```
3. 設定本地 `.env` 檔案，啟動前後端伺服器進行開發測試。
4. 提交程式碼前，確保通過靜態檢查：
   ```bash
   npm run lint
   ```

## 📝 提交日誌規範 (Commit Message Guidelines)

我們遵循類似 [Conventional Commits](https://www.conventionalcommits.org/) 的規範，請使用以下類型開頭：

- `feat`: 新增功能 (Feature)
- `fix`: 修復 Bug
- `docs`: 修改文件
- `style`: 程式碼格式化（不影響邏輯的空白、分號等變更）
- `refactor`: 重構（非新增功能也非修復 Bug 的代碼變更）
- `perf`: 提高效能的代碼變更
- `test`: 增加或修改測試案例
- `chore`: 建置流程或輔助工具的變動（如：升級套件）

**範例**：
```bash
feat: 新增供應商多選與經營項目篩選功能
fix: 修正開標 PDF 報表在特定瀏覽器下無法下載的問題
```

## 🚀 提交 Pull Request (PR Rules)

1. 確保您的 PR 描述中清晰說明了：
   - 此修改解決了什麼問題或新增了什麼功能。
   - 具體的修改範圍。
   - 您的本地測試與驗證結果。
2. 若有對資料庫 Schema 的修改，請確保同步更新 `database/schema.sql`，並在 `scripts/` 下提供相應的資料遷移腳本。
3. PR 需要至少一位專案維護人員（Maintainer）審查（Review）並通過後方可合併。
