"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type HistoryItem = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export function StockChart({ history }: { history: HistoryItem[] }) {
  const data = history.map((h) => ({
    date: h.date.slice(5),
    close: h.close,
    high: h.high,
    low: h.low,
  }));

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
          <XAxis
            dataKey="date"
            stroke="#8b949e"
            tick={{ fill: "#8b949e", fontSize: 12 }}
            tickLine={{ stroke: "#30363d" }
          />
          <YAxis
            stroke="#8b949e"
            tick={{ fill: "#8b949e", fontSize: 12 }}
            tickLine={{ stroke: "#30363d" }
            domain={["auto", "auto"]}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#161b22",
              border: "1px solid #30363d",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#c9d1d9" }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, "收盤價"]}
          />
          <Line
            type="monotone"
            dataKey="close"
            stroke="#58a6ff"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
