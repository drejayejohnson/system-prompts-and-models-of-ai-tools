import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listCalendarEvents, createCalendarEvent } from "@/lib/gcal";
import type { CreateEventParams } from "@/types";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.accessToken) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") ?? "7", 10);
  const calendarId = searchParams.get("calendarId") ?? "primary";
  try {
    const events = await listCalendarEvents(session.accessToken, { days, calendarId });
    return NextResponse.json({ events });
  } catch (err) {
    console.error("Calendar list error:", err);
    return NextResponse.json({ error: "Failed to fetch calendar events" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.accessToken) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const params = (await req.json()) as CreateEventParams;
  if (!params.title || !params.start || !params.end) return NextResponse.json({ error: "title, start, and end are required" }, { status: 400 });
  try {
    const event = await createCalendarEvent(session.accessToken, params);
    return NextResponse.json({ event });
  } catch (err) {
    console.error("Calendar create error:", err);
    return NextResponse.json({ error: "Failed to create calendar event" }, { status: 500 });
  }
}
