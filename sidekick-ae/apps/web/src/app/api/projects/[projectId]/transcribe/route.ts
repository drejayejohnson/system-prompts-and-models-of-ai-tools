import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { transcriptionQueue } from "@/lib/queue";

export async function POST(
  _req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const project = await prisma.project.findFirst({
    where: { id: params.projectId, userId: session.user.id },
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const clips = await prisma.clip.findMany({
    where: {
      projectId: params.projectId,
      role: "AROLL",
      status: "UPLOADED",
    },
  });

  if (clips.length === 0) {
    return NextResponse.json({ message: "No clips to transcribe", queued: 0 });
  }

  const jobs = await Promise.all(
    clips.map((clip) =>
      transcriptionQueue.add("transcribe", {
        clipId: clip.id,
        projectId: params.projectId,
        s3Key: clip.s3Key,
      })
    )
  );

  await prisma.clip.updateMany({
    where: { id: { in: clips.map((c) => c.id) } },
    data: { status: "TRANSCRIBING" },
  });

  return NextResponse.json({ queued: jobs.length });
}
