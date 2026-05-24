import { Worker } from "bullmq";
import { connection } from "@/lib/queue";
import type { TranscriptionJobPayload, ExportJobPayload } from "@/types";

const PROCESSOR_URL = process.env.PROCESSOR_URL ?? "http://localhost:8000";

const transcriptionWorker = new Worker<TranscriptionJobPayload>(
  "transcription",
  async (job) => {
    const { clipId, projectId, s3Key } = job.data;
    const res = await fetch(`${PROCESSOR_URL}/jobs/transcribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clipId, projectId, s3Key }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Processor transcription error: ${text}`);
    }
  },
  { connection }
);

const exportWorker = new Worker<ExportJobPayload>(
  "export",
  async (job) => {
    const { exportId, roughCutId, projectId, format } = job.data;
    const res = await fetch(`${PROCESSOR_URL}/jobs/export`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exportId, roughCutId, projectId, format }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Processor export error: ${text}`);
    }
  },
  { connection }
);

transcriptionWorker.on("failed", (job, err) => {
  console.error(`[transcription] job ${job?.id} failed:`, err.message);
});

exportWorker.on("failed", (job, err) => {
  console.error(`[export] job ${job?.id} failed:`, err.message);
});

console.log("Sidekick AE workers started");
