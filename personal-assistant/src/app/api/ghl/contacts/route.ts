import { NextRequest, NextResponse } from "next/server";
import { searchContacts, getContact } from "@/lib/ghl";

export async function GET(req: NextRequest) {
  if (!process.env.GHL_API_KEY) return NextResponse.json({ error: "GHL not configured" }, { status: 500 });
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");
  const id = searchParams.get("id");
  try {
    if (id) { const contact = await getContact(id); return NextResponse.json({ contact }); }
    if (!query) return NextResponse.json({ error: "query or id required" }, { status: 400 });
    const contacts = await searchContacts(query);
    return NextResponse.json({ contacts });
  } catch (err) {
    console.error("GHL contacts error:", err);
    return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 });
  }
}
