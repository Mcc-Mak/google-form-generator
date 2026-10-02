# 快速入門 (QuickStart)

本文件引導您完成本機預覽、GAS 後端部署與 GitHub Pages 前端部署。

## 1. 本機前端預覽

### 1.1 安裝相依套件

```bash
cd codebase/gh
npm install
```

### 1.2 啟動開發伺服器

```bash
npm run dev
```

Vite 會啟動本機開發伺服器，預設網址為 `http://localhost:5173`，開啟瀏覽器前往該網址即可看到精靈介面。

### 1.3 建置正式版本

```bash
npm run build    # 輸出至 codebase/gh/dist/
npm run preview  # 本機預覽建置結果
```

### 1.4 程式碼檢查

```bash
npm run lint     # ESLint 檢查
```

> **注意**：本機預覽時，步驟一需輸入已部署的 GAS Web App URL 才能與後端通訊。

## 2. clasp 設定

### 2.1 安裝 clasp

```bash
# 全域安裝 clasp（需要 Node.js）
npm install -g @google/clasp
```

### 2.2 登入 Google 帳號

```bash
clasp login
```

瀏覽器會開啟 Google 授權頁面，請以您的 Google 帳號登入並授權 clasp。

### 2.3 建立 `.clasp.json`

在 `codebase/gas/` 目錄下建立 `.clasp.json` 檔案，內容如下：

```json
{
  "scriptId": "您的 GAS 專案 ID",
  "rootDir": "."
}
```

> **取得 scriptId**：前往 [Google Apps Script 主控台](https://script.google.com/)，建立新專案或開啟現有專案，從專案設定頁面複製「指令碼 ID」。

### 2.4 推送程式碼

```bash
cd codebase/gas
clasp push
```

clasp 會將 `Code.gs` 與 `appsscript.json` 推送至 GAS 專案。

## 3. 部署為 Web App

### 3.1 建立新版本

在 GAS 編輯器中：

1. 點擊右上角「部署」→「新部署」。
2. 選擇類型「網頁應用程式」。
3. 填寫說明（例如 `v0.2.0`）。
4. 設定：
   - **執行身分**：`我`（即部署者，`USER_DEPLOYING`）
   - **存取權限**：`任何人`（`ANYONE_ANONYMOUS`）
5. 點擊「部署」。

### 3.2 授權

首次部署時，Google 會要求授權以下權限：

- 查看及管理您的 Google 試算表
- 查看及管理您的 Google 表單
- 查看及管理您 Google 雲端硬碟中的檔案
- 連線至外部服務

請點擊「允許」完成授權。

### 3.3 取得 Web App URL

部署完成後，系統會顯示 Web App URL，格式如下：

```
https://script.google.com/macros/s/.../exec
```

請複製此 URL，前端精靈步驟一需要輸入此 URL。

### 3.4 更新部署

若後端程式碼有更新：

```bash
cd codebase/gas
clasp push
```

然後在 GAS 編輯器中：
1. 點擊「部署」→「管理部署」。
2. 選擇現有的 Web App 部署。
3. 點擊「編輯」→選擇新版本→「部署」。

> **重要**：更新部署後，Web App URL 不會改變。

## 4. CI Secrets 設定

GAS 後端 CI 部署（`.github/workflows/gas.yml`）需要以下 GitHub Secrets：

### 4.1 `GAS_SCRIPT_ID`

GAS 專案的指令碼 ID。前往 [Google Apps Script 主控台](https://script.google.com/) → 專案設定 → 複製「指令碼 ID」。

### 4.2 `CLASPRC_JSON`

完整的 `~/.clasprc.json` 檔案內容。在本機執行 `clasp login` 後，此檔案會自動產生於 `~/.clasprc.json`。

取得方式：

```bash
cat ~/.clasprc.json
```

將整個 JSON 內容（包含 `token`、`oauth2ClientSettings`、`isLocalCreds` 等欄位）原樣貼入 GitHub Secret。

> **安全性提示**：`~/.clasprc.json` 包含 OAuth refresh token，請勿提交至版本控制系統。

### 4.3 新增 Secrets

1. 前往 GitHub 儲存庫的「Settings」頁面。
2. 左側選單找到「Secrets and variables」→「Actions」。
3. 點擊「New repository secret」，分別新增 `GAS_SCRIPT_ID` 與 `CLASPRC_JSON`。

## 5. GitHub Pages 部署

### 5.1 CI 自動部署

前端部署已整合至 CI pipeline（`.github/workflows/gh.yml`）。當推送到 `dev-001` 分支時，CI 會自動執行以下步驟：

1. `npm ci` 安裝相依套件
2. `npm run lint` 程式碼檢查
3. `npm run build` 建置正式版本
4. 推進分支：`dev-001 → dev → main`
5. 部署 `dist/` 至 GitHub Pages

### 5.2 設定 GitHub Pages 來源

1. 前往 GitHub 儲存庫的「Settings」頁面。
2. 左側選單找到「Pages」。
3. 在「Source」區塊選擇 **GitHub Actions**。
4. 儲存設定。

### 5.3 取得 GitHub Pages URL

CI 部署完成後，GitHub 會顯示 Pages URL，格式如下：

```
https://your-username.github.io/your-repo/
```

> **注意**：`vite.config.js` 中已設定 `base: '/google-form-generator/'`，以對應 GitHub Pages 子路徑。若您的儲存庫名稱不同，請同步修改此設定。

## 6. 完整部署檢查清單

| 步驟 | 狀態 |
|---|---|
| 安裝 clasp 並登入 | ☐ |
| 建立 `.clasp.json` 並設定 scriptId | ☐ |
| 執行 `clasp push` 推送後端程式碼 | ☐ |
| 在 GAS 部署為 Web App（存取設為「任何人」） | ☐ |
| 取得 GAS Web App URL | ☐ |
| GitHub Settings → Secrets 新增 `GAS_SCRIPT_ID` 與 `CLASPRC_JSON` | ☐ |
| GitHub Settings → Pages 設定來源為 GitHub Actions | ☐ |
| 推送 `dev-001` 觸發 CI 建置與部署 | ☐ |
| 開啟 GitHub Pages 網站並輸入 GAS URL | ☐ |
| 完整測試精靈 6 步驟流程 | ☐ |
