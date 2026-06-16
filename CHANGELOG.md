# 更新日誌 (CHANGELOG)

此專案的所有顯著變更都將記錄在此檔案中。

## [2.0.0] - 2026-01-23

### 新增 (Added)
- **經營項目管理 (Business Category Management)**
  - 管理員（Admin）可全面新增、編輯與刪除經營項目（Business Categories）。
  - 供應商（Supplier）可在註冊流程或「帳號管理」中，靈活勾選公司經營之相關項目。
  - 採購人員（Operator）在建立採購專案時，可根據經營項目篩選並邀請相符的供應商。
- **靈活開標授權機制 (Flexible Bid Opening)**
  - 建立專案時，允許設定開標執行人為該專案的採購人員（Operator）或獨立的稽核人員（Auditor）。
- **郵件自動通知系統 (Automated Email Notification System)**
  - 使用者註冊時自動發送 Email 驗證連結。
  - 使用者完成驗證後，主動通知管理員進行帳號審核與角色分配。
  - 管理員核准後，自動通知使用者帳號啟用。
  - 採購專案建立並釋出後，自動對受邀供應商派送投標邀請郵件。
- **個人帳號管理面版 (Account Profile Dashboard)**
  - 提供個人資訊維護及密碼變更功能。
  - 供應商可在個人資料中即時更新經營項目。
- **SaaS 現代化 UI/UX 介面 (Modern SaaS UI/UX)**
  - 全新深色/淺色模式（Dark/Light Mode）切換。
  - 優化響應式佈局，並搭配流暢微動畫，提供現代化企業級系統體驗。

### 修復 (Fixed)
- 修正註冊與登入頁面表單在邊界條件下的驗證失敗問題。
- 修正 PDF 開標記錄報告在長文字折行時的排版問題。

### 變更 (Changed)
- 全面升級至 React 19 與 Vite 7 以提升前端建置與執行效能。
- 升級後端路由，Express 支援至版本 5.2.1。

---

## [1.0.0] - 2025-11-15

### 新增 (Added)
- **基礎角色權限系統 (RBAC)**
  - 包含四種核心角色：Admin（系統管理）、Operator（採購人員）、Supplier（供應商）、Auditor（稽核人員）。
- **採購專案生命週期管理 (Project Lifecycle Management)**
  - 支持專案建立、截止時間設定、密封投標（Sealed Bidding）、倒數計時與開標流程。
- **投標與報價機制 (Bidding Mechanism)**
  - 密封投標，投標截止前禁止解密與查看報價。
  - 供應商提交報價與上傳附件。
- **開標報告 (Bid Opening Report)**
  - 支援將開標結果、報價排名一鍵匯出為 PDF 報告（使用 `jspdf` 與 `jspdf-autotable`）。
