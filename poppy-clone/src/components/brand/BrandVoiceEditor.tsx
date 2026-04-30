'use client';

import { useState } from 'react';
import type { BrandProfile } from '@/types/brand';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface BrandVoiceEditorProps {
  profile: BrandProfile;
  onUpdate: (updates: Partial<BrandProfile>) => void;
}

export function BrandVoiceEditor({ profile, onUpdate }: BrandVoiceEditorProps) {
  const [toneInput, setToneInput] = useState(profile.tone.join(', '));
  const [traitsInput, setTraitsInput] = useState(profile.personalityTraits.join(', '));
  const [keywordsInput, setKeywordsInput] = useState(profile.brandKeywords.join(', '));
  const [avoidInput, setAvoidInput] = useState(profile.avoidWords.join(', '));

  const parseCSV = (s: string) =>
    s.split(',').map((x) => x.trim().toLowerCase()).filter(Boolean);

  const save = () => {
    onUpdate({
      tone: parseCSV(toneInput),
      personalityTraits: parseCSV(traitsInput),
      brandKeywords: parseCSV(keywordsInput),
      avoidWords: parseCSV(avoidInput),
    });
  };

  return (
    <div className="space-y-5">
      {/* Brand Name */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Brand Name</label>
        <Input
          value={profile.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="e.g., Acme Co"
        />
      </div>

      {/* Tone */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Tone <span className="text-slate-400 font-normal">(comma-separated)</span>
        </label>
        <Input
          value={toneInput}
          onChange={(e) => setToneInput(e.target.value)}
          onBlur={save}
          placeholder="e.g., professional, warm, direct, inspiring"
        />
      </div>

      {/* Vocabulary */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Vocabulary Style</label>
        <div className="grid grid-cols-2 gap-2">
          {(['formal', 'casual', 'technical', 'conversational'] as const).map((v) => (
            <button
              key={v}
              onClick={() => onUpdate({ vocabulary: v })}
              className={`px-3 py-2 rounded-lg text-sm border transition-all capitalize ${
                profile.vocabulary === v
                  ? 'border-pink-400 bg-pink-50 text-pink-700 font-medium'
                  : 'border-slate-200 text-slate-600 hover:border-pink-200'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Sentence Structure */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Sentence Structure</label>
        <div className="grid grid-cols-2 gap-2">
          {(['short', 'medium', 'long', 'varied'] as const).map((s) => (
            <button
              key={s}
              onClick={() => onUpdate({ sentenceStructure: s })}
              className={`px-3 py-2 rounded-lg text-sm border transition-all capitalize ${
                profile.sentenceStructure === s
                  ? 'border-pink-400 bg-pink-50 text-pink-700 font-medium'
                  : 'border-slate-200 text-slate-600 hover:border-pink-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Personality Traits */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Personality Traits <span className="text-slate-400 font-normal">(comma-separated)</span>
        </label>
        <Input
          value={traitsInput}
          onChange={(e) => setTraitsInput(e.target.value)}
          onBlur={save}
          placeholder="e.g., authoritative, empathetic, witty, bold"
        />
      </div>

      {/* Brand Keywords */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Brand Keywords <span className="text-slate-400 font-normal">(comma-separated)</span>
        </label>
        <Input
          value={keywordsInput}
          onChange={(e) => setKeywordsInput(e.target.value)}
          onBlur={save}
          placeholder="e.g., innovation, community, real results, no fluff"
        />
      </div>

      {/* Words to Avoid */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Words/Phrases to Avoid <span className="text-slate-400 font-normal">(comma-separated)</span>
        </label>
        <Input
          value={avoidInput}
          onChange={(e) => setAvoidInput(e.target.value)}
          onBlur={save}
          placeholder="e.g., synergy, leverage, cutting-edge, game-changing"
        />
      </div>

      {/* Audience */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Target Audience</label>
        <Textarea
          value={profile.audienceDescription}
          onChange={(e) => onUpdate({ audienceDescription: e.target.value })}
          rows={2}
          placeholder="Who do you write for? What do they care about?"
        />
      </div>

      {/* Additional Instructions */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Additional Instructions
          <span className="text-slate-400 font-normal"> — anything else Claude should know</span>
        </label>
        <Textarea
          value={profile.additionalInstructions}
          onChange={(e) => onUpdate({ additionalInstructions: e.target.value })}
          rows={3}
          placeholder="e.g., Always use Oxford comma. Never write in first person plural ('we'). Use em dashes frequently..."
        />
      </div>

      <Button onClick={save} className="w-full">Save Changes</Button>
    </div>
  );
}
