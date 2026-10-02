# 快速入門 (QuickStart)

本文件引導您完成本機預覽、GAS 後端部署與 GitHub Pages 前端部署。

## 1. 本機前端預覽

### 1.1 直接開啟

最簡單的方式是直接用瀏覽器開啟 `index.html`：

```bash
# 直接以瀏覽器開啟
open codebase/gh/index.html        # macOS
xdg-open codebase/gh/index.html     # Linux
start codebase/gh/index.html        # Windows
```

### 1.2 使用 HTTP 伺服器

若需模擬正式環境（例如測試 `fetch` 行為），建議使用簡易 HTTP 伺服器：

```bash
# 使用 Python 內建 HTTP 伺服器
cd codebase/gh
python3 -m http.server 8080

# 或使用 Node.js 的 http-server
npx http-server codebase/gh -p 8080
```

開啟瀏覽器前往 `http://localhost:8080` 即可看到精靈介面。

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

## 4. 設定 GitHub Pages

### 4.1 推送前端至 GitHub

#### 方法 A：使用 `gh-pages` 分支

```bash
# 建立 gh-pages 分支
git checkout -b gh-pages

# 將前端檔案複製到分支根目錄
cp codebase/gh/index.html .
cp codebase/gh/app.js .
cp codebase/gh/style.css .

# 提交並推送
git add .
git commit -m "Deploy frontend to GitHub Pages"
git push origin gh-pages
```

#### 方法 B：使用 `/docs` 目錄

```bash
# 將前端檔案複製到 /docs 目錄
mkdir -p docs
cp codebase/gh/index.html docs/
cp codebase/gh/app.js docs/
cp codebase/gh/style.css docs/

# 提交並推送
git add docs
git commit -m "Add GitHub Pages content to /docs"
git push origin main
```

### 4.2 設定 GitHub Pages 來源

1. 前往 GitHub 儲存庫的「Settings」頁面。
2. 左側選單找到「Pages」。
3. 在「Source」區塊：
   - 方法 A：選擇 `gh-pages` 分支、`/(root)` 目錄。
   - 方法 B：選擇 `main` 分支、`/docs` 目錄。
4. 點擊「Save」。

### 4.3 取得 GitHub Pages URL

設定完成後，GitHub 會顯示 Pages URL，格式如下：

```
https://your-username.github.io/your-repo/
```

### 4.4 在精靈中更新 GAS URL

1. 開啟 GitHub Pages 網站。
2. 在步驟一輸入您的 GAS Web App URL。
3. 點擊「儲存網址」將 URL 暫存至瀏覽器。
4. 依精靈步驟完成表單建立。

> **提示**：GAS URL 會儲存在瀏覽器的 `localStorage` 中（鍵名 `gasWebAppUrl`），下次開啟時會自動填入。

## 5. 完整部署檢查清單

| 步驟 | 狀態 |
|---|---|
| 安裝 clasp 並登入 | ☐ |
| 建立 `.clasp.json` 並設定 scriptId | ☐ |
| 執行 `clasp push` 推送後端程式碼 | ☐ |
| 在 GAS 部署為 Web App（存取設為「任何人」） | ☐ |
| 取得 GAS Web App URL | ☐ |
| 推送前端至 `gh-pages` 分支或 `/docs` 目錄 | ☐ |
| 在 GitHub Settings → Pages 設定來源 | ☐ |
| 開啟 GitHub Pages 網站並輸入 GAS URL | ☐ |
| 完整測試精靈 6 步驟流程 | ☐ |
