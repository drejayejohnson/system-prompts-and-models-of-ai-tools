import { NextRequest, NextResponse } from 'next/server';
import { getAnthropicClient } from '@/lib/anthropic';
import { buildBrandVoiceSystemPrompt } from '@/lib/brand-voice';
import { CONTENT_TEMPLATES, CONTENT_TYPE_LABELS } from '@/lib/templates';
import type { BrandProfile } from '@/types/brand';
import type { GenerationRequest, ContentType } from '@/types/generation';
import type { ChatMessage } from '@/types/chat';

export const runtime = 'nodejs';

const LENGTH_INSTRUCTIONS: Record<string, string> = {
  short: 'Keep it concise and punchy. Aim for brevity — short paragraphs, snappy sentences.',
  medium: 'Write a moderate length piece — thorough but not exhaustive. Strike a balance.',
  long: 'Write a comprehensive, detailed piece. Cover the topic thoroughly with depth and examples.',
};

function buildUserPrompt(
  request: GenerationRequest,
  mode: 'generate' | 'chat'
): string {
  if (mode === 'chat') return request.topic;

  const label = CONTENT_TYPE_LABELS[request.contentType] ?? request.contentType;
  const template = request.templateId
    ? CONTENT_TEMPLATES.find((t) => t.id === request.templateId)
    : null;

  const parts: string[] = [
    `Generate a ${label} about the following topic:`,
    `**Topic**: ${request.topic}`,
  ];

  if (request.context) parts.push(`**Context/Background**: ${request.context}`);
  if (request.targetAudience) parts.push(`**Target Audience**: ${request.targetAudience}`);
  if (request.toneOverride) parts.push(`**Tone Override**: For this piece, lean more ${request.toneOverride}`);

  parts.push(`**Length**: ${LENGTH_INSTRUCTIONS[request.lengthPreference]}`);

  if (template) {
    parts.push(`\n**Format Instructions**:\n${template.promptScaffold}`);
  }

  if (request.additionalInstructions) {
    parts.push(`**Additional Instructions**: ${request.additionalInstructions}`);
  }

  parts.push(
    '\nWrite the content now. Output ONLY the final content — no meta-commentary, no "Here is your...", no preamble. Just the content itself.'
  );

  return parts.join('\n');
}

interface GenerateBody {
  request: GenerationRequest;
  brandProfile: BrandProfile;
  mode?: 'generate' | 'chat';
  chatHistory?: ChatMessage[];
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GenerateBody;
    const { request, brandProfile, mode = 'generate', chatHistory = [] } = body;

    if (!request || !brandProfile) {
      return NextResponse.json({ error: 'Missing request or brandProfile' }, { status: 400 });
    }

    const anthropic = getAnthropicClient();
    const systemPrompt = buildBrandVoiceSystemPrompt(brandProfile);

    const messages: { role: 'user' | 'assistant'; content: string }[] = [
      ...chatHistory.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: buildUserPrompt(request, mode) },
    ];

    // Use prompt caching on the system prompt block (requires >= 1024 tokens to cache)
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          const claudeStream = anthropic.messages.stream({
            model: 'claude-sonnet-4-6',
            max_tokens: 4096,
            system: [
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              {
                type: 'text',
                text: systemPrompt,
                cache_control: { type: 'ephemeral' },
              } as any,
            ],
            messages,
          });

          for await (const event of claudeStream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              const chunk = JSON.stringify({ text: event.delta.text });
              controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
            }
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Stream error';
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`)
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Generation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
