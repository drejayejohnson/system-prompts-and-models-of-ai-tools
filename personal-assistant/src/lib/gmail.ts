import { google } from "googleapis";
import type { EmailThread, EmailMessage, SendEmailParams } from "@/types";

function getGmailClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.gmail({ version: "v1", auth });
}

export async function listEmailThreads(
  accessToken: string,
  options: { maxResults?: number; query?: string } = {}
): Promise<EmailThread[]> {
  const gmail = getGmailClient(accessToken);
  const { maxResults = 20, query = "" } = options;

  const listRes = await gmail.users.threads.list({
    userId: "me",
    maxResults,
    q: query || "in:inbox",
  });

  const threads = listRes.data.threads ?? [];
  if (threads.length === 0) return [];

  const detailed = await Promise.all(
    threads.map(async (t) => {
      const res = await gmail.users.threads.get({
        userId: "me",
        id: t.id!,
        format: "metadata",
        metadataHeaders: ["Subject", "From", "Date"],
      });

      const messages = res.data.messages ?? [];
      const firstMsg = messages[0];
      const headers = firstMsg?.payload?.headers ?? [];

      const getHeader = (name: string) =>
        headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? "";

      const labelIds = firstMsg?.labelIds ?? [];

      return {
        id: t.id!,
        subject: getHeader("Subject") || "(no subject)",
        snippet: firstMsg?.snippet ?? "",
        from: getHeader("From"),
        date: getHeader("Date"),
        unread: labelIds.includes("UNREAD"),
        messageCount: messages.length,
      } satisfies EmailThread;
    })
  );

  return detailed;
}

export async function getEmailMessage(
  accessToken: string,
  messageId: string
): Promise<EmailMessage> {
  const gmail = getGmailClient(accessToken);

  const res = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format: "full",
  });

  const msg = res.data;
  const headers = msg.payload?.headers ?? [];

  const getHeader = (name: string) =>
    headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? "";

  let body = "";
  let isHtml = false;

  function extractBody(parts: typeof msg.payload extends undefined ? never : NonNullable<typeof msg.payload>["parts"]): void {
    if (!parts) return;
    for (const part of parts) {
      if (part.mimeType === "text/html" && part.body?.data) {
        body = Buffer.from(part.body.data, "base64").toString("utf-8");
        isHtml = true;
        return;
      }
      if (part.mimeType === "text/plain" && part.body?.data && !body) {
        body = Buffer.from(part.body.data, "base64").toString("utf-8");
      }
      if (part.parts) extractBody(part.parts);
    }
  }

  if (msg.payload?.body?.data) {
    body = Buffer.from(msg.payload.body.data, "base64").toString("utf-8");
    isHtml = msg.payload.mimeType === "text/html";
  } else {
    extractBody(msg.payload?.parts);
  }

  return {
    id: msg.id!,
    threadId: msg.threadId!,
    subject: getHeader("Subject"),
    from: getHeader("From"),
    to: getHeader("To"),
    date: getHeader("Date"),
    body,
    isHtml,
  };
}

export async function sendEmail(
  accessToken: string,
  params: SendEmailParams
): Promise<string> {
  const gmail = getGmailClient(accessToken);

  const messageParts = [
    `To: ${params.to}`,
    `Subject: ${params.subject}`,
    "Content-Type: text/plain; charset=utf-8",
    "",
    params.body,
  ];

  if (params.replyToMessageId) {
    messageParts.splice(2, 0, `In-Reply-To: ${params.replyToMessageId}`);
  }

  const raw = Buffer.from(messageParts.join("\r\n"))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const res = await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw, threadId: params.replyToMessageId },
  });

  return res.data.id!;
}
