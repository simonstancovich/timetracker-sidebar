import { useMemo } from "react";
import { type TimeEntry } from "../api";
import { formatLocalDate, mondayOf } from "./date";
import { LIVE_SESSION_ID, type PendingEntry } from "./pendingEntries";

interface Company {
  id: string;
  name: string;
}
interface Project {
  id: string;
  name: string;
  hour_price?: string;
}

interface TimerSnapshot {
  tSec: number;
  tCo: string;
  tPr: string;
  tD: string;
  tNote: string;
  tInv: boolean;
  draftId: string | null;
}

interface UseTodayDerivationsArgs {
  entries: TimeEntry[];
  pendingQueue: PendingEntry[];
  failedQueue: PendingEntry[];
  timer: TimerSnapshot;
  companies: Company[];
  projectCache: Record<string, Project[]>;
  goal: number;
}

export interface CompanyGroup {
  cid: string;
  h: number;
  entries: TimeEntry[];
}

export function useTodayDerivations({
  entries,
  pendingQueue,
  failedQueue,
  timer,
  companies,
  projectCache,
  goal,
}: UseTodayDerivationsArgs) {
  const { tSec, tCo, tPr, tD, tNote, tInv, draftId } = timer;

  // Current weekday index (0=Mon..4=Fri), clamped to the work week.
  const now = new Date();
  const mon = mondayOf(now);
  const todayI = Math.max(
    0,
    Math.min(4, Math.floor((+now - +mon) / 86400000)),
  );

  // Server entries + queued + failed for today, deduped by id. Single source of
  // truth for "what shows on today".
  const liveTodayEntries = useMemo(() => {
    const todayISO = formatLocalDate(new Date());
    const ids = new Set(entries.map((e) => e.id));
    const extras = [...pendingQueue, ...failedQueue]
      .filter((x) => x.entry.task_date === todayISO && !ids.has(x.entry.id))
      .map((x) => x.entry);
    return [...extras, ...entries];
  }, [entries, pendingQueue, failedQueue]);

  const failedIds = useMemo(
    () => new Set(failedQueue.map((f) => f.entry.id)),
    [failedQueue],
  );

  // Committed total (saved + queued) — drives goal celebration, never the
  // unsaved running timer.
  const todayH = useMemo(
    () => liveTodayEntries.reduce((s, e) => s + parseFloat(e.hour || "0"), 0),
    [liveTodayEntries],
  );

  // What the Today list renders: committed entries with the in-progress
  // session folded in live — overriding the continued entry's hour, or added
  // as a synthetic LIVE row.
  const displayTodayEntries = useMemo(() => {
    if (!(tSec > 0 && tCo && tPr && tD.trim())) return liveTodayEntries;
    const liveHour = String(tSec / 3600);
    const idx = liveTodayEntries.findIndex((r) => r.id === draftId);
    if (idx >= 0) {
      return liveTodayEntries.map((r, i) =>
        i === idx ? { ...r, hour: liveHour } : r,
      );
    }
    const co = companies.find((c) => c.id === tCo);
    const pr = (projectCache[tCo] || []).find((p) => p.id === tPr);
    const liveRow: TimeEntry = {
      id: LIVE_SESSION_ID,
      _user_id: "",
      _project_id: tPr,
      _company_id: tCo,
      task_date: formatLocalDate(new Date()),
      description: tD.trim(),
      internal_description: tNote.trim(),
      hour: liveHour,
      invoice_hours: liveHour,
      invoice: tInv ? "1" : "0",
      no_flex: "0",
      hour_price: pr?.hour_price || "0",
      username: "",
      company: co?.name || tCo,
      project: pr?.name || "",
      create_date: "",
    };
    return [liveRow, ...liveTodayEntries];
  }, [
    liveTodayEntries,
    tSec,
    tCo,
    tPr,
    tD,
    tNote,
    tInv,
    draftId,
    companies,
    projectCache,
  ]);

  // Live total for the displayed clock — hero and list-total derive from this
  // so they can't disagree. `done`/`todayH` stay on committed hours so
  // celebrations only fire on real logged hours.
  const liveTodayH = useMemo(
    () => displayTodayEntries.reduce((s, e) => s + parseFloat(e.hour || "0"), 0),
    [displayTodayEntries],
  );

  const groups = useMemo(() => {
    const g: Record<string, CompanyGroup> = {};
    displayTodayEntries.forEach((e) => {
      const key = e.company;
      if (!g[key]) g[key] = { cid: e._company_id, h: 0, entries: [] };
      g[key].h = +(g[key].h + parseFloat(e.hour || "0")).toFixed(2);
      g[key].entries.push(e);
    });
    return g;
  }, [displayTodayEntries]);

  const done = todayH >= goal;
  const liveDone = liveTodayH >= goal;

  return {
    todayI,
    liveTodayEntries,
    failedIds,
    todayH,
    displayTodayEntries,
    liveTodayH,
    groups,
    done,
    liveDone,
  };
}
