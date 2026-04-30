import type { BrandProfile } from '@/types/brand';
import { v4 as uuidv4 } from 'uuid';

export function createEmptyBrandProfile(): BrandProfile {
  return {
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    name: 'My Brand',
    tone: [],
    vocabulary: 'conversational',
    sentenceStructure: 'varied',
    personalityTraits: [],
    brandKeywords: [],
    avoidWords: [],
    audienceDescription: '',
    writingExamples: [],
    additionalInstructions: '',
    uploadedSamples: [],
  };
}

export function buildBrandVoiceSystemPrompt(profile: BrandProfile): string {
  const hasProfile =
    profile.tone.length > 0 ||
    profile.personalityTraits.length > 0 ||
    profile.brandKeywords.length > 0 ||
    profile.writingExamples.length > 0 ||
    profile.audienceDescription;

  const base = `You are an expert content creator and copywriter. Your task is to generate content that authentically matches a specific brand's voice, tone, and style.`;

  if (!hasProfile) {
    return `${base}

No brand profile has been configured yet. Generate high-quality, professional content based on the user's request.

## Core Content Principles
- Write clearly and compellingly
- Match the requested format and length precisely
- Adapt your tone to the content type (professional for LinkedIn, casual for Instagram, etc.)
- Always include a clear call to action where appropriate
- Use strong, active verbs and concrete language
- Avoid clichés and generic filler phrases`;
  }

  const sections: string[] = [
    base,
    '',
    `## Brand Identity`,
    `**Brand Name**: ${profile.name}`,
    `**Tone**: ${profile.tone.length > 0 ? profile.tone.join(', ') : 'Not specified'}`,
    `**Vocabulary Level**: ${profile.vocabulary}`,
    `**Sentence Structure**: ${profile.sentenceStructure} sentences`,
    `**Personality Traits**: ${profile.personalityTraits.length > 0 ? profile.personalityTraits.join(', ') : 'Not specified'}`,
  ];

  if (profile.audienceDescription) {
    sections.push(`**Target Audience**: ${profile.audienceDescription}`);
  }

  if (profile.brandKeywords.length > 0) {
    sections.push(
      '',
      '## Brand Keywords & Phrases',
      'Use these words and phrases naturally throughout your writing:',
      profile.brandKeywords.map((k) => `- ${k}`).join('\n')
    );
  }

  if (profile.avoidWords.length > 0) {
    sections.push(
      '',
      '## Words & Phrases to Avoid',
      'Never use these — they break the brand voice:',
      profile.avoidWords.map((w) => `- ${w}`).join('\n')
    );
  }

  if (profile.writingExamples.length > 0) {
    sections.push(
      '',
      '## Authentic Writing Examples',
      'These examples represent this brand\'s authentic voice. Study the rhythm, word choices, and sentence patterns carefully — mirror them precisely:',
      '',
      ...profile.writingExamples.map((ex, i) => `### Example ${i + 1}\n---\n${ex}\n---`)
    );
  }

  if (profile.additionalInstructions) {
    sections.push(
      '',
      '## Additional Brand Instructions',
      profile.additionalInstructions
    );
  }

  sections.push(
    '',
    '## Your Directive',
    `Always generate content that sounds EXACTLY like ${profile.name} wrote it. Every sentence should feel native to this brand. Never break character or slip into generic AI-sounding language. The content should be indistinguishable from content this brand would naturally produce.`
  );

  return sections.join('\n');
}

export function mergeBrandProfiles(
  existing: BrandProfile,
  extracted: Partial<BrandProfile>
): BrandProfile {
  return {
    ...existing,
    ...extracted,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
    tone: dedupe([...existing.tone, ...(extracted.tone ?? [])]),
    personalityTraits: dedupe([...existing.personalityTraits, ...(extracted.personalityTraits ?? [])]),
    brandKeywords: dedupe([...existing.brandKeywords, ...(extracted.brandKeywords ?? [])]),
    avoidWords: dedupe([...existing.avoidWords, ...(extracted.avoidWords ?? [])]),
    writingExamples: [...existing.writingExamples, ...(extracted.writingExamples ?? [])].slice(-3),
    uploadedSamples: [...existing.uploadedSamples, ...(extracted.uploadedSamples ?? [])],
  };
}

function dedupe(arr: string[]): string[] {
  return [...new Set(arr.map((s) => s.toLowerCase().trim()))];
}
