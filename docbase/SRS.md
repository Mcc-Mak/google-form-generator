# 軟體需求規格書 (Software Requirements Specification)

## 1. 簡介

本文件定義「Google 表單建立精靈」的軟體需求規格，涵蓋功能性需求、非功能性需求、限制條件與外部介面。

## 2. 功能性需求

### FR-01：設定 GAS Web App URL

| 項目 | 內容 |
|---|---|
| 需求 ID | FR-01 |
| 描述 | 使用者可輸入 GAS Web App 的部署網址，並將其暫存至瀏覽器。 |
| 輸入 | GAS Web App URL（有效網址格式） |
| 驗證 | URL 不可為空；必須通過 `new URL()` 驗證 |
| 暫存 | 以 `localStorage` 鍵名 `gasWebAppUrl` 儲存 |
| 前端模組 | `validateStep0()`、`getGasUrl()` |
| 後端模組 | 無 |

### FR-02：列出試算表

| 項目 | 內容 |
|---|---|
| 需求 ID | FR-02 |
| 描述 | 系統列出使用者 Google Drive 中的所有試算表檔案。 |
| GAS Action | `listSpreadsheets` |
| 後端實作 | `DriveApp.searchFiles('mimeType = "application/vnd.google-apps.spreadsheet"')` |
| 回傳資料 | `[{ id: string, name: string }]` |
| 前端模組 | `loadSpreadsheets()` |

### FR-03：列出工作表

| 項目 | 內容 |
|---|---|
| 需求 ID | FR-03 |
| 描述 | 系統列出所選試算表中的所有工作表分頁名稱。 |
| GAS Action | `listSheets` |
| 請求參數 | `spreadsheetId: string` |
| 後端實作 | `SpreadsheetApp.openById(spreadsheetId).getSheets()` |
| 回傳資料 | `string[]`（工作表名稱陣列） |
| 前端模組 | `loadSheets(spreadsheetId)` |

### FR-04：取得欄位標題

| 項目 | 內容 |
|---|---|
| 需求 ID | FR-04 |
| 描述 | 系統讀取所選工作表第一列的所有欄位標題。 |
| GAS Action | `getHeaders` |
| 請求參數 | `spreadsheetId: string`, `sheetName: string` |
| 後端實作 | `sheet.getRange(1, 1, 1, maxColumns).getValues()[0]` |
| 回傳資料 | `[{ index: number, title: string }]` |
| 前端模組 | `loadHeaders(spreadsheetId, sheetName)`、`renderFields()` |

### FR-05：設定表單欄位

| 項目 | 內容 |
|---|---|
| 需求 ID | FR-05 |
| 描述 | 使用者可為每個欄位設定問題類型、問題標題、是否必填及選項內容。 |
| 支援類型 | 簡答、段落、單選、核取方塊、下拉式清單、線性刻度、日期、時間（共 8 種） |
| 選項編輯 | 單選、核取方塊、下拉式清單需顯示選項編輯器 |
| 驗證 | 所有欄位的問題標題不可為空 |
| 前端模組 | `createFieldCard()`、`toggleOptionsEditor()`、`validateStep3()` |

### FR-06：列出資料夾

| 項目 | 內容 |
|---|---|
| 需求 ID | FR-06 |
| 描述 | 系統列出使用者 Google Drive 根目錄下的所有資料夾。 |
| GAS Action | `listFolders` |
| 後端實作 | `DriveApp.getFolders()` |
| 回傳資料 | `[{ id: string, name: string }]` |
| 前端模組 | `loadFolders()` |

### FR-07：建立 Google 表單

| 項目 | 內容 |
|---|---|
| 需求 ID | FR-07 |
| 描述 | 系統根據使用者設定的欄位建立 Google 表單，並移動至指定資料夾。 |
| GAS Action | `createForm` |
| 請求參數 | `title: string`, `description: string`, `folderId: string`, `fields: array` |
| 後端實作 | `FormApp.create(title)` → 新增各欄位項目 → `DriveApp.getFileById().moveTo()` |
| 回傳資料 | `{ formId: string, editUrl: string, publishedUrl: string }` |
| 前端模組 | `createForm()` |

### FR-08：顯示結果與複製連結

