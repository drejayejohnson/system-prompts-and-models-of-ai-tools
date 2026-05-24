import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listEmailThreads, sendEmail } from "@/lib/gmail";
import type { SendEmailParams } from "@/types";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.accessToken) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const maxResults = parseInt(searchParams.get("maxResults") ?? "20", 10);
  const query = searchParams.get("query") ?? "";
  try {
    const threads = await listEmailThreads(session.accessToken, { maxResults, query });
    return NextResponse.json({ threads });
  } catch (err) {
    console.error("Gmail list error:", err);
    return NextResponse.json({ error: "Failed to fetch emails" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.accessToken) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const params = (await req.json()) as SendEmailParams;
  if (!params.to || !params.subject || !params.body) return NextResponse.json({ error: "to, subject, and body are required" }, { status: 400 });
  try {
    const messageId = await sendEmail(session.accessToken, params);
    return NextResponse.json({ messageId });
  } catch (err) {
    console.error("Gmail send error:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
