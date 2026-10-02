# 資料結構說明 (Schema)

## 1. 來源試算表問題匯入慣例

本系統支援兩種模式從 Google 試算表工作表匯入問題定義。

### 模式一：問題定義表（建議）

工作表第一列為標題列，需包含以下欄位：

| 欄位標題 | 說明 | 範例 |
|---|---|---|
| `問題類型` | 問題類型（簡答/段落/單選/核取方塊/下拉式清單/線性刻度/日期/時間） | `單選` |
| `問題標題` | 問題的標題文字 | `滿意度` |
| `必填` | 是否必填（是/否） | `是` |
| `選項` | 選項清單，以 `|` 分隔（僅選擇類型需要） | `非常滿意|滿意|普通|不滿意` |

每一列（第二列起）對應一個問題。系統透過 `getQuestions` action 讀取並轉換為問題物件陣列。

#### 範例試算表

| 問題類型 | 問題標題 | 必填 | 選項 |
|---|---|---|---|
| 簡答 | 姓名 | 是 | |
| 段落 | 意見回饋 | 否 | |
| 單選 | 滿意度 | 是 | 非常滿意\|滿意\|普通\|不滿意 |
| 核取方塊 | 感興趣的主題 | 否 | 技術\|設計\|行銷\|管理 |
| 下拉式清單 | 所在地區 | 是 | 北部\|中部\|南部\|東部 |
| 日期 | 填寫日期 | 是 | |

則 `getQuestions` 回傳：

```json
{
  "ok": true,
  "data": [
    { "type": "簡答", "title": "姓名", "required": true, "options": [] },
    { "type": "段落", "title": "意見回饋", "required": false, "options": [] },
    { "type": "單選", "title": "滿意度", "required": true, "options": ["非常滿意", "滿意", "普通", "不滿意"] },
    { "type": "核取方塊", "title": "感興趣的主題", "required": false, "options": ["技術", "設計", "行銷", "管理"] },
    { "type": "下拉式清單", "title": "所在地區", "required": true, "options": ["北部", "中部", "南部", "東部"] },
    { "type": "日期", "title": "填寫日期", "required": true, "options": [] }
  ]
}
```

### 模式二：標題列回退模式（舊模式）

若工作表第一列不包含「問題類型」與「問題標題」欄位，系統自動回退為舊模式：將第一列各欄位視為問題標題，類型預設為「簡答」，必填預設為否。

#### 範例

假設工作表「客戶資料」的第一列如下：

| A | B | C | D |
|---|---|---|---|
| 姓名 | 電子郵件 | 聯絡電話 | 滿意度 |

則 `getQuestions` 回傳：

```json
{
  "ok": true,
  "data": [
    { "type": "簡答", "title": "姓名", "required": false, "options": [] },
    { "type": "簡答", "title": "電子郵件", "required": false, "options": [] },
    { "type": "簡答", "title": "聯絡電話", "required": false, "options": [] },
    { "type": "簡答", "title": "滿意度", "required": false, "options": [] }
  ]
}
```

### getHeaders（保留向下相容）

`getHeaders` action 仍然保留，僅讀取第一列各欄位標題，回傳 `{ index, title }` 陣列。新功能請使用 `getQuestions`。

## 2. createForm 欄位 payload 結構

`createForm` action 的 `fields` 參數為一陣列，每個元素代表一個表單問題。

### 欄位物件結構

```typescript
interface Field {
  title: string;        // 問題標題
  type: string;         // 問題類型（見下方對照表）
  required: boolean;    // 是否必填
  options?: string[];   // 選項陣列（僅選擇類型需要）
}
```

### 欄位說明

| 欄位 | 型別 | 必填 | 說明 |
|---|---|---|---|
| `title` | `string` | 是 | 表單問題的標題文字，不可為空字串 |
| `type` | `string` | 是 | 問題類型，支援中文或英文標籤（見下方對照表） |
| `required` | `boolean` | 是 | 是否為必填問題 |
| `options` | `string[]` | 否 | 選項陣列，僅選擇類型（單選、核取方塊、下拉式清單）需要提供 |

### payload 範例

