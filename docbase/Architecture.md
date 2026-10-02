# 架構說明 (Architecture)

## 1. 系統概述

本系統採用「靜態前端 + GAS Web App 後端」的分離架構。前端部署於 GitHub Pages，為純靜態 HTML/CSS/Vanilla JS 檔案；後端為 Google Apps Script Web App，負責所有 Google API 操作。兩者透過 HTTP POST 以 JSON 格式通訊。

## 2. 為何前端委託 GAS 處理所有 Google API 呼叫

### 安全性考量

若將 Google API 呼叫直接放在前端，則必須在前端程式碼中嵌入 API 金鑰或 OAuth 憑證。由於前端程式碼會被瀏覽器完整下載，任何使用者都能檢視原始碼並取得憑證，造成嚴重的安全風險。

透過 GAS 後端代理所有 Google API 呼叫，可達成以下安全目標：

1. **前端無敏感資訊**：前端程式碼中不含任何 API 金鑰、OAuth client secret 或憑證。
2. **權限最小化**：GAS 專案僅授予必要的 OAuth 範圍（`spreadsheets`、`forms`、`drive`、`script.external_request`），定義於 `appsscript.json`。
3. **以部署者身份執行**：GAS Web App 設定為 `executeAs: USER_DEPLOYING`，API 操作使用部署者的權限，而非終端使用者的權限。
4. **集中控管**：所有 Google API 呼叫集中於 `Code.gs`，便於審查與權限管理。

### 架構分離的優勢

| 面向 | 前端 (GitHub Pages) | 後端 (GAS) |
|---|---|---|
| 職責 | 使用者介面、輸入驗證、狀態管理 | Google API 操作、業務邏輯、錯誤處理 |
| 技術 | HTML/CSS/Vanilla JS | Google Apps Script (V8) |
| 部署 | `git push` → GitHub Pages | `clasp push` → GAS |
| 更新頻率 | 高（UI 變更） | 低（API 變更） |
| 憑證 | 無 | OAuth 範圍定義於 `appsscript.json` |

## 3. 資料流程

### 3.1 整體架構流程

```mermaid
flowchart LR
    User([使用者]) --> Frontend["GitHub Pages\n(靜態前端)"]
    Frontend -->|"fetch POST\n{action, ...params}"| GAS["GAS Web App\n(後端)"]
    GAS -->|"SpreadsheetApp"| Sheets[(Google Sheets)]
    GAS -->|"FormApp"| Forms[(Google Forms)]
    GAS -->|"DriveApp"| Drive[(Google Drive)]
    GAS -->|"JSON 回應\n{ok, data?}"| Frontend
    Frontend -->|"顯示結果"| User
```

### 3.2 建立表單流程（時序圖）

以下時序圖展示使用者從精靈步驟五進入步驟六時，系統建立 Google 表單的完整流程：

```mermaid
sequenceDiagram
    participant User as 使用者
    participant Frontend as 前端 (GitHub Pages)
    participant GAS as GAS Web App
    participant FormApp as FormApp
    participant DriveApp as DriveApp

    User->>Frontend: 點擊「下一步」進入步驟六
    Frontend->>Frontend: collectFields() 收集欄位設定
    Frontend->>GAS: POST { action: "createForm", title, description, folderId, fields }
    GAS->>GAS: routeAction("createForm", params)
    GAS->>FormApp: FormApp.create(title)
    FormApp-->>GAS: form 物件
    GAS->>FormApp: form.setDescription(description)
    loop 每個 field
        GAS->>FormApp: 依 type 新增對應 item
        GAS->>FormApp: item.setTitle(field.title)
        GAS->>FormApp: item.setRequired(field.required)
        opt 選擇類型
            GAS->>FormApp: item.setChoiceValues(field.options)
        end
    end
    GAS->>DriveApp: DriveApp.getFileById(form.getId())
    DriveApp-->>GAS: formFile 物件
    GAS->>DriveApp: formFile.moveTo(DriveApp.getFolderById(folderId))
    GAS-->>Frontend: { ok: true, data: { formId, editUrl, publishedUrl } }
    Frontend->>Frontend: 顯示 editUrl 與 publishedUrl
    Frontend-->>User: 顯示表單連結與複製按鈕
```

