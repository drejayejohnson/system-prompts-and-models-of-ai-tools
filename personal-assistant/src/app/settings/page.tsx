"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { CheckCircle2, Circle, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const integrations = [
    { name: "Google (Gmail + Calendar)", description: "Read emails and manage your calendar", connected: status === "authenticated", onConnect: () => signIn("google"), onDisconnect: () => signOut() },
    { name: "GoHighLevel CRM", description: "Access contacts, pipeline, and appointments", connected: !!process.env.NEXT_PUBLIC_GHL_CONFIGURED, configNote: "Set GHL_API_KEY and GHL_LOCATION_ID in your .env.local file" },
  ];
  return (
    <div className="max-w-xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-warm-900">Settings</h1>
        <p className="text-sm text-warm-500 mt-1">Manage your integrations and preferences</p>
      </div>
      <section>
        <h2 className="text-sm font-semibold text-warm-700 uppercase tracking-wide mb-3">Integrations</h2>
        <div className="space-y-3">
          {integrations.map((intg) => (
            <div key={intg.name} className="flex items-start justify-between gap-4 p-4 rounded-xl bg-white border border-warm-100">
              <div className="flex items-start gap-3">
                {intg.connected ? <CheckCircle2 className="w-5 h-5 text-coral-500 mt-0.5 flex-shrink-0" /> : <Circle className="w-5 h-5 text-warm-300 mt-0.5 flex-shrink-0" />}
                <div>
                  <p className="text-sm font-medium text-warm-800">{intg.name}</p>
                  <p className="text-xs text-warm-400 mt-0.5">{intg.description}</p>
                  {!intg.connected && intg.configNote && <p className="text-xs text-warm-400 mt-1 italic">{intg.configNote}</p>}
                  {intg.connected && intg.name.startsWith("Google") && session?.user && <p className="text-xs text-coral-500 mt-0.5">{session.user.email}</p>}
                </div>
              </div>
              {intg.onConnect && (
                <button onClick={intg.connected ? intg.onDisconnect : intg.onConnect}
                  className={cn("text-xs px-3 py-1.5 rounded-lg font-medium flex-shrink-0 transition-colors", intg.connected ? "bg-warm-100 text-warm-600 hover:bg-warm-200" : "bg-coral-500 text-white hover:bg-coral-600")}>
                  {intg.connected ? "Disconnect" : "Connect"}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-sm font-semibold text-warm-700 uppercase tracking-wide mb-3">Required API Keys</h2>
        <div className="p-4 rounded-xl bg-warm-50 border border-warm-100 space-y-2">
          <p className="text-xs text-warm-600">Add these to your <code className="bg-warm-200 px-1 rounded">.env.local</code> file:</p>
          {[{ key: "OPENAI_API_KEY", label: "OpenAI (voice)" }, { key: "ANTHROPIC_API_KEY", label: "Anthropic/Claude (chat & drafting)" }, { key: "GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET", label: "Google OAuth" }, { key: "GHL_API_KEY / GHL_LOCATION_ID", label: "GoHighLevel CRM" }].map(({ key, label }) => (
            <div key={key} className="flex items-center gap-2">
              <code className="text-xs bg-white border border-warm-200 px-2 py-0.5 rounded text-warm-700">{key}</code>
              <span className="text-xs text-warm-400">— {label}</span>
            </div>
          ))}
        </div>
        <a href="https://github.com/purplelabelconsulting1/system-prompts-and-models-of-ai-tools/tree/main/personal-assistant" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-coral-500 hover:text-coral-700 mt-2">
          <ExternalLink className="w-3 h-3" />View setup guide on GitHub
        </a>
      </section>
    </div>
  );
}
