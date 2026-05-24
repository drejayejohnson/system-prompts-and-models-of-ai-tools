export interface RoughCutSegment {
  clipId: string;
  clipFileName: string;
  startSec: number;
  endSec: number;
  text: string;
  order: number;
}

export interface WhisperSegment {
  start: number;
  end: number;
  text: string;
}

export interface WhisperWord {
  word: string;
  start: number;
  end: number;
}

export interface WhisperVerboseJson {
  text: string;
  language: string;
  segments: WhisperSegment[];
  words: WhisperWord[];
}

export interface TranscriptionJobPayload {
  clipId: string;
  projectId: string;
  s3Key: string;
}

export interface ExportJobPayload {
  exportId: string;
  roughCutId: string;
  projectId: string;
  format: "FCPXML" | "EDL";
}

export interface WebhookPayload {
  type: "transcript_complete" | "export_complete";
  clipId?: string;
  exportId?: string;
  projectId: string;
  error?: string;
}
