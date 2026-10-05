# 架構決策記錄 (Architecture Decision Records)

## ADR-01：靜態前端 + GAS Web App 分離

### 狀態

已接受 (Accepted)

### 背景

本專案需要與 Google Sheets、Google Forms 及 Google Drive 等 Google API 互動。若將 API 呼叫直接放在前端，則需要在前端程式碼中嵌入 API 金鑰或 OAuth 憑證，這會導致嚴重的安全風險——任何存取網頁的使用者都能取得這些憑證。

### 決策

將系統分為兩部分：

1. **靜態前端**（GitHub Pages）：純 HTML/CSS/JS，不包含任何 Google API 憑證，僅負責使用者介面與使用者輸入收集。
2. **GAS Web App 後端**：負責所有 Google API 呼叫（SpreadsheetApp、FormApp、DriveApp），以部署者的身份執行。

前端透過 `fetch()` POST 將請求發送至 GAS Web App URL，後端處理後回傳 JSON。

### 理由

- **安全性**：前端不暴露任何 API 金鑰或 OAuth 憑證。所有敏感操作皆在 GAS 後端完成，以 `USER_DEPLOYING` 身份執行。
- **部署簡單**：前端為靜態檔案，可直接部署至 GitHub Pages，無需伺服器。
- **權限控制**：GAS 專案的 OAuth 範圍可在 `appsscript.json` 中明確定義，僅授予必要權限（`spreadsheets`、`forms`、`drive`、`script.external_request`）。
- **成本**：GAS 與 GitHub Pages 均為免費服務，無額外基礎設施成本。

### 後果

- 前端與後端為獨立部署，需分別更新。
- 前端需知道 GAS Web App URL，此 URL 由使用者在步驟一輸入。
- GAS 的 `ANYONE_ANONYMOUS` 存取設定（CORS 所需）搭配 API token 驗證，未攜帶正確 token 的請求會被拒絕。

---

## ADR-02：以 action 為基礎的路由 (doGet / doPost)

### 狀態

已接受 (Accepted)

### 背景

GAS Web App 僅提供 `doGet(e)` 與 `doPost(e)` 兩個進入點。若為每個 API 操作建立獨立的 Web App 部署，將導致管理複雜且 URL 難以維護。

### 決策

使用單一 GAS Web App 端點，透過請求中的 `action` 欄位進行路由：

- **GET 請求**：從 `e.parameter.action` 讀取 action 名稱。
- **POST 請求**：從 JSON body 的 `action` 欄位讀取 action 名稱。

`routeAction(action, params)` 函式使用 `switch` 將 action 對應至對應的處理函式：

| action | 處理函式 |
|---|---|
| `listSpreadsheets` | `handleListSpreadsheets()` |
| `listSheets` | `handleListSheets()` |
| `getHeaders` | `handleGetHeaders()` |
| `listFolders` | `handleListFolders()` |
| `createForm` | `handleCreateForm()` |

### 理由

- **簡單性**：單一端點，單一部署，前端只需記住一個 URL。
- **一致性**：所有回應格式統一為 `{ ok: boolean, data?: any, error?: string }`。
- **可擴展性**：新增功能只需在 `ACTIONS` 常數與 `switch` 中新增一個 case。
- **明確的錯誤處理**：未知的 action 會回傳 `{ ok: false, error: '未知的動作：' + action }`。

### 後果

- 所有 API 呼叫共用同一個 URL，無法在網路層針對不同操作設定不同的存取控制。
- `action` 欄位為字串，缺乏編譯時期型別檢查，需靠文件與測試確保一致性。

---

## ADR-03：試算表即設定 (Sheet-as-Config)

### 狀態

已接受 (Accepted)

### 背景

本專案的核心需求是從 Google 試算表建立 Google 表單。需要一種方式讓非技術使用者能定義表單的欄位結構，而不需要撰寫 JSON 或其他設定檔。

### 決策

以 Google 試算表工作表的第一列作為欄位標題（field titles），每個欄位對應一個表單問題：

- **第一列（Row 1）**：欄位標題，每個儲存格的值即為表單問題的預設標題。
- **每個欄位（Column）**：對應一個表單問題項目。
- 使用者在精靈步驟四中可為每個欄位設定問題類型、修改標題、設定必填與選項。

### 理由

- **非技術使用者友善**：使用者只需在試算表中輸入標題列即可定義表單結構，無需學習 JSON 或其他設定格式。
- **降低使用門檻**：Google 試算表是大多數使用者已熟悉工具。
- **視覺化**：試算表的欄位排列直觀反映表單的問題順序。
- **彈性**：使用者可在精靈中修改問題標題、類型與選項，試算表僅作為初始設定來源。

### 後果

- 試算表第一列必須包含有意義的標題，空白標題會在驗證時被攔截。
- 欄位順序由試算表欄位順序決定，使用者無法在精靈中重新排序（但可修改標題）。
- `getHeaders` action 回傳 `[{ index: number, title: string }]`，`index` 為欄位在試算表中的位置。
