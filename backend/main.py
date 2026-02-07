"""
股票智慧分析 API - FastAPI 後端
使用 yfinance 抓取數據，透過 OpenAI 生成投資洞察
"""
import os

from dotenv import load_dotenv

load_dotenv()
from datetime import datetime, timedelta
from typing import Optional

import yfinance as yf
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI

app = FastAPI(title="股票智慧分析 API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class StockDataResponse(BaseModel):
    symbol: str
    name: str
    history: list[dict]
    current_price: float
    pe_ratio: Optional[float]
    eps: Optional[float]
    revenue_growth: Optional[float]
    market_cap: Optional[int]
    dividend_yield: Optional[float]
    recommendation: Optional[str]


class AnalyzeRequest(BaseModel):
    symbol: str
    stock_data: dict


def get_revenue_growth(ticker: yf.Ticker) -> Optional[float]:
    """取得營收成長率（YoY）"""
    try:
        financials = ticker.financials
        if financials is None or financials.empty:
            return None
        if "Total Revenue" in financials.index:
            rev = financials.loc["Total Revenue"]
            rev = rev.dropna()
            if len(rev) >= 2:
                return float((rev.iloc[0] - rev.iloc[1]) / rev.iloc[1] * 100)
        return None
    except Exception:
        return None


@app.get("/api/stock/{symbol}", response_model=StockDataResponse)
async def get_stock_data(symbol: str):
    """取得股票歷史價格與基本面數據"""
    symbol = symbol.strip().upper()
    ticker = yf.Ticker(symbol)

    try:
        info = ticker.info
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"無法取得股票資訊: {str(e)}")

    if not info or "regularMarketPrice" not in info and "currentPrice" not in info:
        raise HTTPException(status_code=404, detail=f"找不到股票代碼: {symbol}")

    # 歷史價格（過去一年）
    end = datetime.now()
    start = end - timedelta(days=365)
    hist = ticker.history(start=start, end=end, interval="1d")

    if hist.empty:
        raise HTTPException(status_code=404, detail=f"無法取得 {symbol} 的歷史價格數據")

    history_data = [
        {
            "date": row[0].strftime("%Y-%m-%d"),
            "open": round(row[1], 2),
            "high": round(row[2], 2),
            "low": round(row[3], 2),
            "close": round(row[4], 2),
            "volume": int(row[5]),
        }
        for row in hist.itertuples()
    ]

    current_price = info.get("regularMarketPrice") or info.get("currentPrice") or hist["Close"].iloc[-1]
    pe = info.get("trailingPE") or info.get("forwardPE")
    eps = info.get("trailingEps") or info.get("forwardEps")
    market_cap = info.get("marketCap")
    div_yield = info.get("dividendYield")
    if div_yield and div_yield < 1:
        div_yield = div_yield * 100  # 若為小數形式則轉為百分比

    revenue_growth = get_revenue_growth(ticker)
    rec = info.get("recommendationKey")

    return StockDataResponse(
        symbol=symbol,
        name=info.get("shortName") or info.get("longName") or symbol,
        history=history_data,
        current_price=float(current_price),
        pe_ratio=float(pe) if pe is not None else None,
        eps=float(eps) if eps is not None else None,
        revenue_growth=round(revenue_growth, 2) if revenue_growth is not None else None,
        market_cap=int(market_cap) if market_cap is not None else None,
        dividend_yield=round(float(div_yield), 2) if div_yield is not None else None,
        recommendation=rec,
    )


@app.post("/api/analyze")
async def analyze_stock(request: AnalyzeRequest):
    """使用 AI 生成投資洞察摘要"""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="未設定 OPENAI_API_KEY，請在 .env 中設定後重啟服務",
        )

    symbol = request.symbol
    data = request.stock_data

    metrics_text = f"""
股票代碼：{symbol}
公司名稱：{data.get('name', 'N/A')}
當前股價：{data.get('current_price', 'N/A')}
本益比 (PE)：{data.get('pe_ratio', 'N/A')}
每股盈餘 (EPS)：{data.get('eps', 'N/A')}
營收成長率 (%)：{data.get('revenue_growth', 'N/A')}
市值：{data.get('market_cap', 'N/A')}
股息殖利率 (%)：{data.get('dividend_yield', 'N/A')}
分析師建議：{data.get('recommendation', 'N/A')}
""".strip()

    try:
        client = OpenAI(api_key=api_key)
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "你是專業的投資分析師，根據提供的股票基本面數據，用繁體中文撰寫約 200 字的投資洞察摘要。內容應包含：簡要評價、風險提示、投資建議方向。語氣專業但易讀，避免過度樂觀或悲觀。",
                },
                {
                    "role": "user",
                    "content": f"請根據以下股票數據撰寫投資洞察摘要：\n\n{metrics_text}",
                },
            ],
            max_tokens=400,
            temperature=0.6,
        )
        summary = response.choices[0].message.content.strip()
        return {"symbol": symbol, "summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI 分析失敗: {str(e)}")
