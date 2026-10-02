# Changelog

本專案版本依 `major.minor.patch` 格式管理。

## 0.2.0

- 新增前端精靈 UI（`codebase/gh/`）：6 步驟表單建立精靈，包含 GAS URL 輸入、試算表選擇、工作表選擇、欄位設定（8 種問題類型）、資料夾與表單資訊、結果顯示，純 Vanilla JS 實作，無外部相依。
- 新增 GAS 後端（`codebase/gas/`）：5 個 action 端點（`listSpreadsheets`、`listSheets`、`getHeaders`、`listFolders`、`createForm`），透過 `doGet` / `doPost` 路由，所有回應為 JSON 格式 `{ ok, data?, error? }`。
- 新增完整文件（`docbase/`）：12 份文件涵蓋專案章程、產品需求、軟體需求規格、使用者故事、架構決策記錄、架構說明、API 文件、資料結構、實體關係圖、快速入門、交叉參考矩陣、需求追溯矩陣，所有內容以繁體中文撰寫並使用 Mermaid 圖表。

## 0.1.0

- 新增 `AGENTS.md`：專案棧、目錄結構、文件規範、Git 流程與 GAS 部署說明。
- 更新 `README.md`：開頭加入 `docbase/TOCTREE.md` 文件索引連結。
