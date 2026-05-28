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
import { FlameIcon } from "./icons/FlameIcon";
import {
  TimeEntry,
  buildSavePayload,
  deleteTimeEntry,
  loadTimeEntries,
  saveTimeEntry,
} from "./api";
import { classifyApiError, apiErrorKey } from "./lib/apiError";
import {
  LIVE_SESSION_ID,
  isPendingId,
  makePendingEntry,
  type PendingEntry,
} from "./lib/pendingEntries";
import { formatLocalDate, mondayOf } from "./lib/date";
import {
  fmtClock,
  fmtHours,
  roundUpToQuarter,
} from "./lib/hours";
import {
  ACHS,
  CHECKS,
  isoWeekKey,
  type Ach,
  type AchCtx,
  type AchStats,
} from "./lib/achievements";
import { pickRandomMessage } from "./lib/funMessages";
import { pickTip } from "./lib/productivityTips";
import { pickGreeting } from "./lib/greetingMessages";
import { getTimerInsight } from "./lib/timerInsights";
import {
  emptyTodayMessage,
  saveCheer,
  xpCoachNote,
} from "./lib/personality";
import { getHolidays, isWorkingDay } from "./lib/swedishHolidays";
import { Lang, useTranslation } from "./lib/i18n";
import { useModal } from "./lib/useModal";
import { useLogForm } from "./lib/useLogForm";
import { useTimer } from "./lib/useTimer";
import * as prim from "./primitives";

import { SunIcon } from "./icons/SunIcon";
import { MoonIcon } from "./icons/MoonIcon";

import { MONO, SERIF } from "./lib/fonts";

import { workingDaysInRange } from "./lib/absence";

