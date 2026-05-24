"use client";

import { useState } from "react";
import { EmailList } from "@/components/email/EmailList";
import { EmailComposer } from "@/components/email/EmailComposer";
import { PenSquare } from "lucide-react";

export default function EmailPage() {
  const [composing, setComposing] = useState(false);
  return (
    <div className="flex h-full relative">
      <div className="flex-1 overflow-hidden"><EmailList /></div>
      {!composing && (
        <button onClick={() => setComposing(true)}
          className="absolute bottom-6 right-6 w-12 h-12 rounded-full bg-coral-500 hover:bg-coral-600 text-white shadow-lg flex items-center justify-center transition-all hover:scale-105"
          aria-label="Compose email"><PenSquare className="w-5 h-5" /></button>
      )}
      {composing && (
        <div className="absolute inset-4 md:inset-auto md:right-4 md:bottom-4 md:w-96 md:h-[520px] bg-white rounded-2xl shadow-xl border border-warm-100 p-4 overflow-y-auto z-10">
          <EmailComposer onClose={() => setComposing(false)} />
        </div>
      )}
    </div>
  );
}
