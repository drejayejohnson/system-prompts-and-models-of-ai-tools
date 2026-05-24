import { NextRequest, NextResponse } from "next/server";
import { getAppointments } from "@/lib/ghl";
import { addDays } from "date-fns";

export async function GET(req: NextRequest) {
  if (!process.env.GHL_API_KEY) return NextResponse.json({ error: "GHL not configured" }, { status: 500 });
  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") ?? "7", 10);
  const calendarId = searchParams.get("calendarId") ?? undefined;
  const startDate = new Date().toISOString();
  const endDate = addDays(new Date(), days).toISOString();
  try {
    const appointments = await getAppointments(startDate, endDate, calendarId);
    return NextResponse.json({ appointments });
  } catch (err) {
    console.error("GHL calendar error:", err);
    return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 });
  }
}
