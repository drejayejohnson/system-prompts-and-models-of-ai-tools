import Anthropic from "@anthropic-ai/sdk";
import type { Message } from "@/types";

let _anthropic: Anthropic | null = null;

function getAnthropic(): Anthropic {
  if (!_anthropic) {
    _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _anthropic;
}

export const anthropic = { get client() { return getAnthropic(); } };

const OWNER_NAME = process.env.ASSISTANT_OWNER_NAME || "the user";

const SYSTEM_PROMPT = `You are a personal AI business assistant for ${OWNER_NAME}. You are thoughtful, professional, and concise.

You help with:
- Drafting, summarizing, and analyzing emails
- Reviewing and planning calendar schedules
- Analyzing GoHighLevel CRM data and pipeline
- Writing professional communications
- Strategic business advice and planning

When drafting emails or messages:
- Match the tone of prior correspondence if provided
- Be professional but personable
- Keep subject lines clear and specific
- End with appropriate sign-offs

Format your responses using markdown when helpful (lists, headers, bold text for emphasis).`;

export async function chatWithClaude(
  messages: Message[],
  systemOverride?: string
) {
  const response = await getAnthropic().messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: systemOverride ?? SYSTEM_PROMPT,
    messages: messages.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    })),
  });

  const content = response.content[0];
  return content.type === "text" ? content.text : "";
}

export async function streamWithClaude(
  messages: Message[],
  systemOverride?: string
) {
  return getAnthropic().messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: systemOverride ?? SYSTEM_PROMPT,
    messages: messages.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    })),
  });
}

export async function draftEmailWithClaude(params: {
  context: string;
  to: string;
  intent: string;
  priorThread?: string;
}): Promise<{ subject: string; body: string }> {
  const prompt = `Draft a professional email with the following details:
To: ${params.to}
Intent: ${params.intent}
${params.priorThread ? `\nPrior email thread for context:\n${params.priorThread}` : ""}

Respond in this exact JSON format:
{"subject": "...", "body": "..."}

Keep the body professional and concise.`;

  const response = await getAnthropic().messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
    // fallback
  }

  return {
    subject: "Re: Your message",
    body: text,
  };
}

export async function summarizeEmailThread(thread: string): Promise<string> {
  const response = await getAnthropic().messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 256,
    messages: [
      {
        role: "user",
        content: `Summarize this email thread in 1-2 sentences, focusing on what action (if any) is needed:\n\n${thread}`,
      },
    ],
  });

  const content = response.content[0];
  return content.type === "text" ? content.text : "";
}
