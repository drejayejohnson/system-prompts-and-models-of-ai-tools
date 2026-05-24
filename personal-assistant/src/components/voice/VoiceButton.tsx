"use client";

import { useVoice } from "@/hooks/useVoice";
import { Mic, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function VoiceButton() {
  const { status, start, stop, audioLevel, lastTranscript } = useVoice();

  const isActive = status === "connected" || status === "listening" || status === "speaking";
  const isConnecting = status === "connecting";
  const isError = status === "error";

  const handleClick = () => {
    if (isActive) stop();
    else if (status === "idle" || isError) start();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        {isActive && (
          <>
            <span className="absolute inset-0 rounded-full bg-coral-400 opacity-30 animate-pulse-ring"
              style={{ transform: `scale(${1 + audioLevel * 0.5})` }} />
            <span className="absolute inset-0 rounded-full bg-coral-400 opacity-20 animate-pulse-ring"
              style={{ transform: `scale(${1 + audioLevel * 0.8})`, animationDelay: "0.3s" }} />
          </>
        )}
        <button
          onClick={handleClick}
          disabled={isConnecting}
          className={cn(
            "relative z-10 w-20 h-20 rounded-full flex items-center justify-center",
            "transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-coral-300 shadow-lg",
            isActive && "bg-coral-500 hover:bg-coral-600 text-white shadow-coral-300",
            (status === "idle" || isError) && "bg-white hover:bg-coral-50 text-coral-500 border-2 border-coral-200",
            isConnecting && "bg-warm-100 text-warm-400 cursor-not-allowed",
            isError && "border-red-300 text-red-400"
          )}
          aria-label={isActive ? "Stop voice" : "Start voice"}
        >
          {isConnecting ? <Loader2 className="w-8 h-8 animate-spin" />
            : isActive ? <VoiceWave audioLevel={audioLevel} />
            : <Mic className="w-8 h-8" />}
        </button>
      </div>
      <div className="text-center">
        <p className={cn("text-sm font-medium transition-colors",
          isActive && "text-coral-600", status === "idle" && "text-warm-400",
          isConnecting && "text-warm-400", isError && "text-red-500")}>
          {status === "idle" && "Tap to speak"}
          {isConnecting && "Connecting…"}
          {status === "listening" && "Listening…"}
          {status === "connected" && "Ready"}
          {status === "speaking" && "Speaking…"}
          {isError && "Mic error — tap to retry"}
        </p>
        {lastTranscript && isActive && (
          <p className="mt-1 text-xs text-warm-400 max-w-xs text-center line-clamp-2">{lastTranscript}</p>
        )}
      </div>
    </div>
  );
}

function VoiceWave({ audioLevel }: { audioLevel: number }) {
  const bars = 5;
  return (
    <div className="flex items-center gap-0.5 h-8">
      {Array.from({ length: bars }).map((_, i) => {
        const delay = (i / bars) * 1.2;
        const height = 8 + audioLevel * 20 * Math.sin((i / bars) * Math.PI);
        return (
          <span key={i} className="w-1 rounded-full bg-white transition-all duration-75"
            style={{ height: `${Math.max(8, height)}px`, animationDelay: `${delay}s` }} />
        );
      })}
    </div>
  );
}
