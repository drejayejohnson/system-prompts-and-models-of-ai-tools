import { Queue } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

export const transcriptionQueue = new Queue("transcription", { connection });
export const exportQueue = new Queue("export", { connection });
export const brollQueue = new Queue("broll", { connection });

export { connection };
