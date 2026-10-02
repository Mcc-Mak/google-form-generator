# Changelog

本專案版本依 `major.minor.patch` 格式管理。

## 0.5.7

- **修正路徑計算錯誤**：`listSpreadsheets` / `listFolders` 的 `path` 欄位因 `buildFolderMap` 依賴 `searchFiles` 回傳所有資料夾，若部分資料夾未在結果中則路徑鏈斷裂，產生不完整或錯誤的路徑。改回以 `getParents()` 走訪實際 Drive 父層鏈（保證正確），同時加入 `_folderPathCache` 路徑快取，共用祖先的資料夾僅需 1 次 API 呼叫即可命中快取，兼顧正確性與效能。
- 移除 `buildFolderMap` / `resolveFolderPath`，新增 `getFolderPathCached` / `getFilePathCached`。

## 0.5.6

- **API 效能大幅優化**：
  - `listSpreadsheets` / `listFolders` 改用資料夾路徑快取（`buildFolderMap`），一次遍歷所有資料夾後路徑解析零 API 呼叫。舊方式逐檔走訪父層鏈，N 個檔案 × D 層深度 = O(N×D) 次 API 呼叫；新方式降為 O(N+M)（N 試算表 + M 資料夾，各僅 1 次 `getParents`）。
  - `createForm` 的兩次 is.gd 短網址請求改用 `UrlFetchApp.fetchAll` 並行送出，節省約一半等待時間。
  - 移除已不再使用的 `getFilePath`、`getFolderPath`、`shortenUrl` 函式。
  - `listFolders` 現在回傳所有層級資料夾（舊版僅回傳根目錄第一層）。

## 0.5.5

- **SonarCloud 問題修復**：修復 26 項 SonarCloud 開放議題，涵蓋前端 React 元件與 GitHub Actions 工作流程：
  - **S7781**：`String#replace()` → `String#replaceAll()`（StepResult.jsx HTML 跳脫）。
  - **S1874**：移除已棄用的 `document.write`，改用 `iframe.srcdoc`（StepResult.jsx PDF 匯出）。
  - **S7762**：`parentNode.removeChild(childNode)` → `childNode.remove()`（StepResult.jsx）。
  - **S6853**：`<label>` 未關聯控制項改為 `<span>`（StepResult.jsx、StepFields.jsx）。
  - **S2681**：`if` 陳述式補上大括號，修正條件執行瑕疵（App.jsx moveField）。
  - **S9383**：useEffect 中非同步呼叫加上 `.catch()` 處理（StepFields、StepFolder、StepSheets、StepSpreadsheets、StepResult）。
  - **S6479**：陣列索引作為 key 改為穩定唯一識別碼（StepIndicators 用 label、StepFields 用 uid）。
  - **S6819**：`<li role="button">` 改為 `<li><button>` 語意元素（StepIndicators.jsx）。
  - **S6772**：input 後文字以 `<span>` 包裹，消除模糊間距（StepFields.jsx）。
  - **S8233**：`permissions` 從 workflow 層級移至 job 層級（gh.yml、gas.yml）。
  - **S6505**：`npm ci` / `npm install` 加入 `--ignore-scripts`（gh.yml、gas.yml）。
  - **S8543**：`@google/clasp` 鎖定版本 `@3.4.1`（gas.yml）。
- **欄位唯一識別碼**：EMPTY_FIELD 新增 `uid` 欄位，addField 與 setFields 自動指派，作為 React key 使用。

## 0.5.4

- **PDF 邊距**：匯出 PDF body 新增 10px padding。
- **步驟一改版**：GAS Web App URL 已硬編碼，移除手動輸入欄位，改顯示後端服務設定資訊（服務名稱、部署網址、存取、存取權限、執行身分）及設定說明。
- **下拉選單加入路徑資訊**：listSpreadsheets 回傳新增 `path` 欄位（Drive 完整路徑），listFolders 回傳新增 `path` 欄位，listSheets 回傳改為物件陣列 `[{ name, index }]`。前端三個下拉選單的 `<option>` 皆加入 `title` 屬性，滑鼠停留可顯示完整路徑。
- **PDF 表單說明**：匯出 PDF 永遠包含「表單說明」欄位，即使使用者未輸入亦顯示「（無）」。

## 0.5.0

- **步驟六結果頁全面改版**：表單建立成功後顯示分角色摘要頁面，包含：
  - **一般使用者**：表單連結（完整網址）、表單連結（短網址）、QR Code（短網址）
  - **維護人員**：表單編輯連結（完整網址）、表單連結（完整網址）、表單連結（短網址）
  - **開發人員**：表單連結（短網址）、試算表連結（短網址）、表單 ID
- **SweetAlert2 載入彈窗**：點擊「建立表單」時顯示不可關閉的載入彈窗，建立完成後自動關閉。
- **PDF 匯出功能**：摘要頁面提供「匯出 PDF」按鈕，檔名格式為 `GoogleForm-PDF-${yyyymmddHHMMSS}.pdf`，使用 html2canvas + jsPDF 實作。
- **QR Code 產生**：使用 qrcode.react 產生短網址的 QR Code。
- **短網址支援**：GAS 後端新增 `shortenUrl` 函式，透過 is.gd 免費服務縮短 URL。`createForm` 回傳新增 `shortViewUrl`、`spreadsheetUrl`、`shortSpreadsheetUrl`。
- **createForm 新增 spreadsheetId 參數**：前端傳入來源試算表 ID，後端據此產生試算表連結。
- 新增前端相依套件：sweetalert2、qrcode.react、jspdf、html2canvas。
- 更新文件：API.md（createForm 回應欄位）、Schema.md（CreateFormResult 結構）。

