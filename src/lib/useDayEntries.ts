import { useEffect, useState } from "react";
import { loadTimeEntries, type TimeEntry } from "../api";

interface UseDayEntriesArgs {
  authed: boolean | null;
  active: boolean;
  selectedDate: Date;
  // Bump key: when this changes the cache reloads (e.g. after a save).
  reloadKey: unknown;
}

// Loads the entries for `selectedDate` whenever the History → Daily panel is
// the active view. `reloadKey` lets the parent flush the cache after a save
// without us needing to depend on the full entries array.
export function useDayEntries({
  authed,
  active,
  selectedDate,
  reloadKey,
}: UseDayEntriesArgs) {
  const [dayEntries, setDayEntries] = useState<TimeEntry[]>([]);
  const [dayEntriesLoading, setDayEntriesLoading] = useState(false);

  useEffect(() => {
    if (!authed || !active) return;
    let cancelled = false;
    setDayEntriesLoading(true);
    loadTimeEntries(selectedDate)
      .then((list) => {
        if (cancelled) return;
        setDayEntries(list);
        setDayEntriesLoading(false);
      })
      .catch(() => {
        if (!cancelled) setDayEntriesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authed, active, selectedDate, reloadKey]);

  return { dayEntries, setDayEntries, dayEntriesLoading };
}
