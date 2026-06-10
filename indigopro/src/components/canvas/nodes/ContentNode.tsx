'use client';

import { useState } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { clsx } from 'clsx';
import { CONTENT_TYPE_LABELS } from '@/lib/templates';
import type { ContentType } from '@/types/generation';

const TYPE_COLORS: Record<string, string> = {
  blog_post: 'border-blue-300 bg-blue-50',
  blog_listicle: 'border-blue-300 bg-blue-50',
  social_instagram: 'border-rose-300 bg-rose-50',
  social_linkedin: 'border-blue-400 bg-blue-50',
  social_twitter: 'border-sky-300 bg-sky-50',
  email_newsletter: 'border-purple-300 bg-purple-50',
  email_subjects: 'border-purple-300 bg-purple-50',
  video_script_youtube: 'border-red-300 bg-red-50',
  video_script_tiktok: 'border-rose-300 bg-rose-50',
  ad_copy: 'border-orange-300 bg-orange-50',
  product_description: 'border-green-300 bg-green-50',
  press_release: 'border-slate-300 bg-slate-50',
};

export function ContentNode({ data, selected }: NodeProps) {
  const nodeData = data as {
    contentType?: ContentType;
    generatedText?: string;
    label?: string;
  };

  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const contentType = nodeData.contentType ?? 'blog_post';
  const text = nodeData.generatedText ?? '';
  const label = CONTENT_TYPE_LABELS[contentType] ?? contentType;
  const colorClass = TYPE_COLORS[contentType] ?? 'border-slate-200 bg-white';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={clsx(
        'rounded-xl w-72 shadow-sm border-2 transition-all',
        colorClass,
        selected && 'shadow-md ring-2 ring-indigo-400'
      )}
    >
      <Handle type="target" position={Position.Left} className="!bg-slate-400" />
      <Handle type="source" position={Position.Right} className="!bg-slate-400" />

      <div className="px-3 py-2 border-b border-black/5 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-600">{label}</span>
        <div className="flex gap-1">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-slate-400 hover:text-slate-600 px-1.5 py-0.5 rounded hover:bg-black/5"
          >
            {expanded ? '▲' : '▼'}
          </button>
          <button
            onClick={handleCopy}
            className="text-xs text-slate-400 hover:text-slate-600 px-1.5 py-0.5 rounded hover:bg-black/5"
          >
            {copied ? '✓' : '📋'}
          </button>
        </div>
      </div>

      <div className="p-3">
        <p className={clsx('text-xs text-slate-700 leading-relaxed whitespace-pre-wrap', !expanded && 'line-clamp-6')}>
          {text || 'No content generated'}
        </p>
      </div>
    </div>
  );
}
