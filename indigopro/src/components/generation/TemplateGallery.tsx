'use client';

import { CONTENT_TEMPLATES } from '@/lib/templates';
import type { ContentTemplate } from '@/types/generation';

interface TemplateGalleryProps {
  onSelect: (template: ContentTemplate) => void;
}

export function TemplateGallery({ onSelect }: TemplateGalleryProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {CONTENT_TEMPLATES.map((template) => (
        <button
          key={template.id}
          onClick={() => onSelect(template)}
          className="flex flex-col items-start p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 text-left transition-all group"
        >
          <div className="text-2xl mb-2">{template.icon}</div>
          <div className="text-sm font-semibold text-slate-700 group-hover:text-indigo-700 leading-tight">
            {template.name}
          </div>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{template.description}</p>
        </button>
      ))}
    </div>
  );
}
