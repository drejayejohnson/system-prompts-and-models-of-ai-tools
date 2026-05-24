"use client";

import { useEffect, useState } from "react";
import { Mail, RefreshCw, Loader2, Wand2 } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import type { EmailThread } from "@/types";

export function EmailList() {
  const [threads, setThreads] = useState<EmailThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<Record<string, string>>({});
  const [summarizing, setSummarizing] = useState<string | null>(null);

  const fetchEmails = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/email?maxResults=20");
      if (!res.ok) throw new Error("Failed to load emails");
      const data = await res.json();
      setThreads(data.threads ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchEmails(); }, []);

  const summarize = async (threadId: string, snippet: string) => {
    if (summaries[threadId] || summarizing === threadId) return;
    setSummarizing(threadId);
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ id: "1", role: "user", content: `Summarize this email in one sentence, noting any action needed:\n\n"${snippet}"` }] }) });
      const text = await res.text();
      setSummaries((prev) => ({ ...prev, [threadId]: text }));
    } finally { setSummarizing(null); }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-warm-400"><Loader2 className="w-6 h-6 animate-spin mr-2" />Loading emails…</div>;
  if (error) return <div className="flex flex-col items-center justify-center h-64 gap-3 text-warm-500"><Mail className="w-10 h-10 text-warm-300" /><p className="text-sm">{error}</p><p className="text-xs text-warm-400">Make sure you've connected your Google account.</p></div>;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-warm-100">
        <h2 className="font-semibold text-warm-800">Inbox</h2>
        <button onClick={fetchEmails} className="p-1.5 rounded-lg hover:bg-warm-100 text-warm-500 transition-colors" aria-label="Refresh">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-warm-50">
        {threads.length === 0 && <p className="text-center py-12 text-sm text-warm-400">No emails found</p>}
        {threads.map((t) => (
          <div key={t.id} onClick={() => setSelectedId(selectedId === t.id ? null : t.id)}
            className={cn("px-4 py-3 cursor-pointer hover:bg-warm-50 transition-colors", selectedId === t.id && "bg-coral-50", t.unread && "bg-orange-50/50")}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {t.unread && <span className="w-2 h-2 rounded-full bg-coral-500 flex-shrink-0" />}
                  <p className={cn("text-sm truncate", t.unread ? "font-semibold text-warm-900" : "text-warm-700")}>
                    {t.from.split("<")[0].trim() || t.from}
                  </p>
                </div>
                <p className="text-sm font-medium text-warm-800 truncate mt-0.5">{t.subject}</p>
                <p className="text-xs text-warm-400 truncate mt-0.5">{summaries[t.id] ?? t.snippet}</p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <p className="text-xs text-warm-400 whitespace-nowrap">{formatDate(t.date)}</p>
                {t.messageCount > 1 && <span className="text-xs bg-warm-100 text-warm-500 rounded-full px-1.5">{t.messageCount}</span>}
              </div>
            </div>
            {selectedId === t.id && (
              <div className="mt-2 flex gap-2">
                <button onClick={(e) => { e.stopPropagation(); summarize(t.id, t.snippet); }}
                  disabled={!!summaries[t.id] || summarizing === t.id}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-coral-100 text-coral-700 hover:bg-coral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {summarizing === t.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                  {summaries[t.id] ? "Summarized" : "Summarize with AI"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
