'use client';

import type { ChatMessage as ChatMessageType } from '@/types/chat';
import ReactMarkdown from 'react-markdown';
import { clsx } from 'clsx';

interface ChatMessageProps {
  message: ChatMessageType;
  isLastAssistant?: boolean;
  isTyping?: boolean;
}

export function ChatMessage({ message, isLastAssistant, isTyping }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={clsx('flex gap-3', isUser && 'flex-row-reverse')}>
      <div
        className={clsx(
          'w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-sm',
          isUser ? 'bg-slate-200' : 'bg-gradient-to-br from-pink-400 to-purple-500'
        )}
      >
        {isUser ? '👤' : '🌸'}
      </div>
      <div
        className={clsx(
          'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm',
          isUser
            ? 'bg-pink-500 text-white rounded-tr-sm'
            : 'bg-slate-100 text-slate-800 rounded-tl-sm'
        )}
      >
        {isUser ? (
          <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className={clsx('prose prose-sm max-w-none', isLastAssistant && isTyping && !message.content && 'streaming-cursor')}>
            {message.content ? (
              <ReactMarkdown>{message.content}</ReactMarkdown>
            ) : isTyping ? (
              <span className="streaming-cursor text-slate-400">Thinking</span>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
