import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { loadTimeEntries, saveTimeEntry, type TimeEntry } from "../api";
import { classifyApiError } from "./apiError";
import { createLog } from "./logger";
import {
  PENDING_STORE_KEY,
  FAILED_STORE_KEY,
  entrySignature,
  type PendingEntry,
} from "./pendingEntries";

const log = createLog("syncQueue");

interface UseSyncQueueArgs {
  online: boolean;
  setOnline: (v: boolean) => void;
  setEntries: Dispatch<SetStateAction<TimeEntry[]>>;
  onAuthFailed: () => void;
}

// Offline save queue: entries that couldn't reach the API yet (pending) and
// entries the server rejected outright (failed, awaiting review). Owns the two
// arrays, their refs, the persistence effects, the flush logic (with per-day
// signature dedup), the flush-on-reconnect + retry interval, and the retry-
// failed helper that moves quarantined entries back to pending.
export function useSyncQueue({
  online,
  setOnline,
  setEntries,
  onAuthFailed,
}: UseSyncQueueArgs) {
  const [pendingQueue, setPendingQueue] = useState<PendingEntry[]>([]);
  const [pendingLoaded, setPendingLoaded] = useState(false);
  const [failedQueue, setFailedQueue] = useState<PendingEntry[]>([]);
  const [failedLoaded, setFailedLoaded] = useState(false);
  const [syncing, setSyncing] = useState(false);
  // Latest queue for flushPending so its identity stays stable across renders.
  const pendingQueueRef = useRef<PendingEntry[]>([]);
  const flushingRef = useRef(false);

  // Load pending from store.
  useEffect(() => {
    window.electronAPI.storeGet(PENDING_STORE_KEY).then((v) => {
      if (Array.isArray(v)) setPendingQueue(v as PendingEntry[]);
      setPendingLoaded(true);
    });
  }, []);

  // Persist + sync the ref.
  useEffect(() => {
    pendingQueueRef.current = pendingQueue;
    if (pendingLoaded)
      window.electronAPI.storeSet(PENDING_STORE_KEY, pendingQueue);
  }, [pendingQueue, pendingLoaded]);

  // Load failed from store.
  useEffect(() => {
    window.electronAPI.storeGet(FAILED_STORE_KEY).then((v) => {
      if (Array.isArray(v)) setFailedQueue(v as PendingEntry[]);
      setFailedLoaded(true);
    });
  }, []);

  // Persist failed.
  useEffect(() => {
    if (failedLoaded)
      window.electronAPI.storeSet(FAILED_STORE_KEY, failedQueue);
  }, [failedQueue, failedLoaded]);

  // Push the offline queue to the API. Stops on the first network/auth error so
  // we don't hammer. Before sending each item it checks the server for an
  // identical entry that day and skips it (no duplicates after an ambiguous
  // failure). Entries the server rejects outright are quarantined for review,
  // never silently dropped. Refetches today afterwards to show synced rows.
  const flushPending = useCallback(async () => {
    if (flushingRef.current) return;
    const queue = [...pendingQueueRef.current];
    if (queue.length === 0) return;
    flushingRef.current = true;
    setSyncing(true);
    let touched = false;
    let stoppedOffline = false;
    const drop = (id: string) =>
      setPendingQueue((q) => q.filter((x) => x.localId !== id));
    // Per-day signature cache so a re-send can't duplicate an entry the server
    // already has. Loaded lazily; a load failure means we're offline → stop.
    const daySigs = new Map<string, Set<string>>();
    for (const item of queue) {
      const dateISO = item.payload.task_date.slice(0, 10);
      let sigs = daySigs.get(dateISO);
      if (!sigs) {
        try {
          const rows = await loadTimeEntries(new Date(`${dateISO}T00:00:00`));
          sigs = new Set(rows.map(entrySignature));
          daySigs.set(dateISO, sigs);
        } catch (err) {
          const kind = classifyApiError(err);
          if (kind === "auth") {
            onAuthFailed();
            break;
          }
          setOnline(false);
          stoppedOffline = true;
          break;
        }
      }
      const sig = entrySignature(item.payload);
      if (sigs.has(sig)) {
        // Already on the server (or an identical earlier item synced) — done.
        drop(item.localId);
        touched = true;
        continue;
      }
      try {
        await saveTimeEntry(item.payload);
        log.info("flushed pending entry", { localId: item.localId, task_date: item.payload.task_date });
        setOnline(true);
        sigs.add(sig);
        drop(item.localId);
        touched = true;
      } catch (err) {
        const kind = classifyApiError(err);
        log.warn("flush pending entry failed", { localId: item.localId, kind, error: String(err) });
        if (kind === "auth") {
          onAuthFailed();
          break;
        }
        if (kind === "offline" || kind === "timeout") {
          setOnline(false);
          stoppedOffline = true;
          break;
        }
        // Server rejected it — quarantine for review instead of losing it.
        const reason = err instanceof Error ? err.message : "rejected";
        setFailedQueue((f) => [...f, { ...item, error: reason }]);
        drop(item.localId);
        touched = true;
      }
    }
    flushingRef.current = false;
    setSyncing(false);
    if (touched && !stoppedOffline) {
      try {
        const fresh = await loadTimeEntries(new Date());
        setEntries(fresh);
      } catch {
        /* refresh is best-effort */
      }
    }
  }, [setOnline, setEntries, onAuthFailed]);

  // Flush whenever we're online with a non-empty queue (reconnect or new item).
  useEffect(() => {
    if (online && pendingLoaded && pendingQueue.length > 0) void flushPending();
  }, [online, pendingLoaded, pendingQueue.length, flushPending]);

  // Retry periodically — covers a reachable network but unreachable server,
  // where the OS "online" event never fires.
  useEffect(() => {
    if (!online || pendingQueue.length === 0) return;
    const id = window.setInterval(() => void flushPending(), 30_000);
    return () => clearInterval(id);
  }, [online, pendingQueue.length, flushPending]);

  // Move quarantined entries back into the sync queue to try again.
  const retryFailed = useCallback(() => {
    if (failedQueue.length === 0) return;
    const items = failedQueue.map(({ error: _e, ...rest }) => rest);
    setFailedQueue([]);
    setPendingQueue((q) => [...q, ...items]);
  }, [failedQueue]);

  return {
    pendingQueue, setPendingQueue,
    failedQueue, setFailedQueue,
    syncing,
    flushPending,
    retryFailed,
  };
}

export type UseSyncQueue = ReturnType<typeof useSyncQueue>;
