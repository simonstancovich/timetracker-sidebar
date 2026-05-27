import { vars, chart } from "./theme";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import * as ui from "./components";
import { FlameIcon } from "./icons/FlameIcon";
import {
  Company,
  Project,
  TimeEntry,
  buildSavePayload,
  deleteTimeEntry,
  loadCompanies,
  loadProjects,
  loadTimeEntries,
  loadUsers,
  saveTimeEntry,
} from "./api";
import { classifyApiError, apiErrorKey } from "./lib/apiError";
import {
  PENDING_STORE_KEY,
  FAILED_STORE_KEY,
  LIVE_SESSION_ID,
  entrySignature,
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
  EMPTY_ACH_STATS,
  isoWeekKey,
  type Ach,
  type AchCtx,
  type AchStats,
} from "./lib/achievements";
import { pickRandomMessage } from "./lib/funMessages";
import { pickTip } from "./lib/productivityTips";
import { pickGreeting } from "./lib/greetingMessages";
import { getTimerInsight } from "./lib/timerInsights";
import { getTimerVibe } from "./lib/timerVibe";
import {
  emptyTodayMessage,
  goalDoneCheer,
  goalDoneSub,
  saveCheer,
  xpCoachNote,
} from "./lib/personality";
import { getHolidays, isWorkingDay } from "./lib/swedishHolidays";
import {
  Lang,
  useTranslation,
  setLang as setI18nLang,
  achName,
  achDescription,
} from "./lib/i18n";
import { useModal } from "./lib/useModal";
import { useLogForm } from "./lib/useLogForm";
import { buildIntroSteps } from "./lib/introSteps";
import * as prim from "./primitives";

import { SunIcon } from "./icons/SunIcon";
import { MoonIcon } from "./icons/MoonIcon";
import { PauseIcon } from "./icons/PauseIcon";
import { StopIcon } from "./icons/StopIcon";
import { XIcon } from "./icons/XIcon";
import { PlusIcon } from "./icons/PlusIcon";

import { MONO, SERIF } from "./lib/fonts";

import { workingDaysInRange } from "./lib/absence";

import {
  createTodo,
  normalizeTodo,
  taskKey,
  todosInPlay,
  todosUpcoming,
  TODOS_STORE_KEY,
  type Todo,
  type TodoDraft,
  type TodoFormState,
} from "./lib/todos";
import { useMonthClosure } from "./lib/useMonthClosure";
import { useConnection } from "./lib/useConnection";
import {
  lightTheme,
  darkTheme,
} from "./theme";

const DAYS = ["Mo", "Tu", "We", "Th", "Fr"];
const GOAL = 8;

