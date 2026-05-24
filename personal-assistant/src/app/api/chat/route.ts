import { NextRequest, NextResponse } from "next/server";
import { streamWithClaude } from "@/lib/anthropic";
import type { Message } from "@/types";

export async function POST(req: NextRequest) {
  const { messages, system } = (await req.json()) as { messages: Message[]; system?: string };
  if (!messages?.length) return NextResponse.json({ error: "messages required" }, { status: 400 });
  try {
    const stream = await streamWithClaude(messages, system);
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      },
    });
    return new NextResponse(readable, { headers: { "Content-Type": "text/plain; charset=utf-8", "Transfer-Encoding": "chunked", "X-Content-Type-Options": "nosniff" } });
  } catch (err) {
    console.error("Claude chat error:", err);
    return NextResponse.json({ error: "Failed to get Claude response" }, { status: 500 });
  }
}
