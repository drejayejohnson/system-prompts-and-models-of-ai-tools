import { NextRequest, NextResponse } from 'next/server';
import { getAnthropicClient } from '@/lib/anthropic';
import type { BrandProfile } from '@/types/brand';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';

const EXTRACTION_PROMPT = `Analyze the writing samples below and extract a comprehensive brand voice profile.

Return ONLY a valid JSON object with NO markdown formatting, no code blocks, no explanation — just the raw JSON.

Required JSON schema:
{
  "tone": ["array", "of", "3-6", "tone", "adjectives"],
  "vocabulary": "formal" | "casual" | "technical" | "conversational",
  "sentenceStructure": "short" | "medium" | "long" | "varied",
  "personalityTraits": ["array", "of", "3-5", "personality", "descriptors"],
  "brandKeywords": ["array", "of", "5-10", "recurring", "representative", "words", "or", "phrases"],
  "avoidWords": ["array", "of", "words", "or", "phrases", "that", "break", "this", "voice"],
  "audienceDescription": "1-2 sentence description of who this brand speaks to",
  "writingExamples": ["up to 3 short excerpts (50-100 words each) that best exemplify the voice"]
}

Extract these carefully:
1. Tone: adjectives describing the overall emotional quality (e.g., "warm", "authoritative", "playful")
2. Vocabulary: the dominant register used
3. Sentence structure: the predominant sentence length pattern
4. Personality traits: the human personality behind the writing (e.g., "empathetic", "bold", "witty")
5. Brand keywords: words/phrases this writer naturally gravitates toward
6. Words to avoid: generic, corporate, or off-brand language this writer never uses
7. Audience: who is this person writing for and why
8. Examples: the best 50-100 word excerpts that show the voice at its purest`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { samples, brandName } = body as { samples: string[]; brandName?: string };

    if (!samples || samples.length === 0) {
      return NextResponse.json({ error: 'No samples provided' }, { status: 400 });
    }

    const combinedText = samples
      .map((s, i) => `--- Sample ${i + 1} ---\n${s.trim()}`)
      .join('\n\n');

    const anthropic = getAnthropicClient();

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: EXTRACTION_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Here are the writing samples to analyze:\n\n${combinedText}`,
        },
      ],
    });

    const rawText = response.content[0].type === 'text' ? response.content[0].text : '';

    let extracted: Partial<BrandProfile>;
    try {
      // Strip any accidental markdown code fences
      const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      extracted = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: 'Failed to parse brand analysis from AI' }, { status: 500 });
    }

    const profile: BrandProfile = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      name: brandName ?? 'My Brand',
      tone: extracted.tone ?? [],
      vocabulary: extracted.vocabulary ?? 'conversational',
      sentenceStructure: extracted.sentenceStructure ?? 'varied',
      personalityTraits: extracted.personalityTraits ?? [],
      brandKeywords: extracted.brandKeywords ?? [],
      avoidWords: extracted.avoidWords ?? [],
      audienceDescription: extracted.audienceDescription ?? '',
      writingExamples: extracted.writingExamples ?? [],
      additionalInstructions: '',
      uploadedSamples: [],
    };

    return NextResponse.json({ profile });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Analysis failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
