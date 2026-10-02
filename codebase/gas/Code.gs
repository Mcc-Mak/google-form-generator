/**
 * Google Apps Script Web App 後端
 *
 * 提供 doGet / doPost 端點，依 action 參數路由至對應的處理函式。
 * 所有回傳皆為 JSON，格式為 { ok: boolean, data?: any, error?: string }。
 */

// ==================== 路由常數 ====================

var ACTIONS = {
  LIST_SPREADSHEETS: 'listSpreadsheets',
  LIST_SHEETS: 'listSheets',
  GET_HEADERS: 'getHeaders',
  GET_QUESTIONS: 'getQuestions',
  LIST_FOLDERS: 'listFolders',
  CREATE_FORM: 'createForm'
};

// ==================== HTTP 端點 ====================

/**
 * GET 處理函式。
 * @param {Object} e 事件物件，包含 e.parameter.action 做為路由鍵。
 * @return {TextOutput} JSON 回應。
 */
function doGet(e) {
  var action = e.parameter.action;
  var result = routeAction(action, e.parameter);
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * POST 處理函式。
 * @param {Object} e 事件物件，e.postData.contents 為 JSON 字串。
 * @return {TextOutput} JSON 回應。
 */
function doPost(e) {
  var body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: '無法解析請求主體 JSON：' + err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  var action = body.action;
  var result = routeAction(action, body);
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * 依 action 將請求路由至對應的處理函式。
 * @param {string} action 動作名稱。
 * @param {Object} params 請求參數（GET 的 query string 或 POST 的 JSON body）。
 * @return {Object} { ok: boolean, data?: any, error?: string }
 */
function routeAction(action, params) {
  switch (action) {
    case ACTIONS.LIST_SPREADSHEETS:
      return handleListSpreadsheets(params);
    case ACTIONS.LIST_SHEETS:
      return handleListSheets(params);
    case ACTIONS.GET_HEADERS:
      return handleGetHeaders(params);
    case ACTIONS.GET_QUESTIONS:
      return handleGetQuestions(params);
    case ACTIONS.LIST_FOLDERS:
      return handleListFolders(params);
    case ACTIONS.CREATE_FORM:
      return handleCreateForm(params);
    default:
      return { ok: false, error: '未知的動作：' + action };
  }
}

// ==================== 處理函式 ====================

/**
 * 列出 Google Drive 中所有試算表檔案。
 * @param {Object} _params （未使用）
 * @return {Object} { ok: true, data: [{ id, name }] }
 */
function handleListSpreadsheets(_params) {
  try {
    var files = DriveApp.searchFiles('mimeType = "application/vnd.google-apps.spreadsheet"');
    var data = [];
    while (files.hasNext()) {
      var file = files.next();
      data.push({ id: file.getId(), name: file.getName() });
    }
    return { ok: true, data: data };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

/**
 * 列出指定試算表中的所有工作表分頁名稱。
 * @param {Object} params 需包含 spreadsheetId。
 * @return {Object} { ok: true, data: string[] }
 */
function handleListSheets(params) {
  try {
    var spreadsheetId = params.spreadsheetId;
    var sheets = SpreadsheetApp.openById(spreadsheetId).getSheets();
    var data = sheets.map(function (sheet) {
      return sheet.getName();
    });
    return { ok: true, data: data };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

/**
 * 取得指定工作表的第一列（標題列）。
 * @param {Object} params 需包含 spreadsheetId 與 sheetName。
 * @return {Object} { ok: true, data: [{ index: number, title: string }] }
 */
function handleGetHeaders(params) {
  try {
    var spreadsheetId = params.spreadsheetId;
    var sheetName = params.sheetName;
    var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
    var maxColumns = sheet.getMaxColumns();
    var values = sheet.getRange(1, 1, 1, maxColumns).getValues()[0];
    var data = values.map(function (title, index) {
      return { index: index, title: title };
    });
    return { ok: true, data: data };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

/**
 * 從工作表匯入問題定義。
 *
 * 工作表需包含以下標題欄（第一列）：
 *   - 問題類型（簡答/段落/單選/核取方塊/下拉式清單/線性刻度/日期/時間）
 *   - 問題標題
 *   - 必填（是/否）
 *   - 選項（以 | 分隔，僅選擇類型需要）
 *
 * 若工作表未包含「問題類型」與「問題標題」欄，則回退為舊模式：
 * 將第一列各欄位視為問題標題，類型預設為「簡答」。
 *
 * @param {Object} params 需包含 spreadsheetId 與 sheetName。
 * @return {Object} { ok: true, data: [{ type, title, required, options }] }
 */
function handleGetQuestions(params) {
  try {
    var spreadsheetId = params.spreadsheetId;
    var sheetName = params.sheetName;
    var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();

    if (lastRow === 0 || lastCol === 0) {
      return { ok: true, data: [] };
    }

    var values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
    var headers = values[0];

    var typeCol = -1, titleCol = -1, requiredCol = -1, optionsCol = -1;
    for (var i = 0; i < headers.length; i++) {
      var h = headers[i].toString().trim();
      if (h === '問題類型') typeCol = i;
      else if (h === '問題標題') titleCol = i;
      else if (h === '必填') requiredCol = i;
      else if (h === '選項') optionsCol = i;
    }

    var data = [];

    if (typeCol !== -1 && titleCol !== -1) {
      for (var row = 1; row < values.length; row++) {
        var rowData = values[row];
        var title = rowData[titleCol] ? rowData[titleCol].toString().trim() : '';
        if (!title) continue;

        var type = rowData[typeCol] ? rowData[typeCol].toString().trim() : '簡答';
        if (!type) type = '簡答';

        var required = false;
        if (requiredCol !== -1 && rowData[requiredCol]) {
          var reqVal = rowData[requiredCol].toString().trim().toLowerCase();
          required = reqVal === '是' || reqVal === 'true' || reqVal === '1';
        }

        var options = [];
        if (optionsCol !== -1 && rowData[optionsCol]) {
          options = rowData[optionsCol]
            .toString()
            .split('|')
            .map(function (s) { return s.trim(); })
            .filter(function (s) { return s !== ''; });
        }

        data.push({ type: type, title: title, required: required, options: options });
      }
    } else {
      for (var col = 0; col < headers.length; col++) {
        var headerTitle = headers[col] ? headers[col].toString().trim() : '';
        if (!headerTitle) continue;
        data.push({ type: '簡答', title: headerTitle, required: false, options: [] });
      }
    }

    return { ok: true, data: data };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

/**
 * 列出 Google Drive 根目錄下的所有資料夾。
 * @param {Object} _params （未使用）
 * @return {Object} { ok: true, data: [{ id, name }] }
 */
function handleListFolders(_params) {
  try {
    var folders = DriveApp.getFolders();
    var data = [];
    while (folders.hasNext()) {
      var folder = folders.next();
      data.push({ id: folder.getId(), name: folder.getName() });
    }
    return { ok: true, data: data };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

/**
 * 根據設定建立 Google 表單，並移動至指定資料夾。
 *
 * 每個欄位的 type 可為：
 *   - 簡答 / short             → TextItem
 *   - 段落 / paragraph          → ParagraphTextItem
 *   - 單選 / multiple_choice    → MultipleChoiceItem
 *   - 核取方塊 / checkboxes     → CheckboxItem
 *   - 下拉式清單 / list         → ListItem
 *   - 線性刻度 / linear_scale   → ScaleItem
 *   - 日期 / date              → DateItem
 *   - 時間 / time              → TimeItem
 *
 * @param {Object} params 需包含 title, description, folderId, fields（陣列）。
 * @return {Object} { ok: true, data: { formId, editUrl, publishedUrl } }
 */
function handleCreateForm(params) {
  try {
    var title = params.title;
    var description = params.description;
    var folderId = params.folderId;
    var fields = params.fields;
    var spreadsheetId = params.spreadsheetId;

    var form = FormApp.create(title);
    form.setDescription(description);

    for (var i = 0; i < fields.length; i++) {
      var field = fields[i];
      var item;

      switch (field.type) {
        case '簡答':
        case 'short':
          item = form.addTextItem();
          break;

        case '段落':
        case 'paragraph':
          item = form.addParagraphTextItem();
          break;

        case '單選':
        case 'multiple_choice':
          item = form.addMultipleChoiceItem();
          item.setChoiceValues(field.options || []);
          break;

        case '核取方塊':
        case 'checkboxes':
          item = form.addCheckboxItem();
          item.setChoiceValues(field.options || []);
          break;

        case '下拉式清單':
        case 'list':
          item = form.addListItem();
          item.setChoiceValues(field.options || []);
          break;

        case '線性刻度':
        case 'linear_scale':
          item = form.addScaleItem();
          break;

        case '日期':
        case 'date':
          item = form.addDateItem();
          break;

        case '時間':
        case 'time':
          item = form.addTimeItem();
          break;

        default:
          throw new Error('未知的欄位類型：' + field.type);
      }

      item.setTitle(field.title);
      item.setRequired(field.required);
    }

    // 將表單移動至指定資料夾
    var formFile = DriveApp.getFileById(form.getId());
    formFile.moveTo(DriveApp.getFolderById(folderId));

    var editUrl = form.getEditUrl();
    var publishedUrl = form.getPublishedUrl();
    var spreadsheetUrl = spreadsheetId
      ? 'https://docs.google.com/spreadsheets/d/' + spreadsheetId + '/edit'
      : '';

    return {
      ok: true,
      data: {
        formId: form.getId(),
        editUrl: editUrl,
        publishedUrl: publishedUrl,
        shortViewUrl: shortenUrl(publishedUrl),
        spreadsheetUrl: spreadsheetUrl,
        shortSpreadsheetUrl: spreadsheetUrl ? shortenUrl(spreadsheetUrl) : ''
      }
    };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

/**
 * 使用 is.gd 免費短網址服務縮短 URL。
 * 失敗時回傳原始 URL。
 */
function shortenUrl(url) {
  try {
    var response = UrlFetchApp.fetch(
      'https://is.gd/create.php?format=json&url=' + encodeURIComponent(url),
      { muteHttpExceptions: true }
    );
    var json = JSON.parse(response.getContentText());
    return json.shorturl || url;
  } catch (e) {
    return url;
  }
}
