# 資料結構說明 (Schema)

## 1. 來源試算表標題慣例

本系統以 Google 試算表工作表的第一列作為欄位標題列（header row），每個欄位對應一個表單問題。

### 慣例規則

| 規則 | 說明 |
|---|---|
| 第一列（Row 1） | 欄位標題列，每個儲存格的值即為表單問題的預設標題 |
| 每個欄位（Column） | 對應一個表單問題項目 |
| 欄位順序 | 由左至右，對應表單問題的出現順序 |
| 空白欄位 | 標題為空的欄位仍會被讀取，但使用者在步驟四需設定非空的問題標題才能通過驗證 |

### 範例

假設工作表「客戶資料」的第一列如下：

| A | B | C | D |
|---|---|---|---|
| 姓名 | 電子郵件 | 聯絡電話 | 滿意度 |

則 `getHeaders` 回傳：

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
  formId: string;        // 建立的 Google 表單 ID
  editUrl: string;       // 表單編輯連結
  publishedUrl: string;  // 表單發布連結
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
