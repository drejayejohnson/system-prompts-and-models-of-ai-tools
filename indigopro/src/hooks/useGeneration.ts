'use client';

import { useState, useCallback, useRef } from 'react';
import type { BrandProfile } from '@/types/brand';
import type { GenerationRequest } from '@/types/generation';
import type { ChatMessage } from '@/types/chat';
import { createEmptyBrandProfile } from '@/lib/brand-voice';

type GenerationState = 'idle' | 'generating' | 'done' | 'error';

export function useGeneration() {
  const [state, setState] = useState<GenerationState>('idle');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(
    async (
      request: GenerationRequest,
      brandProfile: BrandProfile | null,
      options?: { mode?: 'generate' | 'chat'; chatHistory?: ChatMessage[] }
    ) => {
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      setState('generating');
      setOutput('');
      setError(null);

      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            request,
            brandProfile: brandProfile ?? createEmptyBrandProfile(),
            mode: options?.mode ?? 'generate',
            chatHistory: options?.chatHistory ?? [],
          }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'Generation failed' }));
          throw new Error(err.error ?? 'Generation failed');
        }

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

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
              if (parsed.error) throw new Error(parsed.error);
              if (parsed.text) setOutput((prev) => prev + parsed.text);
            } catch {
              // skip malformed chunks
            }
          }
        }

        setState('done');
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          setState('idle');
          return;
        }
        setError(err instanceof Error ? err.message : 'Generation failed');
        setState('error');
      }
    },
    []
  );

  const reset = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    setState('idle');
    setOutput('');
    setError(null);
  }, []);

  const stop = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    setState('done');
  }, []);

  return { state, output, error, generate, reset, stop, isGenerating: state === 'generating' };
}
