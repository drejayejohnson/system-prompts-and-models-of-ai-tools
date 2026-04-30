'use client';

import { Button } from '@/components/ui/button';

interface CanvasToolbarProps {
  onAddIdea: () => void;
  onAddPrompt: () => void;
  onClear: () => void;
}

export function CanvasToolbar({ onAddIdea, onAddPrompt, onClear }: CanvasToolbarProps) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-white rounded-xl shadow-md border border-slate-200 px-3 py-2 flex items-center gap-2">
      <span className="text-xs text-slate-400 font-medium pr-2 border-r border-slate-100">Add</span>

      <button
        onClick={onAddIdea}
        className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
      >
        <span>📝</span> Idea
      </button>

      <button
        onClick={onAddPrompt}
        className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
      >
        <span>✨</span> Prompt
      </button>

      <div className="w-px h-4 bg-slate-200 mx-1" />

      <button
        onClick={onClear}
        className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-red-500 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
        title="Clear canvas"
      >
        🗑
      </button>
    </div>
  );
}
