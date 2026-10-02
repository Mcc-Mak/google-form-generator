# 需求追溯矩陣 (Requirements Traceability Matrix)

本矩陣將每個需求 ID 追溯至對應的使用者故事、設計文件、程式模組與測試驗證點，確保需求從定義到實作到驗證的完整可追溯性。

## 1. 追溯矩陣

| 需求 ID | 需求描述 | 使用者故事 | 設計文件 | 前端程式模組 | 後端程式模組 | 測試驗證點 |
|---|---|---|---|---|---|---|
| FR-01 | 設定 GAS Web App URL | US-01 | PRD.md §3.1, SRS.md FR-01, Architecture.md §4 | `validateStep0()`, `getGasUrl()`, `init()` (app.js) | 無 | TVP-01：URL 為空時顯示錯誤；TVP-02：無效 URL 格式顯示錯誤；TVP-03：儲存後 localStorage 含 URL；TVP-04：重新載入頁面自動填入 URL |
| FR-02 | 列出試算表 | US-02 | PRD.md §3.2, SRS.md FR-02, API.md §1, ADR.md ADR-02 | `loadSpreadsheets()` (app.js) | `handleListSpreadsheets()` (Code.gs) | TVP-05：下拉選單顯示試算表清單；TVP-06：無試算表時顯示「找不到任何試算表」；TVP-07：未選擇時下一步顯示錯誤 |
| FR-03 | 列出工作表 | US-03 | PRD.md §3.3, SRS.md FR-03, API.md §2, ADR.md ADR-02 | `loadSheets()` (app.js) | `handleListSheets()` (Code.gs) | TVP-08：下拉選單顯示工作表清單；TVP-09：未選擇時下一步顯示錯誤；TVP-10：切換試算表時重置工作表狀態 |
| FR-04 | 取得欄位標題 | US-04 | PRD.md §3.4, SRS.md FR-04, API.md §3, Schema.md §1, ADR.md ADR-03 | `loadHeaders()`, `renderFields()` (app.js) | `handleGetHeaders()` (Code.gs) | TVP-11：步驟四顯示所有欄位卡片；TVP-12：每張卡片顯示原始欄位標題；TVP-13：空白標題欄位仍被讀取 |
| FR-05 | 設定表單欄位 | US-04 | PRD.md §3.4, SRS.md FR-05, Schema.md §2-3 | `createFieldCard()`, `toggleOptionsEditor()`, `validateStep3()` (app.js) | 無 | TVP-14：8 種問題類型可選擇；TVP-15：選擇類型顯示選項編輯器；TVP-16：非選擇類型隱藏選項編輯器；TVP-17：必填核取方塊可勾選；TVP-18：空白標題驗證失敗 |
| FR-06 | 列出資料夾 | US-05 | PRD.md §3.5, SRS.md FR-06, API.md §4 | `loadFolders()` (app.js) | `handleListFolders()` (Code.gs) | TVP-19：下拉選單顯示資料夾清單；TVP-20：無資料夾時顯示「找不到任何資料夾」；TVP-21：未選擇時下一步顯示錯誤 |
| FR-07 | 建立 Google 表單 | US-06 | PRD.md §3.6, SRS.md FR-07, API.md §5, Schema.md §2, Architecture.md §3.2 | `createForm()` (app.js) | `handleCreateForm()` (Code.gs) | TVP-22：表單建立成功回傳 editUrl + publishedUrl；TVP-23：表單移動至指定資料夾；TVP-24：未知欄位類型回傳錯誤；TVP-25：建立中顯示載入訊息 |
| FR-08 | 顯示結果與複製連結 | US-06 | PRD.md §3.6, SRS.md FR-08 | 結果區域、複製按鈕事件 (app.js) | 無 | TVP-26：成功顯示 editUrl 與 publishedUrl；TVP-27：複製按鈕複製連結至剪貼簿；TVP-28：複製後按鈕顯示「已複製！」 |
| FR-09 | 重新開始 | US-07 | SRS.md FR-09, UserStories.md US-07 | `restartBtn` 事件 (app.js) | 無 | TVP-29：點擊重新開始重置所有狀態；TVP-30：重置後回到步驟一 |
| NFR-01 | 繁體中文 | — | SRS.md NFR-01, AGENTS.md | 所有 UI 字串 (app.js, index.html) | 錯誤訊息 (Code.gs) | TVP-31：所有介面文字為繁體中文；TVP-32：錯誤訊息為繁體中文 |
| NFR-02 | 純 Vanilla JS | — | SRS.md NFR-02, Architecture.md §4 | IIFE 封裝，無外部引用 (app.js) | — | TVP-33：HTML 無外部 script/link 標籤；TVP-34：JS 無 import/require |
| NFR-03 | 前端無敏感資訊 | — | SRS.md NFR-03, ADR.md ADR-01, Architecture.md §2 | 無 API 金鑰 (app.js) | 所有 API 呼叫 (Code.gs) | TVP-35：前端程式碼搜尋無 API key/secret/token |
| NFR-04 | 回應式設計 | — | SRS.md NFR-04 | `@media` 斷點 (style.css) | — | TVP-36：手機寬度 (375px) 介面正常；TVP-37：桌面寬度 (1024px) 介面正常 |
| NFR-05 | 無障礙 | — | SRS.md NFR-05 | `focus-visible`, `prefers-reduced-motion` (style.css) | — | TVP-38：鍵盤 Tab 可導覽所有互動元素；TVP-39：`prefers-reduced-motion` 停用動畫 |
| NFR-06 | 錯誤處理 | — | SRS.md NFR-06, Architecture.md §6 | `callGas()` 錯誤分類 (app.js) | try/catch (Code.gs) | TVP-40：網路斷線顯示「無法連線至後端服務」；TVP-41：業務錯誤顯示後端 error 訊息 |
| NFR-07 | 資料暫存 | — | SRS.md NFR-07 | `localStorage` (app.js) | — | TVP-42：URL 儲存於 localStorage 鍵 `gasWebAppUrl` |
| NFR-08 | API 一致性 | — | SRS.md NFR-08, API.md | — | 所有回應 (Code.gs) | TVP-43：所有回應含 `ok` 欄位；TVP-44：成功回應含 `data`；TVP-45：失敗回應含 `error` |
| NFR-09 | 部署 | — | SRS.md NFR-09, QuickStart.md | GitHub Pages | clasp → GAS | TVP-46：GitHub Pages 可存取前端；TVP-47：GAS Web App URL 可回應 |

