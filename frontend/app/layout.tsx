import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "台灣股票智慧分析 | Stock Intelligence",
  description: "輸入股票代碼查詢過去一年股價、K線圖與 AI 投資洞察摘要",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className="dark">
      <body className="min-h-screen bg-terminal-bg text-terminal-text antialiased">
        {children}
      </body>
    </html>
  );
}
