import { useState, type Dispatch, type MutableRefObject, type SetStateAction } from "react";
import { deleteTimeEntry } from "../api";

interface Company {
  id: string;
  name: string;
}

export interface StashedTimer {
  co: string;
  pr: string;
  desc: string;
  note: string;
  inv: boolean;
  sec: number;
  draftId: string | null;
  coName: string;
}

interface TimerForSideQuest {
  tCo: string;
  tPr: string;
  tD: string;
  tNote: string;
  tInv: boolean;
  tSec: number;
  setTCo: Dispatch<SetStateAction<string>>;
  setTPr: Dispatch<SetStateAction<string>>;
  setTD: Dispatch<SetStateAction<string>>;
  setTNote: Dispatch<SetStateAction<string>>;
  setTInv: Dispatch<SetStateAction<boolean>>;
  setTSec: Dispatch<SetStateAction<number>>;
  setDraftId: Dispatch<SetStateAction<string | null>>;
  setTRun: Dispatch<SetStateAction<boolean>>;
}

interface UseSideQuestArgs {
  timer: TimerForSideQuest;
  draftIdRef: MutableRefObject<string | null>;
  companies: Company[];
  resetTimer: () => void;
  setTimerFormOpen: Dispatch<SetStateAction<boolean>>;
}

// Side-quest stack: when an interruption comes in, freeze the main timer in
// `stashedTimer` and start a fresh one. Restore the main when the side quest
// is logged or abandoned. Also owns the cancel-confirm flag (pendingCancelTimer).
export function useSideQuest({
  timer,
  draftIdRef,
  companies,
  resetTimer,
  setTimerFormOpen,
}: UseSideQuestArgs) {
  const [stashedTimer, setStashedTimer] = useState<StashedTimer | null>(null);
  const [pendingCancelTimer, setPendingCancelTimer] = useState(false);

  const startSideQuest = () => {
    if (stashedTimer) return; // single level of nesting
    const coName = companies.find((c) => c.id === timer.tCo)?.name || "";
    setStashedTimer({
      co: timer.tCo,
      pr: timer.tPr,
      desc: timer.tD,
      note: timer.tNote,
      inv: timer.tInv,
      sec: timer.tSec,
      draftId: draftIdRef.current,
      coName,
    });
    // Fresh blank timer, running immediately — details filled later.
    timer.setTCo("");
    timer.setTPr("");
    timer.setTD("");
    timer.setTNote("");
    timer.setTInv(true);
    timer.setTSec(0);
    timer.setDraftId(null);
    draftIdRef.current = null;
    setTimerFormOpen(true);
    timer.setTRun(true);
  };

  const restoreStashedTimer = () => {
    if (!stashedTimer) return;
    timer.setTCo(stashedTimer.co);
    timer.setTPr(stashedTimer.pr);
    timer.setTD(stashedTimer.desc);
    timer.setTNote(stashedTimer.note);
    timer.setTInv(stashedTimer.inv);
    timer.setTSec(stashedTimer.sec);
    timer.setDraftId(stashedTimer.draftId);
    draftIdRef.current = stashedTimer.draftId;
    setStashedTimer(null);
    setTimerFormOpen(false);
    timer.setTRun(false); // restored paused — user taps resume
  };

  const cancelTimer = async () => {
    setPendingCancelTimer(false);
    const id = draftIdRef.current;
    if (stashedTimer) {
      // Abandoning a side quest — pop the main timer back instead of clearing.
      restoreStashedTimer();
    } else {
      resetTimer();
    }
    if (id) {
      // Best-effort: remove the crash-safe draft from the server. Swallow
      // errors — the local state is already cleared.
      try {
        await deleteTimeEntry(id);
      } catch {
        /* ignore */
      }
    }
  };

  return {
    stashedTimer,
    pendingCancelTimer,
    setPendingCancelTimer,
    startSideQuest,
    restoreStashedTimer,
    cancelTimer,
  };
}

export type UseSideQuest = ReturnType<typeof useSideQuest>;
