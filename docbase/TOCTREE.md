# 文件索引 (TOCTREE)

本專案所有文件均以繁體中文撰寫，技術術語與程式識別字保留英文。

## 文件清單

| 檔案 | 說明 |
|---|---|
| [ProjectCharter.md](ProjectCharter.md) | 專案章程 — 涵蓋目標、範圍、利害關係人與成功標準。 |
| [PRD.md](PRD.md) | 產品需求文件 — 描述精靈流程、表單類型、資料夾選擇與表單建立。 |
| [SRS.md](SRS.md) | 軟體需求規格書 — 涵蓋功能性與非功能性需求、限制條件與外部介面。 |
| [UserStories.md](UserStories.md) | 使用者故事 — 每個精靈步驟皆附驗收條件。 |
| [ADR.md](ADR.md) | 架構決策記錄 — 靜態前端 + GAS 分離、action 路由、試算表即設定。 |
| [Architecture.md](Architecture.md) | 架構說明 — GitHub Pages → GAS → Google Sheets/Forms/Drive 流程與 Mermaid 圖表。 |
| [API.md](API.md) | API 文件 — 記錄所有 GAS action 的請求與回應格式。 |
| [Schema.md](Schema.md) | 資料結構說明 — 來源試算表標題慣例與 createForm 欄位 payload 結構。 |
| [ERD.md](ERD.md) | 實體關係圖 — Spreadsheet、Worksheet、Header/Field、Form、FormItem、DriveFolder 之間的關係。 |
| [QuickStart.md](QuickStart.md) | 快速入門 — 本機預覽、clasp 設定、Web App 部署與 GitHub Pages 設定。 |
| [CRM.md](CRM.md) | 交叉參考矩陣 — 需求、使用者故事與實作模組及文件的對應關係。 |
| [RTM.md](RTM.md) | 需求追溯矩陣 — 需求 ID 對應使用者故事、設計文件、程式模組與測試驗證點。 |

## 專案結構

```
.
├── AGENTS.md          # 專案規範
├── CHANGELOG.md       # 版本變更記錄
├── codebase/
│   ├── gh/            # 前端 (GitHub Pages)
│   │   ├── index.html
│   │   ├── app.js
│   │   └── style.css
│   └── gas/           # 後端 (Google Apps Script)
│       ├── Code.gs
│       └── appsscript.json
└── docbase/           # 專案文件（本目錄）
```
