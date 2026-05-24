// ─── Chat / Conversation ────────────────────────────────────────
export type Role = "user" | "assistant" | "system";

export interface Message {
  id: string;
  role: Role;
  content: string;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

// ─── Email ─────────────────────────────────────────────────────
export interface EmailThread {
  id: string;
  subject: string;
  snippet: string;
  from: string;
  date: string;
  unread: boolean;
  messageCount: number;
}

export interface EmailMessage {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  body: string;
  isHtml: boolean;
}

export interface SendEmailParams {
  to: string;
  subject: string;
  body: string;
  replyToMessageId?: string;
}

// ─── Calendar ───────────────────────────────────────────────────
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  location?: string;
  attendees?: string[];
  isAllDay: boolean;
  calendarId: string;
}

export interface CreateEventParams {
  title: string;
  start: string;
  end: string;
  description?: string;
  attendees?: string[];
  location?: string;
}

// ─── GoHighLevel ──────────────────────────────────────────────
export interface GHLContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  tags: string[];
  companyName?: string;
  notes?: string;
}

export interface GHLOpportunity {
  id: string;
  name: string;
  contactId: string;
  contactName: string;
  pipelineId: string;
  pipelineStageId: string;
  stageName: string;
  monetaryValue?: number;
  status: "open" | "won" | "lost" | "abandoned";
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GHLPipelineStage {
  id: string;
  name: string;
  position: number;
}

export interface GHLPipeline {
  id: string;
  name: string;
  stages: GHLPipelineStage[];
}

export interface GHLAppointment {
  id: string;
  title: string;
  contactId: string;
  startTime: string;
  endTime: string;
  status: "confirmed" | "cancelled" | "showed" | "noshow";
}

// ─── Voice / Realtime ──────────────────────────────────────────
export type VoiceStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "listening"
  | "speaking"
  | "error";

export interface RealtimeSessionToken {
  clientSecret: { value: string };
}

// ─── Tool calls (voice function calling) ─────────────────────
export interface ToolCallResult {
  toolCallId: string;
  output: string;
}
