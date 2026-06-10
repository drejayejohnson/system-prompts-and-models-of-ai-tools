'use client';

import { useState } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { clsx } from 'clsx';

const COLORS = ['#fef9c3', '#fce7f3', '#dbeafe', '#d1fae5', '#ede9fe', '#ffedd5'];

export function IdeaNode({ data, selected }: NodeProps) {
  const nodeData = data as { text?: string; color?: string; label?: string };
  const [text, setText] = useState(nodeData.text ?? '');
  const [color, setColor] = useState(nodeData.color ?? COLORS[0]);

  return (
    <div
      className={clsx(
        'rounded-xl p-3 w-52 shadow-sm border-2 transition-all',
        selected ? 'border-indigo-400 shadow-indigo-100' : 'border-transparent'
      )}
      style={{ backgroundColor: color }}
    >
      <Handle type="target" position={Position.Left} className="!bg-slate-300" />
      <Handle type="source" position={Position.Right} className="!bg-slate-300" />

      <textarea
        className="w-full bg-transparent text-sm text-slate-700 resize-none outline-none placeholder:text-slate-400"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type an idea..."
        rows={4}
      />

      <div className="flex gap-1 mt-2">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className="w-4 h-4 rounded-full border border-white/50 shadow-sm transition-transform hover:scale-110"
            style={{ backgroundColor: c, outline: color === c ? '2px solid #e84b8a' : 'none' }}
          />
        ))}
      </div>
    </div>
  );
}
