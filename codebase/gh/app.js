/**
 * Google 表單建立精靈 — 前端應用程式
 *
 * 純 Vanilla JS，無任何外部相依。
 * 實作精靈狀態機，透過 fetch POST 與 GAS 後端通訊。
 */

(function () {
  'use strict';

  // ==================== 常數 ====================

  /** 儲存 GAS URL 的 localStorage 鍵名 */
  var STORAGE_KEY = 'gasWebAppUrl';

  /** 問題類型定義：值為送往後端的 type 字串，choiceTypes 表示需要選項編輯器 */
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

  /** 需要選項編輯器的問題類型 */
  var CHOICE_TYPES = ['單選', '核取方塊', '下拉式清單'];

  var TOTAL_STEPS = 6;

  // ==================== 狀態 ====================

  var state = {
    currentStep: 0,
    gasUrl: '',
    spreadsheetId: '',
    spreadsheetName: '',
    sheetName: '',
    headers: [],
    fields: [],
    folders: [],
    folderId: '',
    formTitle: '',
    formDescription: ''
  };

  // ==================== DOM 輔助 ====================

  function $(selector) {
    return document.querySelector(selector);
  }

  function $$(selector) {
    return document.querySelectorAll(selector);
  }

  /**
   * 在指定訊息區域顯示錯誤訊息。
   * @param {string} stepId - 步驟區塊 ID，如 "step0Message"
   * @param {string} message - 錯誤訊息文字
   */
  function showError(stepId, message) {
    var el = document.getElementById(stepId);
    if (el) {
      el.innerHTML = '<p class="error-msg">' + escapeHtml(message) + '</p>';
    }
  }

  /**
   * 在指定訊息區域顯示成功訊息。
   * @param {string} stepId - 步驟區塊 ID
   * @param {string} message - 成功訊息文字
   */
  function showSuccess(stepId, message) {
    var el = document.getElementById(stepId);
    if (el) {
      el.innerHTML = '<p class="success-msg">' + escapeHtml(message) + '</p>';
    }
  }

  /**
   * 清除指定訊息區域的內容。
   * @param {string} stepId - 步驟區塊 ID
   */
  function clearMessage(stepId) {
    var el = document.getElementById(stepId);
    if (el) {
      el.innerHTML = '';
    }
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  }

  // ==================== 步驟導覽 ====================

  /**
   * 切換至指定步驟。
   * @param {number} step - 目標步驟索引（0-based）
   */
  function goToStep(step) {
    if (step < 0 || step >= TOTAL_STEPS) return;

    // 隱藏所有步驟
    var steps = $$('.wizard-step');
    for (var i = 0; i < steps.length; i++) {
      steps[i].classList.remove('active');
    }

    // 顯示目標步驟
    var target = document.getElementById('step-' + step);
    if (target) {
      target.classList.add('active');
    }

    // 更新步驟指示器
    var dots = $$('.step-dot');
    for (var j = 0; j < dots.length; j++) {
      dots[j].classList.remove('active');
      if (j <= step) {
        dots[j].classList.add('completed');
      } else {
        dots[j].classList.remove('completed');
      }
      if (j === step) {
        dots[j].classList.add('active');
      }
    }

    state.currentStep = step;

    // 步驟進入時的資料載入
    onStepEnter(step);
  }

  /**
   * 步驟進入時觸發的資料載入邏輯。
   * @param {number} step - 步驟索引
   */
  function onStepEnter(step) {
    switch (step) {
      case 1:
        if (state.spreadsheetId === '' || $('#spreadsheetSelect').children.length <= 1) {
          loadSpreadsheets();
        }
        break;
      case 2:
        if (state.spreadsheetId) {
          loadSheets(state.spreadsheetId);
        }
        break;
      case 3:
        if (state.spreadsheetId && state.sheetName && state.headers.length === 0) {
          loadHeaders(state.spreadsheetId, state.sheetName);
        }
        break;
      case 4:
        if (state.folders.length === 0) {
          loadFolders();
        }
        // 預設填入試算表名稱作為表單標題
        if (!state.formTitle && state.spreadsheetName) {
          $('#formTitle').value = state.spreadsheetName;
          state.formTitle = state.spreadsheetName;
        }
        break;
      case 5:
        createForm();
        break;
    }
  }

  // ==================== GAS API 通訊 ====================

  /**
   * 取得 GAS Web App URL（優先從 localStorage 讀取）。
   * @return {string} GAS URL
   */
  function getGasUrl() {
    if (state.gasUrl) return state.gasUrl;
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      state.gasUrl = stored;
      return stored;
    }
    return '';
  }

  /**
   * 向 GAS 後端發送 POST 請求。
   * @param {Object} payload - 請求主體，必須包含 action 欄位
   * @return {Promise<Object>} 回應的 data 欄位
   * @throws {Error} 當連線失敗或回應格式錯誤時拋出
   */
  function callGas(payload) {
    var url = getGasUrl();
    if (!url) {
      throw new Error('尚未設定 GAS Web App URL，請返回步驟一進行設定。');
    }

    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error('後端回應 HTTP 狀態碼：' + response.status);
        }
        return response.json();
      })
      .then(function (result) {
        if (!result.ok) {
          var errMsg = result.error || '未知的後端錯誤';
          throw new Error(errMsg);
        }
        return result.data;
      })
      .catch(function (err) {
        // 區分網路錯誤與業務錯誤
        if (err instanceof TypeError) {
          throw new Error('無法連線至後端服務，請檢查 GAS Web App URL 是否正確。');
        }
        throw err;
      });
  }

  // ==================== 各步驟資料載入 ====================

  /**
   * 載入試算表清單（listSpreadsheets）。
   */
  function loadSpreadsheets() {
    var select = $('#spreadsheetSelect');
    select.disabled = true;
    select.innerHTML = '<option value="">載入中…</option>';
    clearMessage('step1Message');

    callGas({ action: 'listSpreadsheets' })
      .then(function (data) {
        select.innerHTML = '';
        if (!data || data.length === 0) {
          select.innerHTML = '<option value="">找不到任何試算表</option>';
          showError('step1Message', '您的 Google Drive 中沒有試算表檔案。');
          return;
        }
        var defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '請選擇試算表';
        select.appendChild(defaultOption);

        for (var i = 0; i < data.length; i++) {
          var opt = document.createElement('option');
          opt.value = data[i].id;
          opt.textContent = data[i].name;
          select.appendChild(opt);
        }
        select.disabled = false;

        // 若先前已選過，嘗試還原選取
        if (state.spreadsheetId) {
          select.value = state.spreadsheetId;
        }
      })
      .catch(function (err) {
        select.innerHTML = '<option value="">載入失敗</option>';
        showError('step1Message', err.message);
      });
  }

  /**
   * 載入工作表清單（listSheets）。
   * @param {string} spreadsheetId - 試算表 ID
   */
  function loadSheets(spreadsheetId) {
    var select = $('#sheetSelect');
    select.disabled = true;
    select.innerHTML = '<option value="">載入中…</option>';
    clearMessage('step2Message');

    callGas({ action: 'listSheets', spreadsheetId: spreadsheetId })
      .then(function (data) {
        select.innerHTML = '';
        if (!data || data.length === 0) {
          select.innerHTML = '<option value="">找不到任何工作表</option>';
          showError('step2Message', '此試算表中沒有工作表分頁。');
          return;
        }
        var defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '請選擇工作表';
        select.appendChild(defaultOption);

        for (var i = 0; i < data.length; i++) {
          var opt = document.createElement('option');
          opt.value = data[i];
          opt.textContent = data[i];
          select.appendChild(opt);
        }
        select.disabled = false;

        // 若先前已選過，嘗試還原選取
        if (state.sheetName) {
          select.value = state.sheetName;
        }
      })
      .catch(function (err) {
        select.innerHTML = '<option value="">載入失敗</option>';
        showError('step2Message', err.message);
      });
  }

  /**
   * 載入欄位標題（getHeaders）。
   * @param {string} spreadsheetId - 試算表 ID
   * @param {string} sheetName - 工作表名稱
   */
  function loadHeaders(spreadsheetId, sheetName) {
    var container = $('#fieldsContainer');
    container.innerHTML = '<p class="loading-text">載入中…</p>';
    clearMessage('step3Message');

    callGas({ action: 'getHeaders', spreadsheetId: spreadsheetId, sheetName: sheetName })
      .then(function (data) {
        state.headers = data || [];
        state.fields = [];
        renderFields();
      })
      .catch(function (err) {
        container.innerHTML = '<p class="error-msg">' + escapeHtml(err.message) + '</p>';
      });
  }

  /**
   * 渲染欄位設定介面。
   */
  function renderFields() {
    var container = $('#fieldsContainer');
    container.innerHTML = '';

    if (state.headers.length === 0) {
      container.innerHTML = '<p class="error-msg">沒有可用的欄位標題。</p>';
      return;
    }

    for (var i = 0; i < state.headers.length; i++) {
      var header = state.headers[i];
      var fieldCard = createFieldCard(i, header);
      container.appendChild(fieldCard);

      // 初始化狀態
      if (!state.fields[i]) {
        state.fields[i] = {
          title: header.title,
          type: '簡答',
          required: false,
          options: []
        };
      }
    }
  }

  /**
   * 建立單一欄位設定卡片。
   * @param {number} index - 欄位索引
   * @param {Object} header - 欄位標題物件 {index, title}
   * @return {HTMLElement} 欄位卡片元素
   */
  function createFieldCard(index, header) {
    var card = document.createElement('div');
    card.className = 'field-card';
    card.dataset.index = index;

    // 欄位標題顯示
    var titleDiv = document.createElement('div');
    titleDiv.className = 'field-header';
    titleDiv.innerHTML = '<span class="field-number">欄位 ' + (index + 1) + '</span>' +
      '<span class="field-column-title">資料欄位：' + escapeHtml(header.title) + '</span>';
    card.appendChild(titleDiv);

    // 問題類型選擇器
    var typeGroup = document.createElement('div');
    typeGroup.className = 'form-group';
    var typeLabel = document.createElement('label');
    typeLabel.textContent = '問題類型';
    typeLabel.htmlFor = 'fieldType-' + index;
    var typeSelect = document.createElement('select');
    typeSelect.id = 'fieldType-' + index;
    typeSelect.dataset.index = index;
    for (var t = 0; t < QUESTION_TYPES.length; t++) {
      var opt = document.createElement('option');
      opt.value = QUESTION_TYPES[t].value;
      opt.textContent = QUESTION_TYPES[t].label;
      typeSelect.appendChild(opt);
    }
    typeSelect.addEventListener('change', function (e) {
      var idx = parseInt(e.target.dataset.index, 10);
      state.fields[idx].type = e.target.value;
      toggleOptionsEditor(card, e.target.value);
    });
    typeGroup.appendChild(typeLabel);
    typeGroup.appendChild(typeSelect);
    card.appendChild(typeGroup);

    // 問題標題輸入
    var titleGroup = document.createElement('div');
    titleGroup.className = 'form-group';
    var titleLabel = document.createElement('label');
    titleLabel.textContent = '問題標題';
    titleLabel.htmlFor = 'fieldTitle-' + index;
    var titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.id = 'fieldTitle-' + index;
    titleInput.dataset.index = index;
    titleInput.value = header.title;
    titleInput.addEventListener('input', function (e) {
      var idx = parseInt(e.target.dataset.index, 10);
      state.fields[idx].title = e.target.value;
    });
    titleGroup.appendChild(titleLabel);
    titleGroup.appendChild(titleInput);
    card.appendChild(titleGroup);

    // 必填核取方塊
    var requiredGroup = document.createElement('div');
    requiredGroup.className = 'form-group checkbox-group';
    var requiredCheck = document.createElement('input');
    requiredCheck.type = 'checkbox';
    requiredCheck.id = 'fieldRequired-' + index;
    requiredCheck.dataset.index = index;
    requiredCheck.addEventListener('change', function (e) {
      var idx = parseInt(e.target.dataset.index, 10);
      state.fields[idx].required = e.target.checked;
    });
    var requiredLabel = document.createElement('label');
    requiredLabel.htmlFor = 'fieldRequired-' + index;
    requiredLabel.textContent = '必填';
    requiredGroup.appendChild(requiredCheck);
    requiredGroup.appendChild(requiredLabel);
    card.appendChild(requiredGroup);

    // 選項編輯器（僅選擇類型顯示）
    var optionsDiv = document.createElement('div');
    optionsDiv.className = 'options-editor hidden';
    optionsDiv.id = 'optionsEditor-' + index;
    optionsDiv.dataset.index = index;

    var optionsLabel = document.createElement('label');
    optionsLabel.textContent = '選項（每行一個）';
    optionsDiv.appendChild(optionsLabel);

    var optionsTextarea = document.createElement('textarea');
    optionsTextarea.rows = 3;
    optionsTextarea.placeholder = '請輸入選項，每行一個';
    optionsTextarea.dataset.index = index;
    optionsTextarea.addEventListener('input', function (e) {
      var idx = parseInt(e.target.dataset.index, 10);
      var lines = e.target.value.split('\n').filter(function (line) {
        return line.trim() !== '';
      });
      state.fields[idx].options = lines;
    });
    optionsDiv.appendChild(optionsTextarea);
    card.appendChild(optionsDiv);

    return card;
  }

  /**
   * 顯示或隱藏選項編輯器。
   * @param {HTMLElement} card - 欄位卡片元素
   * @param {string} type - 問題類型
   */
  function toggleOptionsEditor(card, type) {
    var editor = card.querySelector('.options-editor');
    if (!editor) return;

    if (CHOICE_TYPES.indexOf(type) !== -1) {
      editor.classList.remove('hidden');
    } else {
      editor.classList.add('hidden');
    }
  }

  /**
   * 載入資料夾清單（listFolders）。
   */
  function loadFolders() {
    var select = $('#folderSelect');
    select.disabled = true;
    select.innerHTML = '<option value="">載入中…</option>';
    clearMessage('step4Message');

    callGas({ action: 'listFolders' })
      .then(function (data) {
        state.folders = data || [];
        select.innerHTML = '';

        if (state.folders.length === 0) {
          select.innerHTML = '<option value="">找不到任何資料夾</option>';
          showError('step4Message', '您的 Google Drive 根目錄中沒有資料夾。');
          return;
        }

        var defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '請選擇資料夾';
        select.appendChild(defaultOption);

        for (var i = 0; i < state.folders.length; i++) {
          var opt = document.createElement('option');
          opt.value = state.folders[i].id;
          opt.textContent = state.folders[i].name;
          select.appendChild(opt);
        }
        select.disabled = false;

        // 若先前已選過，嘗試還原選取
        if (state.folderId) {
          select.value = state.folderId;
        }
      })
      .catch(function (err) {
        select.innerHTML = '<option value="">載入失敗</option>';
        showError('step4Message', err.message);
      });
  }

  /**
   * 建立表單（createForm）。
   */
  function createForm() {
    var resultsContainer = $('#resultsContainer');
    var loadingEl = $('#resultLoading');
    resultsContainer.style.display = 'none';
    loadingEl.style.display = 'block';
    clearMessage('step5Message');

    // 收集欄位資料，過濾掉空標題
    var fields = [];
    for (var i = 0; i < state.fields.length; i++) {
      var f = state.fields[i];
      if (!f.title || f.title.trim() === '') continue;
      var field = {
        title: f.title,
        type: f.type,
        required: !!f.required
      };
      if (CHOICE_TYPES.indexOf(f.type) !== -1) {
        field.options = f.options || [];
      }
      fields.push(field);
    }

    var payload = {
      action: 'createForm',
      title: state.formTitle,
      description: state.formDescription,
      folderId: state.folderId,
      fields: fields
    };

    callGas(payload)
      .then(function (data) {
        loadingEl.style.display = 'none';
        $('#editUrlResult').value = data.editUrl || '';
        $('#publishedUrlResult').value = data.publishedUrl || '';
        resultsContainer.style.display = 'block';
      })
      .catch(function (err) {
        loadingEl.style.display = 'none';
        showError('step5Message', err.message);
      });
  }

  // ==================== 步驟驗證 ====================

  /**
   * 驗證步驟一：GAS URL 是否已設定。
   * @return {boolean}
   */
  function validateStep0() {
    var url = $('#gasUrl').value.trim();
    if (!url) {
      showError('step0Message', '請輸入 GAS Web App URL。');
      return false;
    }
    try {
      new URL(url);
    } catch (e) {
      showError('step0Message', '請輸入有效的網址格式。');
      return false;
    }
    state.gasUrl = url;
    localStorage.setItem(STORAGE_KEY, url);
    clearMessage('step0Message');
    return true;
  }

  /**
   * 驗證步驟二：是否已選擇試算表。
   * @return {boolean}
   */
  function validateStep1() {
    var select = $('#spreadsheetSelect');
    var id = select.value;
    if (!id) {
      showError('step1Message', '請選擇一份試算表。');
      return false;
    }
    state.spreadsheetId = id;
    state.spreadsheetName = select.options[select.selectedIndex].textContent;
    // 切換試算表時重置下游狀態
    state.sheetName = '';
    state.headers = [];
    state.fields = [];
    clearMessage('step1Message');
    return true;
  }

  /**
   * 驗證步驟三：是否已選擇工作表。
   * @return {boolean}
   */
  function validateStep2() {
    var select = $('#sheetSelect');
    var name = select.value;
    if (!name) {
      showError('step2Message', '請選擇一個工作表分頁。');
      return false;
    }
    state.sheetName = name;
    // 切換工作表時重置下游狀態
    state.headers = [];
    state.fields = [];
    clearMessage('step2Message');
    return true;
  }

  /**
   * 驗證步驟四：是否所有欄位都有問題標題。
   * @return {boolean}
   */
  function validateStep3() {
    for (var i = 0; i < state.fields.length; i++) {
      if (!state.fields[i].title || state.fields[i].title.trim() === '') {
        showError('step3Message', '欄位 ' + (i + 1) + ' 的問題標題不可為空。');
        return false;
      }
    }
    clearMessage('step3Message');
    return true;
  }

  /**
   * 驗證步驟五：是否已選擇資料夾並輸入表單標題。
   * @return {boolean}
   */
  function validateStep4() {
    var folderId = $('#folderSelect').value;
    var formTitle = $('#formTitle').value.trim();

    if (!folderId) {
      showError('step4Message', '請選擇目標資料夾。');
      return false;
    }
    if (!formTitle) {
      showError('step4Message', '請輸入表單標題。');
      return false;
    }

    state.folderId = folderId;
    state.formTitle = formTitle;
    state.formDescription = $('#formDescription').value.trim();
    clearMessage('step4Message');
    return true;
  }

  // ==================== 事件綁定 ====================

  function initEvents() {
    // 步驟一
    $('#saveUrlBtn').addEventListener('click', function () {
      if (validateStep0()) {
        showSuccess('step0Message', 'GAS Web App URL 已儲存至瀏覽器。');
      }
    });

    $('#step0Next').addEventListener('click', function () {
      if (validateStep0()) {
        goToStep(1);
      }
    });

    // 步驟二
    $('#step1Back').addEventListener('click', function () {
      goToStep(0);
    });

    $('#step1Next').addEventListener('click', function () {
      if (validateStep1()) {
        goToStep(2);
      }
    });

    $('#refreshSpreadsheetsBtn').addEventListener('click', loadSpreadsheets);

    // 步驟三
    $('#step2Back').addEventListener('click', function () {
      goToStep(1);
    });

    $('#step2Next').addEventListener('click', function () {
      if (validateStep2()) {
        goToStep(3);
      }
    });

    $('#refreshSheetsBtn').addEventListener('click', function () {
      if (state.spreadsheetId) {
        loadSheets(state.spreadsheetId);
      }
    });

    // 步驟四
    $('#step3Back').addEventListener('click', function () {
      goToStep(2);
    });

    $('#step3Next').addEventListener('click', function () {
      if (validateStep3()) {
        goToStep(4);
      }
    });

    $('#refreshHeadersBtn').addEventListener('click', function () {
      if (state.spreadsheetId && state.sheetName) {
        state.headers = [];
        state.fields = [];
        loadHeaders(state.spreadsheetId, state.sheetName);
      }
    });

    // 步驟五
    $('#step4Back').addEventListener('click', function () {
      goToStep(3);
    });

    $('#step4Next').addEventListener('click', function () {
      if (validateStep4()) {
        goToStep(5);
      }
    });

    $('#refreshFoldersBtn').addEventListener('click', loadFolders);

    // 步驟六
    $('#step5Back').addEventListener('click', function () {
      goToStep(4);
    });

    $('#restartBtn').addEventListener('click', function () {
      // 重置狀態
      state.spreadsheetId = '';
      state.spreadsheetName = '';
      state.sheetName = '';
      state.headers = [];
      state.fields = [];
      state.folders = [];
      state.folderId = '';
      state.formTitle = '';
      state.formDescription = '';

      // 重置 UI
      $('#spreadsheetSelect').innerHTML = '<option value="">請選擇試算表</option>';
      $('#spreadsheetSelect').disabled = true;
      $('#sheetSelect').innerHTML = '<option value="">請選擇工作表</option>';
      $('#sheetSelect').disabled = true;
      $('#fieldsContainer').innerHTML = '';
      $('#folderSelect').innerHTML = '<option value="">請選擇資料夾</option>';
      $('#folderSelect').disabled = true;
      $('#formTitle').value = '';
      $('#formDescription').value = '';
      $('#editUrlResult').value = '';
      $('#publishedUrlResult').value = '';
      $('#resultsContainer').style.display = 'none';

      goToStep(0);
    });

    // 複製按鈕
    var copyButtons = $$('.copy-btn');
    for (var i = 0; i < copyButtons.length; i++) {
      copyButtons[i].addEventListener('click', function (e) {
        var targetId = e.target.dataset.target;
        var input = document.getElementById(targetId);
        if (input && input.value) {
          input.select();
          try {
            document.execCommand('copy');
            var originalText = e.target.textContent;
            e.target.textContent = '已複製！';
            setTimeout(function () {
              e.target.textContent = originalText;
            }, 2000);
          } catch (err) {
            showError('step5Message', '複製失敗，請手動選取文字複製。');
          }
        }
      });
    }

    // 步驟指示器點擊導覽（僅允許前往已完成的步驟）
    var dots = $$('.step-dot');
    for (var d = 0; d < dots.length; d++) {
      dots[d].addEventListener('click', function (e) {
        var targetStep = parseInt(e.target.dataset.step, 10);
        if (e.target.classList.contains('completed') || targetStep <= state.currentStep) {
          goToStep(targetStep);
        }
      });
    }
  }

  // ==================== 初始化 ====================

  function init() {
    // 從 localStorage 載入 GAS URL
    var storedUrl = localStorage.getItem(STORAGE_KEY);
    if (storedUrl) {
      state.gasUrl = storedUrl;
      $('#gasUrl').value = storedUrl;
    }

    initEvents();
    goToStep(0);
  }

  // DOM 載入完成後初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
