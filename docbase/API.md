# API 文件 (API Documentation)

本文件記錄 GAS Web App 提供的所有 action 端點。所有請求皆透過 HTTP POST 發送至 GAS Web App URL，請求主體為 JSON，必須包含 `action` 欄位。所有回應為 JSON，格式為 `{ ok: boolean, data?: any, error?: string }`。

---

## 1. listSpreadsheets

### 說明

列出使用者 Google Drive 中所有試算表檔案。透過 `DriveApp.searchFiles` 搜尋 MIME 類型為 `application/vnd.google-apps.spreadsheet` 的檔案。

### 請求 JSON 範例

```json
{
  "action": "listSpreadsheets"
}
```

### 回應 JSON 範例

```json
{
  "ok": true,
  "data": [
    { "id": "1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890", "name": "客戶問卷資料", "path": "My Drive/問卷/客戶問卷資料" },
    { "id": "2BcDeFgHiJkLmNoPqRsTuVwXyZ0987654321a", "name": "員工滿意度調查", "path": "My Drive/員工滿意度調查" }
  ]
}
```

### 錯誤回應範例

```json
{
  "ok": false,
  "error": "You do not have permission to access this file."
}
```

---

## 2. listSheets

### 說明

列出指定試算表中的所有工作表分頁資訊。透過 `SpreadsheetApp.openById(spreadsheetId).getSheets()` 取得所有工作表，回傳 `{ name, index }` 物件陣列。

### 請求 JSON 範例

```json
{
  "action": "listSheets",
  "spreadsheetId": "1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890"
}
```

### 回應 JSON 範例

```json
{
  "ok": true,
  "data": [
    { "name": "工作表1", "index": 0 },
    { "name": "客戶資料", "index": 1 },
    { "name": "問卷結果", "index": 2 }
  ]
}
```

### 錯誤回應範例

```json
{
  "ok": false,
  "error": "No item with the given ID could be found, or you do not have permission to access it."
}
```

---

## 3. getHeaders

### 說明

取得指定工作表第一列（標題列）的所有欄位標題。透過 `sheet.getRange(1, 1, 1, maxColumns).getValues()[0]` 讀取第一列所有欄位的值，回傳 `{ index, title }` 物件陣列。

### 請求 JSON 範例

```json
{
  "action": "getHeaders",
  "spreadsheetId": "1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890",
  "sheetName": "客戶資料"
}
```

### 回應 JSON 範例

```json
{
  "ok": true,
  "data": [
    { "index": 0, "title": "姓名" },
    { "index": 1, "title": "電子郵件" },
    { "index": 2, "title": "聯絡電話" },
    { "index": 3, "title": "滿意度" }
  ]
}
```

### 錯誤回應範例

```json
{
  "ok": false,
  "error": "No sheet found with name '客戶資料'."
}
```

---

## 4. getQuestions

### 說明

從指定工作表匯入問題定義。系統會檢查第一列是否包含「問題類型」與「問題標題」欄位：

- **模式一（問題定義表）**：若第一列包含「問題類型」與「問題標題」欄位，則逐列讀取問題，支援 `問題類型`、`問題標題`、`必填`（是/否）、`選項`（以 `|` 分隔）四個欄位。
- **模式二（回退模式）**：若未包含上述欄位，則將第一列各欄位視為問題標題，類型預設為「簡答」，必填預設為否。

### 請求 JSON 範例

```json
{
  "action": "getQuestions",
  "spreadsheetId": "1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890",
  "sheetName": "客戶資料"
}
```

### 回應 JSON 範例（模式一）

```json
{
  "ok": true,
  "data": [
    { "type": "簡答", "title": "姓名", "required": true, "options": [] },
    { "type": "單選", "title": "滿意度", "required": true, "options": ["非常滿意", "滿意", "普通", "不滿意"] },
    { "type": "日期", "title": "填寫日期", "required": false, "options": [] }
  ]
}
```

