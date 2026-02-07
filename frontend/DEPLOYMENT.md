# 部署指南 - 台灣股票智慧分析網頁

## 透過 Vercel 一鍵部署（推薦）

1. **將專案推送到 GitHub**
   - 若尚未有 repo，可先在 GitHub 建立新專案並 push

2. **連結 Vercel**
   - 前往 [vercel.com](https://vercel.com) 並登入
   - 點擊 **Add New** → **Project**
   - 選擇你的 GitHub 倉庫

3. **設定專案**
   - **Root Directory**：點擊 Edit，選擇 `frontend` 資料夾
   - **Framework Preset**：Next.js（會自動偵測）
   - **Build Command**：`npm run build`（預設）
   - **Output Directory**：`.next`（預設）

4. **環境變數（AI 分析功能）**
   - 展開 **Environment Variables**
   - 新增：`OPENAI_API_KEY` = `sk-你的OpenAI金鑰`
   - 選填：未設定時，股票查詢與圖表仍可使用，僅 AI 分析會顯示錯誤

5. **部署**
   - 點擊 **Deploy**
   - 約 1–2 分鐘後完成，會顯示你的公開連結

## 公開連結範例

部署成功後會得到如：

```
https://stock-intelligence-xxx.vercel.app
```

將此連結分享給任何人即可使用，無需安裝或登入。

## 本地測試

```bash
cd frontend
npm install
# 建立 .env.local，填入 OPENAI_API_KEY
npm run dev
```

開啟 http://localhost:3000 進行測試。
