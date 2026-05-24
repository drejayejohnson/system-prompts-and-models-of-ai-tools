"use client";

import { useState } from "react";
import { Search, User, Phone, Mail, Building2, Loader2 } from "lucide-react";
import type { GHLContact } from "@/types";
import { cn } from "@/lib/utils";

export function ContactSearch() {
  const [query, setQuery] = useState("");
  const [contacts, setContacts] = useState<GHLContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selected, setSelected] = useState<GHLContact | null>(null);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true); setSearched(true); setSelected(null);
    try {
      const res = await fetch(`/api/ghl/contacts?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      setContacts(data.contacts ?? []);
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-warm-100">
        <h2 className="font-semibold text-warm-800 mb-3">Contacts</h2>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && search()}
              placeholder="Search by name, email, or phone…"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-warm-200 focus:outline-none focus:ring-2 focus:ring-coral-300" />
          </div>
          <button onClick={search} disabled={!query.trim() || loading}
            className={cn("px-4 py-2 rounded-xl text-sm font-medium transition-colors",
              query.trim() && !loading ? "bg-coral-500 text-white hover:bg-coral-600" : "bg-warm-100 text-warm-400 cursor-not-allowed")}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {!searched && <p className="text-center py-12 text-sm text-warm-400">Search your GoHighLevel contacts</p>}
        {searched && !loading && contacts.length === 0 && <p className="text-center py-12 text-sm text-warm-400">No contacts found for &ldquo;{query}&rdquo;</p>}
        {!selected && contacts.length > 0 && (
          <div className="space-y-2">
            {contacts.map((c) => (
              <button key={c.id} onClick={() => setSelected(c)}
                className="w-full text-left p-3 rounded-xl border border-warm-100 hover:border-coral-200 hover:bg-coral-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-coral-100 text-coral-600 flex items-center justify-center flex-shrink-0"><User className="w-4 h-4" /></div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-warm-800">{c.firstName} {c.lastName}</p>
                    <p className="text-xs text-warm-400 truncate">{c.email || c.phone}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
        {selected && <ContactDetail contact={selected} onBack={() => setSelected(null)} />}
      </div>
    </div>
  );
}

function ContactDetail({ contact, onBack }: { contact: GHLContact; onBack: () => void }) {
  return (
    <div>
      <button onClick={onBack} className="text-xs text-coral-500 hover:text-coral-700 mb-4 flex items-center gap-1">← Back to results</button>
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-full bg-coral-100 text-coral-600 flex items-center justify-center"><User className="w-7 h-7" /></div>
        <div>
          <h3 className="text-lg font-semibold text-warm-900">{contact.firstName} {contact.lastName}</h3>
          {contact.companyName && <p className="text-sm text-warm-500">{contact.companyName}</p>}
        </div>
      </div>
      <div className="space-y-3">
        {contact.email && <div className="flex items-center gap-3 p-3 rounded-xl bg-warm-50"><Mail className="w-4 h-4 text-warm-400 flex-shrink-0" /><a href={`mailto:${contact.email}`} className="text-sm text-coral-600 hover:underline">{contact.email}</a></div>}
        {contact.phone && <div className="flex items-center gap-3 p-3 rounded-xl bg-warm-50"><Phone className="w-4 h-4 text-warm-400 flex-shrink-0" /><a href={`tel:${contact.phone}`} className="text-sm text-warm-700">{contact.phone}</a></div>}
        {contact.companyName && <div className="flex items-center gap-3 p-3 rounded-xl bg-warm-50"><Building2 className="w-4 h-4 text-warm-400 flex-shrink-0" /><span className="text-sm text-warm-700">{contact.companyName}</span></div>}
        {contact.tags && contact.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {contact.tags.map((tag) => <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-coral-100 text-coral-700">{tag}</span>)}
          </div>
        )}
      </div>
    </div>
  );
}
