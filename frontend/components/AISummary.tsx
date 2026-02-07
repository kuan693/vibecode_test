"use client";

export function AISummary({
  content,
  loading,
}: {
  content: string | null;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-terminal-border bg-terminal-bg/50 p-6">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-terminal-accent border-t-transparent" />
        <span className="text-terminal-text/70">AI 正在分析並生成投資洞察…</span>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="rounded-lg border border-dashed border-terminal-border p-6 text-center text-terminal-text/50">
        點擊「生成摘要」取得 AI 投資洞察（需設定 OpenAI API Key）
      </div>
    );
  }

  return (
    <div className="whitespace-pre-wrap rounded-lg border border-terminal-border bg-terminal-bg/50 p-6 leading-relaxed text-terminal-text">
      {content}
    </div>
  );
}