### 3.3 精靈流程圖

以下流程圖展示使用者從步驟一到步驟六的完整精靈流程：

```mermaid
flowchart TD
    Start([開始]) --> S1["步驟一\n輸入 GAS Web App URL"]
    S1 -->|"驗證 URL 有效"| S2["步驟二\n選擇 Google 試算表"]
    S2 -->|"listSpreadsheets\n選擇試算表"| S3["步驟三\n選擇工作表"]
    S3 -->|"listSheets\n選擇工作表"| S4["步驟四\n設定表單欄位"]
    S4 -->|"getHeaders\n設定各欄位類型/標題/必填/選項"| S5["步驟五\n選擇資料夾與表單資訊"]
    S5 -->|"listFolders\n選擇資料夾/輸入標題與說明"| S6["步驟六\n顯示結果"]
    S6 -->|"createForm\n顯示 editUrl + publishedUrl"| End([完成])
    S6 -.->|"重新開始"| S1
```

## 4. 前端架構

前端採用 IIFE 封裝，避免全域變數污染。主要模組如下：

| 模組 | 職責 |
|---|---|
| 常數定義 | `STORAGE_KEY`、`QUESTION_TYPES`（8 種問題類型）、`CHOICE_TYPES`（需選項的類型）、`TOTAL_STEPS` |
| 狀態管理 | `state` 物件，包含 `currentStep`、`gasUrl`、`spreadsheetId`、`sheetName`、`headers`、`fields`、`folders`、`folderId`、`formTitle`、`formDescription` |
| 步驟導覽 | `goToStep()`、`onStepEnter()` — 控制步驟切換與進入時的資料載入 |
| GAS 通訊 | `getGasUrl()`、`callGas(payload)` — 封裝 fetch POST 與錯誤處理 |
| 資料載入 | `loadSpreadsheets()`、`loadSheets()`、`loadHeaders()`、`loadFolders()`、`createForm()` |
| UI 渲染 | `renderFields()`、`createFieldCard()`、`toggleOptionsEditor()` |
| 驗證 | `validateStep0()` 至 `validateStep4()` — 各步驟的前端驗證 |
| 事件綁定 | `initEvents()` — 綁定所有按鈕與步驟指示器的事件 |

## 5. 後端架構

後端 `Code.gs` 的結構如下：

| 模組 | 職責 |
|---|---|
| `ACTIONS` 常數 | 定義 5 個 action 名稱 |
| `doGet(e)` / `doPost(e)` | HTTP 端點，解析請求並回傳 JSON |
| `routeAction(action, params)` | 依 action 路由至對應處理函式 |
| `handleListSpreadsheets()` | 列出 Drive 中的試算表 |
| `handleListSheets()` | 列出試算表的工作表分頁 |
| `handleGetHeaders()` | 取得工作表第一列標題 |
| `handleListFolders()` | 列出 Drive 根目錄的資料夾 |
| `handleCreateForm()` | 建立 Google 表單並移動至指定資料夾 |

所有處理函式皆以 `try/catch` 包裝，錯誤時回傳 `{ ok: false, error: e.message }`。

## 6. 通訊協定

### 請求格式

前端透過 `fetch()` 發送 POST 請求：

```
POST {GAS Web App URL}
Content-Type: application/json

{
  "action": "actionName",
  ...其他參數
}
```

### 回應格式

所有回應皆為 JSON：

```json
{
  "ok": true,
  "data": { ... }
}
```

或錯誤時：

```json
{
  "ok": false,
  "error": "錯誤訊息（繁體中文）"
}
```

### 錯誤處理策略

| 錯誤類型 | 偵測方式 | 前端處理 |
|---|---|---|
| 網路錯誤 | `fetch` 拋出 `TypeError` | 顯示「無法連線至後端服務，請檢查 GAS Web App URL 是否正確。」 |
| HTTP 錯誤 | `response.ok === false` | 顯示「後端回應 HTTP 狀態碼：{status}」 |
| 業務錯誤 | `result.ok === false` | 顯示 `result.error` 的內容 |
| JSON 解析錯誤 | `doPost` 中的 `JSON.parse` 失敗 | 後端回傳 `{ ok: false, error: "無法解析請求主體 JSON：..." }` |
