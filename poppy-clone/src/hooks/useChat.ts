'use client';

import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { ChatMessage } from '@/types/chat';
import type { BrandProfile } from '@/types/brand';
import { useGeneration } from './useGeneration';
import type { GenerationRequest } from '@/types/generation';

export function useChat(brandProfile: BrandProfile | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { generate, isGenerating } = useGeneration();

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

      const fakeRequest: GenerationRequest = {
        contentType: 'blog_post',
        topic: text,
        lengthPreference: 'medium',
      };

      // We need to stream into the assistant message
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request: fakeRequest,
          brandProfile,
          mode: 'chat',
          chatHistory: messages,
        }),
      });

      if (!res.ok || !res.body) return;

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
            // skip
          }
        }
      }
    },
    [messages, brandProfile, generate]
  );

  const clearChat = useCallback(() => setMessages([]), []);

  return { messages, sendMessage, isTyping: isGenerating, clearChat };
}