### 回應 JSON 範例（模式二 — 回退）

```json
{
  "ok": true,
  "data": [
    { "type": "簡答", "title": "姓名", "required": false, "options": [] },
    { "type": "簡答", "title": "電子郵件", "required": false, "options": [] }
  ]
}
```

### 錯誤回應範例

```json
{
  "ok": false,
  "error": "No sheet found with name '客戶資料'."
}
```

---

## 5. listFolders

### 說明

列出使用者 Google Drive 根目錄下的所有資料夾。透過 `DriveApp.getFolders()` 迭代取得所有資料夾的 ID 與名稱。

### 請求 JSON 範例

```json
{
  "action": "listFolders"
}
```

### 回應 JSON 範例

```json
{
  "ok": true,
  "data": [
    { "id": "folder-id-001", "name": "表單封存", "path": "My Drive/表單封存" },
    { "id": "folder-id-002", "name": "問卷資料夾", "path": "My Drive/問卷/問卷資料夾" },
    { "id": "folder-id-003", "name": "2024 調查", "path": "My Drive/2024 調查" }
  ]
}
```

### 錯誤回應範例

```json
{
  "ok": false,
  "error": "You do not have permission to perform this action."
}
```

---

## 6. createForm

### 說明

根據使用者設定的欄位建立 Google 表單，並將表單移動至指定的 Google Drive 資料夾。

處理流程：
1. 取得部署 ID（3 位數滾動計數器，001–999，透過 `PropertiesService` 持久化）。
2. 透過 `FormApp.create(title)` 建立表單（顯示標題為使用者輸入的 title）。
3. 透過 `form.setDescription(description)` 設定表單說明。
4. 依每個欄位的 `type` 新增對應的問題項目（`addTextItem`、`addParagraphTextItem` 等）。
5. 設定問題標題 (`item.setTitle`) 與必填 (`item.setRequired`)。
6. 選擇類型需設定選項 (`item.setChoiceValues`)。
7. 透過 `DriveApp.getFileById(form.getId()).moveTo(folder)` 移動表單至指定資料夾，並重命名為 `Google表格-部署${部署ID}`。
8. 透過 `SpreadsheetApp.create()` 建立回應試算表 `Google試算表-部署${部署ID}`，移動至指定資料夾。
9. 透過 `form.setDestination(FormApp.DestinationType.SPREADSHEET, responseSheetId)` 連結表單回應至新試算表。
10. 透過 is.gd 縮短表單連結、回應試算表連結、來源試算表連結。
11. 透過 Drive API v3 multipart 上傳 HTML 轉為 Google Document，再匯出為 PDF，儲存為 `Google表格-PDF-${時間戳記}-部署${部署ID}.pdf` 至指定資料夾，刪除暫存文件（不使用 `DocumentApp`，無需額外 OAuth 授權）。
12. 回傳表單資訊、回應試算表資訊、PDF 檔案資訊等完整資料。

### 請求 JSON 範例

```json
{
  "action": "createForm",
  "title": "客戶滿意度調查",
  "description": "請填寫以下問卷，我們將根據您的回饋持續改進服務品質。",
  "folderId": "folder-id-001",
  "spreadsheetId": "1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890",
  "fields": [
    {
      "title": "姓名",
      "type": "簡答",
      "required": true
    },
    {
      "title": "電子郵件",
      "type": "段落",
      "required": false
    },
    {
      "title": "滿意度",
      "type": "單選",
      "required": true,
      "options": ["非常滿意", "滿意", "普通", "不滿意", "非常不滿意"]
    },
    {
      "title": "改善建議（可複選）",
      "type": "核取方塊",
      "required": false,
      "options": ["服務態度", "回覆速度", "產品品質", "價格"]
    },
    {
      "title": "所在地區",
      "type": "下拉式清單",
      "required": true,
      "options": ["北部", "中部", "南部", "東部", "離島"]
    },
    {
      "title": "推薦程度",
      "type": "線性刻度",
      "required": false
    },
    {
      "title": "填寫日期",
      "type": "日期",
      "required": true
    },
    {
      "title": "方便聯絡時間",
      "type": "時間",
      "required": false
    }
  ]
}
```

