'use client';

import { useState } from 'react';
import { ContentTypeSelector } from './ContentTypeSelector';
import { TemplateGallery } from './TemplateGallery';
import { GenerationForm } from './GenerationForm';
import { GeneratedOutput } from './GeneratedOutput';
import { useGeneration } from '@/hooks/useGeneration';
import type { ContentType, GenerationRequest, ContentTemplate } from '@/types/generation';
import type { BrandProfile } from '@/types/brand';

type Step = 'start' | 'type' | 'template' | 'form' | 'output';

interface GenerationPanelProps {
  brandProfile: BrandProfile | null;
  initialTopic?: string;
  initialContentType?: ContentType;
  onClose: () => void;
  onAddToCanvas: (text: string, contentType: ContentType) => void;
}

export function GenerationPanel({
  brandProfile,
  initialTopic,
  initialContentType,
  onClose,
  onAddToCanvas,
}: GenerationPanelProps) {
  const [step, setStep] = useState<Step>(initialContentType ? 'form' : 'start');
  const [selectedType, setSelectedType] = useState<ContentType | null>(initialContentType ?? null);
  const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | null>(null);
  const [lastRequest, setLastRequest] = useState<GenerationRequest | null>(null);

  const { state, output, error, generate, reset, stop } = useGeneration();

  const handleTypeSelect = (type: ContentType) => {
    setSelectedType(type);
    setStep('form');
  };

  const handleTemplateSelect = (template: ContentTemplate) => {
    setSelectedTemplate(template);
    setSelectedType(template.contentType);
    setStep('form');
  };

  const handleGenerate = async (request: GenerationRequest) => {
    setLastRequest(request);
    setStep('output');
    await generate(request, brandProfile);
  };

  const handleRegenerate = () => {
    if (lastRequest) {
      reset();
      generate(lastRequest, brandProfile);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-2">
          {step !== 'start' && (
            <button
              onClick={() => {
                if (step === 'output') {
                  reset();
                  setStep('form');
                } else {
                  setStep('start');
                }
              }}
              className="text-slate-400 hover:text-slate-600 text-sm mr-1 w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100"
            >
              ←
            </button>
          )}
          <h2 className="font-semibold text-slate-800">
            {step === 'start' && 'Create Content'}
            {step === 'type' && 'Choose Type'}
            {step === 'template' && 'Templates'}
            {step === 'form' && (selectedTemplate?.name ?? 'Generate')}
            {step === 'output' && 'Generated Content'}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {step === 'output' && (
            <button
              onClick={() => { reset(); setSelectedType(null); setSelectedTemplate(null); setStep('start'); }}
              className="text-xs text-pink-500 hover:text-pink-700 font-medium px-2 py-1 rounded hover:bg-pink-50"
            >
              + New
            </button>
          )}
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg leading-none w-6 h-6 flex items-center justify-center">×</button>
        </div>
      </div>

      {/* Brand voice indicator */}
      {brandProfile && (
        <div className="px-5 py-2.5 bg-pink-50 border-b border-pink-100 shrink-0">
          <p className="text-xs text-pink-600 font-medium">
            ✨ Writing as <strong>{brandProfile.name}</strong>
            {brandProfile.tone.length > 0 && (
              <span className="text-pink-400 font-normal"> · {brandProfile.tone.slice(0, 2).join(', ')}</span>
            )}
          </p>
        </div>
      )}

      {/* Content */}
      <div className={`flex-1 overflow-y-auto px-5 py-5 ${step === 'output' ? 'flex flex-col' : ''}`}>
        {step === 'start' && (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">How would you like to start?</p>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => setStep('template')}
                className="flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 hover:border-pink-300 hover:bg-pink-50/30 text-left transition-all"
              >
                <span className="text-2xl">🎨</span>
                <div>
                  <div className="font-semibold text-slate-700">Start from a Template</div>
                  <div className="text-xs text-slate-400 mt-0.5">12 pre-built templates for every content type</div>
                </div>
              </button>
              <button
                onClick={() => setStep('type')}
                className="flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 hover:border-pink-300 hover:bg-pink-50/30 text-left transition-all"
              >
                <span className="text-2xl">✍️</span>
                <div>
                  <div className="font-semibold text-slate-700">Choose Content Type</div>
                  <div className="text-xs text-slate-400 mt-0.5">Blog, social, email, video, and more</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {step === 'type' && (
          <ContentTypeSelector selected={selectedType} onSelect={handleTypeSelect} />
        )}

        {step === 'template' && (
          <TemplateGallery onSelect={handleTemplateSelect} />
        )}

        {step === 'form' && selectedType && (
          <GenerationForm
            contentType={selectedType}
            templateId={selectedTemplate?.id}
            initialTopic={initialTopic}
            onSubmit={handleGenerate}
            onBack={() => setStep('start')}
            isGenerating={state === 'generating'}
          />
        )}

        {step === 'output' && (
          <div className="flex flex-col flex-1 h-full">
            {error && (
              <div className="mb-3 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}
            <GeneratedOutput
              output={output}
              isGenerating={state === 'generating'}
              onStop={stop}
              onReset={handleRegenerate}
              onAddToCanvas={(text) => {
                onAddToCanvas(text, selectedType!);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
