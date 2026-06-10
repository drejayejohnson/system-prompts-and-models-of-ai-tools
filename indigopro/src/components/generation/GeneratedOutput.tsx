'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import { clsx } from 'clsx';

interface GeneratedOutputProps {
  output: string;
  isGenerating: boolean;
  onStop: () => void;
  onReset: () => void;
  onAddToCanvas: (text: string) => void;
}

export function GeneratedOutput({
  output,
  isGenerating,
  onStop,
  onReset,
  onAddToCanvas,
}: GeneratedOutputProps) {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'rendered' | 'raw'>('rendered');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('rendered')}
            className={clsx('text-xs px-2.5 py-1 rounded-md transition-colors', viewMode === 'rendered' ? 'bg-white shadow-sm font-medium text-slate-800' : 'text-slate-500')}
          >
            Preview
          </button>
          <button
            onClick={() => setViewMode('raw')}
            className={clsx('text-xs px-2.5 py-1 rounded-md transition-colors', viewMode === 'raw' ? 'bg-white shadow-sm font-medium text-slate-800' : 'text-slate-500')}
          >
            Raw
          </button>
        </div>

        <div className="flex items-center gap-2">
          {isGenerating && (
            <Button variant="outline" size="sm" onClick={onStop}>
              ⏹ Stop
            </Button>
          )}
          {!isGenerating && output && (
            <>
              <Button variant="outline" size="sm" onClick={onReset}>
                ↺ Regenerate
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? '✓ Copied' : '📋 Copy'}
              </Button>
              <Button size="sm" onClick={() => onAddToCanvas(output)}>
                + Canvas
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-white border border-slate-200 rounded-xl p-4 min-h-0">
        {viewMode === 'rendered' ? (
          <div className={clsx('prose prose-sm max-w-none text-slate-700', isGenerating && output && 'streaming-cursor')}>
            <ReactMarkdown>{output}</ReactMarkdown>
          </div>
        ) : (
          <pre className={clsx('text-xs text-slate-700 whitespace-pre-wrap font-mono', isGenerating && output && 'streaming-cursor')}>
            {output}
          </pre>
        )}
        {!output && !isGenerating && (
          <p className="text-slate-400 text-sm">Your generated content will appear here...</p>
        )}
        {!output && isGenerating && (
          <div className="streaming-cursor text-slate-400 text-sm">Generating</div>
        )}
      </div>
    </div>
  );
}
