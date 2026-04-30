'use client';

import { CONTENT_TEMPLATES } from '@/lib/templates';
import type { ContentType } from '@/types/generation';
import { clsx } from 'clsx';

interface ContentTypeSelectorProps {
  selected: ContentType | null;
  onSelect: (type: ContentType) => void;
}

const GROUPS = [
  {
    label: 'Social Media',
    types: ['social_linkedin', 'social_instagram', 'social_twitter'],
  },
  {
    label: 'Blog',
    types: ['blog_post', 'blog_listicle'],
  },
  {
    label: 'Email',
    types: ['email_newsletter', 'email_subjects'],
  },
  {
    label: 'Video',
    types: ['video_script_youtube', 'video_script_tiktok'],
  },
  {
    label: 'Marketing',
    types: ['ad_copy', 'product_description', 'press_release'],
  },
];

export function ContentTypeSelector({ selected, onSelect }: ContentTypeSelectorProps) {
  const templatesByType = Object.fromEntries(
    CONTENT_TEMPLATES.map((t) => [t.contentType, t])
  );

  return (
    <div className="space-y-4">
      {GROUPS.map((group) => (
        <div key={group.label}>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            {group.label}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {group.types.map((type) => {
              const t = templatesByType[type];
              if (!t) return null;
              return (
                <button
                  key={type}
                  onClick={() => onSelect(type as ContentType)}
                  className={clsx(
                    'flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all',
                    selected === type
                      ? 'border-pink-400 bg-pink-50 text-pink-700'
                      : 'border-slate-200 hover:border-pink-200 hover:bg-pink-50/30 text-slate-700'
                  )}
                >
                  <span className="text-xl">{t.icon}</span>
                  <div>
                    <div className="text-xs font-semibold leading-tight">{t.name}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
