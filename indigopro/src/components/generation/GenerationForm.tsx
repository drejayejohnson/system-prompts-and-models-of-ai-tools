'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import type { GenerationRequest, ContentType } from '@/types/generation';
import { CONTENT_TYPE_LABELS } from '@/lib/templates';

interface GenerationFormProps {
  contentType: ContentType;
  templateId?: string;
  initialTopic?: string;
  onSubmit: (request: GenerationRequest) => void;
  onBack: () => void;
  isGenerating: boolean;
}

export function GenerationForm({
  contentType,
  templateId,
  initialTopic = '',
  onSubmit,
  onBack,
  isGenerating,
}: GenerationFormProps) {
  const [topic, setTopic] = useState(initialTopic);
  const [context, setContext] = useState('');
  const [audience, setAudience] = useState('');
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [toneOverride, setToneOverride] = useState('');

  const label = CONTENT_TYPE_LABELS[contentType];

  return (
    <div className="space-y-4">
      {/* Topic */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Topic / Main Idea <span className="text-red-400">*</span>
        </label>
        <Input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder={`What should this ${label} be about?`}
          autoFocus
        />
      </div>

      {/* Context */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Context or Background <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <Textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          rows={3}
          placeholder="Any relevant context, facts, or details to include..."
        />
      </div>

      {/* Audience override */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Target Audience Override <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <Input
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          placeholder="Who is this specific piece for?"
        />
      </div>

      {/* Length */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Length</label>
        <div className="grid grid-cols-3 gap-2">
          {(['short', 'medium', 'long'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLength(l)}
              className={`py-2 rounded-lg text-sm border transition-all capitalize ${
                length === l
                  ? 'border-indigo-400 bg-indigo-50 text-indigo-700 font-medium'
                  : 'border-slate-200 text-slate-600 hover:border-indigo-200'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Tone override */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Tone Tweak <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <Input
          value={toneOverride}
          onChange={(e) => setToneOverride(e.target.value)}
          placeholder="e.g., more urgent, more playful, more technical"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onBack} className="flex-1">
          ← Back
        </Button>
        <Button
          onClick={() =>
            onSubmit({
              contentType,
              topic,
              context: context || undefined,
              targetAudience: audience || undefined,
              lengthPreference: length,
              toneOverride: toneOverride || undefined,
              templateId,
            })
          }
          disabled={!topic.trim() || isGenerating}
          className="flex-1"
        >
          {isGenerating ? 'Generating...' : '✨ Generate'}
        </Button>
      </div>
    </div>
  );
}
