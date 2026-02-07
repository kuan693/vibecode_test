"use client";

import type { StockData } from "@/app/page";

function formatMarketCap(v: number | null) {
  if (v == null) return "—";
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
  return `$${v}`;
}

function Metric({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg border border-terminal-border bg-terminal-bg/50 px-4 py-3">
      <p className="text-xs text-terminal-text/60">{label}</p>
      <p
        className={`font-mono text-lg font-semibold ${
          highlight ? "text-terminal-accent" : "text-terminal-text"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export function MetricsPanel({ data }: { data: StockData }) {
  return (
    <div className="rounded-xl border border-terminal-border bg-terminal-surface p-6">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-mono text-lg font-medium text-terminal-accent">
          {data.symbol} · {data.name}
        </h2>
        <span className="font-mono text-2xl font-semibold text-terminal-green">
          ${data.current_price.toFixed(2)}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Metric label="本益比 (PE)" value={data.pe_ratio ?? "—"} />
        <Metric label="每股盈餘 (EPS)" value={data.eps ?? "—"} />
        <Metric label="營收成長 (%)" value={data.revenue_growth ?? "—"} />
        <Metric label="市值" value={formatMarketCap(data.market_cap)} />
        <Metric label="股息殖利率 (%)" value={data.dividend_yield ?? "—"} />
        <Metric
          label="分析師建議"
          value={data.recommendation ?? "—"}
          highlight
        />
      </div>
    </div>
  );
}
