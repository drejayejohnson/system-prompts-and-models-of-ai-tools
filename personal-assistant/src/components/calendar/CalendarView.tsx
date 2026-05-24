"use client";

import { useEffect, useState } from "react";
import { format, isToday, parseISO } from "date-fns";
import { Calendar, RefreshCw, Loader2, MapPin, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/types";

export function CalendarView() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(7);

  const fetchEvents = async (d = days) => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/calendar?days=${d}`);
      if (!res.ok) throw new Error("Failed to fetch events");
      const data = await res.json();
      setEvents(data.events ?? []);
    } catch (e) { setError(e instanceof Error ? e.message : "Unknown error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEvents(); }, []);

  const grouped = events.reduce<Record<string, CalendarEvent[]>>((acc, e) => {
    const day = e.start.slice(0, 10);
    (acc[day] ??= []).push(e);
    return acc;
  }, {});

  if (loading) return <div className="flex items-center justify-center h-64 text-warm-400"><Loader2 className="w-6 h-6 animate-spin mr-2" />Loading calendar…</div>;
  if (error) return <div className="flex flex-col items-center justify-center h-64 gap-3 text-warm-500"><Calendar className="w-10 h-10 text-warm-300" /><p className="text-sm">{error}</p></div>;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-warm-100">
        <h2 className="font-semibold text-warm-800">Calendar</h2>
        <div className="flex items-center gap-2">
          <select value={days} onChange={(e) => { const d = parseInt(e.target.value, 10); setDays(d); fetchEvents(d); }}
            className="text-xs border border-warm-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-coral-300 bg-white">
            <option value={1}>Today</option>
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
          </select>
          <button onClick={() => fetchEvents()} className="p-1.5 rounded-lg hover:bg-warm-100 text-warm-500 transition-colors"><RefreshCw className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.keys(grouped).length === 0 && <p className="text-center py-12 text-sm text-warm-400">No events in the next {days} day{days !== 1 ? "s" : ""}</p>}
        {Object.entries(grouped).map(([day, dayEvents]) => (
          <div key={day}>
            <p className={cn("text-xs font-semibold uppercase tracking-wide mb-2", isToday(parseISO(day)) ? "text-coral-500" : "text-warm-400")}>
              {isToday(parseISO(day)) ? "Today" : format(parseISO(day), "EEEE, MMM d")}
            </p>
            <div className="space-y-2">{dayEvents.map((e) => <EventCard key={e.id} event={e} />)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EventCard({ event }: { event: CalendarEvent }) {
  const startTime = event.isAllDay ? "All day" : format(parseISO(event.start), "h:mm a");
  const endTime = event.isAllDay ? "" : format(parseISO(event.end), "h:mm a");
  return (
    <div className="flex gap-3 p-3 rounded-xl bg-white border border-warm-100 hover:border-coral-200 transition-colors">
      <div className="w-1 rounded-full bg-coral-400 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-warm-800 truncate">{event.title}</p>
        <p className="text-xs text-warm-400 mt-0.5">{startTime}{endTime && ` – ${endTime}`}</p>
        {event.location && <div className="flex items-center gap-1 mt-1"><MapPin className="w-3 h-3 text-warm-400" /><p className="text-xs text-warm-400 truncate">{event.location}</p></div>}
        {event.attendees && event.attendees.length > 0 && (
          <div className="flex items-center gap-1 mt-1"><Users className="w-3 h-3 text-warm-400" />
            <p className="text-xs text-warm-400">{event.attendees.slice(0, 2).join(", ")}{event.attendees.length > 2 && ` +${event.attendees.length - 2} more`}</p>
          </div>
        )}
      </div>
    </div>
  );
}
