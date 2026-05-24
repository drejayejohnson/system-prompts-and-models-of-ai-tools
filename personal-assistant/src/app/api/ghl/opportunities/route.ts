import { NextRequest, NextResponse } from "next/server";
import { getPipelines, getOpportunities, updateOpportunityStage } from "@/lib/ghl";

export async function GET(req: NextRequest) {
  if (!process.env.GHL_API_KEY) return NextResponse.json({ error: "GHL not configured" }, { status: 500 });
  const { searchParams } = new URL(req.url);
  const pipelineId = searchParams.get("pipelineId") ?? undefined;
  const includePipelines = searchParams.get("includePipelines") === "true";
  try {
    const [opportunities, pipelines] = await Promise.all([getOpportunities(pipelineId), includePipelines ? getPipelines() : Promise.resolve([])]);
    return NextResponse.json({ opportunities, pipelines });
  } catch (err) {
    console.error("GHL opportunities error:", err);
    return NextResponse.json({ error: "Failed to fetch opportunities" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!process.env.GHL_API_KEY) return NextResponse.json({ error: "GHL not configured" }, { status: 500 });
  const { opportunityId, stageId } = await req.json();
  if (!opportunityId || !stageId) return NextResponse.json({ error: "opportunityId and stageId required" }, { status: 400 });
  try {
    const opportunity = await updateOpportunityStage(opportunityId, stageId);
    return NextResponse.json({ opportunity });
  } catch (err) {
    console.error("GHL update stage error:", err);
    return NextResponse.json({ error: "Failed to update opportunity stage" }, { status: 500 });
  }
}
