'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { TopBar } from '@/components/layout/TopBar';
import { BrandUploader } from '@/components/brand/BrandUploader';
import { BrandVoiceEditor } from '@/components/brand/BrandVoiceEditor';
import { BrandAnalysisCard } from '@/components/brand/BrandAnalysisCard';
import { SamplePasteModal } from '@/components/brand/SamplePasteModal';
import { Button } from '@/components/ui/button';
import { useBrandProfile } from '@/hooks/useBrandProfile';
import { mergeBrandProfiles, createEmptyBrandProfile } from '@/lib/brand-voice';
import type { BrandProfile } from '@/types/brand';

type ActiveTab = 'setup' | 'analysis' | 'edit';

export default function BrandPage() {
  const { profile, isLoaded, setFullProfile, updateProfile, resetProfile } = useBrandProfile();
  const [activeTab, setActiveTab] = useState<ActiveTab>('setup');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [pendingSamples, setPendingSamples] = useState<{ text: string; filename: string; wordCount: number }[]>([]);
  const [showPasteModal, setShowPasteModal] = useState(false);

  if (!isLoaded) {
    return (
      <AppShell>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-slate-400">Loading...</div>
        </div>
      </AppShell>
    );
  }

  const handleTextExtracted = (text: string, filename: string, wordCount: number) => {
    setPendingSamples((prev) => [...prev, { text, filename, wordCount }]);
  };

  const handlePasteSample = (text: string) => {
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    setPendingSamples((prev) => [...prev, { text, filename: 'Pasted sample', wordCount }]);
  };

  const handleAnalyze = async () => {
    if (pendingSamples.length === 0) return;
    setIsAnalyzing(true);
    setAnalyzeError(null);

    try {
      const res = await fetch('/api/brand/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          samples: pendingSamples.map((s) => s.text),
          brandName: profile?.name ?? 'My Brand',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Analysis failed');

      const extracted: BrandProfile = data.profile;
      extracted.uploadedSamples = pendingSamples.map((s) => ({
        filename: s.filename,
        type: 'text',
        wordCount: s.wordCount,
        analyzedAt: new Date().toISOString(),
      }));

      const merged = profile
        ? mergeBrandProfiles(profile, extracted)
        : extracted;

      setFullProfile(merged);
      setPendingSamples([]);
      setActiveTab('analysis');
    } catch (err) {
      setAnalyzeError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const TABS: { id: ActiveTab; label: string; icon: string }[] = [
    { id: 'setup', label: 'Upload Samples', icon: '📄' },
    { id: 'analysis', label: 'Voice Analysis', icon: '✨' },
    { id: 'edit', label: 'Edit Profile', icon: '✏️' },
  ];

  return (
    <AppShell>
      <TopBar
        title="Brand Profile"
        brandName={profile?.name}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">
          {/* Tab Bar */}
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-8">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Upload Samples */}
          {activeTab === 'setup' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">
                  Train Your Brand Voice
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Upload writing samples that represent your authentic voice — blog posts, social captions,
                  emails, anything you've written. The more you share, the better IndigoPro will capture your style.
                </p>
              </div>

              <BrandUploader onTextExtracted={handleTextExtracted} />

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs text-slate-400">
                  <span className="bg-white px-3">or</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowPasteModal(true)}
              >
                ✍️ Paste Writing Sample
              </Button>

              {pendingSamples.length > 0 && (
                <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                  <p className="text-sm font-medium text-slate-700">
                    {pendingSamples.length} sample{pendingSamples.length !== 1 ? 's' : ''} ready to analyze
                  </p>
                  {pendingSamples.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                      <span>📝</span>
                      <span>{s.filename}</span>
                      <span className="text-slate-300">·</span>
                      <span>{s.wordCount.toLocaleString()} words</span>
                      <button
                        onClick={() => setPendingSamples((prev) => prev.filter((_, j) => j !== i))}
                        className="ml-auto text-slate-400 hover:text-red-400"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {analyzeError && (
                    <p className="text-sm text-red-500">{analyzeError}</p>
                  )}
                  <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="w-full"
                  >
                    {isAnalyzing ? '🔍 Analyzing your voice...' : '✨ Analyze Brand Voice'}
                  </Button>
                </div>
              )}

              {profile && (
                <div className="mt-4 p-4 bg-green-50 border border-green-100 rounded-xl">
                  <p className="text-sm font-semibold text-green-700 mb-1">
                    ✓ Brand profile active
                  </p>
                  <p className="text-xs text-green-600">
                    {profile.name} · {profile.tone.slice(0, 3).join(', ')}
                  </p>
                  <button
                    onClick={() => setActiveTab('analysis')}
                    className="text-xs text-green-600 underline mt-1 hover:text-green-800"
                  >
                    View analysis →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Voice Analysis */}
          {activeTab === 'analysis' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">Voice Analysis</h2>
                {profile && (
                  <button
                    onClick={() => { resetProfile(); setActiveTab('setup'); }}
                    className="text-sm text-red-400 hover:text-red-600"
                  >
                    Reset Profile
                  </button>
                )}
              </div>

              {profile ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-6">
                  <BrandAnalysisCard profile={profile} />
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <div className="text-4xl mb-3">🧠</div>
                  <p className="font-medium">No brand profile yet</p>
                  <p className="text-sm mt-1">Upload samples to analyze your voice</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setActiveTab('setup')}
                  >
                    Upload Samples
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Edit Profile */}
          {activeTab === 'edit' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-800">Edit Brand Profile</h2>
              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <BrandVoiceEditor
                  profile={profile ?? createEmptyBrandProfile()}
                  onUpdate={updateProfile}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {showPasteModal && (
        <SamplePasteModal
          onSubmit={handlePasteSample}
          onClose={() => setShowPasteModal(false)}
        />
      )}
    </AppShell>
  );
}
