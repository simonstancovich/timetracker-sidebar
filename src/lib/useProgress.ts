import { useCallback, useEffect, useState } from "react";
import {
  EMPTY_ACH_STATS,
  type Ach,
  type AchStats,
} from "./achievements";
import { formatLocalDate } from "./date";
import { getHolidays, isWorkingDay } from "./swedishHolidays";

interface UseProgressArgs {
  authed: boolean | null;
}

// Persisted player-progression state — XP, streak, unlocked achievements, week
// hours, achievement stats, and the achievement toast queue. Owns its own
// load-from-store / persist-on-change effects and the toast dequeue/dismiss
// effects. App's save flow writes through the exposed setters when a save lands.
export function useProgress({ authed }: UseProgressArgs) {
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [weekH, setWeekH] = useState<number[]>([0, 0, 0, 0, 0]);
  const [achStats, setAchStats] = useState<AchStats>(EMPTY_ACH_STATS);
  const [achStatsLoaded, setAchStatsLoaded] = useState(false);
  const [lastCelebratedDate, setLastCelebratedDate] = useState<string>("");
  const [ach, setAch] = useState<Ach | null>(null);
  const [pendingAchs, setPendingAchs] = useState<Ach[]>([]);

  // Load persisted progression on auth.
  useEffect(() => {
    if (!authed) return;
    let cancelled = false;
    (async () => {
      const [x, u, s, last] = await Promise.all([
        window.electronAPI.storeGet("xp"),
        window.electronAPI.storeGet("unlocked"),
        window.electronAPI.storeGet("streak"),
        window.electronAPI.storeGet("lastLoggedDate"),
      ]);
      if (cancelled) return;
      setXp(typeof x === "number" ? x : 0);
      setUnlocked(Array.isArray(u) ? u : []);

      const savedCelebrated = await window.electronAPI.storeGet(
        "lastCelebratedDate",
      );
      if (cancelled) return;
      if (typeof savedCelebrated === "string")
        setLastCelebratedDate(savedCelebrated);

      const savedStats = await window.electronAPI.storeGet("achStats");
      if (cancelled) return;
      setAchStats(
        savedStats && typeof savedStats === "object"
          ? { ...EMPTY_ACH_STATS, ...(savedStats as Partial<AchStats>) }
          : EMPTY_ACH_STATS,
      );
      setAchStatsLoaded(true);

      // Streak valid if we've logged today or on the most recent previous
      // working day (skipping weekends + Swedish holidays).
      const now = new Date();
      const today = formatLocalDate(now);
      const hols = getHolidays(now.getFullYear());
      const prev = new Date(now);
      do {
        prev.setDate(prev.getDate() - 1);
      } while (!isWorkingDay(prev, hols));
      const prevWD = formatLocalDate(prev);
      if (typeof s === "number" && (last === today || last === prevWD))
        setStreak(s);
      else setStreak(0);
    })();
    return () => {
      cancelled = true;
    };
  }, [authed]);

  // Persist on change.
  useEffect(() => {
    if (authed) window.electronAPI.storeSet("xp", xp);
  }, [xp, authed]);
  useEffect(() => {
    if (authed) window.electronAPI.storeSet("unlocked", unlocked);
  }, [unlocked, authed]);
  useEffect(() => {
    if (authed) window.electronAPI.storeSet("streak", streak);
  }, [streak, authed]);
  useEffect(() => {
    if (authed && achStatsLoaded)
      window.electronAPI.storeSet("achStats", achStats);
  }, [achStats, authed, achStatsLoaded]);

  // Dequeue: when no toast is showing and the queue has items, pop the next
  // one into `ach`. The dismiss timer is a separate effect (below) so the
  // cleanup here doesn't kill it on the first re-render.
  useEffect(() => {
    if (ach || pendingAchs.length === 0) return;
    const [next, ...rest] = pendingAchs;
    setAch(next);
    setPendingAchs(rest);
  }, [ach, pendingAchs]);

  // Auto-dismiss the currently-shown toast after 3.2s. Runs whenever `ach`
  // becomes truthy; cleanup runs when `ach` flips back to null.
  useEffect(() => {
    if (!ach) return;
    const id = window.setTimeout(() => setAch(null), 3200);
    return () => clearTimeout(id);
  }, [ach]);

  // Clear user-scoped progression on sign-out. lastCelebratedDate is per-device
  // (survives sign-out by design — see App.tsx sign-out reset).
  const clear = useCallback(() => {
    setXp(0);
    setUnlocked([]);
    setStreak(0);
    setAchStats(EMPTY_ACH_STATS);
    setAchStatsLoaded(false);
    setPendingAchs([]);
    setAch(null);
    setWeekH([0, 0, 0, 0, 0]);
  }, []);

  return {
    xp, setXp,
    streak, setStreak,
    unlocked, setUnlocked,
    weekH, setWeekH,
    achStats, setAchStats, achStatsLoaded,
    lastCelebratedDate, setLastCelebratedDate,
    ach, setAch,
    pendingAchs, setPendingAchs,
    clear,
  };
}

export type UseProgress = ReturnType<typeof useProgress>;