export default function App() {
  const { t } = useTranslation();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [mode, setMode] = useState<"light" | "dark">("light");
  const [lang, setLang] = useState<Lang>("en");
  const [pinned, setPinned] = useState(false);
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
  const [size, setWindowSize] = useState<"full" | "top">("full");

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

  const [sessionXp, setSessionXp] = useState(0);
  const lastXp = useRef<number | null>(null);
  const sessionSettledAt = useRef(Date.now() + 2500);
  const [funMessage, setFunMessage] = useState<string | null>(null);
  const [xpBump, setXpBump] = useState<{ id: number; delta: number } | null>(
    null,
  );
  const xpBumpId = useRef(0);
  const [showIntro, setShowIntro] = useState(false);
  const [introChecked, setIntroChecked] = useState(false);
  const [introStep, setIntroStep] = useState(0);
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

  const [currentUser, setCurrentUser] = useState<{
    _user_id: string;
    username: string;
  } | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companiesError, setCompaniesError] = useState(false);
  const [projectErrors, setProjectErrors] = useState<Record<string, boolean>>(
    {},
  );
  const [projectCache, setProjectCache] = useState<Record<string, Project[]>>(
    {},
  );
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(true);
  const [weekH, setWeekH] = useState<number[]>([0, 0, 0, 0, 0]);

  const [xp, setXp] = useState(0);

  useEffect(() => {
    if (Date.now() < sessionSettledAt.current) {
      lastXp.current = xp;
      return;
    }
    if (lastXp.current !== null && xp > lastXp.current) {
      setSessionXp((s) => s + (xp - lastXp.current!));
    }
    lastXp.current = xp;
  }, [xp]);

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
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);
  const [floats, setFloats] = useState<
    { id: number; txt: string; col: string }[]
  >([]);
  const [ach, setAch] = useState<Ach | null>(null);
  const [pendingAchs, setPendingAchs] = useState<Ach[]>([]);
  const [achStats, setAchStats] = useState<AchStats>(EMPTY_ACH_STATS);
  const [achStatsLoaded, setAchStatsLoaded] = useState(false);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todosLoaded, setTodosLoaded] = useState(false);
  const [activeTodoId, setActiveTodoId] = useState<string | null>(null);
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  // Hours already on the entry when the active to-do session began, so we only
  // credit the new delta back to the to-do (continuing an entry resumes its time).
  const activeTodoBaseHoursRef = useRef(0);
  // To-do draft form, lifted here so it survives collapsing to top-bar mode.
  const [todoDraft, setTodoDraft] = useState<TodoFormState>({
    text: "",
    estimate: "",
    planned: "",
    deadline: "",
    co: "",
    pr: "",
  });
  const [lastCelebratedDate, setLastCelebratedDate] = useState<string>("");
  const [goalCelebration, setGoalCelebration] = useState<{
    title: string;
    sub: string;
  } | null>(null);
  const [justHitGoal, setJustHitGoal] = useState(false);
  const [justBumpedStreak, setJustBumpedStreak] = useState(false);
  const prevStreakRef = useRef<number>(0);
  const [windowFocused, setWindowFocused] = useState(
    typeof document === "undefined" ? true : !document.hidden,
  );
  const { online, setOnline } = useConnection();
  // Simon mode — hidden dev gate. Triple-click the secret corner to toggle.
  // Reveals features we keep deactivated for tester/demo builds. Persisted.
  const [simonMode, setSimonMode] = useState(false);
  const simonClicksRef = useRef(0);
  const simonResetRef = useRef<number | null>(null);
  // Offline save queue — entries that couldn't reach the API yet.
  const [pendingQueue, setPendingQueue] = useState<PendingEntry[]>([]);
  const [pendingLoaded, setPendingLoaded] = useState(false);
  const [failedQueue, setFailedQueue] = useState<PendingEntry[]>([]);
  const [failedLoaded, setFailedLoaded] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const pendingQueueRef = useRef<PendingEntry[]>([]);
  const flushingRef = useRef(false);
  const [absenceOpen, setAbsenceOpen] = useState(false);
  const [absenceSaving, setAbsenceSaving] = useState(false);
  const [saveToast, setSaveToast] = useState<{
    cheer: string;
    hours: string;
    xp: number;
  } | null>(null);
  const fid = useRef(0);

  // Timer state
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
  const [timerLoaded, setTimerLoaded] = useState(false);
  const [timerFormOpen, setTimerFormOpen] = useState(true);
  const tick = useRef<number | null>(null);

  const prevDisplayXp = useRef(0);
  useEffect(() => {
    const current = sessionXp + (tRun ? Math.floor(tSec / 60) : 0);
    if (current > prevDisplayXp.current) {
      const delta = current - prevDisplayXp.current;
      const id = ++xpBumpId.current;
      setXpBump({ id, delta });
      const t = window.setTimeout(() => {
        setXpBump((cur) => (cur && cur.id === id ? null : cur));
      }, 1500);
      prevDisplayXp.current = current;
      return () => clearTimeout(t);
    }
    prevDisplayXp.current = current;
  }, [sessionXp, tRun, tSec]);

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
  const [draftId, setDraftId] = useState<string | null>(null);
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
    setTRun(false);
    setTSec(0);
    setTCo("");
    setTPr("");
    setTD("");
    setTNote("");
    setTInv(true);
    setDraftId(null);
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
    // Fresh blank timer, running immediately — details filled later.
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
    setTRun(false); // restored paused — user taps resume
  };

  const [pendingCancelTimer, setPendingCancelTimer] = useState(false);
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
      // errors — the local state is already cleared, so the user's intent
      // has been honored even if the round-trip fails.
      try {
        await deleteTimeEntry(id);
      } catch {
        /* ignore */
      }
    }
  };


  // Credit a logged session back to the to-do that started it (if any). Uses the
  // same billed (rounded-up-to-15-min) hours the entry is saved with, so the
  // to-do's logged total stays in sync with its entries. Only the delta since the
  // session began counts, so continuing an entry isn't double-counted.
  const accrueTodoHours = (todoId: string | null, totalHours: number) => {
    if (!todoId) return;
    const billed = roundUpToQuarter(totalHours);
    const delta = +(billed - activeTodoBaseHoursRef.current).toFixed(2);
    if (delta <= 0) return;
    setTodos((ts) =>
      ts.map((td) =>
        td.id === todoId
          ? { ...td, loggedH: +(td.loggedH + delta).toFixed(2) }
          : td,
      ),
    );
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
      // Timer is actively running → confirm before saving & switching.
      setConfirmation({
        title: t("timer.confirmSwitchTitle"),
        body: t("timer.confirmSwitchBody"),
        confirmLabel: t("timer.confirmSwitchOk"),
        onConfirm: saveCurrentAndSwitch,
      });
    } else if (canSaveCurrent) {
      // Paused with unsaved progress → save silently, then switch.
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

  // ─── Auth gating ───────────────────────────────────────────────────────
  useEffect(() => {
    window.electronAPI.checkAuth().then(setAuthed);
    const unsubs = [
      window.electronAPI.onAuthSuccess(() => setAuthed(true)),
      window.electronAPI.onSignedOut(() => setAuthed(false)),
      window.electronAPI.onSessionLost(() => setAuthed(false)),
      window.electronAPI.onForcedSize((s) => setWindowSize(s)),
    ];
    return () => unsubs.forEach((off) => typeof off === "function" && off());
  }, []);

  // Hydrate device-scoped prefs (mode, lang) before auth completes so the
  // LoginScreen and cold-start spinner already reflect the user's choices.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [m, l, p] = await Promise.all([
        window.electronAPI.storeGet("mode"),
        window.electronAPI.storeGet("lang"),
        window.electronAPI.storeGet("pinned"),
      ]);
      if (cancelled) return;
      if (m === "dark" || m === "light") setMode(m);
      if (l === "en" || l === "sv") setLang(l);
      if (typeof p === "boolean") setPinned(p);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Reset user-scoped state on sign-out so the next user doesn't inherit it.
  useEffect(() => {
    if (authed) return;
    setXp(0);
    setUnlocked([]);
    setStreak(0);
    setAchStats(EMPTY_ACH_STATS);
    setAchStatsLoaded(false);
    setPendingAchs([]);
    setAch(null);
    setEntries([]);
    setEntriesLoading(true);
    setWeekH([0, 0, 0, 0, 0]);
    setTRun(false);
    setTSec(0);
    setTCo("");
    setTPr("");
    setTD("");
    setTNote("");
    setTInv(true);
    setPendingCancelTimer(false);
    resetLogForm();
    setFHInput("1:00");
    setDraftId(null);
    setSessionXp(0);
    setCurrentUser(null);
    setTimerLoaded(false);
    setLogFormLoaded(false);
  }, [authed, resetLogForm, setFHInput]);

  // ─── Persisted: mode, xp, unlocked, streak, timer ──────────────────────
  useEffect(() => {
    if (!authed) return;
    (async () => {
      const [m, x, u, s, last, t, l] = await Promise.all([
        window.electronAPI.storeGet("mode"),
        window.electronAPI.storeGet("xp"),
        window.electronAPI.storeGet("unlocked"),
        window.electronAPI.storeGet("streak"),
        window.electronAPI.storeGet("lastLoggedDate"),
        window.electronAPI.storeGet("timer"),
        window.electronAPI.storeGet("lang"),
      ]);
      if (m === "dark" || m === "light") setMode(m);
      if (l === "en" || l === "sv") setLang(l);
      setXp(typeof x === "number" ? x : 0);
      setUnlocked(Array.isArray(u) ? u : []);
      const savedCelebrated = await window.electronAPI.storeGet(
        "lastCelebratedDate",
      );
      if (typeof savedCelebrated === "string")
        setLastCelebratedDate(savedCelebrated);
      const savedStats = await window.electronAPI.storeGet("achStats");
      setAchStats(
        savedStats && typeof savedStats === "object"
          ? { ...EMPTY_ACH_STATS, ...savedStats }
          : EMPTY_ACH_STATS,
      );
      setAchStatsLoaded(true);

      // Streak valid if we've logged today or on the most recent
      // previous working day (skipping weekends + Swedish holidays).
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

      // restore running timer
      if (t && typeof t === "object") {
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
        if (t.tCo) {
          loadProjects(t.tCo)
            .then((list) => setProjectCache((c) => ({ ...c, [t.tCo]: list })))
            .catch(() => {});
        }
      }
      setTimerLoaded(true);
    })();
  }, [authed]);

  useEffect(() => {
    window.electronAPI.storeSet("mode", mode);
  }, [mode]);
  useEffect(() => {
    window.electronAPI.storeSet("lang", lang);
    setI18nLang(lang);
  }, [lang]);

  useEffect(() => {
    const r = document.documentElement.style;
    r.setProperty("--rec-color", vars.typography.pink);
    r.setProperty("--scrollbar-thumb", vars.border.soft);
    r.setProperty("--select-bg", vars.background.page);
    r.setProperty("--select-fg", vars.typography.primary);
  }, []);
  useEffect(() => {
    if (!authed || introChecked) return;
    window.electronAPI.storeGet("intro_seen").then((seen) => {
      if (!seen) {
        setShowIntro(true);
        setIntroStep(0);
        if (sizeRef.current !== "full") goSizeRef.current("full");
      }
      setIntroChecked(true);
    });
  }, [authed, introChecked]);

  const dismissIntro = () => {
    setShowIntro(false);
    setIntroStep(0);
    window.electronAPI.storeSet("intro_seen", true);
    window.electronAPI.setBlurCollapseDisabled(false);
  };

  const introSteps = useMemo(() => buildIntroSteps(lang), [lang]);
  const advanceIntro = () => {
    setIntroStep((s) => {
      const next = s + 1;
      if (next >= introSteps.length) {
        dismissIntro();
        return 0;
      }
      return next;
    });
  };

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
    if (projectCache[devcoreId]) return;
    loadProjects(devcoreId)
      .then((list) => setProjectCache((pc) => ({ ...pc, [devcoreId]: list })))
      .catch(() => {});
  }, [showIntro, devcoreId, projectCache]);

  const introIndex = useMemo(() => {
    const m: Record<string, number> = {};
    introSteps.forEach((s, i) => {
      m[s.key] = i;
    });
    return m;
  }, [introSteps]);

  useEffect(() => {
    if (!showIntro) return;
    // Any client / project works — not restricted to DevCore / Utbildning —
    // so the tour continues for tenants without those exact names.
    const at = (key: string) => introStep === introIndex[key];
    if (at("openTimer") && tab === "timer") setIntroStep(introIndex.startClock);
    if (at("startClock") && tRun) setIntroStep(introIndex.pickClient);
    if (at("pickClient") && tCo) setIntroStep(introIndex.pickProject);
    if (at("pickProject") && tPr) setIntroStep(introIndex.describe);
    if (at("revealRunning") && !timerFormOpen) setIntroStep(introIndex.liveActions);
    if (at("openToday") && tab === "today") setIntroStep(introIndex.todayStats);
    if (at("openHistory") && tab === "history") setIntroStep(introIndex.historyScale);
    if (at("openXp") && tab === "xp") setIntroStep(introIndex.xpLevel);
  }, [showIntro, introStep, introIndex, tab, tCo, tPr, tRun, timerFormOpen]);

  const introCanAdvance =
    introStep === introIndex.describe ? tD.trim().length > 0 : true;

  useEffect(() => {
    window.electronAPI.setBlurCollapseDisabled(showIntro || !authed || pinned);
  }, [showIntro, authed, pinned]);

  useEffect(() => {
    window.electronAPI.storeSet("pinned", pinned);
  }, [pinned]);

  useEffect(() => {
    if (authed === false && size !== "full") {
      setWindowSize("full");
      window.electronAPI.setSize("full");
    }
  }, [authed, size]);

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
  // becomes truthy; cleanup runs when `ach` flips back to null (via this
  // timeout) or when a new toast replaces it.
  useEffect(() => {
    if (!ach) return;
    const id = window.setTimeout(() => setAch(null), 3200);
    return () => clearTimeout(id);
  }, [ach]);

  // Persist timer on control/field changes (NOT on tSec tick — startedAt covers elapsed).
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
  }, [authed, timerLoaded, tCo, tPr, tD, tNote, tInv, tRun, draftId]);

  // Persist Log form fields too so manual-log inputs survive app restarts.
  useEffect(() => {
    if (!authed) return;
    (async () => {
      const f = await window.electronAPI.storeGet("logForm");
      if (f && typeof f === "object") {
        hydrateLogForm(f);
        if (f.fCo)
          loadProjects(f.fCo)
            .then((list) => setProjectCache((c) => ({ ...c, [f.fCo]: list })))
            .catch(() => {});
      }
      setLogFormLoaded(true);
    })();
  }, [authed, hydrateLogForm]);

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

  // ─── Load companies once authed ────────────────────────────────────────
  const loadCompaniesNow = useCallback(() => {
    setCompaniesError(false);
    loadCompanies()
      .then((list) => {
        setCompanies(list);
        setOnline(true);
      })
      .catch((err) => {
        setCompaniesError(true);
        const k = classifyApiError(err);
        if (k === "offline" || k === "timeout") setOnline(false);
      });
  }, [setOnline]);
  useEffect(() => {
    if (!authed) return;
    loadCompaniesNow();
  }, [authed, loadCompaniesNow]);

  // ─── Resolve current user (prefer cache; else infer from entries + user.load) ─
  useEffect(() => {
    if (!authed) return;
    (async () => {
      const cached = await window.electronAPI.storeGet("currentUser");
      if (cached && cached._user_id && cached.username) {
        setCurrentUser(cached);
        return;
      }
      // Need a recent entry to discover _user_id (entries are scoped to me).
      try {
        const today = await loadTimeEntries(new Date());
        let uid = today[0]?._user_id;
        if (!uid) {
          // try last 14 days until we find one
          for (let i = 1; i <= 14 && !uid; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const rows = await loadTimeEntries(d);
            uid = rows[0]?._user_id;
          }
        }
        // We can't run the app without knowing who the user is. If anything
        // along the resolution path fails, sign out and let them re-auth
        // rather than guessing or showing data under a wrong identity.
        if (!uid) {
          window.electronAPI.signOut();
          return;
        }
        const users = await loadUsers();
        const me = users.find((u) => u.id === uid);
        if (!me) {
          window.electronAPI.signOut();
          return;
        }
        const resolved = { _user_id: me.id, username: me.name || me.username };
        setCurrentUser(resolved);
        await window.electronAPI.storeSet("currentUser", resolved);
      } catch {
        window.electronAPI.signOut();
      }
    })();
  }, [authed]);

  // ─── Load entries for today ────────────────────────────────────────────
  // Today view is always today; History view loads its own entries per week/month.
  // `nowTick` re-runs this at local-midnight so the day rolls over cleanly.
  useEffect(() => {
    if (!authed) return;
    let cancelled = false;
    setEntriesLoading(true);
    loadTimeEntries(new Date())
      .then((list) => {
        if (!cancelled) {
          setEntries(list);
          setEntriesLoading(false);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setEntriesLoading(false);
        if (err.message === "NOT_AUTHENTICATED") setAuthed(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authed, nowTick]);

  useEffect(() => {
    if (!authed) return;
    monthClosure.ensure(selectedDate.getFullYear(), selectedDate.getMonth());
  }, [authed, selectedDate, monthClosure]);

  // ─── Load entries for History → Daily drill-down ──────────────────────
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

  // ─── Load week hours (Mon–Fri containing selectedDate) ─────────────────
  useEffect(() => {
    if (!authed) return;
    // Always show the current week — independent of selectedDate
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
  }, [authed, entries]);

  // ─── Timer tick ────────────────────────────────────────────────────────
  useEffect(() => {
    if (tRun)
      tick.current = window.setInterval(() => setTSec((s) => s + 1), 1000);
    else if (tick.current) {
      clearInterval(tick.current);
      tick.current = null;
    }
    return () => {
      if (tick.current) clearInterval(tick.current);
    };
  }, [tRun]);

  // ─── Auto-save draft every 5 min while running ─────────────────────────
  // Only depend on tRun — we read the latest fields through a ref so typing
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

  // ─── Derived ───────────────────────────────────────────────────────────
  // Cheap; recompute each render so it's always the real current weekday.
  const todayI = (() => {
    const now = new Date();
    const mon = mondayOf(now);
    return Math.max(0, Math.min(4, Math.floor((+now - +mon) / 86400000)));
  })();
  // Single source of truth for what shows today: server rows plus any locally
  // queued (pending) or quarantined (failed) entries for today, deduped by id.
  // Survives restarts — queued entries are reloaded from the store.
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

  // Committed total (saved + queued) — drives goal/celebration, never the
  // unsaved running timer.
  const todayH = useMemo(
    () => liveTodayEntries.reduce((s, e) => s + parseFloat(e.hour || "0"), 0),
    [liveTodayEntries],
  );

  // Volatile timer values for the ambient insight — read via ref so the message
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
  // folded in live — overriding the continued entry's hour, or added as a
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

  // Save flash — auto-dismiss after 2.1s.
  useEffect(() => {
    if (!saveToast) return;
    const t = window.setTimeout(() => setSaveToast(null), 2100);
    return () => clearTimeout(t);
  }, [saveToast]);

  // Window focus tracking — pauses decorative animations (marquee, shimmer)
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
  // Intentionally no toast — background failures shouldn't alarm the user.
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

  useEffect(() => {
    window.electronAPI.storeGet(PENDING_STORE_KEY).then((v) => {
      if (Array.isArray(v)) setPendingQueue(v as PendingEntry[]);
      setPendingLoaded(true);
    });
  }, []);

  useEffect(() => {
    pendingQueueRef.current = pendingQueue;
    if (pendingLoaded) window.electronAPI.storeSet(PENDING_STORE_KEY, pendingQueue);
  }, [pendingQueue, pendingLoaded]);

  useEffect(() => {
    window.electronAPI.storeGet(FAILED_STORE_KEY).then((v) => {
      if (Array.isArray(v)) setFailedQueue(v as PendingEntry[]);
      setFailedLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (failedLoaded) window.electronAPI.storeSet(FAILED_STORE_KEY, failedQueue);
  }, [failedQueue, failedLoaded]);

  // The To-do feature lives behind Simon mode; bounce off the tab when it's off.
  useEffect(() => {
    if (!simonMode && tab === "todo") setTab("today");
  }, [simonMode, tab]);

  // Streak increment — pop animation when streak goes up after first hydration.
  useEffect(() => {
    const prev = prevStreakRef.current;
    prevStreakRef.current = streak;
    if (streak > prev && prev > 0) {
      setJustBumpedStreak(true);
      const t = window.setTimeout(() => setJustBumpedStreak(false), 1200);
      return () => clearTimeout(t);
    }
  }, [streak]);

  // 8h goal celebration — fires once per calendar day on first crossing.
  useEffect(() => {
    if (!authed || !done) return;
    const today = formatLocalDate(new Date());
    if (lastCelebratedDate === today) return;
    setGoalCelebration({ title: goalDoneCheer(lang), sub: goalDoneSub(lang) });
    setJustHitGoal(true);
    setLastCelebratedDate(today);
    window.electronAPI.storeSet("lastCelebratedDate", today);
  }, [done, authed, lastCelebratedDate, lang]);

  // Auto-dismiss bloom + celebration toast in separate effects keyed on the
  // flags, so the trigger above re-running (it sets lastCelebratedDate, a dep)
  // can't cancel these timers mid-flight and strand them on forever.
  useEffect(() => {
    if (!justHitGoal) return;
    const id = window.setTimeout(() => setJustHitGoal(false), 1700);
    return () => clearTimeout(id);
  }, [justHitGoal]);

  useEffect(() => {
    if (!goalCelebration) return;
    const id = window.setTimeout(() => setGoalCelebration(null), 4200);
    return () => clearTimeout(id);
  }, [goalCelebration]);

  // Lazy load projects for a company
  const ensureProjects = async (cid: string) => {
    if (projectCache[cid]) return projectCache[cid];
    try {
      const list = await loadProjects(cid);
      setProjectCache((c) => ({ ...c, [cid]: list }));
      setProjectErrors((e) => (e[cid] ? { ...e, [cid]: false } : e));
      return list;
    } catch (err) {
      setProjectErrors((e) => ({ ...e, [cid]: true }));
      const k = classifyApiError(err);
      if (k === "offline" || k === "timeout") setOnline(false);
      return [];
    }
  };

  // ─── To-do list (local, electron-store) ────────────────────────────────
  useEffect(() => {
    if (!authed) return;
    let cancelled = false;
    window.electronAPI.storeGet(TODOS_STORE_KEY).then((saved) => {
      if (cancelled) return;
      if (Array.isArray(saved))
        setTodos((saved as Todo[]).map(normalizeTodo));
      setTodosLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [authed]);

  useEffect(() => {
    if (todosLoaded) window.electronAPI.storeSet(TODOS_STORE_KEY, todos);
  }, [todos, todosLoaded]);

  const resetTodoForm = () => {
    setEditingTodoId(null);
    setTodoDraft({
      text: "",
      estimate: "",
      planned: "",
      deadline: "",
      co: "",
      pr: "",
    });
  };
  const addTodo = (draft: TodoDraft) =>
    setTodos((ts) => [createTodo(draft), ...ts]);
  const updateTodo = (id: string, draft: TodoDraft) =>
    setTodos((ts) =>
      ts.map((td) =>
        td.id === id
          ? {
              ...td,
              text: draft.text,
              estimateH: draft.estimateH,
              plannedDate: draft.plannedDate,
              deadline: draft.deadline,
              companyId: draft.companyId,
              companyName: draft.companyName,
              projectId: draft.projectId,
              projectName: draft.projectName,
            }
          : td,
      ),
    );
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
  const toggleTodo = (id: string) =>
    setTodos((ts) =>
      ts.map((td) => (td.id === id ? { ...td, done: !td.done } : td)),
    );
  const deleteTodo = (id: string) =>
    setTodos((ts) => ts.filter((td) => td.id !== id));

  // The estimated to-do (if any) a tracked task belongs to, so logged entries
  // and the running timer can show progress against its estimate.
  const estimatedTodoFor = (cid: string, prid: string, desc: string) =>
    todos.find(
      (td) =>
        td.estimateH > 0 &&
        td.companyId === cid &&
        td.projectId === prid &&
        td.text === desc,
    );

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
  // "Running" state by matching their own task — independent of activeTodoId.
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
      // Already the running entry — just surface the tracker, don't restart.
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

  const addFloat = useCallback((txt: string, col: string) => {
    const id = ++fid.current;
    setFloats((f) => {
      // Dedupe an identical message that's already showing; cap at 3 at once.
      if (f.some((x) => x.txt === txt)) return f;
      return [...f, { id, txt, col }].slice(-3);
    });
    setTimeout(() => setFloats((f) => f.filter((x) => x.id !== id)), 1500);
  }, []);

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
  // callers can wrap the message (e.g. "Couldn't save — …"). `wrapKey` lets a
  // caller prefix the human message with a contextual form key.
  const handleApiError = (err: unknown, wrapKey?: string): string => {
    const kind = classifyApiError(err);
    if (kind === "auth") {
      setAuthed(false);
      return kind;
    }
    if (kind === "offline" || kind === "timeout") setOnline(false);
    const human = t(apiErrorKey(kind));
    addFloat(wrapKey ? t(wrapKey, { err: human }) : human, "#ef4444");
    return kind;
  };

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
            setAuthed(false);
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
        setOnline(true);
        sigs.add(sig);
        drop(item.localId);
        touched = true;
      } catch (err) {
        const kind = classifyApiError(err);
        if (kind === "auth") {
          setAuthed(false);
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
  }, [setOnline]);

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
        setAuthed(false);
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
    // Only bump weekH for today's entries (weekH is current week Mon–Fri)
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

    // Skip achievement evaluation on edits — only fresh entries advance stats.
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
    // Queued / quarantined rows only live locally — drop from the queues.
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

  // Move quarantined entries back into the sync queue to try again.
  const retryFailed = () => {
    if (failedQueue.length === 0) return;
    const items = failedQueue.map(({ error: _e, ...rest }) => rest);
    setFailedQueue([]);
    setPendingQueue((q) => [...q, ...items]);
  };

  // The "Frånvaro" client (absence) — a normal client in the list.
  const fravaroCompany = useMemo(
    () => companies.find((c) => /fr[åa]nvaro/i.test(c.name)) || null,
    [companies],
  );

  // DevCore is internal work — its entries are always non-billable.
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

  // Bulk-log 8h absence for each working day in the range, under the Frånvaro
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
          setAuthed(false);
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

  // Vanilla-extract theme class — applied to every top-level return so CSS
  // custom properties resolve correctly in both early-return branches and the
  // main app render.
  const themeClass = mode === "dark" ? darkTheme : lightTheme;

  const spinner = (
    <prim.Spinner layout="fill" label={t("form.loadingProjects")} className={themeClass} />
  );
  if (authed === null) return spinner;
  if (!authed)
    return (
      <div
        className={themeClass}
        style={{ height: "100vh", background: vars.background.page, color: vars.typography.primary }}
      >
        <ui.LoginScreen
          onAuthed={() => setAuthed(true)}
          onOpenBrowser={() => window.electronAPI.openAuth()}
        />
      </div>
    );
  if (!currentUser) return spinner;

  // ─── Shared UI helpers ────────────────────────────────────────────────
  const locale = lang === "sv" ? "sv-SE" : "en-GB";
  // Live clock: weekday · day · month · hh:mm. Re-renders once per minute via
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

  // ─── Header ────────────────────────────────────────────────────────────
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

  // ─── Today view ────────────────────────────────────────────────────────
  const todayView = (() => {
    const firstName = currentUser.username.trim().split(/\s+/)[0];
    const hr = new Date().getHours();
    const greeting =
      hr >= 5 && hr < 12
        ? t("greet.morning")
        : hr >= 12 && hr < 17
          ? t("greet.afternoon")
          : hr >= 17 && hr < 22
            ? t("greet.evening")
            : t("greet.latenight");
    const todayDate = new Date();
    // ISO week + 1-indexed weekday for the page eyebrow hint.
    const eyebrowDate = new Date(
      Date.UTC(
        todayDate.getFullYear(),
        todayDate.getMonth(),
        todayDate.getDate(),
      ),
    );
    const dayNum = eyebrowDate.getUTCDay() || 7;
    eyebrowDate.setUTCDate(eyebrowDate.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(eyebrowDate.getUTCFullYear(), 0, 1));
    const isoWeek = Math.ceil(
      ((eyebrowDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
    );

    // Today XP + billable % for the chip row.
    const todayBillableH = liveTodayEntries.reduce(
      (s, e) => s + (e.invoice === "1" ? parseFloat(e.hour) : 0),
      0,
    );
    const todayBillablePct =
      todayH > 0 ? Math.round((todayBillableH / todayH) * 100) : 0;
    const todayXp = liveTodayEntries.reduce(
      (s, e) => s + Math.round(10 + parseFloat(e.hour) * 8),
      0,
    );

    return (
      <div style={{ paddingBottom: 24 }}>
        {firstName && (
          <div style={{ padding: "16px 14px 4px" }}>
            <div
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontSize: 22,
                color: vars.typography.primary,
                letterSpacing: -0.3,
                lineHeight: 1.15,
              }}
            >
              {greeting}, {firstName}.
            </div>
            {greetingMsg && (
              <div
                style={{
                  fontFamily: SERIF,
                  fontStyle: "italic",
                  fontSize: 14,
                  color: vars.typography.accent,
                  marginTop: 6,
                  lineHeight: 1.4,
                  letterSpacing: -0.1,
                }}
              >
                {greetingMsg}
              </div>
            )}
          </div>
        )}
        <prim.PageEyebrow
          title={t("page.today")}
          hint={t("today.eyebrowHint", { week: isoWeek, day: dayNum })}
        />
        <div
          style={{
            padding: "12px 14px 0",
            display: "flex",
            flexDirection: "column",
            gap: 11,
          }}
        >
          <div
            data-tour="today-stats"
            style={{
              textAlign: "center",
              padding: "20px 0 22px",
            }}
          >
            <div
              className={justHitGoal ? "goal-bloom" : undefined}
              style={{
                fontFamily: SERIF,
                fontSize: 90,
                fontWeight: 400,
                color: liveDone ? vars.typography.green : vars.typography.primary,
                letterSpacing: -3,
                lineHeight: 0.9,
                display: "inline-block",
                textDecoration: "none",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {fmtHours(liveTodayH).split(":")[0]}
              <span
                aria-hidden
                style={{
                  display: "inline-flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: "0.13em",
                  height: "0.65em",
                  verticalAlign: "0.18em",
                  margin: "0 0.12em",
                }}
              >
                <span
                  style={{
                    width: "0.085em",
                    height: "0.085em",
                    borderRadius: "50%",
                    background: "currentColor",
                  }}
                />
                <span
                  style={{
                    width: "0.085em",
                    height: "0.085em",
                    borderRadius: "50%",
                    background: "currentColor",
                  }}
                />
              </span>
              {fmtHours(liveTodayH).split(":")[1]}
              <span
                style={{
                  fontStyle: "italic",
                  fontSize: 40,
                  color: liveDone ? vars.typography.green : vars.typography.accent,
                  marginLeft: 4,
                }}
              >
                h
              </span>
            </div>
            <div
              style={{
                marginTop: 16,
                fontFamily: MONO,
                fontSize: 12,
                color: vars.typography.tertiary,
                lineHeight: 1.4,
                textTransform: "uppercase",
                letterSpacing: 2.4,
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              {liveDone
                ? t("today.dayDoneSubtitle", { extra: fmtHours(liveTodayH - GOAL) })
                : t("today.toGoSubtitle", {
                    remaining: fmtHours(Math.max(0, GOAL - liveTodayH)),
                  })}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
           <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            <ui.StatChip
              tone="pink"
              icon={<FlameIcon size={11} />}
              value={streak}
              label={t("today.stat.streak")}
              popped={justBumpedStreak}
            />
            <ui.StatChip
              tone="green"
              icon={
                <svg
                  viewBox="0 0 24 24"
                  width="11"
                  height="11"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              }
              value={`${todayBillablePct}%`}
              label={t("today.stat.billable")}
            />
           </div>
            <ui.StatChip tone="accent" value={todayXp} label={t("today.stat.xpToday")} />
          </div>

          {simonMode && (
            <ui.MeetingsWidget
              onStartForMeeting={(title) => {
                setTD(title);
                setTab("timer");
              }}
            />
          )}

          {simonMode && (
            <ui.TodoCompactList
              title={t("todo.todaySection")}
              todos={todosInPlay(todos)}
              activeTaskKey={activeTaskKey}
              showPressure
              onStart={startTodo}
              onEdit={editTodo}
            />
          )}

          <prim.Divider tone="raised" />

          <div
            data-tour="today-entries"
            style={{ display: "flex", flexDirection: "column", gap: 11 }}
          >
            {(
              Object.entries(groups) as [
                string,
                { cid: string; h: number; entries: TimeEntry[] },
              ][]
            ).map(([co, g], gi) => (
              <div key={co}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 6,
                  }}
                >
                  <span
                    style={{
                      fontFamily: SERIF,
                      fontSize: 17,
                      lineHeight: 1.1,
                      color: chart[gi % chart.length],
                      letterSpacing: -0.1,
                    }}
                  >
                    {co}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: vars.typography.tertiary,
                      fontFamily: MONO,
                    }}
                  >
                    {fmtHours(g.h)}
                  </span>
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 5 }}
                >
                  {g.entries.map((e) => {
                    const isPending = pendingDeleteId === e.id;
                    const isLive = e.id === LIVE_SESSION_ID;
                    return (
                      <div
                        key={e.id}
                        style={{ display: "flex", flexDirection: "column" }}
                      >
                        <div
                          className="entry-card"
                          onDoubleClick={() =>
                            isLive ? setTab("timer") : editEntry(e)
                          }
                          title={t("entry.doubleClickEdit")}
                          style={{
                            background: vars.background.surface,
                            border: `1px solid ${isPending ? "#ef4444" : vars.border.soft}`,
                            borderRadius: 11,
                            padding: "9px 11px",
                            borderBottomLeftRadius: isPending ? 0 : 11,
                            borderBottomRightRadius: isPending ? 0 : 11,
                            borderBottom: isPending
                              ? "none"
                              : `1px solid ${vars.border.soft}`,
                            cursor: "pointer",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              justifyContent: "space-between",
                              gap: 8,
                            }}
                          >
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div
                                style={{
                                  fontSize: 10,
                                  fontWeight: 600,
                                  color: vars.typography.tertiary,
                                  marginBottom: 2,
                                }}
                              >
                                {e.project}
                              </div>
                              <div
                                style={{
                                  fontSize: 12,
                                  color: vars.typography.primary,
                                  lineHeight: 1.4,
                                  wordBreak: "break-word",
                                }}
                              >
                                {e.description}
                              </div>
                              {e.internal_description && (
                                <div
                                  style={{
                                    fontSize: 11,
                                    color: vars.typography.tertiary,
                                    marginTop: 4,
                                    fontStyle: "italic",
                                  }}
                                >
                                  {e.internal_description}
                                </div>
                              )}
                              {(() => {
                                if (!simonMode) return null;
                                const eTodo = estimatedTodoFor(
                                  e._company_id,
                                  e._project_id,
                                  e.description,
                                );
                                if (!eTodo) return null;
                                const loggedH = todoTrackedH(eTodo);
                                const pct = Math.min(
                                  100,
                                  (loggedH / eTodo.estimateH) * 100,
                                );
                                const complete = loggedH >= eTodo.estimateH;
                                return (
                                  <div
                                    style={{
                                      marginTop: 6,
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 7,
                                    }}
                                  >
                                    <div
                                      style={{
                                        flex: 1,
                                        maxWidth: 96,
                                        height: 3,
                                        borderRadius: 2,
                                        background: vars.border.soft,
                                        overflow: "hidden",
                                      }}
                                    >
                                      <div
                                        style={{
                                          height: "100%",
                                          width: `${pct}%`,
                                          background: complete ? vars.typography.green : vars.typography.accent,
                                        }}
                                      />
                                    </div>
                                    <span
                                      style={{
                                        fontFamily:
                                          MONO,
                                        fontSize: 9,
                                        fontVariantNumeric: "tabular-nums",
                                        color: complete ? vars.typography.green : vars.typography.tertiary,
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {fmtHours(loggedH)} /{" "}
                                      {fmtHours(eTodo.estimateH)}
                                    </span>
                                  </div>
                                );
                              })()}
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                flexShrink: 0,
                                paddingTop: 1,
                              }}
                            >
                              <span
                                style={{
                                  fontFamily: MONO,
                                  fontSize: 12,
                                  fontWeight: 700,
                                  color: vars.typography.accent,
                                }}
                              >
                                {fmtHours(parseFloat(e.hour))}
                              </span>
                              <span
                                title={
                                  e.invoice === "1"
                                    ? "Billable — shows up on invoice"
                                    : "Internal — not billed"
                                }
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  height: 16,
                                  padding: "0 6px",
                                  borderRadius: 4,
                                  fontSize: 9,
                                  fontWeight: 700,
                                  letterSpacing: 0.5,
                                  textTransform: "uppercase",
                                  background:
                                    e.invoice === "1"
                                      ? `color-mix(in srgb, ${vars.typography.accent} 15%, transparent)`
                                      : "transparent",
                                  color: e.invoice === "1" ? vars.typography.accent : vars.typography.faint,
                                  border: `1px solid ${e.invoice === "1" ? `color-mix(in srgb, ${vars.typography.accent} 33%, transparent)` : vars.border.soft}`,
                                }}
                              >
                                {e.invoice === "1" ? "Billable" : "Internal"}
                              </span>
                              {isPendingId(e.id) &&
                                (failedIds.has(e.id) ? (
                                  <span
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      height: 16,
                                      padding: "0 6px",
                                      borderRadius: 4,
                                      fontSize: 9,
                                      fontWeight: 700,
                                      letterSpacing: 0.5,
                                      textTransform: "uppercase",
                                      background: "#ef444426",
                                      color: "#ef4444",
                                      border: `1px solid #ef444455`,
                                    }}
                                  >
                                    {t("offline.failedBadge")}
                                  </span>
                                ) : (
                                  <span
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      height: 16,
                                      padding: "0 6px",
                                      borderRadius: 4,
                                      fontSize: 9,
                                      fontWeight: 700,
                                      letterSpacing: 0.5,
                                      textTransform: "uppercase",
                                      background: "#f59e0b26",
                                      color: mode === "dark" ? "#fbbf24" : "#b45309",
                                      border: `1px solid #f59e0b55`,
                                    }}
                                  >
                                    {t("offline.pendingBadge")}
                                  </span>
                                ))}
                              {(isLive || (tRun && draftId === e.id)) && (
                                <span
                                  className={tRun ? "todo-live-dot" : undefined}
                                  style={
                                    {
                                      display: "inline-flex",
                                      alignItems: "center",
                                      height: 16,
                                      padding: "0 6px",
                                      borderRadius: 4,
                                      fontSize: 9,
                                      fontWeight: 700,
                                      letterSpacing: 0.5,
                                      textTransform: "uppercase",
                                      background: tRun ? `color-mix(in srgb, ${vars.typography.pink} 15%, transparent)` : vars.background.raised,
                                      color: tRun ? vars.typography.pink : vars.typography.tertiary,
                                      border: `1px solid ${tRun ? `color-mix(in srgb, ${vars.typography.pink} 33%, transparent)` : vars.border.soft}`,
                                      "--todo-live-ring": `color-mix(in srgb, ${vars.typography.pink} 40%, transparent)`,
                                    } as CSSProperties
                                  }
                                >
                                  {tRun ? t("timer.recording") : t("status.paused")}
                                </span>
                              )}
                              {(() => {
                                if (isPendingId(e.id) || isLive) return null;
                                const isActive = tRun && draftId === e.id;
                                return (
                                  <button
                                    onClick={(ev) => {
                                      ev.stopPropagation();
                                      if (isActive) {
                                        setTRun(false);
                                        return;
                                      }
                                      if (
                                        draftId === e.id &&
                                        tCo === e._company_id &&
                                        tPr === e._project_id
                                      ) {
                                        setTRun(true);
                                        setTab("timer");
                                        return;
                                      }
                                      switchTaskGuarded(
                                        e._company_id,
                                        e._project_id,
                                        e.description,
                                        {
                                          entryId: e.id,
                                          hours: parseFloat(e.hour) || 0,
                                          note: e.internal_description || "",
                                          invoice: e.invoice === "1",
                                        },
                                      );
                                    }}
                                    title={
                                      isActive
                                        ? "Pause the running timer"
                                        : "Continue this task — timer resumes from logged hours"
                                    }
                                    style={{
                                      width: 22,
                                      height: 22,
                                      borderRadius: "50%",
                                      background: isActive ? vars.typography.pink : vars.background.button,
                                      border: "none",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      cursor: "pointer",
                                      padding: 0,
                                    }}
                                  >
                                    {isActive ? (
                                      <svg
                                        width="8"
                                        height="10"
                                        viewBox="0 0 12 14"
                                        fill="none"
                                      >
                                        <rect
                                          x="1"
                                          y="1"
                                          width="3"
                                          height="12"
                                          rx="1"
                                          fill="white"
                                        />
                                        <rect
                                          x="8"
                                          y="1"
                                          width="3"
                                          height="12"
                                          rx="1"
                                          fill="white"
                                        />
                                      </svg>
                                    ) : (
                                      <svg
                                        width="8"
                                        height="10"
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
                                );
                              })()}
                              {!isLive && (
                                <button
                                  onClick={() =>
                                    setPendingDeleteId(isPending ? null : e.id)
                                  }
                                  style={{
                                    background: "none",
                                    border: "none",
                                    color: isPending ? "#ef4444" : vars.typography.tertiary,
                                    fontSize: 12,
                                    cursor: "pointer",
                                    padding: "2px 4px",
                                    fontWeight: isPending ? 700 : 400,
                                  }}
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                        <div
                          style={{
                            maxHeight: isPending ? 44 : 0,
                            overflow: "hidden",
                            transition: "max-height .22s ease",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              borderRadius: "0 0 11px 11px",
                              overflow: "hidden",
                              border: `1px solid #ef4444`,
                              borderTop: "none",
                            }}
                          >
                            <button
                              onClick={() => setPendingDeleteId(null)}
                              style={{
                                flex: 1,
                                padding: "10px 0",
                                background: vars.background.raised,
                                border: "none",
                                color: vars.typography.secondary,
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              {t("entry.cancel")}
                            </button>
                            <button
                              onClick={async () => {
                                setPendingDeleteId(null);
                                await delEntry(e.id);
                              }}
                              style={{
                                flex: 1,
                                padding: "10px 0",
                                background: "#ef4444",
                                border: "none",
                                color: "#fff",
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                            >
                              {t("entry.delete")}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {entries.length === 0 && entriesLoading && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  padding: "4px 0",
                }}
              >
                <div
                  className="skeleton"
                  style={{ height: 18, width: "40%", borderRadius: 6 }}
                />
                <div
                  className="skeleton"
                  style={{ height: 52, borderRadius: 11 }}
                />
                <div
                  className="skeleton"
                  style={{ height: 52, borderRadius: 11 }}
                />
              </div>
            )}
            {entries.length === 0 && !entriesLoading && (
              <div
                style={{
                  textAlign: "center",
                  padding: "28px 12px",
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
              >
                <div style={{ color: vars.typography.secondary, fontWeight: 600, marginBottom: 4 }}>
                  {emptyMsg}
                </div>
                <div style={{ color: vars.typography.faint, fontSize: 11 }}>
                  {t("today.noEntriesHeader", {
                    date: new Date().toLocaleDateString(locale, {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    }),
                  })}
                </div>
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 8,
              paddingTop: 8,
              borderTop: `1px solid ${vars.background.raised}`,
            }}
          >
            <span style={{ fontSize: 12, color: vars.typography.tertiary }}>
              {t("today.totalLabel")}
            </span>
            <span
              style={{
                fontSize: 17,
                fontWeight: 700,
                color: liveDone ? vars.typography.green : vars.typography.accent,
                fontFamily: MONO,
              }}
            >
              {fmtHours(liveTodayH)}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              paddingTop: 14,
            }}
          >
            <button
              type="button"
              onClick={() => {
                setTab("timer");
                setLogOpen(true);
              }}
              aria-label={t("timer.logPastTime")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "9px 18px 9px 14px",
                borderRadius: 999,
                background: "transparent",
                border: `1px solid ${vars.border.soft}`,
                color: vars.typography.secondary,
                cursor: "pointer",
                fontFamily: MONO,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: 1.4,
                textTransform: "uppercase",
                transition: "all .15s ease",
              }}
            >
              <PlusIcon size={13} />
              {t("today.logTime")}
            </button>
          </div>
        </div>
      </div>
    );
  })();

  // ─── Timer view ────────────────────────────────────────────────────────
  const timerView = (() => {
    const coObj = companies.find((c) => c.id === tCo);
    const prList = projectCache[tCo] || [];
    const prObj = prList.find((p) => p.id === tPr);
    const hasCtx = !!(tCo && tPr);
    const sessXP = Math.round((tSec / 3600) * 8 + 2);

    const canStart = !!(tCo && tPr && tD.trim());
    const stop = async () => {
      if (!canStart) {
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
        draftId,
      );
      accrueTodoHours(activeTodoId, h);
      setActiveTodoId(null);
      if (stashedTimer) {
        // Side quest logged — pop the main timer back (paused).
        restoreStashedTimer();
      } else {
        resetTimer();
        setTab("today");
      }
    };

    const timerHint = tRun
      ? t("page.timerRunning")
      : tSec > 0
        ? t("page.timerPaused")
        : t("page.timerIdle");
    return (
      <ui.Page title={t("page.timer")} hint={timerHint} gap={10} minHeight="100%">
        {stashedTimer && (
          <button
            type="button"
            onClick={restoreStashedTimer}
            title={t("timer.returnToMain")}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              padding: "9px 12px",
              borderRadius: 12,
              background: vars.background.accent,
              border: `1px solid ${vars.border.soft}`,
              cursor: "pointer",
              textAlign: "left",
              width: "100%",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "baseline",
                gap: 8,
                minWidth: 0,
              }}
            >
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 8,
                  fontWeight: 700,
                  color: vars.typography.faint,
                  textTransform: "uppercase",
                  letterSpacing: 1.6,
                  flexShrink: 0,
                }}
              >
                {t("timer.mainPaused")}
              </span>
              <span
                style={{
                  fontFamily: SERIF,
                  fontStyle: "italic",
                  fontSize: 15,
                  color: vars.typography.accentInk,
                  letterSpacing: -0.1,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  minWidth: 0,
                }}
              >
                {stashedTimer.coName}
              </span>
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 11,
                  fontWeight: 700,
                  color: vars.typography.secondary,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {fmtClock(stashedTimer.sec)}
              </span>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 8,
                  fontWeight: 700,
                  color: vars.typography.accent,
                  textTransform: "uppercase",
                  letterSpacing: 1.4,
                }}
              >
                {t("timer.returnShort")} ↩
              </span>
            </span>
          </button>
        )}

        <div
          className="timer-dial-zone"
          style={{ padding: "12px 0 6px" }}
        >
          <div className="timer-dial-content">
          <prim.ActivityRing
            progress={GOAL > 0 ? todayH / GOAL : 0}
            done={done}
            size={210}
            stroke={3}
            withTicks
          >
            <div style={{ textAlign: "center", padding: "0 8px" }}>
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 38,
                  fontWeight: 400,
                  color: tRun ? vars.typography.primary : vars.typography.tertiary,
                  letterSpacing: -1.5,
                  lineHeight: 0.95,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {fmtClock(tSec)}
              </div>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 8,
                  color: tRun ? vars.typography.pink : vars.typography.faint,
                  fontWeight: 700,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  marginTop: 8,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                {tRun && (
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: vars.typography.pink,
                      animation: "pulse 1.2s ease-in-out infinite",
                    }}
                  />
                )}
                {tRun
                  ? t("timer.recording")
                  : tSec > 0
                    ? t("status.paused")
                    : t("status.idle")}
              </div>
            </div>
          </prim.ActivityRing>
          </div>
          {tRun && (
            <div className="timer-dial-controls">
              <button
                type="button"
                onClick={() => setTRun(false)}
                aria-label={t("timer.pause")}
                title={t("timer.pause")}
                className="timer-dial-btn"
                style={{
                  background: vars.background.surface,
                  border: `1px solid ${vars.border.soft}`,
                  color: vars.typography.primary,
                }}
              >
                <PauseIcon size={22} />
              </button>
              <button
                type="button"
                onClick={stop}
                aria-label={t("timer.stopLog")}
                title={t("timer.stopLog")}
                className="timer-dial-btn"
                style={{
                  background: vars.background.button,
                  color: "#fff",
                  boxShadow: vars.shadow.button,
                }}
              >
                <StopIcon size={22} />
              </button>
            </div>
          )}
        </div>

        {!tRun &&
          (() => {
            const v = getTimerVibe(tSec, tRun, lang);
            return (
              <div
                style={{
                  textAlign: "center",
                  fontFamily: SERIF,
                  fontStyle: "italic",
                  fontSize: 15,
                  color: vars.typography.tertiary,
                  lineHeight: 1.3,
                  padding: "0 8px",
                }}
              >
                {v.text}
                {v.icon && <span style={{ marginLeft: 6 }}>{v.icon}</span>}
              </div>
            );
          })()}
        {!tRun && timerInsight && (
          <div
            style={{
              textAlign: "center",
              fontFamily: SERIF,
              fontStyle: "italic",
              fontSize: 13,
              color: vars.typography.faint,
              padding: "0 18px",
              lineHeight: 1.4,
            }}
          >
            {timerInsight}
          </div>
        )}

        {(!tRun || !hasCtx || timerFormOpen) && (
        <div
          style={{
            padding: "4px 0 0",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {tRun && !canStart && (
            <div
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontSize: 14,
                color: vars.typography.pink,
                textAlign: "center",
                padding: "4px 8px",
                lineHeight: 1.4,
              }}
            >
              {t("timer.runningNeedFields")}
            </div>
          )}
          {!tRun &&
            (tSec > 0 && canStart ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                }}
              >
                <button
                  onClick={() => setTRun(true)}
                  style={{
                    height: 44,
                    background: "transparent",
                    border: `1px solid ${vars.border.soft}`,
                    borderRadius: 999,
                    color: vars.typography.primary,
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: 1.4,
                    textTransform: "uppercase",
                    cursor: "pointer",
                  }}
                >
                  {t("timer.resume")}
                </button>
                <button
                  onClick={() => void stopAndLogCurrent()}
                  style={{
                    height: 44,
                    background: vars.background.button,
                    border: "1px solid transparent",
                    borderRadius: 999,
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: 1.4,
                    textTransform: "uppercase",
                    cursor: "pointer",
                    boxShadow: vars.shadow.button,
                  }}
                >
                  {t("timer.stopLog")}
                </button>
              </div>
            ) : (
              <button
                data-tour="timer-start"
                onClick={() => setTRun(true)}
                style={{
                  width: "100%",
                  height: 44,
                  background: vars.background.button,
                  border: "1px solid transparent",
                  borderRadius: 999,
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: 1.4,
                  textTransform: "uppercase",
                  cursor: "pointer",
                  boxShadow: vars.shadow.button,
                }}
              >
                {tSec > 0 ? t("timer.resume") : t("timer.start")}
              </button>
            ))}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              margin: "20px 0 14px",
            }}
          >
            <prim.Divider grow />
            <span
              style={{
                fontSize: 10,
                color: vars.typography.secondary,
                fontWeight: 700,
                letterSpacing: 1.4,
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              {t("timer.whatWorking")}
            </span>
            <prim.Divider grow />
          </div>

          {companiesError && companies.length === 0 && (
            <ui.RetryStrip
              label={t("error.loadClients")}
              onRetry={loadCompaniesNow}
            />
          )}
          <div data-tour="timer-company">
            <ui.Combobox
              value={tCo}
              items={companies}
              placeholder={`${t("form.searchClient")} (${companies.length})`}
                onChange={async (id) => {
                setTCo(id);
                setTPr("");
                if (isInternalCompany(id)) setTInv(false);
                if (id) await ensureProjects(id);
              }}
            />
          </div>

          {tCo &&
            (projectErrors[tCo] && prList.length === 0 ? (
              <ui.RetryStrip
                label={t("error.loadProjects")}
                onRetry={() => void ensureProjects(tCo)}
              />
            ) : (
              <div data-tour="timer-project">
                <ui.Combobox
                  value={tPr}
                  items={prList}
                  placeholder={
                    prList.length
                      ? `${t("form.searchProject")} (${prList.length})`
                      : t("form.loadingProjects")
                  }
                  onChange={setTPr}
                />
              </div>
            ))}

          {tCo && tPr && (
            <>
              <input
                data-tour="timer-description"
                value={tD}
                onChange={(e) => setTD(e.target.value)}
                placeholder={t("timer.taskDescription")}
                style={{
                  padding: "8px 6px",
                  background: "transparent",
                  border: "none",
                  borderBottom: `1px solid ${tD.trim() ? vars.typography.accent : vars.border.soft}`,
                  borderRadius: 8,
                  color: vars.typography.primary,
                  fontSize: 14,
                  outline: "none",
                  width: "100%",
                }}
              />
              {(() => {
                const recentDescs = Array.from(
                  new Set(
                    entries
                      .filter((e) => e._project_id === tPr && e.description?.trim())
                      .map((e) => e.description.trim()),
                  ),
                ).slice(0, 3);
                if (recentDescs.length === 0) return null;
                return (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: -2 }}>
                    {recentDescs.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setTD(d)}
                        title={d}
                        style={{
                          display: "inline-flex",
                          padding: "4px 10px",
                          borderRadius: 999,
                          background: "transparent",
                          border: `1px solid ${vars.border.soft}`,
                          color: vars.typography.tertiary,
                          fontFamily: SERIF,
                          fontStyle: "italic",
                          fontSize: 12,
                          cursor: "pointer",
                          maxWidth: 220,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          lineHeight: 1.2,
                        }}
                      >
                        &ldquo;{d}&rdquo;
                      </button>
                    ))}
                  </div>
                );
              })()}
              <textarea
                data-tour="timer-note"
                value={tNote}
                onChange={(e) => setTNote(e.target.value)}
                placeholder={t("timer.internalNotes")}
                rows={2}
                style={{
                  padding: "8px 6px",
                  background: "transparent",
                  border: "none",
                  borderBottom: `1px solid ${vars.border.soft}`,
                  borderRadius: 8,
                  color: vars.typography.primary,
                  fontSize: 13,
                  outline: "none",
                  width: "100%",
                  resize: "none",
                  fontFamily: "inherit",
                }}
              />
              <button
                type="button"
                data-tour="timer-invoiceable"
                role="switch"
                aria-checked={tInv}
                aria-label={t("timer.invoiceable")}
                onClick={() => setTInv((v) => !v)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  padding: "8px 2px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  font: "inherit",
                  color: "inherit",
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: vars.typography.secondary,
                    textTransform: "uppercase",
                    letterSpacing: 1.4,
                    fontWeight: 600,
                  }}
                >
                  {t("timer.invoiceable")}
                </span>
                <div
                  style={{
                    width: 28,
                    height: 16,
                    borderRadius: 999,
                    background: tInv ? vars.typography.accent : vars.border.soft,
                    display: "flex",
                    alignItems: "center",
                    padding: 2,
                    transition: "background .2s",
                  }}
                >
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: "#fff",
                      transform: `translateX(${tInv ? 12 : 0}px)`,
                      transition: "transform .2s",
                    }}
                  />
                </div>
              </button>
            </>
          )}
          {tRun && canStart && (
            <button
              type="button"
              data-tour="timer-done"
              onClick={() => setTimerFormOpen(false)}
              style={{
                alignSelf: "center",
                marginTop: 8,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 22px",
                borderRadius: 999,
                background: vars.background.button,
                border: "none",
                color: "#fff",
                cursor: "pointer",
                fontFamily: MONO,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1.4,
                textTransform: "uppercase",
                boxShadow: vars.shadow.button,
              }}
            >
              {t("timer.formDone")}
            </button>
          )}
        </div>
        )}

        {tRun && hasCtx && !timerFormOpen && (
          <div style={{ textAlign: "center", padding: "4px 14px" }}>
            <div
              style={{
                fontFamily: SERIF,
                fontSize: 24,
                color: vars.typography.primary,
                letterSpacing: -0.3,
                lineHeight: 1.1,
              }}
            >
              {coObj?.name}
            </div>
            {prObj?.name && (
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 10,
                  color: vars.typography.faint,
                  textTransform: "uppercase",
                  letterSpacing: 1.8,
                  fontWeight: 600,
                  marginTop: 6,
                }}
              >
                {prObj.name}
              </div>
            )}
            {tD && (
              <div
                style={{
                  fontFamily: SERIF,
                  fontStyle: "italic",
                  fontSize: 15,
                  color: vars.typography.tertiary,
                  marginTop: 14,
                  padding: "0 6px",
                  lineHeight: 1.45,
                }}
              >
                &ldquo;{tD}&rdquo;
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 14 }}>
              <button
                type="button"
                data-tour="timer-switch"
                onClick={() => setTimerFormOpen(true)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 999,
                  background: "transparent",
                  border: `1px solid ${vars.border.soft}`,
                  color: vars.typography.tertiary,
                  fontFamily: MONO,
                  fontSize: 9,
                  fontWeight: 600,
                  letterSpacing: 1.6,
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "all .15s ease",
                }}
              >
                {t("timer.switchTask")}
              </button>
              {tRun && !stashedTimer && (
                <button
                  type="button"
                  data-tour="timer-sidequest"
                  onClick={startSideQuest}
                  title={t("timer.sideQuestHint")}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 999,
                    background: "transparent",
                    border: `1px solid color-mix(in srgb, ${vars.typography.accent} 33%, transparent)`,
                    color: vars.typography.accent,
                    fontFamily: MONO,
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: 1.6,
                    textTransform: "uppercase",
                    cursor: "pointer",
                    transition: "all .15s ease",
                  }}
                >
                  ↯ {t("timer.sideQuest")}
                </button>
              )}
            </div>
          </div>
        )}

        {tRun && (
          <div
            data-tour="timer-controls"
            style={{
              marginTop: "auto",
              display: "flex",
              justifyContent: "center",
              gap: 18,
              paddingBottom: 16,
            }}
          >
            <button
              type="button"
              onClick={() => setTRun(false)}
              aria-label={t("timer.pause")}
              title={t("timer.pause")}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "transparent",
                border: `1px solid ${vars.border.soft}`,
                color: vars.typography.primary,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all .15s ease",
              }}
            >
              <PauseIcon size={16} />
            </button>
            <button
              type="button"
              onClick={stop}
              aria-label={t("timer.stopLog")}
              title={t("timer.stopLog")}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: vars.background.button,
                border: "none",
                color: "#fff",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: vars.shadow.button,
                transition: "all .15s ease",
              }}
            >
              <StopIcon size={16} />
            </button>
            <button
              type="button"
              onClick={() => setPendingCancelTimer((v) => !v)}
              aria-label={t("timer.cancel")}
              title={t("timer.cancel")}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: pendingCancelTimer
                  ? "rgba(239,68,68,0.12)"
                  : "transparent",
                border: pendingCancelTimer
                  ? "1px solid #ef4444"
                  : `1px solid ${vars.border.soft}`,
                color: pendingCancelTimer ? "#ef4444" : vars.typography.tertiary,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all .15s ease",
              }}
            >
              <XIcon size={14} />
            </button>
          </div>
        )}

        {tRun && pendingCancelTimer && (
          <div
            style={{
              display: "flex",
              gap: 8,
              padding: "0 0 12px",
              justifyContent: "center",
            }}
          >
            <button
              onClick={() => setPendingCancelTimer(false)}
              style={{
                padding: "9px 18px",
                background: "transparent",
                border: `1px solid ${vars.border.soft}`,
                borderRadius: 999,
                color: vars.typography.secondary,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: 1.4,
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              {t("entry.cancel")}
            </button>
            <button
              onClick={() => void cancelTimer()}
              style={{
                padding: "9px 18px",
                background: "#ef4444",
                border: "none",
                borderRadius: 999,
                color: "#fff",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1.4,
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              {t("timer.cancelDiscard")}
            </button>
          </div>
        )}

        {tRun && (
          <div
            data-tour="timer-stats"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 8,
              paddingTop: 18,
              borderTop: `1px solid ${vars.border.soft}`,
              textAlign: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 24,
                  color: vars.typography.primary,
                  lineHeight: 1,
                  letterSpacing: -0.4,
                }}
              >
                +{sessXP}
              </div>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 8,
                  color: vars.typography.faint,
                  textTransform: "uppercase",
                  letterSpacing: 1.6,
                  fontWeight: 600,
                  marginTop: 3,
                }}
              >
                {t("timer.statSessionXp")}
              </div>
            </div>
            <div>
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 24,
                  color: done ? vars.typography.green : vars.typography.primary,
                  lineHeight: 1,
                  letterSpacing: -0.4,
                }}
              >
                {fmtHours(todayH)}
              </div>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 8,
                  color: vars.typography.faint,
                  textTransform: "uppercase",
                  letterSpacing: 1.6,
                  fontWeight: 600,
                  marginTop: 3,
                }}
              >
                {t("timer.statToday")}
              </div>
            </div>
            <div>
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 24,
                  color: vars.typography.pink,
                  lineHeight: 1,
                  letterSpacing: -0.4,
                }}
              >
                {streak}
                <span style={{ fontSize: 16, opacity: 0.7 }}>d</span>
              </div>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 8,
                  color: vars.typography.faint,
                  textTransform: "uppercase",
                  letterSpacing: 1.6,
                  fontWeight: 600,
                  marginTop: 3,
                }}
              >
                {t("timer.statStreak")}
              </div>
            </div>
          </div>
        )}

        {!tRun && tSec > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 14,
              paddingTop: 4,
            }}
          >
            <button
              type="button"
              onClick={() => setPendingCancelTimer((v) => !v)}
              aria-label={t("timer.cancel")}
              title={t("timer.cancel")}
              style={{
                width: 32,
                height: 32,
                padding: 0,
                borderRadius: "50%",
                background: pendingCancelTimer
                  ? "rgba(239,68,68,0.10)"
                  : "transparent",
                border: pendingCancelTimer
                  ? "1px solid #ef4444"
                  : `1px solid ${vars.border.soft}`,
                color: pendingCancelTimer ? "#ef4444" : vars.typography.faint,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all .15s ease",
              }}
            >
              <XIcon size={14} />
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={openAbsence}
          style={{
            alignSelf: "center",
            marginTop: 4,
            padding: "8px 16px",
            borderRadius: 999,
            background: "transparent",
            color: vars.typography.tertiary,
            border: `1px solid ${vars.border.soft}`,
            fontFamily: MONO,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 1.4,
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          {t("absence.button")}
        </button>
      </ui.Page>
    );
  })();

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

  const historyView = (
    <ui.Page
      title={t("page.history")}
      hint={t(`scale.${historyScale}` as "scale.week")}
      gap={12}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <div
          role="tablist"
          style={{ display: "flex", gap: 4 }}
        >
          {(["day", "week", "month"] as const).map((v) => {
            const labelKey =
              v === "day" ? "daily" : v === "week" ? "weekly" : "monthly";
            const isActive = historyScale === v;
            return (
              <button
                key={v}
                role="tab"
                aria-selected={isActive}
                onClick={() => setHistoryScale(v)}
                style={{
                  padding: "6px 12px",
                  border: "none",
                  borderRadius: 999,
                  background: isActive ? vars.typography.accent : "transparent",
                  color: isActive ? "#fff" : vars.typography.tertiary,
                  fontFamily: MONO,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 1.4,
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "all 150ms ease",
                }}
              >
                {t(`history.${labelKey}`)}
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button
            onClick={() => stepHistoryDate(-1)}
            aria-label={t("scale.prev", {
              scale: t(`scale.${historyScale}` as "scale.week"),
            })}
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: "transparent",
              border: `1px solid ${vars.border.soft}`,
              color: vars.typography.secondary,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              transition: "all 140ms ease",
            }}
          >
            <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={() => stepHistoryDate(1)}
            aria-label={t("scale.next", {
              scale: t(`scale.${historyScale}` as "scale.week"),
            })}
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: "transparent",
              border: `1px solid ${vars.border.soft}`,
              color: vars.typography.secondary,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              transition: "all 140ms ease",
            }}
          >
            <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
          {!historyIsOnCurrent && (
            <button
              onClick={jumpHistoryToCurrent}
              style={{
                background: vars.typography.accent,
                border: "none",
                color: "#fff",
                fontFamily: MONO,
                fontSize: 9,
                fontWeight: 700,
                cursor: "pointer",
                padding: "0 10px",
                height: 22,
                marginLeft: 4,
                borderRadius: 999,
                letterSpacing: 1.2,
                textTransform: "uppercase",
              }}
            >
              {t("header.now")}
            </button>
          )}
        </div>
      </div>
      {historyScale === "day" ? (
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
      ) : historyScale === "week" ? (
        weekView
      ) : (
        monthView
      )}

      {simonMode && (
        <ui.TodoCompactList
          title={t("todo.upcomingSection")}
          todos={todosUpcoming(todos)}
          activeTaskKey={activeTaskKey}
          showPressure={false}
          onStart={startTodo}
          onEdit={editTodo}
        />
      )}
    </ui.Page>
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
                  const sep = "   •   ";
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
                            · {prObj.name}
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
              title={lang === "sv" ? "Öppna sidomenyn" : "Open sidebar"}
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
              {lang === "sv" ? "Öppna" : "Open"}
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
        <div
          onClick={tapSimonCorner}
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 22,
            height: 22,
            zIndex: 9999,
          }}
        >
          {simonMode && (
            <span
              style={{
                position: "absolute",
                top: 4,
                left: 4,
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "#10b981",
                opacity: 0.7,
              }}
            />
          )}
        </div>
        {hdr}
        {(!online || pendingQueue.length > 0) &&
          (() => {
            const n = pendingQueue.length;
            const syncMode = online; // online with a queue → syncing
            const accent = syncMode ? vars.typography.accent : "#f59e0b";
            const text = !online
              ? n > 0
                ? t("offline.banner", { n })
                : t("error.offlineBanner")
              : t("offline.syncing", { n });
            return (
              <div
                role="status"
                style={{
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "7px 14px",
                  background: `${accent}1a`,
                  borderTop: `1px solid ${accent}40`,
                  borderBottom: `1px solid ${accent}40`,
                  color: syncMode
                    ? vars.typography.accent
                    : mode === "dark"
                      ? "#fbbf24"
                      : "#b45309",
                  fontFamily: MONO,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 0.5,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: accent,
                    flexShrink: 0,
                    animation:
                      syncMode || syncing
                        ? "pulse 1.2s ease-in-out infinite"
                        : undefined,
                  }}
                />
                {text}
              </div>
            );
          })()}
        {failedQueue.length > 0 && (
          <div
            role="status"
            style={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 14px",
              background: "#ef44441a",
              borderTop: `1px solid #ef444440`,
              borderBottom: `1px solid #ef444440`,
              color: "#ef4444",
              fontFamily: MONO,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 0.5,
            }}
          >
            <span style={{ flex: 1 }}>
              {t("offline.failedBanner", { n: failedQueue.length })}
            </span>
            <button
              type="button"
              onClick={retryFailed}
              style={{
                padding: "3px 10px",
                borderRadius: 999,
                background: "#ef4444",
                color: "#fff",
                border: "none",
                fontFamily: MONO,
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              {t("offline.retry")}
            </button>
          </div>
        )}
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
                reload: loadCompaniesNow,
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
        <div
          style={{
            height: 40,
            flexShrink: 0,
            borderTop: `1px solid ${vars.border.soft}`,
            background: vars.background.page,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 14px",
            gap: 10,
          }}
        >
          <div
            data-tour="footer-theme"
            style={{
              display: "flex",
              gap: 2,
              background: vars.background.raised,
              border: `1px solid ${vars.border.soft}`,
              borderRadius: 7,
              padding: 2,
            }}
          >
            {(["light", "dark"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 5,
                  border: mode === m ? `1px solid ${vars.border.strong}` : "none",
                  background: mode === m ? vars.background.surface : "transparent",
                  fontSize: 11,
                  cursor: "pointer",
                }}
              >
                {m === "light" ? "☀️" : "🌙"}
              </button>
            ))}
          </div>
          <button
            data-tour="footer-lang"
            onClick={() => setLang(lang === "en" ? "sv" : "en")}
            title={t("lang.switchTo")}
            style={{
              width: 22,
              height: 22,
              borderRadius: 5,
              background: vars.background.raised,
              border: `1px solid ${vars.border.soft}`,
              fontSize: 12,
              cursor: "pointer",
              padding: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {lang === "en" ? "🇸🇪" : "🇬🇧"}
          </button>
          <button
            type="button"
            data-tour="footer-pin"
            onClick={() => setPinned((v) => !v)}
            aria-pressed={pinned}
            title={pinned ? t("footer.unpinSidebar") : t("footer.pinSidebar")}
            style={{
              width: 22,
              height: 22,
              borderRadius: 5,
              background: pinned ? `color-mix(in srgb, ${vars.typography.accent} 15%, transparent)` : vars.background.raised,
              border: `1px solid ${pinned ? vars.typography.accent : vars.border.soft}`,
              color: pinned ? vars.typography.accent : vars.typography.tertiary,
              fontSize: 11,
              cursor: "pointer",
              padding: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            📌
          </button>
          <button
            data-tour="footer-help"
            onClick={startIntroFresh}
            title={t("footer.showIntro")}
            style={{
              width: 22,
              height: 22,
              borderRadius: 5,
              background: vars.background.raised,
              border: `1px solid ${vars.border.soft}`,
              color: vars.typography.tertiary,
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            ?
          </button>
          <button
            onClick={confirmSignOut}
            title={t("footer.signOut")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "none",
              border: "none",
              color: vars.typography.tertiary,
              fontSize: 12,
              cursor: "pointer",
              padding: "4px 8px",
            }}
          >
            <span>{t("footer.signOut")}</span>
            <span style={{ fontSize: 13 }}>⎋</span>
          </button>
        </div>

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

        {floats.length > 0 && (
          <div
            aria-live="polite"
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: 16,
              pointerEvents: "none",
              overflow: "hidden",
              zIndex: 99,
            }}
          >
            {floats.map((f) => (
              <div
                key={f.id}
                role="status"
                style={{
                  maxWidth: "100%",
                  background: vars.background.surface,
                  border: `1px solid ${vars.border.soft}`,
                  borderRadius: 13,
                  padding: "9px 18px",
                  fontSize: 15,
                  fontWeight: 800,
                  color: f.col,
                  fontFamily: MONO,
                  textAlign: "center",
                  lineHeight: 1.35,
                  overflowWrap: "anywhere",
                  animation: "floatUp 1.5s ease-out forwards",
                  boxShadow: `0 4px 24px ${f.col}44`,
                }}
              >
                {f.txt}
              </div>
            ))}
          </div>
        )}

        {saveToast && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                mode === "dark"
                  ? "rgba(11, 9, 16, 0.55)"
                  : "rgba(253, 252, 251, 0.65)",
              animation: "saveFlashBackdrop 2.1s cubic-bezier(.22,1,.36,1) forwards",
              zIndex: 110,
              pointerEvents: "none",
            }}
            role="status"
            aria-live="polite"
          >
            <div
              className="glassy"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 14,
                padding: "26px 30px 24px",
                borderRadius: 22,
                background: vars.background.surface,
                border: `1.5px solid color-mix(in srgb, ${vars.typography.green} 33%, transparent)`,
                boxShadow: `0 14px 48px color-mix(in srgb, ${vars.typography.green} 33%, transparent), 0 0 0 1px color-mix(in srgb, ${vars.typography.green} 13%, transparent)`,
                animation: "saveFlashCard 2.1s cubic-bezier(.22,1,.36,1) forwards",
              }}
            >
              <svg
                viewBox="0 0 72 72"
                width={72}
                height={72}
                fill="none"
                strokeWidth={5}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
                style={{ stroke: vars.typography.green }}
              >
                <circle
                  className="save-flash-ring"
                  cx="36"
                  cy="36"
                  r="31"
                  strokeDasharray="195"
                  strokeDashoffset="195"
                  style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
                />
                <polyline
                  className="save-flash-check"
                  points="22 38 32 48 52 26"
                  strokeDasharray="40"
                  strokeDashoffset="40"
                />
              </svg>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    color: vars.typography.primary,
                    letterSpacing: -0.2,
                  }}
                >
                  {saveToast.cheer}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: vars.typography.tertiary,
                    fontFamily: MONO,
                    letterSpacing: 0.3,
                  }}
                >
                  +{saveToast.hours}  ·  +{saveToast.xp} XP
                </div>
              </div>
            </div>
          </div>
        )}

        {justHitGoal && (
          <div
            className="confetti-burst"
            aria-hidden
            style={{ left: "50%", top: "30%" }}
          >
            {Array.from({ length: 22 }).map((_, i) => {
              const angle = (i / 22) * Math.PI * 2;
              const dist = 90 + Math.random() * 90;
              const dx = Math.cos(angle) * dist;
              const dy = Math.sin(angle) * dist - 30;
              const rot = (Math.random() - 0.5) * 720;
              const palette = [vars.typography.accent, vars.typography.pink, vars.typography.green, "#e8c060"];
              const color = palette[i % palette.length];
              const delay = Math.random() * 120;
              return (
                <span
                  key={i}
                  className="confetti-piece"
                  style={
                    {
                      background: color,
                      "--cx": `${dx}px`,
                      "--cy": `${dy}px`,
                      "--cr": `${rot}deg`,
                      animationDelay: `${delay}ms`,
                    } as { [k: string]: string }
                  }
                />
              );
            })}
          </div>
        )}

        {goalCelebration && (
          <div
            style={{
              position: "absolute",
              bottom: ach ? 90 : 14,
              left: 12,
              right: 12,
              background: vars.background.surface,
              border: `1.5px solid color-mix(in srgb, ${vars.typography.green} 40%, transparent)`,
              borderRadius: 14,
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: 13,
              zIndex: 101,
              animation: "goalToastIn .6s cubic-bezier(.34,1.56,.64,1)",
              boxShadow: `0 10px 36px color-mix(in srgb, ${vars.typography.green} 33%, transparent)`,
            }}
            role="status"
            aria-live="polite"
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: `color-mix(in srgb, ${vars.typography.green} 12%, transparent)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                color: vars.typography.green,
              }}
            >
              <svg
                viewBox="0 0 24 24"
                width={24}
                height={24}
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: vars.typography.green,
                  letterSpacing: 1.4,
                  textTransform: "uppercase",
                  marginBottom: 3,
                }}
              >
                {t("goal.eyebrow")}
              </div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: vars.typography.primary,
                  marginBottom: 2,
                  letterSpacing: -0.2,
                }}
              >
                {goalCelebration.title}
              </div>
              <div style={{ fontSize: 11, color: vars.typography.tertiary }}>
                {goalCelebration.sub}
              </div>
            </div>
          </div>
        )}

        {ach && (
          <div
            style={{
              position: "absolute",
              bottom: 14,
              left: 12,
              right: 12,
              background: vars.background.surface,
              border: `1.5px solid ${ach.co}55`,
              borderRadius: 14,
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              gap: 11,
              zIndex: 100,
              animation: "achIn .4s cubic-bezier(.34,1.56,.64,1)",
              boxShadow: `0 8px 32px ${ach.co}44`,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 11,
                background: `${ach.co}18`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                flexShrink: 0,
              }}
            >
              {ach.e}
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: ach.co,
                  letterSpacing: 1.2,
                  textTransform: "uppercase",
                  marginBottom: 2,
                }}
              >
                {t("xp.achievementUnlocked")}
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: vars.typography.primary,
                  marginBottom: 2,
                }}
              >
                {achName(ach.id, lang)}
              </div>
              <div style={{ fontSize: 10, color: vars.typography.tertiary }}>
                {achDescription(ach.id, lang)}
              </div>
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: ach.co,
                fontFamily: MONO,
                background: `${ach.co}18`,
                borderRadius: 7,
                padding: "4px 9px",
              }}
            >
              +{ach.xp} XP
            </div>
          </div>
        )}
      </div>
      {modeOverlay}
    </>
  );
}
