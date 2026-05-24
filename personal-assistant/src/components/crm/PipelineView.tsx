"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Loader2, RefreshCw, DollarSign } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { GHLOpportunity, GHLPipeline } from "@/types";

export function PipelineView() {
  const [opportunities, setOpportunities] = useState<GHLOpportunity[]>([]);
  const [pipelines, setPipelines] = useState<GHLPipeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>("all");

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams({ includePipelines: "true" });
      if (selectedPipelineId !== "all") params.set("pipelineId", selectedPipelineId);
      const res = await fetch(`/api/ghl/opportunities?${params}`);
      if (!res.ok) throw new Error("Failed to load pipeline");
      const data = await res.json();
      setOpportunities(data.opportunities ?? []);
      setPipelines(data.pipelines ?? []);
    } catch (e) { setError(e instanceof Error ? e.message : "Unknown error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [selectedPipelineId]);

  const openDeals = opportunities.filter((o) => o.status === "open");
  const totalValue = openDeals.reduce((sum, o) => sum + (o.monetaryValue ?? 0), 0);
  const byStage = openDeals.reduce<Record<string, GHLOpportunity[]>>((acc, o) => {
    const key = o.stageName ?? "Unknown";
    (acc[key] ??= []).push(o);
    return acc;
  }, {});

  if (loading) return <div className="flex items-center justify-center h-64 text-warm-400"><Loader2 className="w-6 h-6 animate-spin mr-2" />Loading pipeline…</div>;
  if (error) return <div className="flex flex-col items-center justify-center h-64 gap-3 text-warm-500"><TrendingUp className="w-10 h-10 text-warm-300" /><p className="text-sm">{error}</p><p className="text-xs text-warm-400">Make sure your GHL API key is configured.</p></div>;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-warm-100">
        <h2 className="font-semibold text-warm-800">Pipeline</h2>
        <div className="flex items-center gap-2">
          {pipelines.length > 1 && (
            <select value={selectedPipelineId} onChange={(e) => setSelectedPipelineId(e.target.value)}
              className="text-xs border border-warm-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-coral-300 bg-white">
              <option value="all">All Pipelines</option>
              {pipelines.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          )}
          <button onClick={fetchData} className="p-1.5 rounded-lg hover:bg-warm-100 text-warm-500 transition-colors"><RefreshCw className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 p-4 border-b border-warm-50">
        <div className="bg-coral-50 rounded-xl p-3"><p className="text-xs text-coral-500 font-medium">Open Deals</p><p className="text-2xl font-bold text-coral-700 mt-1">{openDeals.length}</p></div>
        <div className="bg-warm-50 rounded-xl p-3"><p className="text-xs text-warm-500 font-medium">Total Value</p><p className="text-2xl font-bold text-warm-800 mt-1">${totalValue.toLocaleString()}</p></div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.keys(byStage).length === 0 && <p className="text-center py-12 text-sm text-warm-400">No open opportunities</p>}
        {Object.entries(byStage).map(([stage, deals]) => (
          <div key={stage}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-warm-600 uppercase tracking-wide">{stage}</p>
              <span className="text-xs text-warm-400">{deals.length} deal{deals.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="space-y-2">{deals.map((o) => <OpportunityCard key={o.id} opportunity={o} />)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OpportunityCard({ opportunity: o }: { opportunity: GHLOpportunity }) {
  return (
    <div className="p-3 rounded-xl bg-white border border-warm-100 hover:border-coral-200 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-warm-800 truncate">{o.name}</p>
          <p className="text-xs text-warm-400 mt-0.5">{o.contactName}</p>
        </div>
        {o.monetaryValue ? (
          <div className="flex items-center gap-0.5 text-coral-600 flex-shrink-0">
            <DollarSign className="w-3.5 h-3.5" /><span className="text-sm font-semibold">{o.monetaryValue.toLocaleString()}</span>
          </div>
        ) : null}
      </div>
      <p className="text-xs text-warm-400 mt-1.5">{formatDate(o.updatedAt)}</p>
    </div>
  );
}
