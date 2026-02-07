"use client";

import { useEffect, useRef, useState } from "react";
import type { IChartApi, ISeriesApi } from "lightweight-charts";

type HistoryItem = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

type ChartMode = "line" | "kline";

export function StockChartKLine({ history }: { history: HistoryItem[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Line"> | ISeriesApi<"Candlestick"> | null>(null);
  const [mode, setMode] = useState<ChartMode>("kline");

  useEffect(() => {
    if (!containerRef.current || !history.length) return;

    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: containerRef.current.clientWidth });
      }
    };

    const initChart = async () => {
      const { createChart } = await import("lightweight-charts");
      if (!containerRef.current) return;

      const chart = createChart(containerRef.current, {
        layout: {
          background: { color: "#161b22" },
          textColor: "#8b949e",
          fontFamily: "JetBrains Mono, monospace",
        },
        grid: {
          vertLines: { color: "#21262d" },
          horzLines: { color: "#21262d" },
        },
        rightPriceScale: {
          borderColor: "#30363d",
          scaleMargins: { top: 0.1, bottom: 0.2 },
        },
        timeScale: {
          borderColor: "#30363d",
          timeVisible: true,
          secondsVisible: false,
        },
        crosshair: {
          mode: 1,
          vertLine: { color: "#58a6ff", width: 1 },
          horzLine: { color: "#58a6ff", width: 1 },
        },
      });

      chartRef.current = chart;
      window.addEventListener("resize", handleResize);

      const data = history.map((h) => ({
        time: h.date as string,
        open: h.open,
        high: h.high,
        low: h.low,
        close: h.close,
      }));

      if (mode === "kline") {
        const candlestickSeries = chart.addCandlestickSeries({
          upColor: "#3fb950",
          downColor: "#f85149",
          borderDownColor: "#f85149",
          borderUpColor: "#3fb950",
          wickDownColor: "#f85149",
          wickUpColor: "#3fb950",
        });
        candlestickSeries.setData(data);
        seriesRef.current = candlestickSeries;
      } else {
        const lineSeries = chart.addLineSeries({
          color: "#58a6ff",
          lineWidth: 2,
        });
        lineSeries.setData(data.map((d) => ({ time: d.time, value: d.close })));
        seriesRef.current = lineSeries;
      }

      chart.timeScale().fitContent();
    };

    initChart();
    return () => {
      window.removeEventListener("resize", handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
      seriesRef.current = null;
    };
  }, [history, mode]);

  return (
    <div>
      <div className="mb-3 flex gap-2">
        <button
          onClick={() => setMode("kline")}
          className={`rounded px-3 py-1.5 text-sm font-medium transition ${
            mode === "kline"
              ? "bg-terminal-accent text-white"
              : "border border-terminal-border text-terminal-text/70 hover:bg-terminal-surface"
          }`}
        >
          K 線圖
        </button>
        <button
          onClick={() => setMode("line")}
          className={`rounded px-3 py-1.5 text-sm font-medium transition ${
            mode === "line"
              ? "bg-terminal-accent text-white"
              : "border border-terminal-border text-terminal-text/70 hover:bg-terminal-surface"
          }`}
        >
          折線圖
        </button>
      </div>
      <div ref={containerRef} className="h-[400px] w-full" />
    </div>
  );
}
