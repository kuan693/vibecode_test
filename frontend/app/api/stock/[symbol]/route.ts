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
    const chartUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1y&interval=1d&includeTimestamps=true`;
    // 增加 modules 數量以確保覆蓋率
    const quoteUrl = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=defaultKeyStatistics,financialData,summaryDetail,assetProfile`;

    const [chartRes, quoteRes] = await Promise.all([
      fetch(chartUrl, { headers, next: { revalidate: 0 } }),
      fetch(quoteUrl, { headers, next: { revalidate: 0 } })
    ]);

    const chartData = await chartRes.json();
    const quoteData = await quoteRes.json();

    // 1. 處理圖表
    const chartResult = chartData.chart?.result?.[0];
    if (!chartResult) throw new Error(`找不到股票代碼: ${symbol}`);

    const history_data = (chartResult.timestamp || []).map((ts: number, i: number) => ({
      date: new Date(ts * 1000).toISOString().slice(0, 10),
      open: chartResult.indicators.quote[0].open?.[i] || 0,
      high: chartResult.indicators.quote[0].high?.[i] || 0,
      low: chartResult.indicators.quote[0].low?.[i] || 0,
      close: chartResult.indicators.quote[0].close?.[i] || 0,
      volume: chartResult.indicators.quote[0].volume?.[i] || 0,
    })).filter((item: any) => item.close !== 0);

    // 2. 處理財務數據 (增加更嚴謹的鏈式調用)
    const result = quoteData.quoteSummary?.result?.[0] || {};
    const financialData = result.financialData || {};
    const keyStats = result.defaultKeyStatistics || {};
    const summaryDetail = result.summaryDetail || {};
    const assetProfile = result.assetProfile || {};

    // 提取數值邏輯優化
    const getValue = (obj: any) => obj?.raw ?? null;

    // 修正: PE 有時在 summaryDetail，有時在 keyStats
    const pe = getValue(summaryDetail.trailingPE) || getValue(summaryDetail.forwardPE);
    const eps = getValue(keyStats.trailingEps) || getValue(keyStats.forwardEps);
    const marketCap = getValue(summaryDetail.marketCap);
    const revGrowth = getValue(financialData.revenueGrowth);
    const divYield = getValue(summaryDetail.dividendYield);
    const recommendation = financialData.recommendationKey || "N/A";

    return NextResponse.json({
      symbol,
      name: assetProfile.longName || symbol, // 嘗試獲取完整名稱
      history: history_data,
      current_price: getValue(financialData.currentPrice) || (history_data.length > 0 ? history_data[history_data.length - 1].close : 0),
      pe_ratio: pe ? Number(pe.toFixed(2)) : null,
      eps: eps ? Number(eps.toFixed(2)) : null,
      revenue_growth: revGrowth ? Number((revGrowth * 100).toFixed(2)) : null,
      market_cap: marketCap,
      dividend_yield: divYield ? Number((divYield * 100).toFixed(2)) : null,
      recommendation: recommendation.replace(/_/g, ' '), // 將 strong_buy 轉為 strong buy
    });

  } catch (e: any) {
    console.error("Fetch Error:", e.message);
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}