'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface SamplePasteModalProps {
  onSubmit: (text: string) => void;
  onClose: () => void;
}

export function SamplePasteModal({ onSubmit, onClose }: SamplePasteModalProps) {
  const [text, setText] = useState('');

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">Paste Writing Sample</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Paste any writing that represents your brand voice — blog posts, social captions, emails, etc.
          </p>
        </div>

        <div className="px-6 py-5">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your writing sample here. The more examples you add, the better IndigoPro will understand your unique voice..."
            rows={12}
            autoFocus
          />
          <p className="text-xs text-slate-400 mt-2">
            {text.split(/\s+/).filter(Boolean).length} words
          </p>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => { onSubmit(text); onClose(); }}
            disabled={text.trim().length < 50}
          >
            Add Sample
          </Button>
        </div>
      </div>
    </div>
  );
}
