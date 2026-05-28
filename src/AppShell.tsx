import { vars } from "./theme";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import * as ui from "./components";
import type { ConfirmationRequest } from "./components/ConfirmationModal";
import {
  TimeEntry,
  buildSavePayload,
  deleteTimeEntry,
  loadTimeEntries,
  saveTimeEntry,
} from "./api";
import { classifyApiError, apiErrorKey } from "./lib/apiError";
import {
  isPendingId,
  makePendingEntry,
} from "./lib/pendingEntries";
import { formatLocalDate, isOnCurrent, mondayOf } from "./lib/date";
import {
  fmtHours,
  roundUpToQuarter,
} from "./lib/hours";
import {
  findNewlyUnlocked,
  isoWeekKey,
  nextAchStats,
  type AchCtx,
} from "./lib/achievements";
import { streakAfterLog } from "./lib/streak";
import { pickRandomMessage } from "./lib/funMessages";
import { pickTip } from "./lib/productivityTips";
import {
  emptyTodayMessage,
  saveCheer,
} from "./lib/personality";
import { Lang, useTranslation } from "./lib/i18n";
import { useLogForm } from "./lib/useLogForm";
import { useTimer } from "./lib/useTimer";
import * as prim from "./primitives";

import {
  taskKey,
  todoTrackedH,
  type Todo,
} from "./lib/todos";
import { useTodos } from "./lib/useTodos";
import { useEntries } from "./lib/useEntries";
import { useCompanies } from "./lib/useCompanies";
import { useProgress } from "./lib/useProgress";
import { useSyncQueue } from "./lib/useSyncQueue";
import { useFloats } from "./lib/useFloats";
import { useProgressFeedback } from "./lib/useProgressFeedback";
import { useIntro } from "./lib/useIntro";
import { useCurrentUser } from "./lib/useCurrentUser";
import { useNowTick } from "./lib/useNowTick";
import { useDayEntries } from "./lib/useDayEntries";
import { useTodayDerivations } from "./lib/useTodayDerivations";
import { useSideQuest } from "./lib/useSideQuest";
import {
  useGreetingMessage,
  useTimerInsight,
  useXpCoach,
} from "./lib/useRotatingMessages";
import { useGoSize } from "./lib/useGoSize";
import { useAutoSaveDraft } from "./lib/useAutoSaveDraft";
import { useSimonMode } from "./lib/useSimonMode";
import { useAbsence } from "./lib/useAbsence";
import { useMonthClosure } from "./lib/useMonthClosure";
import { useConnection } from "./lib/useConnection";

const GOAL = 8;

type WindowSize = "full" | "top";

interface AppShellProps {
  mode: "light" | "dark";
  setMode: Dispatch<SetStateAction<"light" | "dark">>;
  lang: Lang;
  setLang: Dispatch<SetStateAction<Lang>>;
  pinned: boolean;
  setPinned: Dispatch<SetStateAction<boolean>>;
  size: WindowSize;
  setWindowSize: Dispatch<SetStateAction<WindowSize>>;
  themeClass: string;
  onSignOut: () => void;
}

