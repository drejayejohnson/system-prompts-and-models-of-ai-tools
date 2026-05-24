import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "./prisma";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const CLAUDE_MODEL = "claude-sonnet-4-6";

export const EDITOR_SYSTEM_PROMPT = `You are an expert video editor and documentary filmmaker working as an AI assistant inside Sidekick AE.

You receive raw interview transcripts and the user's creative direction. Your job is to:
1. Select the best transcript segments that tell a compelling story matching the user's intent
2. Order them for maximum narrative impact (not necessarily chronological)
3. Avoid repetition and filler — prefer moments of clarity, emotion, or insight
4. Explain your editorial reasoning briefly

You will be given transcripts from one or more clips. Each transcript segment is formatted as:
[MM:SS - MM:SS] "text"

You MUST respond using the generate_rough_cut tool. Do not respond with plain text only — always call the tool.`;

export const roughCutTool: Anthropic.Tool = {
  name: "generate_rough_cut",
  description: "Generate an ordered rough cut from the best transcript segments",
  input_schema: {
    type: "object" as const,
    properties: {
      rationale: {
        type: "string",
        description: "Brief editorial explanation of the choices made (2-4 sentences)",
      },
      segments: {
        type: "array",
        items: {
          type: "object",
          properties: {
            clipId: { type: "string", description: "The ID of the source clip" },
            startSec: { type: "number", description: "Start time in seconds" },
            endSec: { type: "number", description: "End time in seconds" },
            text: { type: "string", description: "The transcript text in this segment" },
            order: { type: "integer", description: "Position in the rough cut (0-indexed)" },
          },
          required: ["clipId", "startSec", "endSec", "text", "order"],
        },
      },
    },
    required: ["rationale", "segments"],
  },
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export async function buildTranscriptContext(projectId: string): Promise<string> {
  const clips = await prisma.clip.findMany({
    where: { projectId, role: "AROLL", status: "TRANSCRIBED" },
    include: { transcript: true },
    orderBy: { createdAt: "asc" },
  });

  if (clips.length === 0) return "No transcribed clips available yet.";

  return clips
    .map((clip) => {
      const raw = clip.transcript!.rawJson as {
        segments: Array<{ start: number; end: number; text: string }>;
      };
      const segments = raw.segments
        .map((s) => `[${formatTime(s.start)} - ${formatTime(s.end)}] "${s.text.trim()}"`)
        .join("\n");
      return `=== CLIP: ${clip.fileName} (id: ${clip.id}) ===\n${segments}`;
    })
    .join("\n\n");
}

export async function buildCurrentCutContext(projectId: string): Promise<string> {
  const roughCut = await prisma.roughCut.findFirst({
    where: { projectId },
    orderBy: { version: "desc" },
  });
  if (!roughCut) return "";

  const segs = roughCut.segments as Array<{
    clipId: string;
    startSec: number;
    endSec: number;
    text: string;
    order: number;
  }>;

  const formatted = [...segs]
    .sort((a, b) => a.order - b.order)
    .map(
      (s) =>
        `[Order ${s.order}] [${formatTime(s.startSec)} - ${formatTime(s.endSec)}] "${s.text}"`
    )
    .join("\n");

  return `\n\nCURRENT ROUGH CUT (v${roughCut.version}):\n${formatted}`;
}
