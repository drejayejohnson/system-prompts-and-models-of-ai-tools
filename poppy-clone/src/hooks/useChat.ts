'use client';

import { useState, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { ChatMessage } from '@/types/chat';
import type { BrandProfile } from '@/types/brand';
import type { GenerationRequest } from '@/types/generation';
import { createEmptyBrandProfile } from '@/lib/brand-voice';

export function useChat(brandProfile: BrandProfile | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  // Keep a ref to messages so sendMessage closure always sees the latest
  const messagesRef = useRef<ChatMessage[]>([]);
  messagesRef.current = messages;

  const sendMessage = useCallback(
    async (text: string) => {
      const userMsg: ChatMessage = {
        id: uuidv4(),
        role: 'user',
        content: text,
        timestamp: new Date().toISOString(),
      };

      const assistantMsgId = uuidv4();
      const assistantMsg: ChatMessage = {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsTyping(true);

      const chatRequest: GenerationRequest = {
        contentType: 'blog_post',
        topic: text,
        lengthPreference: 'medium',
      };

      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            request: chatRequest,
            brandProfile: brandProfile ?? createEmptyBrandProfile(),
            mode: 'chat',
            // Use ref so we send the actual current history, not a stale closure value
            chatHistory: messagesRef.current,
          }),
        });

        if (!res.ok || !res.body) {
          setIsTyping(false);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let accumulated = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() ?? '';
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6);
            if (data === '[DONE]') break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                accumulated += parsed.text;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId ? { ...m, content: accumulated } : m
                  )
                );
              }
            } catch {
              // skip malformed chunks
            }
          }
        }
      } finally {
        setIsTyping(false);
      }
    },
    [brandProfile]
  );

  const clearChat = useCallback(() => setMessages([]), []);

  return { messages, sendMessage, isTyping, clearChat };
}
