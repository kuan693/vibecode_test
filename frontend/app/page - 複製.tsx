"use client";

import { useState } from "react";
import { StockChartKLine } from "@/components/StockChartKLine";
import { MetricsPanel } from "@/components/MetricsPanel";
import { AISummary } from "@/components/AISummary";

const API_BASE = ""; // 使用 Next.js 同源 API 路由

export type StockData = {
  symbol: string;
  name: string;
  history: { date: string; open: number; high: number; low: number; close: number; volume: number }[];
  current_price: number;
  pe_ratio: number | null;
  eps: number | null;
  revenue_growth: number | null;
  market_cap: number | null;
  dividend_yield: number | null;
  recommendation: string | null;
};

export default function Home() {
  const [symbol, setSymbol] = useState("");
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const fetchStock = async () => {
    const s = symbol.trim();
    if (!s) {
      setError("請輸入股票代碼");
      return;
    }
    setError(null);
    setStockData(null);
    setAiSummary(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/stock/${encodeURIComponent(s)}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setStockData(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "取得數據失敗");
    } finally {
      setLoading(false);
    }
  };

  const fetchAIAnalysis = async () => {
    if (!stockData) return;
    setAiLoading(true);
    setAiSummary(null);
    try {
      const res = await fetch(`${API_BASE}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: stockData.symbol,
          stock_data: {
            name: stockData.name,
            current_price: stockData.current_price,
            pe_ratio: stockData.pe_ratio,
            eps: stockData.eps,
            revenue_growth: stockData.revenue_growth,
            market_cap: stockData.market_cap,
            dividend_yield: stockData.dividend_yield,
            recommendation: stockData.recommendation,
          },
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }
      const { summary } = await res.json();
      setAiSummary(summary);
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI 分析失敗");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-6 lg:p-10">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-10 border-b border-terminal-border pb-6">
          <h1 className="font-mono text-2xl font-semibold tracking-tight text-terminal-accent">
            台灣股票智慧分析
          </h1>
          <p className="mt-1 text-sm text-terminal-text/70">
            輸入代碼查股價 · K 線 / 折線圖 · AI 投資洞察
          </p>
        </header>

        {/* Search Bar */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-1 gap-2">
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && fetchStock()}
              placeholder="輸入股票代碼 (例: AAPL, 2330.TW)"
              className="font-mono w-full rounded-lg border border-terminal-border bg-terminal-surface px-4 py-3 text-terminal-text placeholder:text-terminal-text/50 focus:border-terminal-accent focus:outline-none focus:ring-1 focus:ring-terminal-accent"
            />
            <button
              onClick={fetchStock}
              disabled={loading}
              className="rounded-lg bg-terminal-accent px-6 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "載入中…" : "查詢"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-terminal-red/50 bg-terminal-red/10 px-4 py-3 text-terminal-red">
            {error}
          </div>
        )}

        {stockData && (
          <div className="space-y-6">
            <MetricsPanel data={stockData} />
            <div className="rounded-xl border border-terminal-border bg-terminal-surface p-6">
              <h2 className="font-mono mb-4 text-lg font-medium text-terminal-accent">
                股價走勢
              </h2>
              <StockChartKLine history={stockData.history} />
            </div>

            <div className="rounded-xl border border-terminal-border bg-terminal-surface p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-mono text-lg font-medium text-terminal-accent">
                  AI 投資洞察
                </h2>
                <button
                  onClick={fetchAIAnalysis}
                  disabled={aiLoading}
                  className="rounded-lg border border-terminal-accent px-4 py-2 text-sm font-medium text-terminal-accent transition hover:bg-terminal-accent/10 disabled:opacity-50"
                >
                  {aiLoading ? "分析中…" : "生成摘要"}
                </button>
              </div>
              <AISummary content={aiSummary} loading={aiLoading} />
            </div>
          </div>
        )}

        {!stockData && !loading && !error && (
          <div className="rounded-xl border border-dashed border-terminal-border bg-terminal-surface/50 p-16 text-center">
            <p className="text-terminal-text/60">
              輸入股票代碼後按查詢，即可取得過去一年的股價走勢與基本面數據
            </p>
            <p className="mt-2 text-sm text-terminal-text/40">
              支援台股 (例: 2330.TW)、美股 (例: AAPL) 等
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
