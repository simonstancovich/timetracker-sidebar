// Offline save queue. When a new time entry can't reach the DevCore API
// (offline / network failure), we stash its save payload here and show an
// optimistic row in the UI; once we're back online the queue is flushed to the
// API. Persisted to electron-store under PENDING_STORE_KEY.

import type { SaveEntryPayload, TimeEntry } from "../api";

export const PENDING_STORE_KEY = "pendingEntries";
export const LIVE_SESSION_ID = "live_session";
export const FAILED_STORE_KEY = "failedEntries";

export interface PendingEntry {
  localId: string;
  payload: SaveEntryPayload;
  entry: TimeEntry; // optimistic display row shown until the real save lands
  queuedAt: number;
  error?: string; // set when the server rejected it (quarantined)
}

// A stable fingerprint of a logged entry (date + project + hours + description +
// billable). Used to detect a queued entry that's already on the server, so a
// re-send after an ambiguous failure can't create a duplicate.
export function entrySignature(o: {
  task_date: string;
  _project_id: string;
  hour: string;
  description: string;
  invoice: string;
}): string {
  const date = (o.task_date || "").slice(0, 10);
  const hour = (parseFloat(o.hour) || 0).toFixed(2);
  const inv = o.invoice === "1" || o.invoice === "true" ? "1" : "0";
  return `${date}|${o._project_id}|${hour}|${o.description}|${inv}`;
}

// Optimistic entries carry a local id so we can tell them apart from server rows.
export function isPendingId(id: string): boolean {
  return id.startsWith("pending_");
}

// Build a queue item from a save payload, including the display row the UI shows
// while the save is pending.
export function makePendingEntry(payload: SaveEntryPayload): PendingEntry {
  const localId = `pending_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const entry: TimeEntry = {
    id: localId,
    _user_id: payload._user_id,
    _project_id: payload._project_id,
    _company_id: payload._company_id,
    task_date: payload.task_date,
    description: payload.description,
    internal_description: payload.internal_description,
    hour: payload.hour,
    invoice_hours: payload.invoice_hours,
    invoice: payload.invoice === "true" ? "1" : "0",
    no_flex: payload.no_flex === "true" ? "1" : "0",
    hour_price: payload.hour_price,
    username: payload.username,
    company: payload.company,
    project: payload.project,
    create_date: payload.create_date,
  };
  return { localId, payload, entry, queuedAt: Date.now() };
}
