import { VoiceButton } from "@/components/voice/VoiceButton";

export default function VoicePage() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 px-4">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-warm-800">How can I help?</h1>
        <p className="mt-1 text-sm text-warm-400">
          Tap to start speaking, or use the Chat tab to type
        </p>
      </div>
      <VoiceButton />
      <div className="flex flex-wrap justify-center gap-2 max-w-sm">
        {["Check my emails", "What's on my calendar today?", "Look up a contact", "Check my pipeline"].map((hint) => (
          <span key={hint} className="text-xs px-3 py-1.5 rounded-full bg-warm-100 text-warm-600">{hint}</span>
        ))}
      </div>
    </div>
  );
}
