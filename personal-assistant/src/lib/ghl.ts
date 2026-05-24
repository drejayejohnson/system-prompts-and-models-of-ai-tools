import type {
  GHLContact,
  GHLOpportunity,
  GHLPipeline,
  GHLAppointment,
} from "@/types";

const GHL_BASE = "https://services.leadconnectorhq.com";

function ghlHeaders() {
  return {
    Authorization: `Bearer ${process.env.GHL_API_KEY}`,
    "Content-Type": "application/json",
    Version: "2021-07-28",
  };
}

async function ghlFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${GHL_BASE}${path}`, {
    ...init,
    headers: { ...ghlHeaders(), ...(init?.headers ?? {}) },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GHL API error ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

// ─── Contacts ────────────────────────────────────────────────────
export async function searchContacts(query: string): Promise<GHLContact[]> {
  const locationId = process.env.GHL_LOCATION_ID;
  const params = new URLSearchParams({ locationId: locationId!, query });

  const data = await ghlFetch<{ contacts: GHLContact[] }>(
    `/contacts/search/duplicate?${params}`
  );

  return data.contacts ?? [];
}

export async function getContact(contactId: string): Promise<GHLContact> {
  const data = await ghlFetch<{ contact: GHLContact }>(`/contacts/${contactId}`);
  return data.contact;
}

// ─── Pipelines & Opportunities ───────────────────────────────────────
export async function getPipelines(): Promise<GHLPipeline[]> {
  const locationId = process.env.GHL_LOCATION_ID;
  const data = await ghlFetch<{ pipelines: GHLPipeline[] }>(
    `/opportunities/pipelines?locationId=${locationId}`
  );
  return data.pipelines ?? [];
}

export async function getOpportunities(
  pipelineId?: string
): Promise<GHLOpportunity[]> {
  const locationId = process.env.GHL_LOCATION_ID;
  const params = new URLSearchParams({ location_id: locationId! });
  if (pipelineId) params.set("pipeline_id", pipelineId);

  const data = await ghlFetch<{ opportunities: GHLOpportunity[] }>(
    `/opportunities/search?${params}`
  );
  return data.opportunities ?? [];
}

export async function updateOpportunityStage(
  opportunityId: string,
  stageId: string
): Promise<GHLOpportunity> {
  const data = await ghlFetch<{ opportunity: GHLOpportunity }>(
    `/opportunities/${opportunityId}`,
    {
      method: "PUT",
      body: JSON.stringify({ pipelineStageId: stageId }),
    }
  );
  return data.opportunity;
}

// ─── Calendar / Appointments ───────────────────────────────────────
export async function getAppointments(
  startDate: string,
  endDate: string,
  calendarId?: string
): Promise<GHLAppointment[]> {
  const locationId = process.env.GHL_LOCATION_ID;
  const params = new URLSearchParams({
    locationId: locationId!,
    startDate,
    endDate,
  });
  if (calendarId) params.set("calendarId", calendarId);

  const data = await ghlFetch<{ events: GHLAppointment[] }>(
    `/calendars/events?${params}`
  );
  return data.events ?? [];
}

// ─── Tasks ──────────────────────────────────────────────────────
export async function createTask(params: {
  title: string;
  contactId?: string;
  dueDate?: string;
  description?: string;
}): Promise<{ id: string }> {
  if (!params.contactId) {
    throw new Error("contactId is required to create a GHL task");
  }

  const data = await ghlFetch<{ task: { id: string } }>(
    `/contacts/${params.contactId}/tasks`,
    {
      method: "POST",
      body: JSON.stringify({
        title: params.title,
        dueDate: params.dueDate,
        description: params.description,
        completed: false,
      }),
    }
  );
  return { id: data.task.id };
}
