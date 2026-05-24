"use client";

import { useState } from "react";
import { ContactSearch } from "@/components/crm/ContactSearch";
import { PipelineView } from "@/components/crm/PipelineView";
import { cn } from "@/lib/utils";

type Tab = "contacts" | "pipeline";

export default function CRMPage() {
  const [tab, setTab] = useState<Tab>("pipeline");
  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-warm-100 px-4 pt-3">
        {(["pipeline", "contacts"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px",
              tab === t ? "border-coral-500 text-coral-600" : "border-transparent text-warm-500 hover:text-warm-800")}>
            {t}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-hidden">
        {tab === "contacts" ? <ContactSearch /> : <PipelineView />}
      </div>
    </div>
  );
}