| 項目 | 內容 |
|---|---|
| 需求 ID | FR-08 |
| 描述 | 表單建立成功後顯示編輯連結與發布連結，並提供複製功能。 |
| 前端模組 | 結果區域顯示、複製按鈕事件 (`document.execCommand('copy')`) |

### FR-09：重新開始

| 項目 | 內容 |
|---|---|
| 需求 ID | FR-09 |
| 描述 | 使用者可重置所有狀態並回到步驟一。 |
| 前端模組 | `restartBtn` 事件處理 |

## 3. 非功能性需求

| 編號 | 類別 | 需求 |
|---|---|---|
| NFR-01 | 語言 | 所有介面文字與文件皆使用繁體中文 (zh-Hant)。 |
| NFR-02 | 技術限制 | 前端使用純 Vanilla JS，不使用任何框架、CDN 或外部資源。 |
| NFR-03 | 安全性 | 前端不包含任何 API 金鑰或 OAuth 憑證；所有 Google API 呼叫皆經由 GAS 後端。 |
| NFR-04 | 回應式設計 | 介面支援手機（>= 375px）與桌面瀏覽器。 |
| NFR-05 | 無障礙 | 支援鍵盤導覽（`focus-visible`）與 `prefers-reduced-motion`。 |
| NFR-06 | 錯誤處理 | 所有錯誤以繁體中文顯示；區分網路錯誤（`TypeError`）與業務錯誤。 |
| NFR-07 | 資料暫存 | GAS URL 暫存於 `localStorage`，鍵名為 `gasWebAppUrl`。 |
| NFR-08 | API 一致性 | GAS 回應格式統一為 `{ ok: boolean, data?: any, error?: string }`。 |
| NFR-09 | 部署 | 前端部署至 GitHub Pages；後端透過 clasp 部署至 Google Apps Script。 |

## 4. 限制條件

| 編號 | 限制 | 說明 |
|---|---|---|
| C-01 | Vanilla JS | 前端不得使用任何 JavaScript 框架或建置工具。 |
| C-02 | 無 CDN | 前端不得引用任何 CDN 資源（CSS、JS、字型等）。 |
| C-03 | 繁體中文 | 所有介面文字、錯誤訊息、文件內容均須使用繁體中文。 |
| C-04 | GAS 存取設定 | GAS Web App 須設定為 `ANYONE_ANONYMOUS` 存取，以 `USER_DEPLOYING` 身份執行。 |
| C-05 | OAuth 範圍 | GAS 須授予 `spreadsheets`、`forms`、`drive`、`script.external_request` 權限。 |
| C-06 | 試算表標題慣例 | 工作表第一列為欄位標題列，每個欄位對應一個表單問題。 |

## 5. 外部介面

### 5.1 GitHub Pages（前端）

| 項目 | 內容 |
|---|---|
| 技術 | 靜態 HTML + CSS + Vanilla JS |
| 檔案 | `index.html`、`app.js`、`style.css` |
| 部署位置 | GitHub Pages（`gh-pages` 分支或 `/docs` 目錄） |
| 通訊方式 | 透過 `fetch()` POST 至 GAS Web App URL |

### 5.2 Google Apps Script（後端）

| 項目 | 內容 |
|---|---|
| 技術 | Google Apps Script (V8 runtime) |
| 檔案 | `Code.gs`、`appsscript.json` |
| 端點 | `doGet(e)` / `doPost(e)` |
| 路由方式 | 依 `action` 參數路由至對應處理函式 |
| 回應格式 | JSON，`{ ok: boolean, data?: any, error?: string }` |

### 5.3 Google Sheets

| 項目 | 內容 |
|---|---|
| 服務 | `SpreadsheetApp` |
| 用途 | 讀取試算表工作表名稱與第一列欄位標題 |
| 權限 | `https://www.googleapis.com/auth/spreadsheets` |

### 5.4 Google Forms

| 項目 | 內容 |
|---|---|
| 服務 | `FormApp` |
| 用途 | 建立 Google 表單、新增問題項目、取得編輯與發布連結 |
| 權限 | `https://www.googleapis.com/auth/forms` |

### 5.5 Google Drive

| 項目 | 內容 |
|---|---|
| 服務 | `DriveApp` |
| 用途 | 搜尋試算表檔案、列出資料夾、移動表單至指定資料夾 |
| 權限 | `https://www.googleapis.com/auth/drive` |
