import OpenAI from "openai";

let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

export const openai = { get client() { return getOpenAI(); } };

const OWNER_NAME = process.env.ASSISTANT_OWNER_NAME || "the user";

export const REALTIME_SYSTEM_PROMPT = `You are a personal AI business assistant for ${OWNER_NAME}. You are helpful, concise, and professional.

You have access to the following tools:
- get_emails: Retrieve recent emails from Gmail
- send_email: Draft and send an email (always confirm before sending)
- get_calendar_events: Get upcoming calendar events
- create_calendar_event: Schedule a new meeting or event
- search_ghl_contact: Look up a contact in GoHighLevel CRM
- get_ghl_pipeline: View the sales pipeline and opportunities
- create_ghl_task: Create a task in GoHighLevel

Guidelines for voice responses:
- Keep responses brief and natural — you are speaking out loud
- For complex tasks like drafting emails, say what you're drafting then ask for confirmation
- Use the owner's name occasionally to feel personal
- When asked to perform an action, call the appropriate tool first, then summarize results verbally`;

export async function createRealtimeSession() {
  const response = await getOpenAI().beta.realtime.sessions.create({
    model: "gpt-4o-realtime-preview-2024-12-17",
    voice: "alloy",
    instructions: REALTIME_SYSTEM_PROMPT,
    tools: [
      {
        type: "function",
        name: "get_emails",
        description: "Get recent emails from Gmail inbox",
        parameters: {
          type: "object",
          properties: {
            maxResults: {
              type: "number",
              description: "Maximum number of email threads to retrieve (default 10)",
            },
            query: {
              type: "string",
              description: "Optional Gmail search query (e.g. 'is:unread', 'from:john@example.com')",
            },
          },
        },
      },
      {
        type: "function",
        name: "send_email",
        description: "Send an email via Gmail",
        parameters: {
          type: "object",
          required: ["to", "subject", "body"],
          properties: {
            to: { type: "string", description: "Recipient email address" },
            subject: { type: "string", description: "Email subject line" },
            body: { type: "string", description: "Email body (plain text)" },
            replyToMessageId: {
              type: "string",
              description: "Gmail message ID to reply to (optional)",
            },
          },
        },
      },
      {
        type: "function",
        name: "get_calendar_events",
        description: "Get upcoming calendar events",
        parameters: {
          type: "object",
          properties: {
            days: {
              type: "number",
              description: "Number of days ahead to look (default 7)",
            },
          },
        },
      },
      {
        type: "function",
        name: "create_calendar_event",
        description: "Create a new event on the user's Google Calendar",
        parameters: {
          type: "object",
          required: ["title", "start", "end"],
          properties: {
            title: { type: "string" },
            start: { type: "string", description: "ISO 8601 datetime string" },
            end: { type: "string", description: "ISO 8601 datetime string" },
            description: { type: "string" },
            attendees: {
              type: "array",
              items: { type: "string" },
              description: "List of attendee email addresses",
            },
            location: { type: "string" },
          },
        },
      },
      {
        type: "function",
        name: "search_ghl_contact",
        description: "Search for a contact in GoHighLevel CRM",
        parameters: {
          type: "object",
          required: ["query"],
          properties: {
            query: {
              type: "string",
              description: "Name, email, or phone number to search for",
            },
          },
        },
      },
      {
        type: "function",
        name: "get_ghl_pipeline",
        description: "Get the GoHighLevel sales pipeline and opportunities",
        parameters: {
          type: "object",
          properties: {
            pipelineId: {
              type: "string",
              description: "Optional pipeline ID to filter by",
            },
          },
        },
      },
      {
        type: "function",
        name: "create_ghl_task",
        description: "Create a task in GoHighLevel",
        parameters: {
          type: "object",
          required: ["title"],
          properties: {
            title: { type: "string" },
            contactId: { type: "string", description: "Optional contact to associate" },
            dueDate: { type: "string", description: "ISO 8601 date string" },
            description: { type: "string" },
          },
        },
      },
    ],
    tool_choice: "auto",
  });

  return response;
}
