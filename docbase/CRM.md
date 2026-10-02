# 交叉參考矩陣 (Cross-Reference Matrix)

本矩陣將每個需求與使用者故事對應至實作模組（前端精靈步驟、後端 action）及相關文件。

## 1. 需求 → 實作模組 → 文件對應表

| 需求 ID | 需求描述 | 使用者故事 | 前端步驟 | 後端 Action | 前端模組 | 後端模組 | 相關文件 |
|---|---|---|---|---|---|---|---|
| FR-01 | 設定 GAS Web App URL | US-01 | 步驟一 | 無 | `validateStep0()`, `getGasUrl()` | 無 | SRS.md, PRD.md §3.1, QuickStart.md |
| FR-02 | 列出試算表 | US-02 | 步驟二 | `listSpreadsheets` | `loadSpreadsheets()` | `handleListSpreadsheets()` | SRS.md, PRD.md §3.2, API.md §1 |
| FR-03 | 列出工作表 | US-03 | 步驟三 | `listSheets` | `loadSheets()` | `handleListSheets()` | SRS.md, PRD.md §3.3, API.md §2 |
| FR-04 | 取得欄位標題 | US-04 | 步驟四 | `getHeaders` | `loadHeaders()`, `renderFields()` | `handleGetHeaders()` | SRS.md, PRD.md §3.4, API.md §3, Schema.md §1 |
| FR-05 | 設定表單欄位 | US-04 | 步驟四 | 無（前端設定） | `createFieldCard()`, `toggleOptionsEditor()`, `validateStep3()` | 無 | SRS.md, PRD.md §3.4, Schema.md §2 |
| FR-06 | 列出資料夾 | US-05 | 步驟五 | `listFolders` | `loadFolders()` | `handleListFolders()` | SRS.md, PRD.md §3.5, API.md §4 |
| FR-07 | 建立 Google 表單 | US-06 | 步驟六 | `createForm` | `createForm()` | `handleCreateForm()` | SRS.md, PRD.md §3.6, API.md §5, Schema.md §2 |
| FR-08 | 顯示結果與複製連結 | US-06 | 步驟六 | 無（前端顯示） | 結果區域、複製按鈕事件 | 無 | SRS.md, PRD.md §3.6 |
| FR-09 | 重新開始 | US-07 | 步驟六 | 無 | `restartBtn` 事件 | 無 | SRS.md, UserStories.md US-07 |

## 2. 非功能性需求 → 實作對應表

| NFR ID | 需求 | 實作位置 | 相關文件 |
|---|---|---|---|
| NFR-01 | 繁體中文 | 前端所有 UI 字串、後端錯誤訊息、所有文件 | SRS.md, AGENTS.md |
| NFR-02 | 純 Vanilla JS | `codebase/gh/app.js`（IIFE 封裝，無外部引用） | SRS.md, Architecture.md §4 |
| NFR-03 | 前端無敏感資訊 | 前端不包含 API 金鑰；所有 API 呼叫經由 GAS | SRS.md, ADR.md ADR-01, Architecture.md §2 |
| NFR-04 | 回應式設計 | `codebase/gh/style.css`（`@media` 斷點 768px / 1024px） | SRS.md |
| NFR-05 | 無障礙 | `style.css`（`focus-visible`、`prefers-reduced-motion`） | SRS.md |
| NFR-06 | 錯誤處理 | `callGas()` 區分 `TypeError`（網路錯誤）與業務錯誤 | SRS.md, Architecture.md §6 |
| NFR-07 | 資料暫存 | `localStorage` 鍵名 `gasWebAppUrl` | SRS.md, PRD.md §3.1 |
| NFR-08 | API 一致性 | 所有回應為 `{ ok, data?, error? }` | SRS.md, API.md, Architecture.md §6 |
| NFR-09 | 部署 | 前端 → GitHub Pages；後端 → clasp | SRS.md, QuickStart.md |

## 3. GAS Action → 前端呼叫 → 處理函式對應表

| GAS Action | 前端呼叫位置 | 後端處理函式 | 前端驗證函式 |
|---|---|---|---|
| `listSpreadsheets` | `loadSpreadsheets()` (app.js L244) | `handleListSpreadsheets()` (Code.gs) | `validateStep1()` |
| `listSheets` | `loadSheets()` (app.js L286) | `handleListSheets()` (Code.gs) | `validateStep2()` |
| `getHeaders` | `loadHeaders()` (app.js L328) | `handleGetHeaders()` (Code.gs) | `validateStep3()` |
| `listFolders` | `loadFolders()` (app.js L499) | `handleListFolders()` (Code.gs) | `validateStep4()` |
| `createForm` | `createForm()` (app.js L561) | `handleCreateForm()` (Code.gs) | `validateStep4()` |

## 4. 文件交叉參考表

| 文件 | 涵蓋主題 | 相關文件 |
|---|---|---|
| ProjectCharter.md | 專案目標、範圍、利害關係人、成功標準 | PRD.md, SRS.md, RTM.md |
| PRD.md | 產品需求、精靈流程、表單類型 | SRS.md, UserStories.md, Architecture.md |
| SRS.md | 功能性/非功能性需求、限制、外部介面 | PRD.md, ADR.md, API.md |
| UserStories.md | 使用者故事與驗收條件 | PRD.md, SRS.md, RTM.md |
| ADR.md | 架構決策記錄（3 項） | Architecture.md, SRS.md |
| Architecture.md | 系統架構、資料流程、Mermaid 圖表 | ADR.md, API.md, Schema.md |
| API.md | GAS action 端點文件 | SRS.md, Schema.md |
| Schema.md | 資料結構、問題類型對照表 | API.md, ERD.md |
| ERD.md | 實體關係圖 | Schema.md, Architecture.md |
| QuickStart.md | 部署指南 | AGENTS.md, Architecture.md |
| CRM.md | 交叉參考矩陣（本文件） | RTM.md, 所有文件 |
| RTM.md | 需求追溯矩陣 | CRM.md, SRS.md, UserStories.md |
