import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  context: { params: { symbol: string } }
) {
  const params = await context.params;
  const symbol = params.symbol?.trim().toUpperCase();

  if (!symbol) {
    return NextResponse.json({ detail: "請輸入股票代碼" }, { status: 400 });
  }

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Referer': 'https://finance.yahoo.com/'
  };

  try {
    // 1. Chart API (K線圖)
    const chartUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1y&interval=1d&includeTimestamps=true`;
    
    // 2. QuoteSummary API (財務指標：包含本益比、EPS、營收成長、分析師建議)
    const quoteUrl = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=defaultKeyStatistics,financialData,summaryDetail`;

    const [chartRes, quoteRes] = await Promise.all([
      fetch(chartUrl, { headers, next: { revalidate: 0 } }),
      fetch(quoteUrl, { headers, next: { revalidate: 0 } })
    ]);

    const chartData = await chartRes.json();
    const quoteData = await quoteRes.json();

    // 處理圖表數據
    const chartResult = chartData.chart?.result?.[0];
    if (!chartResult) {
      throw new Error(`找不到股票代碼: ${symbol}`);
    }

    const history_data = (chartResult.timestamp || []).map((ts: number, i: number) => ({
      date: new Date(ts * 1000).toISOString().slice(0, 10),
      open: chartResult.indicators.quote[0].open[i] || 0,
      high: chartResult.indicators.quote[0].high[i] || 0,
      low: chartResult.indicators.quote[0].low[i] || 0,
      close: chartResult.indicators.quote[0].close[i] || 0,
      volume: chartResult.indicators.quote[0].volume[i] || 0,
    })).filter((item: any) => item.close !== 0);

    // 處理財務數據
    const q = quoteData.quoteSummary?.result?.[0] || {};
    const financialData = q.financialData || {};
    const keyStats = q.defaultKeyStatistics || {};
    const summaryDetail = q.summaryDetail || {};

    // 提取數值 (Yahoo API 數值通常放在 .raw 中)
    const pe = summaryDetail.trailingPE?.raw ?? summaryDetail.forwardPE?.raw ?? null;
    const eps = keyStats.trailingEps?.raw ?? null;
    const marketCap = summaryDetail.marketCap?.raw ?? null;
    const revGrowth = financialData.revenueGrowth?.raw ?? null;
    const divYield = summaryDetail.dividendYield?.raw ?? null;

    return NextResponse.json({
      symbol,
      name: symbol, // quoteSummary 有時不包含名稱
      history: history_data,
      current_price: financialData.currentPrice?.raw ?? (history_data.length > 0 ? history_data[history_data.length - 1].close : 0),
      pe_ratio: pe ? Number(pe.toFixed(2)) : null,
      eps: eps ? Number(eps.toFixed(2)) : null,
      revenue_growth: revGrowth ? Number((revGrowth * 100).toFixed(2)) : null,
      market_cap: marketCap,
      dividend_yield: divYield ? Number((divYield * 100).toFixed(2)) : null,
      recommendation: financialData.recommendationKey ?? "N/A",
    });

  } catch (e: any) {
    console.error("Fetch Error:", e.message);
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}