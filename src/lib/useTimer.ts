import { useCallback, useEffect, useRef, useState } from "react";

export interface StoredTimer {
  tCo?: string;
  tPr?: string;
  tD?: string;
  tNote?: string;
  tInv?: boolean;
  draftId?: string | null;
  running?: boolean;
  startedAt?: number | null;
  tSec?: number;
}

// Cohesive state for the running timer — the clock, the entry fields it's
// tracking against, and the crash-safety draft id. The save/commit, side-quest,
// and persistence flows live in App and read this state by the same names.
export function useTimer() {
  const [tSec, setTSec] = useState(0);
  // Latest tSec for effects that need its value but must not re-run each tick.
  const tSecRef = useRef(tSec);
  tSecRef.current = tSec;
  const [tRun, setTRun] = useState(false);
  const [tCo, setTCo] = useState("");
  const [tPr, setTPr] = useState("");
  const [tD, setTD] = useState("");
  const [tNote, setTNote] = useState("");
  const [tInv, setTInv] = useState(true);
  const [draftId, setDraftId] = useState<string | null>(null);
  const tick = useRef<number | null>(null);

  // The clock: tick once a second while running.
  useEffect(() => {
    if (tRun) tick.current = window.setInterval(() => setTSec((s) => s + 1), 1000);
    else if (tick.current) {
      clearInterval(tick.current);
      tick.current = null;
    }
    return () => {
      if (tick.current) clearInterval(tick.current);
    };
  }, [tRun]);

  // Stop the clock and clear the tracked fields (sign-out, cancel, etc.).
  const reset = useCallback(() => {
    setTRun(false);
    setTSec(0);
    setTCo("");
    setTPr("");
    setTD("");
    setTNote("");
    setTInv(true);
    setDraftId(null);
  }, []);

  // Restore from a persisted draft, recomputing elapsed time if it was running.
  const hydrate = useCallback((t: StoredTimer) => {
    setTCo(t.tCo || "");
    setTPr(t.tPr || "");
    setTD(t.tD || "");
    setTNote(t.tNote || "");
    setTInv(typeof t.tInv === "boolean" ? t.tInv : true);
    if (t.draftId) setDraftId(t.draftId);
    if (t.running && typeof t.startedAt === "number") {
      setTSec(Math.max(0, Math.floor((Date.now() - t.startedAt) / 1000)));
      setTRun(true);
    } else {
      setTSec(typeof t.tSec === "number" ? t.tSec : 0);
      setTRun(false);
    }
  }, []);

  return {
    tSec, setTSec, tSecRef,
    tRun, setTRun,
    tCo, setTCo,
    tPr, setTPr,
    tD, setTD,
    tNote, setTNote,
    tInv, setTInv,
    draftId, setDraftId,
    reset,
    hydrate,
  };
}

export type UseTimer = ReturnType<typeof useTimer>;
