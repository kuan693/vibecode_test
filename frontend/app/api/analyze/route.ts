import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { detail: "未設定 OPENAI_API_KEY，請在 Vercel 環境變數中設定" },
      { status: 503 }
    );
  }

  let body: { symbol: string; stock_data: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ detail: "無效的請求內容" }, { status: 400 });
  }

  const { symbol, stock_data: data } = body;
  if (!symbol || !data) {
    return NextResponse.json({ detail: "缺少 symbol 或 stock_data" }, { status: 400 });
  }

  const metricsText = `
股票代碼：${symbol}
公司名稱：${data.name ?? "N/A"}
當前股價：${data.current_price ?? "N/A"}
本益比 (PE)：${data.pe_ratio ?? "N/A"}
每股盈餘 (EPS)：${data.eps ?? "N/A"}
營收成長率 (%)：${data.revenue_growth ?? "N/A"}
市值：${data.market_cap ?? "N/A"}
股息殖利率 (%)：${data.dividend_yield ?? "N/A"}
分析師建議：${data.recommendation ?? "N/A"}
`.trim();

  try {
    const client = new OpenAI({ apiKey });
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "你是專業的投資分析師，根據提供的股票基本面數據，用繁體中文撰寫約 200 字的投資洞察摘要。內容應包含：簡要評價、風險提示、投資建議方向。語氣專業但易讀，避免過度樂觀或悲觀。",
        },
        {
          role: "user",
          content: `請根據以下股票數據撰寫投資洞察摘要：\n\n${metricsText}`,
        },
      ],
      max_tokens: 400,
      temperature: 0.6,
    });

    const summary = response.choices[0]?.message?.content?.trim() ?? "";
    return NextResponse.json({ symbol, summary });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "AI 分析失敗";
    return NextResponse.json({ detail: msg }, { status: 500 });
  }
}
