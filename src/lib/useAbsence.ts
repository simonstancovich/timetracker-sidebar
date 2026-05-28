import {
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  buildSavePayload,
  loadTimeEntries,
  saveTimeEntry,
  type Company,
  type Project,
  type TimeEntry,
} from "../api";
import { workingDaysInRange } from "./absence";
import { classifyApiError } from "./apiError";
import { formatLocalDate } from "./date";
import { useTranslation } from "./i18n";
import {
  makePendingEntry,
  type PendingEntry,
} from "./pendingEntries";
import type { CurrentUser } from "./useCurrentUser";
import { vars } from "../theme";

interface UseAbsenceArgs {
  companies: Company[];
  ensureProjects: (cid: string) => unknown;
  projectCache: Record<string, Project[]>;
  currentUser: CurrentUser | null;
  online: boolean;
  setOnline: (v: boolean) => void;
  setPendingQueue: Dispatch<SetStateAction<PendingEntry[]>>;
  setEntries: Dispatch<SetStateAction<TimeEntry[]>>;
  onSignOut: () => void;
  addFloat: (msg: string, col: string) => void;
}

// "Frånvaro" absence flow: bulk-log 8h for each working day in a range under
// the absence company + chosen project. Rides the offline queue like any other
// save. Owns the open/saving UI flags + the date bounds + the submit function.
export function useAbsence({
  companies,
  ensureProjects,
  projectCache,
  currentUser,
  online,
  setOnline,
  setPendingQueue,
  setEntries,
  onSignOut,
  addFloat,
}: UseAbsenceArgs) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const fravaroCompany = useMemo(
    () => companies.find((c) => /fr[åa]nvaro/i.test(c.name)) || null,
    [companies],
  );
  // Past is capped at the start of the current month; future is open.
  const minFromISO = (() => {
    const d = new Date();
    d.setDate(1);
    return formatLocalDate(d);
  })();
  const todayISO = formatLocalDate(new Date());
  const projects = fravaroCompany
    ? projectCache[fravaroCompany.id] || []
    : [];

  const open = async () => {
    if (fravaroCompany) await ensureProjects(fravaroCompany.id);
    setIsOpen(true);
  };
  const close = () => setIsOpen(false);

  const submit = async (
    projectId: string,
    fromISO: string,
    toISO: string,
    note: string,
  ) => {
    if (!currentUser || !fravaroCompany) return;
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;
    const days = workingDaysInRange(fromISO, toISO);
    if (days.length === 0) {
      addFloat(t("absence.noDays"), vars.typography.warning);
      return;
    }
    setSaving(true);
    const todayISOStr = formatLocalDate(new Date());
    const queued: PendingEntry[] = [];
    let count = 0;
    let authFailed = false;
    for (const dayISO of days) {
      const payload = buildSavePayload({
        company: fravaroCompany,
        project,
        hours: 8,
        description: note.trim() || project.name,
        internalNote: "",
        invoice: false,
        user: currentUser,
        entryDate: new Date(`${dayISO}T00:00:00`),
        existingId: null,
      });
      if (!online) {
        queued.push(makePendingEntry(payload));
        count++;
        continue;
      }
      try {
        await saveTimeEntry(payload);
        setOnline(true);
        count++;
      } catch (err) {
        const kind = classifyApiError(err);
        if (kind === "auth") {
          onSignOut();
          authFailed = true;
          break;
        }
        if (kind === "offline" || kind === "timeout") {
          setOnline(false);
          queued.push(makePendingEntry(payload));
          count++;
        }
        // Other errors: skip this day.
      }
    }
    if (queued.length) setPendingQueue((q) => [...q, ...queued]);
    setSaving(false);
    if (authFailed) return;
    setIsOpen(false);
    if (days.includes(todayISOStr) && online && queued.length === 0) {
      try {
        setEntries(await loadTimeEntries(new Date()));
      } catch {
        /* best-effort refresh */
      }
    }
    if (count > 0) addFloat(t("absence.done", { n: count }), vars.typography.green);
  };

  return {
    isOpen,
    saving,
    fravaroCompany,
    projects,
    minFromISO,
    todayISO,
    open,
    close,
    submit,
  };
}
