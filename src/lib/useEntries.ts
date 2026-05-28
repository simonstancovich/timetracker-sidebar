import { useEffect, useState } from "react";
import { loadTimeEntries } from "../api";
import type { TimeEntry } from "../api";

interface UseEntriesArgs {
  authed: boolean | null;
  nowTick: number;
  onUnauthenticated: () => void;
}

// Storage and today-load for the user's time entries. The save flow (orchestrated
// in App with achievements/XP/weekH/queues) writes through `setEntries`. Other
// effects react to `entries` to keep derived state (weekH, todoTrackedH) in sync.
// `nowTick` re-runs the today-load at local midnight so the day rolls over cleanly.
export function useEntries({
  authed,
  nowTick,
  onUnauthenticated,
}: UseEntriesArgs) {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(true);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!authed) return;
    let cancelled = false;
    setEntriesLoading(true);
    loadTimeEntries(new Date())
      .then((list) => {
        if (cancelled) return;
        setEntries(list);
        setEntriesLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setEntriesLoading(false);
        if (err.message === "NOT_AUTHENTICATED") onUnauthenticated();
      });
    return () => {
      cancelled = true;
    };
  }, [authed, nowTick, onUnauthenticated]);

  return {
    entries, setEntries,
    entriesLoading, setEntriesLoading,
    pendingDeleteId, setPendingDeleteId,
  };
}

export type UseEntries = ReturnType<typeof useEntries>;
