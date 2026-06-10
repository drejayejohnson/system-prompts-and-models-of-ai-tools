'use client';

import { useState, useRef } from 'react';

interface ChatInputProps {
  onSend: (text: string) => void;
  isDisabled?: boolean;
}

export function ChatInput({ onSend, isDisabled }: ChatInputProps) {
  const [text, setText] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!text.trim() || isDisabled) return;
    onSend(text.trim());
    setText('');
    ref.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-2 p-4 border-t border-slate-200 bg-white">
      <textarea
        ref={ref}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Ask me anything in your brand voice..."
        rows={2}
        className="flex-1 resize-none text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-700 placeholder:text-slate-400"
        disabled={isDisabled}
      />
      <button
        onClick={handleSend}
        disabled={!text.trim() || isDisabled}
        className="bg-indigo-500 text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-indigo-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Send
      </button>
    </div>
  );
}