export function AppShell({
  mode, setMode,
  lang, setLang,
  pinned, setPinned,
  size, setWindowSize,
  themeClass,
  onSignOut,
}: AppShellProps) {
  // Always true when AppShell is mounted — App handles the auth gate.
  const authed = true as const;
  const { t } = useTranslation();
  const [tab, setTab] = useState<ui.HeaderTab>("today");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [historyScale, setHistoryScale] = useState<"day" | "week" | "month">(
    "week",
  );
  const [logOpen, setLogOpen] = useState(false);
  const monthClosure = useMonthClosure();

  const stepHistoryDate = (dir: 1 | -1) => {
    if (historyScale === "day") {
      setSelectedDate((d) => {
        const n = new Date(d);
        n.setDate(n.getDate() + dir);
        return n;
      });
    } else if (historyScale === "week") {
      setSelectedDate((d) => {
        const n = new Date(d);
        n.setDate(n.getDate() + 7 * dir);
        return n;
      });
    } else {
      setSelectedDate((d) => new Date(d.getFullYear(), d.getMonth() + dir, 1));
    }
  };
  const historyIsOnCurrent = isOnCurrent(historyScale, selectedDate);
  const jumpHistoryToCurrent = () => setSelectedDate(new Date());

  const nowTick = useNowTick();

  const [funMessage, setFunMessage] = useState<string | null>(null);

  const confirmSignOut = () => {
    if (window.confirm(t("footer.confirmSignOut"))) {
      window.electronAPI.signOut();
    }
  };

  const onUnauthenticated = useCallback(() => onSignOut(), [onSignOut]);
  const onCannotResolveUser = useCallback(() => {
    window.electronAPI.signOut();
  }, []);
  const { currentUser, setCurrentUser } = useCurrentUser({
    authed,
    onUnresolvable: onCannotResolveUser,
  });
  const {
    entries, setEntries,
    entriesLoading, setEntriesLoading,
    pendingDeleteId, setPendingDeleteId,
  } = useEntries({ authed, nowTick, onUnauthenticated });
  // Player progression (cohesive hook): XP, streak, week hours, achievement
  // stats + unlocks + toast queue. Owns load/persist + dequeue/dismiss effects.
  const {
    xp, setXp,
    streak, setStreak,
    unlocked, setUnlocked,
    weekH, setWeekH,
    achStats, setAchStats,
    lastCelebratedDate, setLastCelebratedDate,
    ach,
    setPendingAchs,
    clear: clearProgress,
  } = useProgress({ authed });

  useEffect(() => {
    if (size !== "top") {
      setFunMessage(null);
      return;
    }
    let hideId: number | undefined;
    let showTip = false;
    const show = () => {
      setFunMessage(showTip ? pickTip(lang) : pickRandomMessage(lang));
      showTip = !showTip;
      hideId = window.setTimeout(() => setFunMessage(null), 18000);
    };
    const initialId = window.setTimeout(show, 5000);
    const rotateId = window.setInterval(show, 45000);
    return () => {
      clearTimeout(initialId);
      clearInterval(rotateId);
      if (hideId) clearTimeout(hideId);
    };
  }, [size, lang]);
  // Toast-style "floats" (cohesive hook).
  const { floats, addFloat } = useFloats();
  // To-do state (cohesive hook): items, draft form, active/editing ids, accrual.
  const {
    todos,
    activeTodoId, setActiveTodoId,
    editingTodoId, setEditingTodoId,
    todoDraft, setTodoDraft,
    activeTodoBaseHoursRef,
    accrueTodoHours,
    addTodo, updateTodo, toggleTodo, deleteTodo,
    estimatedTodoFor,
    resetTodoForm,
  } = useTodos(authed);
  const [windowFocused, setWindowFocused] = useState(
    typeof document === "undefined" ? true : !document.hidden,
  );
  const { online, setOnline } = useConnection();
  // Company catalog + lazy project cache (cohesive hook).
  const {
    companies,
    companiesError,
    projectErrors,
    projectCache,
    ensureProjects,
    reload: reloadCompanies,
  } = useCompanies({ authed, onOnlineChange: setOnline });
  const { simonMode, tapCorner: tapSimonCorner } = useSimonMode(addFloat);
  // Offline save queue (cohesive hook): pending + failed + flushPending + retryFailed
  // + the 4 load/persist effects + flush-on-reconnect + retry-on-interval.
  const {
    pendingQueue, setPendingQueue,
    failedQueue, setFailedQueue,
    syncing,
    retryFailed,
  } = useSyncQueue({
    online,
    setOnline,
    setEntries,
    onAuthFailed: onUnauthenticated,
  });
  const [saveToast, setSaveToast] = useState<{
    cheer: string;
    hours: string;
    xp: number;
  } | null>(null);

  // Timer state (cohesive hook)
  const {
    tSec, setTSec, tSecRef,
    tRun, setTRun,
    tCo, setTCo,
    tPr, setTPr,
    tD, setTD,
    tNote, setTNote,
    tInv, setTInv,
    draftId, setDraftId,
    reset: clearTimerFields,
    hydrate: hydrateTimer,
  } = useTimer();
  const { goSize, goSizeRef, sizeRef, modeTransition } = useGoSize({
    size,
    setWindowSize,
    tRun,
    setTab,
  });
  // Silent background save for crash-safety. Upserts the current timer into a
  // server draft entry; later saves update the same id so we don't spawn duplicates.
  const draftIdRef = useRef<string | null>(null);
  useEffect(() => {
    draftIdRef.current = draftId;
  }, [draftId]);
  const [timerLoaded, setTimerLoaded] = useState(false);
  const [timerFormOpen, setTimerFormOpen] = useState(true);

  // First-run intro tour (cohesive hook).
  const {
    showIntro, setShowIntro,
    introStep, setIntroStep,
    introSteps,
    introCanAdvance,
    dismissIntro,
    advanceIntro,
  } = useIntro({
    authed,
    lang,
    tab,
    tCo,
    tPr,
    tD,
    tRun,
    timerFormOpen,
    sizeRef,
    goSizeRef,
  });

  // Log form state (cohesive hook)
  const logFormApi = useLogForm();
  const {
    fCo, setFCo,
    fPr, setFPr,
    fH, setFH,
    fD, setFD,
    fNote, setFNote,
    fInv, setFInv,
    setFHInput,
    setEditingId,
    setEditingDate,
    reset: resetLogForm,
    hydrate: hydrateLogForm,
  } = logFormApi;
  const [logFormLoaded, setLogFormLoaded] = useState(false);
  const [confirmation, setConfirmation] =
    useState<ConfirmationRequest | null>(null);

  const resetTimer = () => {
    clearTimerFields();
    draftIdRef.current = null;
    setTimerFormOpen(true);
    setActiveTodoId(null);
  };

  const {
    stashedTimer,
    pendingCancelTimer, setPendingCancelTimer,
    startSideQuest, restoreStashedTimer, cancelTimer,
  } = useSideQuest({
    timer: {
      tCo, tPr, tD, tNote, tInv, tSec,
      setTCo, setTPr, setTD, setTNote, setTInv, setTSec,
      setDraftId, setTRun,
    },
    draftIdRef,
    companies,
    resetTimer,
    setTimerFormOpen,
  });


  const stopAndLogCurrent = async () => {
    if (!tCo || !tPr || !tD.trim()) {
      addFloat(t("form.fillFirst"), vars.typography.error);
      return;
    }
    const h = Math.max(1, Math.ceil(tSec / 60)) / 60;
    await saveNewEntry(
      tCo,
      tPr,
      h,
      tD.trim(),
      tInv,
      tNote.trim(),
      new Date(),
      draftIdRef.current,
    );
    accrueTodoHours(activeTodoId, h);
    resetTimer();
    setTab("today");
  };

  const switchTaskGuarded = (
    cid: string,
    prid: string,
    desc: string,
    continueFrom?: {
      entryId: string;
      hours: number;
      note: string;
      invoice: boolean;
    },
    opts?: { run?: boolean; todoId?: string | null; landingTab?: ui.HeaderTab },
  ) => {
    const applySwitch = async () => {
      if (cid) await ensureProjects(cid);
      setTCo(cid);
      setTPr(prid);
      setTD(desc);
      if (continueFrom) {
        setTNote(continueFrom.note);
        setTInv(continueFrom.invoice);
        setTSec(Math.round(continueFrom.hours * 3600));
        setDraftId(continueFrom.entryId);
        draftIdRef.current = continueFrom.entryId;
        setTRun(true);
      } else {
        setTNote("");
        setTInv(true);
        setTSec(0);
        setDraftId(null);
        draftIdRef.current = null;
        setTRun(opts?.run ?? false);
      }
      setActiveTodoId(opts?.todoId ?? null);
      activeTodoBaseHoursRef.current = opts?.todoId
        ? (continueFrom?.hours ?? 0)
        : 0;
      setTab(opts?.landingTab ?? "timer");
    };

    const canSaveCurrent = !!(tCo && tPr && tD.trim() && tSec > 0);
    const saveCurrentAndSwitch = async () => {
      if (canSaveCurrent) {
        const h = Math.max(1, Math.ceil(tSec / 60)) / 60;
        await saveNewEntry(
          tCo,
          tPr,
          h,
          tD.trim(),
          tInv,
          tNote.trim(),
          new Date(),
          draftIdRef.current,
        );
        accrueTodoHours(activeTodoId, h);
      }
      await applySwitch();
    };

    if (tRun && canSaveCurrent) {
      // Timer is actively running â†’ confirm before saving & switching.
      setConfirmation({
        title: t("timer.confirmSwitchTitle"),
        body: t("timer.confirmSwitchBody"),
        confirmLabel: t("timer.confirmSwitchOk"),
        onConfirm: saveCurrentAndSwitch,
      });
    } else if (canSaveCurrent) {
      // Paused with unsaved progress â†’ save silently, then switch.
      saveCurrentAndSwitch();
    } else {
      applySwitch();
    }
  };

  const editEntry = async (entry: TimeEntry) => {
    setEditingId(entry.id);
    // Parse YYYY-MM-DD as a local date so the save keeps the original day
    // regardless of the calendar's currently-selected date or timezone.
    const [y, mo, d] = (entry.task_date || "").split("-").map(Number);
    setEditingDate(
      Number.isFinite(y) && Number.isFinite(mo) && Number.isFinite(d)
        ? new Date(y, mo - 1, d)
        : null,
    );
    setFCo(entry._company_id);
    await ensureProjects(entry._company_id);
    setFPr(entry._project_id);
    setFH(parseFloat(entry.hour) || 0);
    setFD(entry.description || "");
    setFNote(entry.internal_description || "");
    setFInv(entry.invoice === "1");
    setLogOpen(true);
  };

  // â”€â”€â”€ Auth gating â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Reset user-scoped state on sign-out so the next user doesn't inherit it.
  useEffect(() => {
    if (authed) return;
    clearProgress();
    setEntries([]);
    setEntriesLoading(true);
    clearTimerFields();
    setPendingCancelTimer(false);
    resetLogForm();
    setFHInput("1:00");
    setCurrentUser(null);
    setTimerLoaded(false);
    setLogFormLoaded(false);
  }, [authed, clearProgress, clearTimerFields, resetLogForm, setFHInput, setEntries, setEntriesLoading, setCurrentUser, setPendingCancelTimer]);

  // â”€â”€â”€ Persisted: mode, lang, timer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // (Player progression â€” xp / unlocked / streak / achStats â€” loads via useProgress.)
  // Restore a saved running-timer draft on auth (mode/lang/pinned hydrate in App
  // via the pref-hydration effect; they're already on props by the time we get here).
  useEffect(() => {
    if (!authed) return;
    (async () => {
      const t = await window.electronAPI.storeGet("timer");
      if (t && typeof t === "object") {
        hydrateTimer(t);
        if (t.tCo) void ensureProjects(t.tCo);
      }
      setTimerLoaded(true);
    })();
  }, [authed, hydrateTimer, ensureProjects]);

  useEffect(() => {
    const r = document.documentElement.style;
    r.setProperty("--rec-color", vars.typography.pink);
    r.setProperty("--scrollbar-thumb", vars.border.soft);
    r.setProperty("--select-bg", vars.background.page);
    r.setProperty("--select-fg", vars.typography.primary);
  }, []);
  const startIntroFresh = () => {
    setTRun(false);
    setTSec(0);
    setTCo("");
    setTPr("");
    setTD("");
    setTNote("");
    setTimerFormOpen(true);
    setTab("today");
    setIntroStep(0);
    setShowIntro(true);
    if (size !== "full") goSize("full");
  };

  const devcoreId = (
    companies.find((c) => c.name.toLowerCase() === "devcore") ??
    companies.find((c) => c.name.toLowerCase().includes("devcore"))
  )?.id;

  useEffect(() => {
    if (!showIntro || !devcoreId) return;
    void ensureProjects(devcoreId);
  }, [showIntro, devcoreId, ensureProjects]);

  useEffect(() => {
    window.electronAPI.setBlurCollapseDisabled(showIntro || !authed || pinned);
  }, [showIntro, authed, pinned]);

  const greetingMsg = useGreetingMessage(currentUser, lang);

  const emptyMsg = useMemo(() => emptyTodayMessage(lang), [lang]);

  // Persist timer on control/field changes (NOT on tSec tick â€” startedAt covers elapsed).
  useEffect(() => {
    if (!authed || !timerLoaded) return;
    window.electronAPI.storeSet("timer", {
      tCo,
      tPr,
      tD,
      tNote,
      tInv,
      tSec: tRun ? 0 : tSecRef.current,
      running: tRun,
      startedAt: tRun ? Date.now() - tSecRef.current * 1000 : null,
      draftId,
    });
  }, [authed, timerLoaded, tCo, tPr, tD, tNote, tInv, tRun, draftId, tSecRef]);

  // Persist Log form fields too so manual-log inputs survive app restarts.
  useEffect(() => {
    if (!authed) return;
    (async () => {
      const f = await window.electronAPI.storeGet("logForm");
      if (f && typeof f === "object") {
        hydrateLogForm(f);
        if (f.fCo) void ensureProjects(f.fCo);
      }
      setLogFormLoaded(true);
    })();
  }, [authed, hydrateLogForm, ensureProjects]);

  useEffect(() => {
    if (!authed || !logFormLoaded) return;
    window.electronAPI.storeSet("logForm", {
      fCo: fCo,
      fPr: fPr,
      fH: fH,
      fD: fD,
      fNote: fNote,
      fInv: fInv,
    });
  }, [authed, logFormLoaded, fCo, fPr, fH, fD, fNote, fInv]);


  useEffect(() => {
    if (!authed) return;
    monthClosure.ensure(selectedDate.getFullYear(), selectedDate.getMonth());
  }, [authed, selectedDate, monthClosure]);

  const { dayEntries, setDayEntries, dayEntriesLoading } = useDayEntries({
    authed,
    active: historyScale === "day" && tab === "history",
    selectedDate,
    reloadKey: entries,
  });

  // â”€â”€â”€ Load week hours (Monâ€“Fri containing selectedDate) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (!authed) return;
    // Always show the current week â€” independent of selectedDate
    const mon = mondayOf(new Date());
    const days = [0, 1, 2, 3, 4].map((i) => {
      const d = new Date(mon);
      d.setDate(d.getDate() + i);
      return d;
    });
    Promise.all(
      days.map((d) => loadTimeEntries(d).catch((): TimeEntry[] => [])),
    ).then((all) =>
      setWeekH(
        all.map((rows) =>
          rows.reduce((s, e) => s + parseFloat(e.hour || "0"), 0),
        ),
      ),
    );
  }, [authed, entries, setWeekH]);


  const {
    todayI,
    liveTodayEntries,
    failedIds,
    todayH,
    liveTodayH,
    groups,
    done,
    liveDone,
  } = useTodayDerivations({
    entries,
    pendingQueue,
    failedQueue,
    timer: { tSec, tCo, tPr, tD, tNote, tInv, draftId },
    companies,
    projectCache,
    goal: GOAL,
  });

  const timerInsight = useTimerInsight(currentUser, lang, GOAL, entries.length, {
    tRun, tSec, tCo, tPr, tD, todayH, streak,
  });

  const weekTotal = useMemo(() => weekH.reduce((s, h) => s + h, 0), [weekH]);

  const xpIntoLevel = xp % 1000;
  const xpCoach = useXpCoach(currentUser, lang, {
    xp, xpIntoLevel, streak, weekTotal,
  });

  const gpct = Math.min((todayH / GOAL) * 100, 100);

  // Save flash â€” auto-dismiss after 2.1s.
  useEffect(() => {
    if (!saveToast) return;
    const t = window.setTimeout(() => setSaveToast(null), 2100);
    return () => clearTimeout(t);
  }, [saveToast]);

  // Window focus tracking â€” pauses decorative animations (marquee, shimmer)
  // when the window is blurred or hidden, saving battery on idle top-bar.
  useEffect(() => {
    const onFocus = () => setWindowFocused(true);
    const onBlur = () => setWindowFocused(false);
    const onVis = () => setWindowFocused(!document.hidden);
    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  // Connection tracking lives in useConnection() above.

  // Log stray errors / rejected promises (e.g. storage failures) for support.
  // Intentionally no toast â€” background failures shouldn't alarm the user.
  useEffect(() => {
    const onErr = (e: ErrorEvent) =>
      console.error("[window-error]", e.error || e.message);
    const onRej = (e: PromiseRejectionEvent) =>
      console.error("[unhandled-rejection]", e.reason);
    window.addEventListener("error", onErr);
    window.addEventListener("unhandledrejection", onRej);
    return () => {
      window.removeEventListener("error", onErr);
      window.removeEventListener("unhandledrejection", onRej);
    };
  }, []);

  // The To-do feature lives behind Simon mode; bounce off the tab when it's off.
  useEffect(() => {
    if (!simonMode && tab === "todo") setTab("today");
  }, [simonMode, tab]);

  // Animation feedback for player progression (cohesive hook).
  const {
    sessionXp,
    xpBump,
    justBumpedStreak,
    justHitGoal,
    goalCelebration,
  } = useProgressFeedback({
    authed,
    xp,
    streak,
    tRun,
    tSec,
    done,
    lang,
    lastCelebratedDate,
    setLastCelebratedDate,
  });

  // Double-click a to-do to edit it: fill the form and jump to the To-do tab.
  const editTodo = async (todo: Todo) => {
    setEditingTodoId(todo.id);
    setTodoDraft({
      text: todo.text,
      estimate: todo.estimateH > 0 ? String(todo.estimateH) : "",
      planned: todo.plannedDate ?? "",
      deadline: todo.deadline ?? "",
      co: todo.companyId ?? "",
      pr: todo.projectId ?? "",
    });
    if (todo.companyId) await ensureProjects(todo.companyId);
    setTab("todo");
  };

  // Hours tracked against a to-do, derived from its actual time entries (the
  // source of truth, in sync with the per-client totals). The running session
  // counts live: a resumed entry uses the live clock, and a fresh session not
  // yet saved is added on top so progress ticks up in real time.
  const trackedHForTodo = (td: Todo) =>
    todoTrackedH(td, entries, { tCo, tPr, tD, tRun, tSec, draftId });

  // Key of the task currently running (if any), so to-do rows can show a live
  // "Running" state by matching their own task â€” independent of activeTodoId.
  const activeTaskKey = tRun ? taskKey(tCo, tPr, tD) : null;

  // Start a to-do in place: track that exact task immediately and stay on the
  // current page (a live tracker appears on Today). A running timer is still
  // saved/confirmed first via the guard. activeTodoId links logged time back.
  // If today already has an entry for this task, continue it (resume its hours,
  // keep it as the running entry) instead of starting a fresh, separate session.
  // To-dos without a client + project fall back to the timer form to pick them.
  const startTodo = (todo: Todo) => {
    if (!todo.companyId || !todo.projectId) {
      setTimerFormOpen(true);
      switchTaskGuarded(
        todo.companyId ?? "",
        todo.projectId ?? "",
        todo.text,
        undefined,
        { run: false, todoId: todo.id, landingTab: "timer" },
      );
      return;
    }
    const cid = todo.companyId;
    const prid = todo.projectId;
    const todayISO = formatLocalDate(new Date());
    const match = entries.find(
      (e) =>
        e._company_id === cid &&
        e._project_id === prid &&
        e.description === todo.text &&
        formatLocalDate(new Date(e.task_date)) === todayISO,
    );
    if (match) {
      // Already the running entry â€” just surface the tracker, don't restart.
      if (tRun && draftIdRef.current === match.id) {
        setTab("today");
        return;
      }
      switchTaskGuarded(
        cid,
        prid,
        todo.text,
        {
          entryId: match.id,
          hours: parseFloat(match.hour) || 0,
          note: match.internal_description || "",
          invoice: match.invoice === "1",
        },
        { todoId: todo.id, landingTab: "today" },
      );
      return;
    }
    switchTaskGuarded(cid, prid, todo.text, undefined, {
      run: true,
      todoId: todo.id,
      landingTab: "today",
    });
  };

  // Turn a raw API error into a clear message + side effects (sign-out on auth
  // expiry, flip the offline banner on network trouble). Returns the kind so
  // callers can wrap the message (e.g. "Couldn't save â€” â€¦"). `wrapKey` lets a
  // caller prefix the human message with a contextual form key.
  const handleApiError = (err: unknown, wrapKey?: string): string => {
    const kind = classifyApiError(err);
    if (kind === "auth") {
      onSignOut();
      return kind;
    }
    if (kind === "offline" || kind === "timeout") setOnline(false);
    const human = t(apiErrorKey(kind));
    addFloat(wrapKey ? t(wrapKey, { err: human }) : human, vars.typography.error);
    return kind;
  };

  const saveNewEntry = async (
    cid: string,
    prid: string,
    hours: number,
    desc: string,
    inv: boolean,
    internalNote = "",
    entryDate: Date = selectedDate,
    existingId: string | null = null,
  ) => {
    if (!currentUser) return;
    const co = companies.find((c) => c.id === cid);
    const pr = (projectCache[cid] || []).find((p) => p.id === prid);
    if (!co || !pr) {
      addFloat(
        t("form.saveFailed", { err: "missing client/project" }),
        vars.typography.error,
      );
      return;
    }

    // Billing policy: every save lands on a 15-minute boundary, rounded up.
    hours = roundUpToQuarter(hours);

    const payload = buildSavePayload({
      company: co,
      project: pr,
      hours,
      description: desc,
      internalNote,
      invoice: inv,
      user: currentUser,
      entryDate,
      existingId,
    });
    // Queue for later sync. Display is derived from the queue (liveTodayEntries
    // / liveDayEntries), so no optimistic row insertion is needed.
    const queueOffline = () => {
      const item = makePendingEntry(payload);
      setPendingQueue((q) => [...q, item]);
      const savedISO = item.entry.task_date;
      const todayISO2 = formatLocalDate(new Date());
      setWeekH((w) => {
        if (savedISO !== todayISO2) return w;
        const n = [...w];
        n[todayI] = +(n[todayI] + hours).toFixed(2);
        return n;
      });
      addFloat(t("offline.queued"), vars.typography.warning);
    };

    // Editing an existing entry needs the server (can't safely queue an edit).
    if (!online) {
      if (existingId) {
        addFloat(t("error.api.offline"), vars.typography.error);
        return;
      }
      queueOffline();
      return;
    }

    let saved: { success: boolean; id?: string } | undefined;
    try {
      saved = await saveTimeEntry(payload);
      setOnline(true);
    } catch (err) {
      const kind = classifyApiError(err);
      if (kind === "auth") {
        onSignOut();
        return;
      }
      if ((kind === "offline" || kind === "timeout") && !existingId) {
        setOnline(false);
        queueOffline();
        return;
      }
      handleApiError(err, "form.saveFailed");
      return;
    }

    // Refresh today's entries if the save landed on today.
    // History view refetches its own weeks/months on navigation.
    const savedDateISO = formatLocalDate(entryDate);
    const todayISOStr = formatLocalDate(new Date());
    if (savedDateISO === todayISOStr) {
      const fresh = await loadTimeEntries(new Date());
      setEntries(fresh);
    }
    // If History's Daily drill-down is showing this date, reload it too so
    // the user sees their just-saved past-day entry immediately.
    if (
      savedDateISO === formatLocalDate(selectedDate) &&
      historyScale === "day"
    ) {
      loadTimeEntries(selectedDate)
        .then(setDayEntries)
        .catch(() => {});
    }
    // Only bump weekH for today's entries (weekH is current week Monâ€“Fri)
    setWeekH((w) => {
      if (savedDateISO !== todayISOStr) return w;
      const n = [...w];
      n[todayI] = +(n[todayI] + hours).toFixed(2);
      return n;
    });

    // Streak: bump if this is the first log of today.
    const nowDate = new Date();
    const todayISO = formatLocalDate(nowDate);
    const lastLogged = (await window.electronAPI.storeGet(
      "lastLoggedDate",
    )) as string | null | undefined;
    const streakResult = streakAfterLog(streak, lastLogged, nowDate);
    if (streakResult.bumped) {
      setStreak(streakResult.streak);
      await window.electronAPI.storeSet("lastLoggedDate", todayISO);
    }
    const effectiveStreak = streakResult.streak;

    const earned = Math.round(10 + hours * 8);
    setXp((x) => x + earned);
    setSaveToast({
      cheer: saveCheer(lang),
      hours: fmtHours(hours),
      xp: earned,
    });

    // Skip achievement evaluation on edits â€” only fresh entries advance stats.
    if (existingId) return saved?.id || existingId || null;

    // Build post-save stats snapshot and the evaluation context.
    const savedIsToday = savedDateISO === todayISOStr;
    const savedDay = entryDate.getDay();
    const savedIsWeekend = savedDay === 0 || savedDay === 6;
    const weekKey = isoWeekKey(nowDate);
    const stats = nextAchStats(achStats, {
      hours,
      invoice: inv,
      cid,
      prid,
      weekKey,
    });
    setAchStats(stats);

    const todaysEntries = entries.filter(
      (e) => formatLocalDate(new Date(e.task_date)) === todayISOStr,
    );
    const clientsToday = new Set([
      ...todaysEntries.map((e) => e._company_id),
      ...(savedIsToday ? [cid] : []),
    ]).size;
    const projectsToday = new Set([
      ...todaysEntries.map((e) => e._project_id),
      ...(savedIsToday ? [prid] : []),
    ]).size;
    const postWeekH = savedIsToday
      ? (() => {
          const n = [...weekH];
          n[todayI] = +(n[todayI] + hours).toFixed(2);
          return n;
        })()
      : weekH;
    const weekDaysAtGoal = postWeekH.filter((h) => h >= GOAL).length;
    const daysSinceLastLog = lastLogged
      ? Math.max(0, Math.floor((+nowDate - +new Date(lastLogged)) / 86400000))
      : 0;

    const ctx: AchCtx = {
      stats,
      streak: effectiveStreak,
      todayH: savedIsToday ? todayH + hours : todayH,
      clientsToday,
      projectsToday,
      hourOfDay: nowDate.getHours(),
      daysSinceLastLog,
      savedIsWeekend,
      savedIsToday,
      entryIsBillable: inv,
      entryHours: hours,
      weekDaysAtGoal,
    };

    // Queue toasts so stacked unlocks don't clobber each other.
    const newly = findNewlyUnlocked(unlocked, ctx);
    if (newly.length > 0) {
      setUnlocked((u) => [...u, ...newly.map((a) => a.id)]);
      setXp((x) => x + newly.reduce((s, a) => s + a.xp, 0));
      setPendingAchs((q) => [...q, ...newly]);
    }

    return saved?.id || existingId || null;
  };

  const autoSaveDraft = async () => {
    if (!currentUser) return;
    if (!tCo || !tPr || !tD.trim()) return;
    const co = companies.find((c) => c.id === tCo);
    const pr = (projectCache[tCo] || []).find((p) => p.id === tPr);
    if (!co || !pr) return;
    const hours = Math.max(1, Math.ceil(tSec / 60)) / 60;
    const payload = buildSavePayload({
      company: co,
      project: pr,
      hours,
      description: tD.trim(),
      internalNote: tNote.trim(),
      invoice: tInv,
      user: currentUser,
      entryDate: new Date(),
      existingId: draftIdRef.current,
    });
    try {
      const r = await saveTimeEntry(payload);
      if (!draftIdRef.current && r?.id) {
        draftIdRef.current = r.id;
        setDraftId(r.id);
      }
    } catch {
      /* silent: local state is still persisted */
    }
  };
  useAutoSaveDraft(tRun, autoSaveDraft);

  const delEntry = async (id: string) => {
    // Queued / quarantined rows only live locally â€” drop from the queues.
    if (isPendingId(id)) {
      setPendingQueue((q) => q.filter((x) => x.localId !== id));
      setFailedQueue((f) => f.filter((x) => x.localId !== id));
      return;
    }
    try {
      await deleteTimeEntry(id);
      setEntries((es) => es.filter((e) => e.id !== id));
    } catch (err) {
      handleApiError(err, "form.deleteFailed");
    }
  };

  // The "FrÃ¥nvaro" client (absence) â€” a normal client in the list.
  // DevCore is internal work — its entries are always non-billable.
  const isInternalCompany = (companyId: string) =>
    /devcore/i.test(companies.find((c) => c.id === companyId)?.name || "");

  const absence = useAbsence({
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
  });

  // currentUser may still be loading on first render; show a themed spinner.
  const spinner = (
    <prim.Spinner layout="fill" label={t("form.loadingProjects")} className={themeClass} />
  );
  if (!currentUser) return spinner;

  // â”€â”€â”€ Shared UI helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const locale = lang === "sv" ? "sv-SE" : "en-GB";
  // Live clock: weekday Â· day Â· month Â· hh:mm. Re-renders once per minute via
  // the nowTick state (which uses `nowTick` as a dep to force revaluation).
  void nowTick;
  const now = new Date();
  const clockDate = now.toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const clockTime = now.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });

  // â”€â”€â”€ Header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const hdr = (
    <ui.AppHeader
      tab={tab}
      onTabChange={setTab}
      tRun={tRun}
      tSec={tSec}
      todayH={liveTodayH}
      goalHours={GOAL}
      done={liveDone}
      justHitGoal={justHitGoal}
      clockDate={clockDate}
      clockTime={clockTime}
      showTodo={simonMode}
      onMinimize={() => goSize("top")}
    />
  );


  const hasCtx = !!(tCo && tPr);
  const coObj = companies.find((c) => c.id === tCo);
  const prObj = (projectCache[tCo] || []).find((p) => p.id === tPr);
  // Estimate for the running task (if it maps to an estimated to-do), and the
  // live total tracked against it (committed hours + the current session delta).
  const topEstTodo = !simonMode
    ? undefined
    : (activeTodoId
        ? todos.find((td) => td.id === activeTodoId && td.estimateH > 0)
        : undefined) ?? estimatedTodoFor(tCo, tPr, tD);
  const topEstLiveH = topEstTodo ? trackedHForTodo(topEstTodo) : 0;

  const runningXpBonus = tRun ? Math.floor(tSec / 60) : 0;
  const displaySessionXp = sessionXp + runningXpBonus;

  const modeOverlay = (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        background: vars.background.page,
        zIndex: 999,
        pointerEvents: modeTransition === "out" ? "auto" : "none",
        opacity: modeTransition === "out" ? 1 : 0,
        transition: "opacity 180ms ease-out",
      }}
    />
  );

  const topBarBg = tRun ? vars.background.page : tSec > 0 ? "#ff7a00" : "#ff1f1f";
  const topBarFg = tRun ? vars.typography.primary : vars.typography.onAccent;
  const topBarMuted = tRun ? vars.typography.tertiary : "rgba(255,255,255,0.8)";

  if (size === "top") {
    return (
      <ui.AppTopBar
        themeClass={themeClass}
        mode={mode}
        setMode={setMode}
        lang={lang}
        goSize={goSize}
        modeOverlay={modeOverlay}
        tRun={tRun}
        setTRun={setTRun}
        tSec={tSec}
        funMessage={funMessage}
        windowFocused={windowFocused}
        displaySessionXp={displaySessionXp}
        xpBump={xpBump}
        justBumpedStreak={justBumpedStreak}
        todayH={todayH}
        streak={streak}
        weekH={weekH}
        goal={GOAL}
        done={done}
        gpct={gpct}
        hasCtx={hasCtx}
        coObj={coObj}
        prObj={prObj}
        topEstTodo={topEstTodo}
        topEstLiveH={topEstLiveH}
        topBarBg={topBarBg}
        topBarFg={topBarFg}
        topBarMuted={topBarMuted}
      />
    );
  }

  return (
    <ui.AppLayout
      themeClass={themeClass}
      mode={mode}
      topLeftCorner={<ui.SimonCorner active={simonMode} onTap={tapSimonCorner} />}
      header={hdr}
      banners={
        <>
          <ui.OfflineBanner
            online={online}
            pendingCount={pendingQueue.length}
            syncing={syncing}
            mode={mode}
          />
          <ui.FailedQueueBanner count={failedQueue.length} onRetry={retryFailed} />
        </>
      }
      footer={
        <ui.AppFooter
          mode={mode}
          setMode={setMode}
          lang={lang}
          setLang={setLang}
          pinned={pinned}
          setPinned={setPinned}
          onShowIntro={startIntroFresh}
          onSignOut={confirmSignOut}
        />
      }
      overlays={
        <>
          {showIntro && (
            <ui.IntroOverlay
              mode={mode}
              step={introStep}
              steps={introSteps}
              onAdvance={advanceIntro}
              onSkip={dismissIntro}
              canAdvance={introCanAdvance}
            />
          )}
          <ui.ConfirmationModal
            request={confirmation}
            onDismiss={() => setConfirmation(null)}
          />
          <ui.FloatStack floats={floats} />
          <ui.SaveToast toast={saveToast} mode={mode} />
          <ui.ConfettiBurst show={justHitGoal} />
          <ui.GoalCelebrationToast
            celebration={goalCelebration}
            liftedForAch={!!ach}
          />
          <ui.AchievementToast ach={ach} lang={lang} />
        </>
      }
      modeOverlay={modeOverlay}
    >
      {absence.isOpen ? (
        <ui.AbsenceForm
          company={absence.fravaroCompany}
          projects={absence.projects}
          minFromISO={absence.minFromISO}
          todayISO={absence.todayISO}
          saving={absence.saving}
          onSubmit={absence.submit}
          onClose={absence.close}
        />
      ) : logOpen ? (
        <ui.LogView
          form={logFormApi}
          entries={entries}
          companies={{
            list: companies,
            cache: projectCache,
            error: companiesError,
            projectErrors,
            ensure: ensureProjects,
            reload: reloadCompanies,
          }}
          saveNewEntry={saveNewEntry}
          addFloat={addFloat}
          switchTaskGuarded={switchTaskGuarded}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          onClose={() => setLogOpen(false)}
        />
      ) : (
        <ui.AppViews
          tab={tab}
          username={currentUser.username}
          timer={{
            tCo, tPr, tD, tNote, tInv, tSec, tRun, draftId,
            setTCo, setTPr, setTD, setTNote, setTInv, setTRun,
          }}
          activeTodoId={activeTodoId}
          setActiveTodoId={setActiveTodoId}
          accrueTodoHours={accrueTodoHours}
          companies={companies}
          projectCache={projectCache}
          companiesError={companiesError}
          projectErrors={projectErrors}
          ensureProjects={ensureProjects}
          reloadCompanies={reloadCompanies}
          isInternalCompany={isInternalCompany}
          entries={entries}
          entriesLoading={entriesLoading}
          dayEntries={dayEntries}
          dayEntriesLoading={dayEntriesLoading}
          pendingQueue={pendingQueue}
          failedQueue={failedQueue}
          pendingDeleteId={pendingDeleteId}
          setPendingDeleteId={setPendingDeleteId}
          todayH={todayH}
          liveTodayH={liveTodayH}
          liveTodayEntries={liveTodayEntries}
          liveDone={liveDone}
          groups={groups}
          failedIds={failedIds}
          streak={streak}
          xp={xp}
          unlocked={unlocked}
          weekH={weekH}
          weekTotal={weekTotal}
          todayI={todayI}
          goal={GOAL}
          justHitGoal={justHitGoal}
          justBumpedStreak={justBumpedStreak}
          todos={todos}
          activeTaskKey={activeTaskKey}
          estimatedTodoFor={estimatedTodoFor}
          todoTrackedH={trackedHForTodo}
          todoDraft={todoDraft}
          setTodoDraft={setTodoDraft}
          editingTodoId={editingTodoId}
          addTodo={addTodo}
          updateTodo={updateTodo}
          resetTodoForm={resetTodoForm}
          toggleTodo={toggleTodo}
          deleteTodo={deleteTodo}
          startTodo={startTodo}
          editTodo={editTodo}
          saveNewEntry={saveNewEntry}
          editEntry={editEntry}
          delEntry={delEntry}
          switchTaskGuarded={switchTaskGuarded}
          stopAndLogCurrent={stopAndLogCurrent}
          cancelTimer={cancelTimer}
          startSideQuest={startSideQuest}
          restoreStashedTimer={restoreStashedTimer}
          resetTimer={resetTimer}
          stashedTimer={stashedTimer}
          historyScale={historyScale}
          setHistoryScale={setHistoryScale}
          stepHistoryDate={stepHistoryDate}
          historyIsOnCurrent={historyIsOnCurrent}
          jumpHistoryToCurrent={jumpHistoryToCurrent}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          setEditingDate={setEditingDate}
          setTab={setTab}
          setTD={setTD}
          setLogOpen={setLogOpen}
          timerFormOpen={timerFormOpen}
          setTimerFormOpen={setTimerFormOpen}
          pendingCancelTimer={pendingCancelTimer}
          setPendingCancelTimer={setPendingCancelTimer}
          setConfirmation={setConfirmation}
          simonMode={simonMode}
          mode={mode}
          lang={lang}
          locale={locale}
          greetingMsg={greetingMsg}
          emptyMsg={emptyMsg}
          timerInsight={timerInsight}
          xpCoach={xpCoach}
          done={done}
          monthClosure={monthClosure}
          ach={ach}
          addFloat={addFloat}
          openAbsence={absence.open}
        />
      )}
    </ui.AppLayout>
  );
}