### 回應 JSON 範例

```json
{
  "ok": true,
  "data": {
    "formId": "1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890",
    "editUrl": "https://docs.google.com/forms/d/1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890/edit",
    "publishedUrl": "https://docs.google.com/forms/d/e/1FAIpQLSf.../viewform",
    "shortViewUrl": "https://is.gd/abc1234",
    "spreadsheetUrl": "https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890/edit",
    "shortSpreadsheetUrl": "https://is.gd/def5678",
    "deploymentId": "001",
    "formFileName": "Google表格-部署001",
    "responseSheetId": "2BcDeFgHiJkLmNoPqRsTuVwXyZ0987654321a",
    "responseSheetUrl": "https://docs.google.com/spreadsheets/d/2BcDeFgHiJkLmNoPqRsTuVwXyZ0987654321a/edit",
    "responseSheetName": "Google試算表-部署001",
    "shortResponseSheetUrl": "https://is.gd/ghi9012",
    "pdfFileName": "Google表格-PDF-20261002143025-部署001.pdf",
    "pdfFileId": "3CdEfGhIjKlMnOpQrStUvWxYz5678901234b",
    "pdfFileUrl": "https://drive.google.com/file/d/3CdEfGhIjKlMnOpQrStUvWxYz5678901234b/view"
  }
}
```

### 回應欄位說明

| 欄位 | 說明 |
|---|---|
| `formId` | 建立的 Google 表單 ID |
| `editUrl` | 表單編輯連結（完整網址） |
| `publishedUrl` | 表單檢視連結（完整網址） |
| `shortViewUrl` | 表單檢視連結（短網址，透過 is.gd 縮短） |
| `spreadsheetUrl` | 來源試算表連結（完整網址） |
| `shortSpreadsheetUrl` | 來源試算表連結（短網址，透過 is.gd 縮短） |
| `deploymentId` | 部署 ID（3 位數滾動計數器，001–999） |
| `formFileName` | Google 表單在 Drive 中的檔案名稱（`Google表格-部署${部署ID}`） |
| `responseSheetId` | 回應試算表 ID |
| `responseSheetUrl` | 回應試算表連結（完整網址） |
| `responseSheetName` | 回應試算表在 Drive 中的檔案名稱（`Google試算表-部署${部署ID}`） |
| `shortResponseSheetUrl` | 回應試算表連結（短網址，透過 is.gd 縮短） |
| `pdfFileName` | PDF 檔案名稱（`Google表格-PDF-${時間戳記}-部署${部署ID}.pdf`） |
| `pdfFileId` | PDF 檔案 ID |
| `pdfFileUrl` | PDF 檔案連結 |

### 錯誤回應範例

```json
{
  "ok": false,
  "error": "未知的欄位類型：rating"
}
```

---

## 欄位類型對照

`createForm` 的 `fields` 陣列中，每個欄位的 `type` 欄位支援以下值（中文與英文皆可）：

| type 值（中文） | type 值（英文） | FormApp 方法 | 需要選項 |
|---|---|---|---|
| `簡答` | `short` | `addTextItem()` | 否 |
| `段落` | `paragraph` | `addParagraphTextItem()` | 否 |
| `單選` | `multiple_choice` | `addMultipleChoiceItem()` | 是 |
| `核取方塊` | `checkboxes` | `addCheckboxItem()` | 是 |
| `下拉式清單` | `list` | `addListItem()` | 是 |
| `線性刻度` | `linear_scale` | `addScaleItem()` | 否 |
| `日期` | `date` | `addDateItem()` | 否 |
| `時間` | `time` | `addTimeItem()` | 否 |
