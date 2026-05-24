import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUploadPresignedUrl } from "@/lib/s3";
import { z } from "zod";
import { randomUUID } from "crypto";

const uploadSchema = z.object({
  fileName: z.string().min(1),
  contentType: z.string().regex(/^video\//),
  role: z.enum(["AROLL", "BROLL"]).default("AROLL"),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const project = await prisma.project.findFirst({
    where: { id: params.projectId, userId: session.user.id },
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = uploadSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { fileName, contentType, role } = parsed.data;
  const s3Key = `projects/${params.projectId}/clips/${randomUUID()}-${fileName}`;

  const presignedUrl = await getUploadPresignedUrl(s3Key, contentType);

  const clip = await prisma.clip.create({
    data: {
      projectId: params.projectId,
      fileName,
      s3Key,
      role,
      status: "UPLOADED",
    },
  });

  return NextResponse.json({ clipId: clip.id, presignedUrl, s3Key });
}
