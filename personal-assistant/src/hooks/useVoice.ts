"use client";

import { useState, useRef, useCallback } from "react";
import type { VoiceStatus } from "@/types";

interface UseVoiceReturn {
  status: VoiceStatus;
  start: () => Promise<void>;
  stop: () => void;
  audioLevel: number;
  lastTranscript: string;
}

export function useVoice(): UseVoiceReturn {
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [audioLevel, setAudioLevel] = useState(0);
  const [lastTranscript, setLastTranscript] = useState("");

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const pollAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;
    const data = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(data);
    const avg = data.reduce((a, b) => a + b, 0) / data.length;
    setAudioLevel(avg / 128);
    animFrameRef.current = requestAnimationFrame(pollAudioLevel);
  }, []);

  const handleDataChannelMessage = useCallback(
    async (event: MessageEvent) => {
      let msg: Record<string, unknown>;
      try {
        msg = JSON.parse(event.data as string);
      } catch {
        return;
      }

      if (
        msg.type === "response.audio_transcript.done" &&
        typeof msg.transcript === "string"
      ) {
        setLastTranscript(msg.transcript);
      }

      if (msg.type === "response.function_call_arguments.done") {
        const fnName = msg.name as string;
        const fnArgs = JSON.parse((msg.arguments as string) ?? "{}");
        const callId = msg.call_id as string;

        let result = "";
        try {
          result = await dispatchToolCall(fnName, fnArgs);
        } catch (err) {
          result = `Error: ${err instanceof Error ? err.message : "unknown error"}`;
        }

        dcRef.current?.send(
          JSON.stringify({
            type: "conversation.item.create",
            item: {
              type: "function_call_output",
              call_id: callId,
              output: result,
            },
          })
        );
        dcRef.current?.send(JSON.stringify({ type: "response.create" }));
      }
    },
    []
  );

  const start = useCallback(async () => {
    setStatus("connecting");

    try {
      const tokenRes = await fetch("/api/realtime/session", { method: "POST" });
      if (!tokenRes.ok) throw new Error("Failed to get session token");
      const { clientSecret } = await tokenRes.json();
      const ephemeralKey: string = clientSecret.value;

      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      if (!audioRef.current) {
        audioRef.current = document.createElement("audio");
        audioRef.current.autoplay = true;
        document.body.appendChild(audioRef.current);
      }
      pc.ontrack = (e) => {
        if (audioRef.current) audioRef.current.srcObject = e.streams[0];
      };

      const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
      ms.getTracks().forEach((t) => pc.addTrack(t, ms));

      const ctx = new AudioContext();
      const src = ctx.createMediaStreamSource(ms);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      analyserRef.current = analyser;
      animFrameRef.current = requestAnimationFrame(pollAudioLevel);

      const dc = pc.createDataChannel("oai-events");
      dcRef.current = dc;
      dc.addEventListener("message", handleDataChannelMessage);
      dc.addEventListener("open", () => setStatus("connected"));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpRes = await fetch(
        "https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ephemeralKey}`,
            "Content-Type": "application/sdp",
          },
          body: offer.sdp,
        }
      );

      if (!sdpRes.ok) throw new Error("OpenAI WebRTC handshake failed");

      const sdpAnswer = await sdpRes.text();
      await pc.setRemoteDescription({ type: "answer", sdp: sdpAnswer });

      setStatus("listening");
    } catch (err) {
      console.error("Voice start error:", err);
      setStatus("error");
      stop();
    }
  }, [handleDataChannelMessage, pollAudioLevel]);

  const stop = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    dcRef.current?.close();
    pcRef.current?.close();
    pcRef.current = null;
    dcRef.current = null;
    setAudioLevel(0);
    setStatus("idle");
  }, []);

  return { status, start, stop, audioLevel, lastTranscript };
}

async function dispatchToolCall(
  name: string,
  args: Record<string, unknown>
): Promise<string> {
  switch (name) {
    case "get_emails": {
      const params = new URLSearchParams();
      if (args.maxResults) params.set("maxResults", String(args.maxResults));
      if (args.query) params.set("query", String(args.query));
      const res = await fetch(`/api/email?${params}`);
      const data = await res.json();
      if (data.threads) {
        return JSON.stringify(
          data.threads.slice(0, 5).map((t: Record<string, unknown>) => ({
            subject: t.subject,
            from: t.from,
            date: t.date,
            snippet: t.snippet,
            unread: t.unread,
          }))
        );
      }
      return JSON.stringify({ error: data.error });
    }

    case "send_email": {
      const res = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(args),
      });
      const data = await res.json();
      return data.messageId
        ? `Email sent successfully (id: ${data.messageId})`
        : `Failed: ${data.error}`;
    }

    case "get_calendar_events": {
      const params = new URLSearchParams({ days: String(args.days ?? 7) });
      const res = await fetch(`/api/calendar?${params}`);
      const data = await res.json();
      if (data.events) {
        return JSON.stringify(
          data.events.map((e: Record<string, unknown>) => ({
            title: e.title,
            start: e.start,
            end: e.end,
            location: e.location,
          }))
        );
      }
      return JSON.stringify({ error: data.error });
    }

    case "create_calendar_event": {
      const res = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(args),
      });
      const data = await res.json();
      return data.event
        ? `Event "${data.event.title}" created for ${data.event.start}`
        : `Failed: ${data.error}`;
    }

    case "search_ghl_contact": {
      const params = new URLSearchParams({ query: String(args.query ?? "") });
      const res = await fetch(`/api/ghl/contacts?${params}`);
      const data = await res.json();
      if (data.contacts?.length) {
        return JSON.stringify(
          data.contacts.slice(0, 3).map((c: Record<string, unknown>) => ({
            name: `${c.firstName} ${c.lastName}`,
            email: c.email,
            phone: c.phone,
            company: c.companyName,
          }))
        );
      }
      return "No contacts found.";
    }

    case "get_ghl_pipeline": {
      const params = new URLSearchParams({ includePipelines: "true" });
      if (args.pipelineId) params.set("pipelineId", String(args.pipelineId));
      const res = await fetch(`/api/ghl/opportunities?${params}`);
      const data = await res.json();
      if (data.opportunities) {
        return JSON.stringify({
          totalOpportunities: data.opportunities.length,
          openDeals: data.opportunities.filter(
            (o: Record<string, unknown>) => o.status === "open"
          ).length,
          recentOpportunities: data.opportunities.slice(0, 5).map(
            (o: Record<string, unknown>) => ({
              name: o.name,
              stage: o.stageName,
              value: o.monetaryValue,
              contact: o.contactName,
            })
          ),
        });
      }
      return JSON.stringify({ error: data.error });
    }

    case "create_ghl_task": {
      if (!args.contactId) {
        return "A contactId is required to create a task. Please search for the contact first.";
      }
      const res = await fetch("/api/ghl/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(args),
      });
      const data = await res.json();
      return data.id ? `Task created (id: ${data.id})` : `Failed: ${data.error}`;
    }

    default:
      return `Unknown tool: ${name}`;
  }
}
