import { useEffect, useState } from "react";

// Owns "are we online?" — the OS online/offline events plus an active re-probe
// while offline (the OS event won't fire if the network never dropped, e.g. the
// server was briefly unreachable). `setOnline` is returned so API call sites can
// flip the state imperatively on success/failure without waiting for an event.
export function useConnection() {
  const [online, setOnline] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine,
  );

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  useEffect(() => {
    if (online) return;
    let cancelled = false;
    const check = async () => {
      if (typeof navigator !== "undefined" && !navigator.onLine) return;
      try {
        const { reachable } = await window.electronAPI.ping();
        if (!cancelled && reachable) setOnline(true);
      } catch {
        /* still offline */
      }
    };
    void check();
    const id = window.setInterval(() => void check(), 8000);
    const onFocus = () => void check();
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [online]);

  return { online, setOnline };
}