```json
{
  "action": "createForm",
  "title": "客戶滿意度調查",
  "description": "請填寫以下問卷",
  "folderId": "folder-id-001",
  "fields": [
    {
      "title": "姓名",
      "type": "簡答",
      "required": true
    },
    {
      "title": "意見回饋",
      "type": "段落",
      "required": false
    },
    {
      "title": "滿意度",
      "type": "單選",
      "required": true,
      "options": ["非常滿意", "滿意", "普通", "不滿意"]
    },
    {
      "title": "感興趣的主題",
      "type": "核取方塊",
      "required": false,
      "options": ["技術", "設計", "行銷", "管理"]
    },
    {
      "title": "所在地區",
      "type": "下拉式清單",
      "required": true,
      "options": ["北部", "中部", "南部", "東部"]
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

## 3. 支援的問題類型對照表

以下為本系統支援的 8 種問題類型，對應中文標籤、英文 type 字串與 Google FormApp 的項目類型：

| 中文標籤 | type 字串（中文） | type 字串（英文） | FormApp 項目類型 | 新增方法 | 需要選項 | 前端 CHOICE_TYPES |
|---|---|---|---|---|---|---|
| 簡答 | `簡答` | `short` | `TextItem` | `form.addTextItem()` | 否 | 否 |
| 段落 | `段落` | `paragraph` | `ParagraphTextItem` | `form.addParagraphTextItem()` | 否 | 否 |
| 單選 | `單選` | `multiple_choice` | `MultipleChoiceItem` | `form.addMultipleChoiceItem()` | 是 | 是 |
| 核取方塊 | `核取方塊` | `checkboxes` | `CheckboxItem` | `form.addCheckboxItem()` | 是 | 是 |
| 下拉式清單 | `下拉式清單` | `list` | `ListItem` | `form.addListItem()` | 是 | 是 |
| 線性刻度 | `線性刻度` | `linear_scale` | `ScaleItem` | `form.addScaleItem()` | 否 | 否 |
| 日期 | `日期` | `date` | `DateItem` | `form.addDateItem()` | 否 | 否 |
| 時間 | `時間` | `time` | `TimeItem` | `form.addTimeItem()` | 否 | 否 |

### 前端問題類型定義

前端 `app.js` 中的 `QUESTION_TYPES` 常數定義了使用者可選擇的問題類型，其 `value` 使用中文標籤：

```javascript
var QUESTION_TYPES = [
  { label: '簡答', value: '簡答' },
  { label: '段落', value: '段落' },
  { label: '單選', value: '單選' },
  { label: '核取方塊', value: '核取方塊' },
  { label: '下拉式清單', value: '下拉式清單' },
  { label: '線性刻度', value: '線性刻度' },
  { label: '日期', value: '日期' },
  { label: '時間', value: '時間' }
];
```

### 選項類型

前端 `CHOICE_TYPES` 常數標記需要顯示選項編輯器的類型：

```javascript
var CHOICE_TYPES = ['單選', '核取方塊', '下拉式清單'];
```

### 後端類型路由

後端 `Code.gs` 中的 `handleCreateForm` 使用 `switch` 對 `field.type` 進行路由，同時支援中文與英文標籤：

```javascript
switch (field.type) {
  case '簡答':
  case 'short':
    item = form.addTextItem();
    break;
  // ...其他類型
}
```

## 4. API 回應結構

### listSpreadsheets 回傳的試算表項目

```typescript
interface SpreadsheetItem {
  id: string;     // 試算表檔案 ID
  name: string;   // 試算表檔案名稱
  path: string;   // Drive 完整路徑（如 "My Drive/問卷/客戶問卷"）
}
```

### listSheets 回傳的工作表項目

```typescript
interface SheetItem {
  name: string;   // 工作表分頁名稱
  index: number;  // 工作表在試算表中的索引（0-based）
}
```

### listFolders 回傳的資料夾項目

```typescript
interface FolderItem {
  id: string;     // Drive 資料夾 ID
  name: string;   // 資料夾名稱
  path: string;   // Drive 完整路徑（如 "My Drive/表單封存"）
}
```

### getHeaders 回傳的 header 物件

```typescript
interface Header {
  index: number;   // 欄位在試算表中的索引（0-based）
  title: string;   // 第一列該欄位的值（欄位標題）
}
```

### createForm 回傳的結果物件

```typescript
interface CreateFormResult {
  formId: string;                   // 建立的 Google 表單 ID
  editUrl: string;                  // 表單編輯連結（完整網址）
  publishedUrl: string;             // 表單檢視連結（完整網址）
  shortViewUrl: string;             // 表單檢視連結（短網址，is.gd）
  spreadsheetUrl: string;           // 來源試算表連結（完整網址）
  shortSpreadsheetUrl: string;      // 來源試算表連結（短網址，is.gd）
  deploymentId: string;             // 部署 ID（3 位數滾動計數器，001–999）
  formFileName: string;             // Google 表單 Drive 檔案名稱（Google表格-部署${部署ID}）
  responseSheetId: string;          // 回應試算表 ID
  responseSheetUrl: string;         // 回應試算表連結（完整網址）
  responseSheetName: string;        // 回應試算表 Drive 檔案名稱（Google試算表-部署${部署ID}）
  shortResponseSheetUrl: string;    // 回應試算表連結（短網址，is.gd）
  pdfFileName: string;              // PDF 檔案名稱（Google表格-PDF-${時間戳記}-部署${部署ID}.pdf）
  pdfFileId: string;                // PDF 檔案 ID
  pdfFileUrl: string;               // PDF 檔案連結
}
```

### 統一回應格式

```typescript
interface ApiResponse<T> {
  ok: boolean;      // 是否成功
  data?: T;         // 回傳資料（成功時）
  error?: string;   // 錯誤訊息（失敗時，繁體中文）
}
```