## 0.4.1

- 修正 GAS CI：`clasp push` 後新增 `clasp deploy` 步驟，自動更新 Web App 部署版本，解決 push 程式碼但 `/exec` URL 仍指向舊版本的問題。

## 0.4.0

- **新增動態問題編輯器**：步驟四從固定欄位對應改為 Google Forms 風格的動態問題編輯器，支援新增、刪除、上移/下移排序及即時編輯問題類型、標題、必填與選項。
- **新增 `getQuestions` action**：GAS 後端新增 `getQuestions` 端點，從試算表匯入問題定義。支援兩種模式：
  - 模式一（問題定義表）：工作表含 `問題類型`/`問題標題`/`必填`/`選項` 四欄，逐列讀取完整問題定義。
  - 模式二（回退模式）：工作表無上述欄位時，將第一列各欄位視為問題標題，類型預設為「簡答」。
- **前端 API 新增 `getQuestions`**：`api.js` 新增 `getQuestions` 匯出函式。
- **新增 `SHEET_COLUMNS` 常數**：`constants.js` 新增工作表欄位名稱常數與 `EMPTY_FIELD` 預設問題物件。
- **步驟標籤更新**：步驟四由「設定欄位」改為「設定問題」，步驟三描述更新。
- **結果頁標籤更新**：「欄位數量」改為「問題數量」。
- **新增 CSS 樣式**：`btn-icon`、`field-row`、`field-actions`、`checkbox-inline`、`step-toolbar`、`import-info` 等新元件樣式。
- **更新文件**：`Schema.md` 新增問題匯入慣例與兩種模式說明；`API.md` 新增 `getQuestions` 端點文件。

## 0.3.5

- 修正 CORS 問題：前端 fetch 改用 `Content-Type: text/plain;charset=utf-8` 避免 preflight OPTIONS 請求，GAS Web App 不支援 OPTIONS 預檢。

## 0.3.4

- 更新 `QuickStart.md` 與 `ConfigSettings.md`：新增無瀏覽器環境的 `clasp login --no-localhost` 操作說明。

## 0.3.3

- 新增 `docbase/ConfigSettings.md`：完整設定參考，涵蓋 GAS 後端、前端、GitHub 儲存庫與 CI/CD pipeline 所有設定項。
- 更新 `TOCTREE.md`：新增 ConfigSettings.md 索引項目。
- 更新 `AGENTS.md`：必要文件清單新增 `ConfigSettings.md`。

## 0.3.2

- 簡化 GAS CI 部署的 clasp 認證：以單一 `CLASPRC_JSON` secret 取代 5 個個別 secrets（`CLASPRC_ACCESS_TOKEN` 等），解決空值導致 JSON 缺欄位的錯誤。
- 更新 `QuickStart.md`：新增「CI Secrets 設定」章節，說明 `GAS_SCRIPT_ID` 與 `CLASPRC_JSON` 的取得方式與新增步驟。

## 0.3.1

- 修正 CI 分支推進邏輯：改用 refspec push 取代本地 checkout/merge，解決跨 job 無法存取本地分支的問題。
- 修正推進順序為正確的逐級鏈式：`dev-001 → dev`，再 `dev → main`（而非 dev-001 同時推至 dev 與 main）。
- 明確設定 git remote URL 使用 GITHUB_TOKEN，解決 `github-actions[bot]` push 403 權限錯誤。
- 合併 `promote-dev` 與 `promote-main` 為單一 `promote` job，簡化流程。
- `gas.yml` 新增 `permissions: contents: write`。

## 0.3.0

- 前端從 Vanilla JS 遷移至 React + Vite：6 步驟精靈以元件化方式重構（`App.jsx` + 6 個步驟元件 + `api.js` + `constants.js`），保留原有 UI 風格與全部功能。
- 新增 CI pipeline：`.github/workflows/gh.yml`（建置 → 推進 dev-001→dev→main → 部署 GitHub Pages）、`.github/workflows/gas.yml`（推進分支 + `clasp push`）。
- 新增前端建置工具鏈：`package.json`、`vite.config.js`（`base: '/google-form-generator/'`）、`eslint.config.js`（flat config）、`.gitignore`。
- 更新 `AGENTS.md`：Stack 與 Layout 段落反映 React + Vite 及 CI pipeline。
- 更新文件：`QuickStart.md`（npm dev/build、CI 部署）、`Architecture.md`（React 元件架構）、`SRS.md`（技術限制與外部介面）。

## 0.2.0

- 新增前端精靈 UI（`codebase/gh/`）：6 步驟表單建立精靈，包含 GAS URL 輸入、試算表選擇、工作表選擇、欄位設定（8 種問題類型）、資料夾與表單資訊、結果顯示，純 Vanilla JS 實作，無外部相依。
- 新增 GAS 後端（`codebase/gas/`）：5 個 action 端點（`listSpreadsheets`、`listSheets`、`getHeaders`、`listFolders`、`createForm`），透過 `doGet` / `doPost` 路由，所有回應為 JSON 格式 `{ ok, data?, error? }`。
- 新增完整文件（`docbase/`）：12 份文件涵蓋專案章程、產品需求、軟體需求規格、使用者故事、架構決策記錄、架構說明、API 文件、資料結構、實體關係圖、快速入門、交叉參考矩陣、需求追溯矩陣，所有內容以繁體中文撰寫並使用 Mermaid 圖表。

## 0.1.0

- 新增 `AGENTS.md`：專案棧、目錄結構、文件規範、Git 流程與 GAS 部署說明。
- 更新 `README.md`：開頭加入 `docbase/TOCTREE.md` 文件索引連結。
