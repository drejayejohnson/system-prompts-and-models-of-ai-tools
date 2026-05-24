"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Message } from "@/types";
import { nanoid } from "@/lib/nanoid";

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([{
    id: "welcome", role: "assistant",
    content: "Hi! I'm your personal assistant. I can help you draft emails, review your calendar, look up contacts, and analyze your pipeline. What do you need?",
    createdAt: new Date(),
  }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    const userMsg: Message = { id: nanoid(), role: "user", content: text, createdAt: new Date() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);
    const assistantId = nanoid();
    setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "", createdAt: new Date() }]);
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: updatedMessages }) });
      if (!res.ok || !res.body) throw new Error("Chat request failed");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, content: accumulated } : m));
      }
    } catch {
      setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, content: "Sorry, something went wrong. Please try again." } : m));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.map((m) => <ChatMessage key={m.id} message={m} />)}
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-warm-100 p-4">
        <div className="flex gap-2 items-end">
          <textarea value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Ask anything… draft an email, check your schedule, look up a contact"
            rows={1}
            className="flex-1 resize-none rounded-xl border border-warm-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-coral-300 focus:border-transparent bg-white placeholder:text-warm-300 max-h-32" />
          <button onClick={send} disabled={!input.trim() || isLoading}
            className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all",
              input.trim() && !isLoading ? "bg-coral-500 hover:bg-coral-600 text-white" : "bg-warm-100 text-warm-300 cursor-not-allowed")}
            aria-label="Send message">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[80%] rounded-2xl px-4 py-3 text-sm",
        isUser ? "bg-coral-500 text-white rounded-br-sm" : "bg-warm-50 text-warm-800 rounded-bl-sm border border-warm-100")}>
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}
