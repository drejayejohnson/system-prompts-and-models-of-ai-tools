'use client';

import { useEffect, useRef } from 'react';
import { useChat } from '@/hooks/useChat';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import type { BrandProfile } from '@/types/brand';

interface ChatPanelProps {
  brandProfile: BrandProfile | null;
  onClose: () => void;
}

export function ChatPanel({ brandProfile, onClose }: ChatPanelProps) {
  const { messages, sendMessage, isTyping, clearChat } = useChat(brandProfile);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0">
        <div>
          <h2 className="font-semibold text-slate-800">Brand Chat</h2>
          {brandProfile && (
            <p className="text-xs text-slate-400 mt-0.5">
              ✨ Responding as <strong className="text-indigo-500">{brandProfile.name}</strong>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Clear
            </button>
          )}
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg leading-none">
            ×
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🔷</div>
            <p className="text-sm text-slate-500 font-medium">
              Chat with your brand voice
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Ask me to write, brainstorm, or refine content in your style
            </p>
          </div>
        )}

        {messages.map((message, i) => (
          <ChatMessage
            key={message.id}
            message={message}
            isLastAssistant={i === messages.length - 1 && message.role === 'assistant'}
            isTyping={isTyping}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <ChatInput onSend={sendMessage} isDisabled={isTyping} />
    </div>
  );
}
