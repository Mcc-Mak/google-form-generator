# Changelog

本專案版本依 `major.minor.patch` 格式管理。

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
