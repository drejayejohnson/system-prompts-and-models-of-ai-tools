import { NextResponse } from "next/server";
import { createRealtimeSession } from "@/lib/openai";

export async function POST() {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY is not configured" }, { status: 500 });
  }
  try {
    const session = await createRealtimeSession();
    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (err) {
    console.error("Failed to create Realtime session:", err);
    return NextResponse.json({ error: "Failed to create voice session" }, { status: 500 });
  }
}
