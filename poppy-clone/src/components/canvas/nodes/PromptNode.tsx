'use client';

import { useState } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { clsx } from 'clsx';
import { CONTENT_TYPE_LABELS } from '@/lib/templates';
import type { ContentType } from '@/types/generation';

interface PromptNodeProps extends NodeProps {
  onGenerate?: (promptText: string, contentType: ContentType) => void;
}

const CONTENT_TYPES = Object.entries(CONTENT_TYPE_LABELS) as [ContentType, string][];

export function PromptNode({ data, selected, onGenerate }: PromptNodeProps) {
  const nodeData = data as { promptText?: string; contentType?: ContentType; label?: string };
  const [promptText, setPromptText] = useState(nodeData.promptText ?? '');
  const [contentType, setContentType] = useState<ContentType>(nodeData.contentType ?? 'blog_post');

  return (
    <div
      className={clsx(
        'rounded-xl bg-white w-64 shadow-sm border-2 transition-all',
        selected ? 'border-pink-400 shadow-pink-100 shadow-md' : 'border-slate-200'
      )}
    >
      <Handle type="target" position={Position.Left} className="!bg-pink-400" />
      <Handle type="source" position={Position.Right} className="!bg-pink-400" />

      <div className="px-3 py-2.5 border-b border-slate-100 flex items-center gap-2">
        <span className="text-sm">✨</span>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Prompt</span>
      </div>

      <div className="p-3 space-y-2">
        <select
          value={contentType}
          onChange={(e) => setContentType(e.target.value as ContentType)}
          className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600 focus:outline-none focus:ring-1 focus:ring-pink-400"
        >
          {CONTENT_TYPES.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        <textarea
          className="w-full text-sm text-slate-700 border border-slate-200 rounded-lg px-2 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-pink-400 placeholder:text-slate-400"
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          placeholder="What should I write about?"
          rows={3}
        />

        <button
          onClick={() => onGenerate?.(promptText, contentType)}
          disabled={!promptText.trim()}
          className="w-full bg-pink-500 text-white text-xs font-semibold py-2 rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Generate →
        </button>
      </div>
    </div>
  );
}
