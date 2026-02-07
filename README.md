# 台灣股票智慧分析網頁 Stock Intelligence

基於 Next.js 的股票分析應用，支援股價走勢圖（K 線/折線）與 AI 投資洞察。**單一專案即可部署，無需額外後端**。

## 功能

- **輸入股票代碼**：支援美股 (AAPL)、台股 (2330.TW) 等
- **歷史價格**：過去一年 K 線圖 / 折線圖，可切換顯示
- **基本面數據**：PE、EPS、營收成長、市值、股息等
- **AI 投資洞察**：約 200 字摘要（需 OpenAI API Key）
- **深色金融終端風格**：簡潔現代的 Dark Mode 介面

## 技術棧

- **前端**：Next.js 14、Tailwind CSS、Lightweight Charts（TradingView）、Recharts
- **API 路由**：Next.js API Routes、yahoo-finance2、OpenAI

## 快速開始（本地開發）

**前置需求**：需先安裝 [Node.js](https://nodejs.org/)（建議 LTS 版本）。

在終端機（PowerShell 或 CMD）執行：

```bash
cd e:\Cursor\frontend
npm install
npm run dev
```

若需 AI 分析功能，複製 `frontend\.env.example` 為 `frontend\.env.local`，填入 `OPENAI_API_KEY`。

在瀏覽器開啟 **http://localhost:3000** 即可使用。

**若 `npm` 指令無法辨識**：請確認 Node.js 已安裝並已加入系統 PATH，安裝後需重新開啟終端機。

## 部署至 Vercel（讓任何人透過連結使用）

1. 將專案推送到 GitHub
2. 前往 [vercel.com](https://vercel.com) 登入，點擊 **Import Project** 匯入此專案
3. **Root Directory** 設為 `frontend`
4. 在 **Environment Variables** 新增：
   - `OPENAI_API_KEY` = 你的 OpenAI API Key（用於 AI 投資洞察）
5. 點擊 **Deploy**

部署完成後會得到一個公開連結，例如：
`https://your-project.vercel.app`

任何人都可以透過此連結查詢股票、查看圖表與 AI 分析。

## 環境變數

| 變數 | 說明 | 必填 |
|------|------|------|
| `OPENAI_API_KEY` | OpenAI API Key，用於 AI 投資洞察 | 選填（未設定則 AI 分析按鈕會顯示錯誤） |

## 專案結構

```
├── frontend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── stock/[symbol]/route.ts   # 股票數據 API
│   │   │   └── analyze/route.ts          # AI 分析 API
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── StockChartKLine.tsx   # K 線 / 折線圖
│   │   ├── StockChart.tsx        # 備用折線圖
│   │   ├── MetricsPanel.tsx      # 基本面數據
│   │   └── AISummary.tsx         # AI 洞察摘要
│   └── vercel.json
├── backend/                      # 舊版 Python 後端（可選）
└── README.md
```

## 授權

MIT
