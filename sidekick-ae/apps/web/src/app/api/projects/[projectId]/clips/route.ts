import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
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
    where: { projectId: params.projectId },
    include: {
      transcript: {
        select: { id: true, plainText: true, language: true, createdAt: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(clips);
}
