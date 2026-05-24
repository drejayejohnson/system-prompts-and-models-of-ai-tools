"use client";

import { useState } from "react";
import { Wand2, Send, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmailComposerProps {
  onClose?: () => void;
  defaultTo?: string;
  defaultSubject?: string;
}

export function EmailComposer({ onClose, defaultTo = "", defaultSubject = "" }: EmailComposerProps) {
  const [to, setTo] = useState(defaultTo);
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState("");
  const [intent, setIntent] = useState("");
  const [drafting, setDrafting] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const draftWithAI = async () => {
    if (!intent.trim()) return;
    setDrafting(true);
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ id: "1", role: "user",
          content: `Draft a professional email:\nTo: ${to || "the recipient"}\nIntent: ${intent}\n\nRespond in this exact JSON format:\n{"subject": "...", "body": "..."}` }] }) });
      const text = await res.text();
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (parsed.subject) setSubject(parsed.subject);
        if (parsed.body) setBody(parsed.body);
      }
    } finally { setDrafting(false); }
  };

  const send = async () => {
    if (!to || !subject || !body) return;
    setSending(true);
    try {
      const res = await fetch("/api/email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ to, subject, body }) });
      if (res.ok) { setSent(true); setTimeout(() => onClose?.(), 1500); }
    } finally { setSending(false); }
  };

  if (sent) return <div className="flex items-center justify-center h-full text-coral-600 font-medium">Email sent!</div>;

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-warm-800">New Email</h3>
        {onClose && <button onClick={onClose} className="p-1 rounded-lg hover:bg-warm-100 text-warm-500"><X className="w-4 h-4" /></button>}
      </div>
      <div className="flex gap-2">
        <input value={intent} onChange={(e) => setIntent(e.target.value)} placeholder="Describe what you want to say…"
          className="flex-1 text-sm px-3 py-2 rounded-lg border border-warm-200 focus:outline-none focus:ring-2 focus:ring-coral-300" />
        <button onClick={draftWithAI} disabled={!intent.trim() || drafting}
          className={cn("flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            intent.trim() && !drafting ? "bg-coral-100 text-coral-700 hover:bg-coral-200" : "bg-warm-100 text-warm-400 cursor-not-allowed")}>
          {drafting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}Draft
        </button>
      </div>
      <div className="space-y-2">
        <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="To" className="w-full text-sm px-3 py-2 rounded-lg border border-warm-200 focus:outline-none focus:ring-2 focus:ring-coral-300" />
        <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" className="w-full text-sm px-3 py-2 rounded-lg border border-warm-200 focus:outline-none focus:ring-2 focus:ring-coral-300" />
        <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Body…" rows={8} className="w-full text-sm px-3 py-2 rounded-lg border border-warm-200 focus:outline-none focus:ring-2 focus:ring-coral-300 resize-none" />
      </div>
      <button onClick={send} disabled={!to || !subject || !body || sending}
        className={cn("flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors",
          to && subject && body && !sending ? "bg-coral-500 hover:bg-coral-600 text-white" : "bg-warm-100 text-warm-400 cursor-not-allowed")}>
        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}Send Email
      </button>
    </div>
  );
}
