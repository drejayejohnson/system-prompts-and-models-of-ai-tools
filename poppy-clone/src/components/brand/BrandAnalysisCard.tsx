'use client';

import type { BrandProfile } from '@/types/brand';
import { Badge } from '@/components/ui/badge';

interface BrandAnalysisCardProps {
  profile: BrandProfile;
}

export function BrandAnalysisCard({ profile }: BrandAnalysisCardProps) {
  return (
    <div className="space-y-5">
      {/* Tone */}
      {profile.tone.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tone</h3>
          <div className="flex flex-wrap gap-1.5">
            {profile.tone.map((t) => (
              <Badge key={t} variant="pink">{t}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Vocabulary & Structure */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Vocabulary</h3>
          <Badge variant="blue">{profile.vocabulary}</Badge>
        </div>
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Sentences</h3>
          <Badge variant="blue">{profile.sentenceStructure}</Badge>
        </div>
      </div>

      {/* Personality Traits */}
      {profile.personalityTraits.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Personality</h3>
          <div className="flex flex-wrap gap-1.5">
            {profile.personalityTraits.map((t) => (
              <Badge key={t} variant="green">{t}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Brand Keywords */}
      {profile.brandKeywords.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Brand Keywords</h3>
          <div className="flex flex-wrap gap-1.5">
            {profile.brandKeywords.map((k) => (
              <span key={k} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{k}</span>
            ))}
          </div>
        </div>
      )}

      {/* Audience */}
      {profile.audienceDescription && (
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Audience</h3>
          <p className="text-sm text-slate-600 leading-relaxed">{profile.audienceDescription}</p>
        </div>
      )}

      {/* Writing Examples */}
      {profile.writingExamples.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Voice Examples</h3>
          <div className="space-y-2">
            {profile.writingExamples.map((ex, i) => (
              <blockquote key={i} className="border-l-2 border-pink-200 pl-3 text-sm text-slate-600 italic leading-relaxed">
                {ex.length > 150 ? ex.slice(0, 150) + '…' : ex}
              </blockquote>
            ))}
          </div>
        </div>
      )}

      {/* Uploaded sources */}
      {profile.uploadedSamples.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Sources ({profile.uploadedSamples.length})
          </h3>
          <div className="space-y-1">
            {profile.uploadedSamples.map((s, i) => (
              <div key={i} className="text-xs text-slate-500 flex items-center gap-2">
                <span>📄</span>
                <span>{s.filename}</span>
                <span className="text-slate-300">·</span>
                <span>{s.wordCount.toLocaleString()} words</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
