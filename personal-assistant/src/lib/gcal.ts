import { google } from "googleapis";
import { addDays, startOfDay, endOfDay } from "date-fns";
import type { CalendarEvent, CreateEventParams } from "@/types";

function getCalendarClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.calendar({ version: "v3", auth });
}

export async function listCalendarEvents(
  accessToken: string,
  options: { days?: number; calendarId?: string } = {}
): Promise<CalendarEvent[]> {
  const cal = getCalendarClient(accessToken);
  const { days = 7, calendarId = "primary" } = options;

  const now = new Date();
  const res = await cal.events.list({
    calendarId,
    timeMin: startOfDay(now).toISOString(),
    timeMax: endOfDay(addDays(now, days)).toISOString(),
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 50,
  });

  const events = res.data.items ?? [];

  return events.map((e) => ({
    id: e.id!,
    title: e.summary ?? "(no title)",
    description: e.description ?? undefined,
    start: e.start?.dateTime ?? e.start?.date ?? "",
    end: e.end?.dateTime ?? e.end?.date ?? "",
    location: e.location ?? undefined,
    attendees: (e.attendees ?? []).map((a) => a.email!).filter(Boolean),
    isAllDay: !e.start?.dateTime,
    calendarId,
  }));
}

export async function createCalendarEvent(
  accessToken: string,
  params: CreateEventParams,
  calendarId = "primary"
): Promise<CalendarEvent> {
  const cal = getCalendarClient(accessToken);

  const res = await cal.events.insert({
    calendarId,
    requestBody: {
      summary: params.title,
      description: params.description,
      location: params.location,
      start: { dateTime: params.start, timeZone: "UTC" },
      end: { dateTime: params.end, timeZone: "UTC" },
      attendees: params.attendees?.map((email) => ({ email })),
    },
  });

  const e = res.data;
  return {
    id: e.id!,
    title: e.summary ?? params.title,
    description: e.description ?? undefined,
    start: e.start?.dateTime ?? e.start?.date ?? params.start,
    end: e.end?.dateTime ?? e.end?.date ?? params.end,
    location: e.location ?? undefined,
    attendees: (e.attendees ?? []).map((a) => a.email!).filter(Boolean),
    isAllDay: !e.start?.dateTime,
    calendarId,
  };
}