## 2. 測試驗證點清單

| TVP ID | 驗證點 | 對應需求 | 驗證方式 |
|---|---|---|---|
| TVP-01 | URL 為空時顯示錯誤 | FR-01 | 手動測試：清空輸入框，點擊下一步 |
| TVP-02 | 無效 URL 格式顯示錯誤 | FR-01 | 手動測試：輸入非 URL 字串 |
| TVP-03 | 儲存後 localStorage 含 URL | FR-01 | 瀏覽器 DevTools 檢查 localStorage |
| TVP-04 | 重新載入頁面自動填入 URL | FR-01 | 重新整理頁面，檢查輸入框 |
| TVP-05 | 下拉選單顯示試算表清單 | FR-02 | 進入步驟二，檢查下拉選單內容 |
| TVP-06 | 無試算表時顯示提示 | FR-02 | 使用無試算表的 Google 帳號測試 |
| TVP-07 | 未選擇試算表時下一步顯示錯誤 | FR-02 | 不選擇直接點擊下一步 |
| TVP-08 | 下拉選單顯示工作表清單 | FR-03 | 進入步驟三，檢查下拉選單內容 |
| TVP-09 | 未選擇工作表時下一步顯示錯誤 | FR-03 | 不選擇直接點擊下一步 |
| TVP-10 | 切換試算表時重置工作表狀態 | FR-03 | 選擇試算表 A → 返回 → 選擇試算表 B |
| TVP-11 | 步驟四顯示所有欄位卡片 | FR-04 | 進入步驟四，檢查卡片數量 |
| TVP-12 | 每張卡片顯示原始欄位標題 | FR-04 | 檢查卡片上的「資料欄位」文字 |
| TVP-13 | 空白標題欄位仍被讀取 | FR-04 | 試算表含空白標題欄位，檢查卡片 |
| TVP-14 | 8 種問題類型可選擇 | FR-05 | 檢查每張卡片的類型下拉選單 |
| TVP-15 | 選擇類型顯示選項編輯器 | FR-05 | 選擇「單選」，檢查選項編輯器出現 |
| TVP-16 | 非選擇類型隱藏選項編輯器 | FR-05 | 選擇「簡答」，檢查選項編輯器隱藏 |
| TVP-17 | 必填核取方塊可勾選 | FR-05 | 勾選必填核取方塊 |
| TVP-18 | 空白標題驗證失敗 | FR-05 | 清空問題標題，點擊下一步 |
| TVP-19 | 下拉選單顯示資料夾清單 | FR-06 | 進入步驟五，檢查下拉選單內容 |
| TVP-20 | 無資料夾時顯示提示 | FR-06 | 使用無資料夾的 Google 帳號測試 |
| TVP-21 | 未選擇資料夾時下一步顯示錯誤 | FR-06 | 不選擇直接點擊下一步 |
| TVP-22 | 表單建立成功回傳連結 | FR-07 | 完成所有步驟，檢查結果頁面 |
| TVP-23 | 表單移動至指定資料夾 | FR-07 | 建立後至 Drive 檢查表單位置 |
| TVP-24 | 未知欄位類型回傳錯誤 | FR-07 | 發送含未知 type 的請求 |
| TVP-25 | 建立中顯示載入訊息 | FR-07 | 進入步驟六，檢查載入訊息 |
| TVP-26 | 成功顯示 editUrl 與 publishedUrl | FR-08 | 檢查結果頁面連結 |
| TVP-27 | 複製按鈕複製連結 | FR-08 | 點擊複製按鈕，貼上檢查 |
| TVP-28 | 複製後按鈕顯示「已複製！」 | FR-08 | 點擊複製按鈕，觀察按鈕文字 |
| TVP-29 | 重新開始重置所有狀態 | FR-09 | 點擊重新開始，檢查各步驟狀態 |
| TVP-30 | 重置後回到步驟一 | FR-09 | 點擊重新開始，檢查目前步驟 |
| TVP-31 | 介面文字為繁體中文 | NFR-01 | 檢查所有頁面文字 |
| TVP-32 | 錯誤訊息為繁體中文 | NFR-01 | 觸發各種錯誤，檢查訊息 |
| TVP-33 | HTML 無外部 script/link | NFR-02 | 檢查 index.html 原始碼 |
| TVP-34 | JS 無 import/require | NFR-02 | 檢查 app.js 原始碼 |
| TVP-35 | 前端無 API 金鑰 | NFR-03 | 搜尋 app.js 中的 key/secret/token |
| TVP-36 | 手機寬度介面正常 | NFR-04 | 以 375px 寬度檢視 |
| TVP-37 | 桌面寬度介面正常 | NFR-04 | 以 1024px 寬度檢視 |
| TVP-38 | 鍵盤 Tab 可導覽 | NFR-05 | 使用 Tab 鍵導覽所有互動元素 |
| TVP-39 | prefers-reduced-motion 停用動畫 | NFR-05 | 設定系統偏好，檢查動畫 |
| TVP-40 | 網路斷線顯示錯誤 | NFR-06 | 斷網後操作精靈 |
| TVP-41 | 業務錯誤顯示後端訊息 | NFR-06 | 發送錯誤請求，檢查訊息 |
| TVP-42 | URL 儲存於 localStorage | NFR-07 | DevTools 檢查 localStorage |
| TVP-43 | 所有回應含 ok 欄位 | NFR-08 | 檢查所有 API 回應 |
| TVP-44 | 成功回應含 data | NFR-08 | 檢查成功回應 |
| TVP-45 | 失敗回應含 error | NFR-08 | 檢查失敗回應 |
| TVP-46 | GitHub Pages 可存取 | NFR-09 | 開啟 Pages URL |
| TVP-47 | GAS Web App 可回應 | NFR-09 | 發送請求至 GAS URL |