import {
  taskKey,
  todosInPlay,
  todosUpcoming,
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
import { useMonthClosure } from "./lib/useMonthClosure";
import { useConnection } from "./lib/useConnection";

const DAYS = ["Mo", "Tu", "We", "Th", "Fr"];
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
  const [dayEntries, setDayEntries] = useState<TimeEntry[]>([]);
  const [dayEntriesLoading, setDayEntriesLoading] = useState(false);
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
  const historyIsOnCurrent = (() => {
    const now = new Date();
    if (historyScale === "day") {
      return formatLocalDate(selectedDate) === formatLocalDate(now);
    }
    if (historyScale === "week") {
      const monA = new Date(selectedDate);
      monA.setDate(monA.getDate() - ((monA.getDay() + 6) % 7));
      monA.setHours(0, 0, 0, 0);
      const monB = new Date(now);
      monB.setDate(monB.getDate() - ((monB.getDay() + 6) % 7));
      monB.setHours(0, 0, 0, 0);
      return +monA === +monB;
    }
    return (
      selectedDate.getFullYear() === now.getFullYear() &&
      selectedDate.getMonth() === now.getMonth()
    );
  })();
  const jumpHistoryToCurrent = () => setSelectedDate(new Date());

  // Bump at the start of every minute so the header clock ticks forward, and
  // so midnight-derived values (`todayI`, greetings) recompute automatically.
  const [nowTick, setNowTick] = useState(0);
  useEffect(() => {
    let id = 0;
    const schedule = () => {
      const now = new Date();
      const nextMinute = new Date(now);
      nextMinute.setSeconds(0, 0);
      nextMinute.setMinutes(nextMinute.getMinutes() + 1);
      id = window.setTimeout(
        () => {
          setNowTick((n) => n + 1);
          schedule();
        },
        Math.max(200, +nextMinute - +now),
      );
    };
    schedule();
    return () => clearTimeout(id);
  }, []);

  const [funMessage, setFunMessage] = useState<string | null>(null);
  const [greetingMsg, setGreetingMsg] = useState<string>("");
  const [timerInsight, setTimerInsight] = useState<string>("");
  const [xpCoach, setXpCoach] = useState<string>("");
  const [modeTransition, setModeTransition] = useState<"idle" | "out" | "in">(
    "idle",
  );

  const goSize = async (s: "full" | "top") => {
    if (s === "full" && tRun) setTab("timer");
    if (modeTransition !== "idle") return;
    setModeTransition("out");
    await new Promise((r) => setTimeout(r, 180));
    setWindowSize(s);
    await window.electronAPI.setSize(s);
    setModeTransition("in");
    setTimeout(() => setModeTransition("idle"), 200);
  };
  // Latest refs so the one-time intro effect can call goSize / read size
  // without re-running when they change.
  const goSizeRef = useRef(goSize);
  goSizeRef.current = goSize;
  const sizeRef = useRef(size);
  sizeRef.current = size;

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
  // Simon mode â€” hidden dev gate. Triple-click the secret corner to toggle.
  // Reveals features we keep deactivated for tester/demo builds. Persisted.
  const [simonMode, setSimonMode] = useState(false);
  const simonClicksRef = useRef(0);
  const simonResetRef = useRef<number | null>(null);
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
  const [absenceOpen, setAbsenceOpen] = useState(false);
  const [absenceSaving, setAbsenceSaving] = useState(false);
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
  const [confirmation, setConfirmation] = useState<{
    title: string;
    body: string;
    confirmLabel: string;
    onConfirm: () => void | Promise<void>;
  } | null>(null);
  const confirmationRef = useModal<HTMLDivElement>({
    enabled: !!confirmation,
    onClose: () => setConfirmation(null),
  });

  // Side-quest stack: when an interruption comes in, freeze the main timer and
  // start a fresh one. Restore the main when the side quest is logged/abandoned.
  const [stashedTimer, setStashedTimer] = useState<{
    co: string;
    pr: string;
    desc: string;
    note: string;
    inv: boolean;
    sec: number;
    draftId: string | null;
    coName: string;
  } | null>(null);

  const resetTimer = () => {
    clearTimerFields();
    draftIdRef.current = null;
    setTimerFormOpen(true);
    setActiveTodoId(null);
  };

  const startSideQuest = () => {
    if (stashedTimer) return; // single level of nesting
    const coName = companies.find((c) => c.id === tCo)?.name || "";
    setStashedTimer({
      co: tCo,
      pr: tPr,
      desc: tD,
      note: tNote,
      inv: tInv,
      sec: tSec,
      draftId: draftIdRef.current,
      coName,
    });
    // Fresh blank timer, running immediately â€” details filled later.
    setTCo("");
    setTPr("");
    setTD("");
    setTNote("");
    setTInv(true);
    setTSec(0);
    setDraftId(null);
    draftIdRef.current = null;
    setTimerFormOpen(true);
    setTRun(true);
  };

  const restoreStashedTimer = () => {
    if (!stashedTimer) return;
    setTCo(stashedTimer.co);
    setTPr(stashedTimer.pr);
    setTD(stashedTimer.desc);
    setTNote(stashedTimer.note);
    setTInv(stashedTimer.inv);
    setTSec(stashedTimer.sec);
    setDraftId(stashedTimer.draftId);
    draftIdRef.current = stashedTimer.draftId;
    setStashedTimer(null);
    setTimerFormOpen(false);
    setTRun(false); // restored paused â€” user taps resume
  };

  const [pendingCancelTimer, setPendingCancelTimer] = useState(false);
  const cancelTimer = async () => {
    setPendingCancelTimer(false);
    const id = draftIdRef.current;
    if (stashedTimer) {
      // Abandoning a side quest â€” pop the main timer back instead of clearing.
      restoreStashedTimer();
    } else {
      resetTimer();
    }
    if (id) {
      // Best-effort: remove the crash-safe draft from the server. Swallow
      // errors â€” the local state is already cleared, so the user's intent
      // has been honored even if the round-trip fails.
      try {
        await deleteTimeEntry(id);
      } catch {
        /* ignore */
      }
    }
  };


  const stopAndLogCurrent = async () => {
    if (!tCo || !tPr || !tD.trim()) {
      addFloat(t("form.fillFirst"), "#ef4444");
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
  }, [authed, clearProgress, clearTimerFields, resetLogForm, setFHInput, setEntries, setEntriesLoading, setCurrentUser]);

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

  useEffect(() => {
    if (!currentUser) return;
    const first = currentUser.username.trim().split(/\s+/)[0] || "friend";
    setGreetingMsg(pickGreeting(first, lang));
    const id = window.setInterval(
      () => setGreetingMsg(pickGreeting(first, lang)),
      30 * 60 * 1000,
    );
    return () => clearInterval(id);
  }, [currentUser, lang]);

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

  // â”€â”€â”€ Load entries for History â†’ Daily drill-down â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (!authed || historyScale !== "day" || tab !== "history") return;
    let cancelled = false;
    setDayEntriesLoading(true);
    loadTimeEntries(selectedDate)
      .then((list) => {
        if (!cancelled) {
          setDayEntries(list);
          setDayEntriesLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setDayEntriesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authed, historyScale, tab, selectedDate, entries]);

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


  // â”€â”€â”€ Auto-save draft every 5 min while running â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Only depend on tRun â€” we read the latest fields through a ref so typing
  // into the description doesn't restart the 5-minute clock.
  const autoSaveRef = useRef<() => Promise<void>>(() => Promise.resolve());
  useEffect(() => {
    if (!tRun) return;
    const h = window.setInterval(
      () => {
        void autoSaveRef.current();
      },
      5 * 60 * 1000,
    );
    return () => clearInterval(h);
  }, [tRun]);

  // â”€â”€â”€ Derived â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Cheap; recompute each render so it's always the real current weekday.
  const todayI = (() => {
    const now = new Date();
    const mon = mondayOf(now);
    return Math.max(0, Math.min(4, Math.floor((+now - +mon) / 86400000)));
  })();
  // Single source of truth for what shows today: server rows plus any locally
  // queued (pending) or quarantined (failed) entries for today, deduped by id.
  // Survives restarts â€” queued entries are reloaded from the store.
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

  // Committed total (saved + queued) â€” drives goal/celebration, never the
  // unsaved running timer.
  const todayH = useMemo(
    () => liveTodayEntries.reduce((s, e) => s + parseFloat(e.hour || "0"), 0),
    [liveTodayEntries],
  );

  // Volatile timer values for the ambient insight â€” read via ref so the message
  // recomputes on the interval / language change rather than on every tick.
  const insightInputRef = useRef({ tRun, tSec, tCo, tPr, tD, todayH, streak });
  insightInputRef.current = { tRun, tSec, tCo, tPr, tD, todayH, streak };
  useEffect(() => {
    if (!currentUser) return;
    const first = currentUser.username.trim().split(/\s+/)[0] || "";
    const compute = () =>
      setTimerInsight(
        getTimerInsight({
          ...insightInputRef.current,
          goal: GOAL,
          entriesToday: entries.length,
          firstName: first,
          lang,
        }),
      );
    compute();
    const id = window.setInterval(compute, 2 * 60 * 1000);
    return () => clearInterval(id);
  }, [currentUser, lang, entries.length]);

  // What the Today list renders: committed entries with the in-progress session
  // folded in live â€” overriding the continued entry's hour, or added as a
  // synthetic LIVE row. The hero and the list Total both derive from this, so
  // they can't disagree.
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
  const weekTotal = useMemo(() => weekH.reduce((s, h) => s + h, 0), [weekH]);

  const xpIntoLevel = xp % 1000;
  // Volatile XP values read via ref so the coaching note recomputes hourly /
  // on language change, not on every XP tick.
  const xpCoachInputRef = useRef({ xp, xpIntoLevel, streak, weekTotal });
  xpCoachInputRef.current = { xp, xpIntoLevel, streak, weekTotal };
  useEffect(() => {
    if (!currentUser) return;
    const first = currentUser.username.trim().split(/\s+/)[0] || "";
    const compute = () =>
      setXpCoach(
        xpCoachNote({
          ...xpCoachInputRef.current,
          xpPerLevel: 1000,
          firstName: first,
          lang,
        }),
      );
    compute();
    const id = window.setInterval(compute, 60 * 60 * 1000);
    return () => clearInterval(id);
  }, [currentUser, lang]);

  const done = todayH >= GOAL;
  const gpct = Math.min((todayH / GOAL) * 100, 100);

  // Live total for the displayed clock = sum of the rows actually shown on
  // Today (incl. the in-progress session), so the hero and the list Total are
  // identical. `done`/celebration above stay on committed hours so confetti
  // only fires on a real logged 8h.
  const liveTodayH = useMemo(
    () => displayTodayEntries.reduce((s, e) => s + parseFloat(e.hour || "0"), 0),
    [displayTodayEntries],
  );
  const liveDone = liveTodayH >= GOAL;

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

  useEffect(() => {
    window.electronAPI.storeGet("simonMode").then((v) => setSimonMode(v === true));
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
  const todoTrackedH = (td: Todo) => {
    const belongs = (cid: string, prid: string, desc: string) =>
      cid === td.companyId && prid === td.projectId && desc === td.text;
    let sum = 0;
    let countedRunning = false;
    for (const e of entries) {
      if (!belongs(e._company_id, e._project_id, e.description)) continue;
      if (tRun && draftId === e.id) {
        sum += tSec / 3600;
        countedRunning = true;
      } else {
        sum += parseFloat(e.hour) || 0;
      }
    }
    if (tRun && !countedRunning && draftId === null && belongs(tCo, tPr, tD)) {
      sum += tSec / 3600;
    }
    return sum;
  };

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

  // Secret corner: 3 clicks within 1.5s toggles Simon mode.
  const tapSimonCorner = () => {
    simonClicksRef.current += 1;
    if (simonResetRef.current) clearTimeout(simonResetRef.current);
    simonResetRef.current = window.setTimeout(() => {
      simonClicksRef.current = 0;
    }, 1500);
    if (simonClicksRef.current < 3) return;
    simonClicksRef.current = 0;
    setSimonMode((m) => {
      const next = !m;
      window.electronAPI.storeSet("simonMode", next);
      addFloat(
        next ? "Simon mode ON" : "Simon mode OFF",
        next ? "#10b981" : "#ef4444",
      );
      return next;
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
    addFloat(wrapKey ? t(wrapKey, { err: human }) : human, "#ef4444");
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
        "#ef4444",
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
      addFloat(t("offline.queued"), "#f59e0b");
    };

    // Editing an existing entry needs the server (can't safely queue an edit).
    if (!online) {
      if (existingId) {
        addFloat(t("error.api.offline"), "#ef4444");
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
    // "Previous" means the most recent working day before today
    // (so weekends and Swedish holidays don't break the streak).
    const nowDate = new Date();
    const todayISO = formatLocalDate(nowDate);
    const lastLogged = await window.electronAPI.storeGet("lastLoggedDate");
    let effectiveStreak = streak;
    if (lastLogged !== todayISO) {
      const hols = getHolidays(nowDate.getFullYear());
      const prev = new Date(nowDate);
      do {
        prev.setDate(prev.getDate() - 1);
      } while (!isWorkingDay(prev, hols));
      const prevWDISO = formatLocalDate(prev);
      effectiveStreak = lastLogged === prevWDISO ? streak + 1 : 1;
      setStreak(effectiveStreak);
      await window.electronAPI.storeSet("lastLoggedDate", todayISO);
    }

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
    const nextStats: AchStats = {
      entriesCount: achStats.entriesCount + 1,
      totalH: +(achStats.totalH + hours).toFixed(2),
      totalBillableH: +(achStats.totalBillableH + (inv ? hours : 0)).toFixed(2),
      clientIds: achStats.clientIds.includes(cid)
        ? achStats.clientIds
        : [...achStats.clientIds, cid],
      projectIds: achStats.projectIds.includes(prid)
        ? achStats.projectIds
        : [...achStats.projectIds, prid],
      currentWeekKey: weekKey,
      currentWeekBillableH: +(
        (achStats.currentWeekKey === weekKey
          ? achStats.currentWeekBillableH
          : 0) + (inv ? hours : 0)
      ).toFixed(2),
    };
    setAchStats(nextStats);

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
      stats: nextStats,
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

    // Fire any newly-passed predicates. Queue toasts so stacked unlocks don't
    // clobber each other.
    const newly: Ach[] = [];
    for (const a of ACHS) {
      if (unlocked.includes(a.id)) continue;
      const fn = CHECKS[a.id];
      if (fn && fn(ctx)) newly.push(a);
    }
    if (newly.length > 0) {
      setUnlocked((u) => [...u, ...newly.map((a) => a.id)]);
      setXp((x) => x + newly.reduce((s, a) => s + a.xp, 0));
      setPendingAchs((q) => [...q, ...newly]);
    }

    return saved?.id || existingId || null;
  };

  // Silent background save for crash-safety. Upserts the current timer into a server
  // draft entry; later saves update the same id so we don't spawn duplicates.
  const draftIdRef = useRef<string | null>(null);
  useEffect(() => {
    draftIdRef.current = draftId;
  }, [draftId]);
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
  useEffect(() => {
    autoSaveRef.current = autoSaveDraft;
  });

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
  const fravaroCompany = useMemo(
    () => companies.find((c) => /fr[Ã¥a]nvaro/i.test(c.name)) || null,
    [companies],
  );

  // DevCore is internal work â€” its entries are always non-billable.
  const isInternalCompany = (companyId: string) =>
    /devcore/i.test(companies.find((c) => c.id === companyId)?.name || "");

  // Absence range bounds: past is capped at the start of the current month;
  // the future is open.
  const absenceMinFromISO = (() => {
    const d = new Date();
    d.setDate(1);
    return formatLocalDate(d);
  })();
  const absenceTodayISO = formatLocalDate(new Date());

  const openAbsence = async () => {
    if (fravaroCompany) await ensureProjects(fravaroCompany.id);
    setAbsenceOpen(true);
  };

  // Bulk-log 8h absence for each working day in the range, under the FrÃ¥nvaro
  // client + chosen project. Rides the offline queue like any other save.
  const reportAbsence = async (
    projectId: string,
    fromISO: string,
    toISO: string,
    note: string,
  ) => {
    if (!currentUser || !fravaroCompany) return;
    const project = (projectCache[fravaroCompany.id] || []).find(
      (p) => p.id === projectId,
    );
    if (!project) return;
    const days = workingDaysInRange(fromISO, toISO);
    if (days.length === 0) {
      addFloat(t("absence.noDays"), "#f59e0b");
      return;
    }
    setAbsenceSaving(true);
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
        // other errors: skip this day
      }
    }
    if (queued.length) setPendingQueue((q) => [...q, ...queued]);
    setAbsenceSaving(false);
    if (authFailed) return;
    setAbsenceOpen(false);
    if (days.includes(todayISOStr) && online && queued.length === 0) {
      try {
        setEntries(await loadTimeEntries(new Date()));
      } catch {
        /* best-effort refresh */
      }
    }
    if (count > 0) addFloat(t("absence.done", { n: count }), "#10b981");
  };

  // Group entries by company for Today view
  const groups = useMemo(() => {
    const g: Record<string, { cid: string; h: number; entries: TimeEntry[] }> =
      {};
    displayTodayEntries.forEach((e) => {
      const key = e.company;
      if (!g[key]) g[key] = { cid: e._company_id, h: 0, entries: [] };
      g[key].h = +(g[key].h + parseFloat(e.hour || "0")).toFixed(2);
      g[key].entries.push(e);
    });
    return g;
  }, [displayTodayEntries]);

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

  // â”€â”€â”€ Today view â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const todayView = (
    <ui.TodayView
      username={currentUser.username}
      todayH={todayH}
      liveTodayH={liveTodayH}
      liveTodayEntries={liveTodayEntries}
      liveDone={liveDone}
      streak={streak}
      goal={GOAL}
      justHitGoal={justHitGoal}
      justBumpedStreak={justBumpedStreak}
      entries={entries}
      entriesLoading={entriesLoading}
      groups={groups}
      failedIds={failedIds}
      pendingDeleteId={pendingDeleteId}
      setPendingDeleteId={setPendingDeleteId}
      timer={{ tRun, draftId, tCo, tPr, setTRun }}
      simonMode={simonMode}
      todos={todosInPlay(todos)}
      activeTaskKey={activeTaskKey}
      estimatedTodoFor={estimatedTodoFor}
      todoTrackedH={todoTrackedH}
      setTab={setTab}
      setTD={setTD}
      setLogOpen={setLogOpen}
      startTodo={startTodo}
      editTodo={editTodo}
      editEntry={editEntry}
      delEntry={delEntry}
      switchTaskGuarded={switchTaskGuarded}
      greetingMsg={greetingMsg}
      emptyMsg={emptyMsg}
      mode={mode}
      locale={locale}
      lang={lang}
    />
  );

  // â”€â”€â”€ Timer view â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const timerView = (
    <ui.TimerView
      timer={{
        tCo, tPr, tD, tNote, tInv, tSec, tRun, draftId,
        setTCo, setTPr, setTD, setTNote, setTInv, setTRun,
      }}
      todos={{ activeTodoId, setActiveTodoId, accrueTodoHours }}
      companies={{
        list: companies,
        cache: projectCache,
        error: companiesError,
        projectErrors,
        ensure: ensureProjects,
        reload: reloadCompanies,
      }}
      entries={entries}
      saveNewEntry={saveNewEntry}
      stopAndLogCurrent={stopAndLogCurrent}
      cancelTimer={cancelTimer}
      startSideQuest={startSideQuest}
      restoreStashedTimer={restoreStashedTimer}
      resetTimer={resetTimer}
      addFloat={addFloat}
      isInternalCompany={isInternalCompany}
      setTab={setTab}
      timerFormOpen={timerFormOpen}
      setTimerFormOpen={setTimerFormOpen}
      pendingCancelTimer={pendingCancelTimer}
      setPendingCancelTimer={setPendingCancelTimer}
      stashedTimer={stashedTimer}
      todayH={todayH}
      streak={streak}
      done={done}
      goal={GOAL}
      lang={lang}
      timerInsight={timerInsight}
      openAbsence={openAbsence}
    />
  );

  const pickDayForView = (d: Date) => {
    setSelectedDate(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
    setHistoryScale("day");
  };
  const monthView = (
    <ui.MonthView
      goal={GOAL}
      referenceDate={selectedDate}
      onPickDay={pickDayForView}
      onBackfillDay={(d) => {
        const [y, mo, da] = [d.getFullYear(), d.getMonth(), d.getDate()];
        setEditingDate(new Date(y, mo, da));
        setTab("timer");
        setLogOpen(true);
      }}
      firstName={currentUser.username.trim().split(/\s+/)[0]}
      confirm={(opts) => setConfirmation(opts)}
      notify={(msg, col) => addFloat(msg, col)}
      monthClosure={monthClosure}
    />
  );
  const weekView = (
    <ui.WeekView
      goal={GOAL}
      referenceDate={selectedDate}
      onPickDay={pickDayForView}
      onBackfillDay={(d) => {
        const [y, mo, da] = [d.getFullYear(), d.getMonth(), d.getDate()];
        setEditingDate(new Date(y, mo, da));
        setTab("timer");
        setLogOpen(true);
      }}
      firstName={currentUser.username.trim().split(/\s+/)[0]}
      monthClosure={monthClosure}
    />
  );

  const dayView = (
    <ui.DayView
      selectedDate={selectedDate}
      dayEntries={dayEntries}
      dayEntriesLoading={dayEntriesLoading}
      pendingQueue={pendingQueue}
      failedQueue={failedQueue}
      goal={GOAL}
      pendingDeleteId={pendingDeleteId}
      onEditEntry={editEntry}
      onSetPendingDelete={setPendingDeleteId}
      onDeleteEntry={delEntry}
      onLogPastTime={() => {
        const [y, mo, da] = [
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
        ];
        setEditingDate(new Date(y, mo, da));
        setLogOpen(true);
      }}
    />
  );

  const historyView = (
    <ui.HistoryView
      historyScale={historyScale}
      setHistoryScale={setHistoryScale}
      stepHistoryDate={stepHistoryDate}
      historyIsOnCurrent={historyIsOnCurrent}
      jumpHistoryToCurrent={jumpHistoryToCurrent}
      dayView={dayView}
      weekView={weekView}
      monthView={monthView}
      simonMode={simonMode}
      upcomingTodos={todosUpcoming(todos)}
      activeTaskKey={activeTaskKey}
      startTodo={startTodo}
      editTodo={editTodo}
    />
  );

  const todoView = (
    <ui.TodoView
      todos={todos}
      companies={companies}
      getProjects={(cid) => projectCache[cid] || []}
      ensureProjects={async (cid) => {
        await ensureProjects(cid);
      }}
      draft={todoDraft}
      onDraftChange={(patch) => setTodoDraft((d) => ({ ...d, ...patch }))}
      activeTaskKey={activeTaskKey}
      editingId={editingTodoId}
      onAdd={addTodo}
      onUpdate={updateTodo}
      onResetForm={resetTodoForm}
      onEdit={editTodo}
      onToggle={toggleTodo}
      onDelete={deleteTodo}
    />
  );

  const views = {
    today: todayView,
    todo: todoView,
    timer: timerView,
    history: historyView,
    xp: (
      <ui.XpView
        xp={xp}
        xpCoach={xpCoach}
        weekTotal={weekTotal}
        weekH={weekH}
        todayI={todayI}
        unlocked={unlocked}
        mode={mode}
        goal={GOAL}
      />
    ),
  };

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
  const topEstLiveH = topEstTodo ? todoTrackedH(topEstTodo) : 0;

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
  const topBarFg = tRun ? vars.typography.primary : "#fff";
  const topBarMuted = tRun ? vars.typography.tertiary : "rgba(255,255,255,0.8)";

  if (size === "top") {
    return (
      <>
        <div
          key="mode-top"
          className={`mode-root ${themeClass}`}
          onDoubleClick={() => goSize("full")}
          title={t("top.dblClickToOpen")}
          style={{
            height: "100vh",
            width: "100vw",
            background: vars.background.page,
            display: "flex",
            alignItems: "stretch",
            gap: 0,
            padding: 0,
            fontFamily:
              "-apple-system,'Segoe UI Variable','Segoe UI',system-ui,sans-serif",
            borderBottom: `1px solid ${vars.border.soft}`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "0 8px",
              position: "relative",
              overflow: "hidden",
              background: topBarBg,
              transition: "background 200ms ease-out",
            }}
          >
            <div
              className={`top-fill${windowFocused ? "" : " paused"}`}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: `${gpct}%`,
                backgroundImage: done
                  ? `linear-gradient(90deg, color-mix(in srgb, ${vars.typography.green} 7%, transparent) 0%, color-mix(in srgb, ${vars.typography.green} 13%, transparent) 50%, color-mix(in srgb, ${vars.typography.green} 7%, transparent) 100%)`
                  : `linear-gradient(90deg, color-mix(in srgb, ${vars.typography.accent} 4%, transparent) 0%, color-mix(in srgb, ${vars.typography.accent} 11%, transparent) 50%, color-mix(in srgb, ${vars.typography.accent} 4%, transparent) 100%)`,
                pointerEvents: "none",
              }}
            />

            <button
              onClick={() => setTRun((r) => !r)}
              title={tRun ? "Pause" : "Start"}
              className="top-play-btn"
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: tRun ? vars.typography.pink : vars.background.button,
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                zIndex: 1,
                cursor: "pointer",
                padding: 0,
              }}
            >
              {tRun ? (
                <svg width="5" height="6" viewBox="0 0 12 14" fill="none">
                  <rect x="1" y="1" width="3" height="12" rx="1" fill="white" />
                  <rect x="8" y="1" width="3" height="12" rx="1" fill="white" />
                </svg>
              ) : (
                <svg
                  width="5"
                  height="7"
                  viewBox="0 0 13 15"
                  fill="none"
                  style={{ marginLeft: 1 }}
                >
                  <path
                    d="M1.5 1.5L11.5 7.5L1.5 13.5V1.5Z"
                    fill="white"
                    stroke="white"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                zIndex: 1,
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: tRun ? vars.typography.pink : "#fff",
                  boxShadow: tRun
                    ? `0 0 5px ${vars.typography.pink}`
                    : "0 0 4px rgba(255,255,255,0.6)",
                  animation: "pulse 1.2s ease-in-out infinite",
                  flexShrink: 0,
                }}
              />
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 10,
                  fontWeight: 700,
                  color: tRun ? vars.typography.accent : topBarFg,
                  letterSpacing: 0.1,
                  minWidth: 48,
                }}
              >
                {fmtClock(tSec)}
              </div>
              {topEstTodo && (
                <span
                  title={t("todo.loggedOfEstimate", {
                    logged: fmtHours(topEstLiveH),
                    estimate: fmtHours(topEstTodo.estimateH),
                  })}
                  style={{
                    fontFamily: MONO,
                    fontSize: 9,
                    fontWeight: 700,
                    color:
                      topEstLiveH >= topEstTodo.estimateH ? vars.typography.green : topBarMuted,
                    letterSpacing: 0.2,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  / {fmtHours(topEstTodo.estimateH)}
                </span>
              )}
            </div>

            <div
              style={{
                flex: 1,
                minWidth: 0,
                zIndex: 1,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {!tRun ? (
                (() => {
                  const msg =
                    tSec > 0 ? t("status.pausedTask") : t("status.notTracking");
                  const sep = "   â€¢   ";
                  const half = (msg + sep).repeat(30);
                  return (
                    <div className="status-marquee" style={{ zIndex: 1 }}>
                      <div
                        className={`status-marquee-track${windowFocused ? "" : " paused"}`}
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          letterSpacing: 1.4,
                          color: topBarFg,
                          fontFamily: MONO,
                        }}
                      >
                        {half}
                        {half}
                      </div>
                    </div>
                  );
                })()
              ) : (
                <>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      flexShrink: 0,
                      maxWidth: "45%",
                      minWidth: 0,
                    }}
                  >
                    {hasCtx && coObj ? (
                      <>
                        <span
                          style={{
                            fontFamily: SERIF,
                            fontSize: 14,
                            color: vars.typography.primary,
                            letterSpacing: -0.2,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            flexShrink: 0,
                            lineHeight: 1,
                          }}
                        >
                          {coObj.name}
                        </span>
                        {prObj?.name && (
                          <span
                            style={{
                              fontFamily:
                                MONO,
                              fontSize: 8,
                              color: vars.typography.faint,
                              textTransform: "uppercase",
                              letterSpacing: 1.4,
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              minWidth: 0,
                            }}
                          >
                            Â· {prObj.name}
                          </span>
                        )}
                      </>
                    ) : (
                      <span
                        style={{
                          fontFamily: SERIF,
                          fontStyle: "italic",
                          fontSize: 13,
                          color: vars.typography.tertiary,
                        }}
                      >
                        {t("timer.noTaskSelected")}
                      </span>
                    )}
                  </div>

                  {funMessage && (
                    <span
                      key={funMessage}
                      className="fun-msg"
                      style={{
                        fontFamily: SERIF,
                        fontStyle: "italic",
                        fontSize: 13,
                        color: vars.typography.accent,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        flex: 1,
                        minWidth: 0,
                        letterSpacing: -0.1,
                      }}
                    >
                      &ldquo;{funMessage}&rdquo;
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexShrink: 0,
              padding: "0 10px",
              background: vars.background.page,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              {weekH.map((h, i) => {
                const p = Math.min(1, h / GOAL);
                const filled = p > 0;
                const color = p >= 1 ? vars.typography.green : p > 0 ? vars.typography.accent : vars.border.soft;
                return (
                  <span
                    key={i}
                    title={`${DAYS[i]}: ${fmtHours(h)}h`}
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      background: color,
                      opacity: filled ? 0.4 + p * 0.6 : 0.35,
                    }}
                  />
                );
              })}
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "baseline",
                gap: 3,
                position: "relative",
              }}
            >
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 10,
                  fontWeight: 700,
                  color: displaySessionXp > 0 ? vars.typography.accent : vars.typography.faint,
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: 0.2,
                }}
              >
                +{displaySessionXp}
              </span>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 7,
                  color: vars.typography.faint,
                  textTransform: "uppercase",
                  letterSpacing: 1.4,
                  fontWeight: 600,
                }}
              >
                xp
              </span>
              {xpBump && (
                <span
                  key={xpBump.id}
                  className="xp-bump"
                  style={{ color: vars.typography.accent }}
                >
                  +{xpBump.delta}
                </span>
              )}
            </div>

            <prim.ActivityRing
              progress={gpct / 100}
              done={done}
              size={22}
              stroke={1.5}
            >
              <span
                style={{
                  fontSize: 7,
                  fontWeight: 700,
                  fontFamily: MONO,
                  color: done ? vars.typography.green : vars.typography.primary,
                  letterSpacing: -0.2,
                  lineHeight: 1,
                  fontVariantNumeric: "tabular-nums",
                }}
                title={`${fmtHours(todayH)} / ${GOAL}h`}
              >
                {fmtHours(todayH)}
              </span>
            </prim.ActivityRing>

            <div
              className={justBumpedStreak ? "streak-pop" : undefined}
              style={{
                display: "inline-flex",
                alignItems: "baseline",
                gap: 3,
                color: vars.typography.pink,
              }}
            >
              <FlameIcon size={10} />
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 10,
                  fontWeight: 700,
                  color: vars.typography.pink,
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: 0.2,
                }}
              >
                {streak}
              </span>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 7,
                  color: vars.typography.faint,
                  textTransform: "uppercase",
                  letterSpacing: 1.4,
                  fontWeight: 600,
                }}
              >
                {t("today.stat.streak")}
              </span>
            </div>

            <button
              onClick={() => setMode(mode === "light" ? "dark" : "light")}
              title={mode === "light" ? "Switch to dark" : "Switch to light"}
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "transparent",
                border: `1px solid ${vars.border.soft}`,
                color: vars.typography.secondary,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
                transition: "all .15s ease",
              }}
            >
              {mode === "light" ? <SunIcon size={11} /> : <MoonIcon size={11} />}
            </button>

            <button
              onClick={() => goSize("full")}
              title={lang === "sv" ? "Ã–ppna sidomenyn" : "Open sidebar"}
              style={{
                height: 22,
                padding: "0 12px",
                borderRadius: 999,
                background: vars.typography.accent,
                border: "none",
                color: "#fff",
                fontFamily: MONO,
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: 1.4,
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "all .15s ease",
              }}
            >
              {lang === "sv" ? "Ã–ppna" : "Open"}
            </button>
          </div>
        </div>
        {modeOverlay}
      </>
    );
  }

  return (
    <>
      <div
        key="mode-full"
        className={`mode-root ${themeClass} ${mode === "dark" ? "app-dark-glow" : ""}`}
        style={{
          height: "100vh",
          background: mode === "dark" ? undefined : vars.background.page,
          fontFamily:
            "-apple-system,'Segoe UI Variable','Segoe UI',system-ui,sans-serif",
          color: vars.typography.primary,
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <ui.SimonCorner active={simonMode} onTap={tapSimonCorner} />
        {hdr}
        <ui.OfflineBanner
          online={online}
          pendingCount={pendingQueue.length}
          syncing={syncing}
          mode={mode}
        />
        <ui.FailedQueueBanner count={failedQueue.length} onRetry={retryFailed} />
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
          {absenceOpen ? (
            <ui.AbsenceForm
              company={fravaroCompany}
              projects={
                fravaroCompany ? projectCache[fravaroCompany.id] || [] : []
              }
              minFromISO={absenceMinFromISO}
              todayISO={absenceTodayISO}
              saving={absenceSaving}
              onSubmit={reportAbsence}
              onClose={() => setAbsenceOpen(false)}
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
            views[tab]
          )}
        </div>
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

        {confirmation && (
          <>
            <div
              onClick={() => setConfirmation(null)}
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.35)",
                zIndex: 200,
              }}
            />
            <div
              ref={confirmationRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="confirmation-title"
              tabIndex={-1}
              style={{
                position: "absolute",
                bottom: 12,
                left: 12,
                right: 12,
                background: vars.background.surface,
                border: `1.5px solid ${vars.typography.accent}`,
                borderRadius: 14,
                padding: "14px 16px",
                zIndex: 201,
                boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
              }}
            >
              <div
                id="confirmation-title"
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: vars.typography.primary,
                  marginBottom: 6,
                }}
              >
                {confirmation.title}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: vars.typography.tertiary,
                  marginBottom: 12,
                  lineHeight: 1.4,
                }}
              >
                {confirmation.body}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setConfirmation(null)}
                  style={{
                    flex: 1,
                    padding: "9px 0",
                    background: vars.background.raised,
                    border: `1px solid ${vars.border.soft}`,
                    borderRadius: 9,
                    color: vars.typography.secondary,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {t("entry.cancel")}
                </button>
                <button
                  onClick={async () => {
                    const fn = confirmation.onConfirm;
                    setConfirmation(null);
                    await fn();
                  }}
                  style={{
                    flex: 1,
                    padding: "9px 0",
                    background: vars.background.button,
                    border: "none",
                    borderRadius: 9,
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {confirmation.confirmLabel}
                </button>
              </div>
            </div>
          </>
        )}

        <ui.FloatStack floats={floats} />

        <ui.SaveToast toast={saveToast} mode={mode} />
        <ui.ConfettiBurst show={justHitGoal} />

        <ui.GoalCelebrationToast celebration={goalCelebration} liftedForAch={!!ach} />
        <ui.AchievementToast ach={ach} lang={lang} />
      </div>
      {modeOverlay}
    </>
  );
}
