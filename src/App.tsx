import { useEffect, useMemo, useRef, useState } from "react";
import { LoginScreen } from "./components/LoginScreen";
import { FlameIcon } from "./icons/FlameIcon";
import { Combobox } from "./components/Combobox";
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
import { formatLocalDate, mondayOf } from "./lib/date";
import {
  fmtClock,
  fmtHours,
  parseHoursInput,
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
import { buildIntroSteps } from "./lib/introSteps";
import { smartDate } from "./lib/smartDate";
import { ActivityRing, Spinner } from "./primitives";
import { SunIcon } from "./icons/SunIcon";
import { MoonIcon } from "./icons/MoonIcon";
import { PauseIcon } from "./icons/PauseIcon";
import { PlayIcon } from "./icons/PlayIcon";
import { StopIcon } from "./icons/StopIcon";
import { XIcon } from "./icons/XIcon";
import { PlusIcon } from "./icons/PlusIcon";
import { PencilIcon } from "./icons/PencilIcon";
import { AppHeader } from "./components/AppHeader";
import { PageEyebrow } from "./components/PageEyebrow";
import { ChapterHeading } from "./components/ChapterHeading";
import { IntroOverlay } from "./components/IntroOverlay";
import { MeetingsWidget } from "./components/MeetingsWidget";
import { MonthView } from "./components/MonthView";
import { WeekView } from "./components/WeekView";
import { useMonthClosure } from "./lib/useMonthClosure";
import {
  light as L,
  dark as D,
  type Theme,
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
  const M: Theme = mode === "light" ? L : D;
  const [tab, setTab] = useState<"today" | "timer" | "history" | "xp">("today");
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
  const [saveToast, setSaveToast] = useState<{
    cheer: string;
    hours: string;
    xp: number;
  } | null>(null);
  const fid = useRef(0);

  // Timer state
  const [tSec, setTSec] = useState(0);
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

  // Log form state
  const [fCo, setFCo] = useState("");
  const [fPr, setFPr] = useState("");
  const [fH, setFH] = useState(1);
  const [fD, setFD] = useState("");
  const [fNote, setFNote] = useState("");
  const [fInv, setFInv] = useState(true);
  const [fHInput, setFHInput] = useState("1:00");
  useEffect(() => {
    setFHInput(fmtHours(fH));
  }, [fH]);
  const [logFormLoaded, setLogFormLoaded] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDate, setEditingDate] = useState<Date | null>(null);
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

  const resetLogForm = () => {
    setEditingId(null);
    setEditingDate(null);
    setFCo("");
    setFPr("");
    setFH(1);
    setFD("");
    setFNote("");
    setFInv(true);
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
  ) => {
    const applySwitch = async () => {
      await ensureProjects(cid);
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
        setTRun(false);
      }
      setTab("timer");
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
    setFCo("");
    setFPr("");
    setFH(1);
    setFHInput("1:00");
    setFD("");
    setFNote("");
    setFInv(true);
    setEditingId(null);
    setEditingDate(null);
    setDraftId(null);
    setSessionXp(0);
    setCurrentUser(null);
    setTimerLoaded(false);
    setLogFormLoaded(false);
  }, [authed]);

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
    r.setProperty("--rec-color", M.pk);
    r.setProperty("--scrollbar-thumb", M.b1);
    r.setProperty("--select-bg", M.bg);
    r.setProperty("--select-fg", M.t1);
  }, [M]);
  useEffect(() => {
    if (!authed || introChecked) return;
    window.electronAPI.storeGet("intro_seen").then((seen) => {
      if (!seen) {
        setShowIntro(true);
        setIntroStep(0);
        if (size !== "full") goSize("full");
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


  const emptyMsg = useMemo(() => emptyTodayMessage(lang), [nowTick, lang]);

  const tCoEmpty = !tCo;
  const tPrEmpty = !tPr;
  const tDEmpty = !tD.trim();
  useEffect(() => {
    if (!currentUser) return;
    const first = currentUser.username.trim().split(/\s+/)[0] || "";
    const compute = () =>
      setTimerInsight(
        getTimerInsight({
          tRun,
          tSec,
          tCo,
          tPr,
          tD,
          todayH,
          goal: GOAL,
          entriesToday: entries.length,
          streak,
          firstName: first,
          lang,
        }),
      );
    compute();
    const id = window.setInterval(compute, 2 * 60 * 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tRun, tCoEmpty, tPrEmpty, tDEmpty, entries.length, currentUser, lang]);

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
      tSec: tRun ? 0 : tSec,
      running: tRun,
      startedAt: tRun ? Date.now() - tSec * 1000 : null,
      draftId,
    });
  }, [authed, timerLoaded, tCo, tPr, tD, tNote, tInv, tRun, draftId]);

  // Persist Log form fields too so manual-log inputs survive app restarts.
  useEffect(() => {
    if (!authed) return;
    (async () => {
      const f = await window.electronAPI.storeGet("logForm");
      if (f && typeof f === "object") {
        setFCo(f.fCo || "");
        setFPr(f.fPr || "");
        setFH(typeof f.fH === "number" ? f.fH : 1);
        setFD(f.fD || "");
        setFNote(f.fNote || "");
        setFInv(typeof f.fInv === "boolean" ? f.fInv : true);
        if (f.fCo)
          loadProjects(f.fCo)
            .then((list) => setProjectCache((c) => ({ ...c, [f.fCo]: list })))
            .catch(() => {});
      }
      setLogFormLoaded(true);
    })();
  }, [authed]);

  useEffect(() => {
    if (!authed || !logFormLoaded) return;
    window.electronAPI.storeSet("logForm", { fCo, fPr, fH, fD, fNote, fInv });
  }, [authed, logFormLoaded, fCo, fPr, fH, fD, fNote, fInv]);

  // ─── Load companies once authed ────────────────────────────────────────
  useEffect(() => {
    if (!authed) return;
    loadCompanies()
      .then(setCompanies)
      .catch(() => {});
  }, [authed]);

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
  const todayI = useMemo(() => {
    const now = new Date();
    const mon = mondayOf(now);
    return Math.max(0, Math.min(4, Math.floor((+now - +mon) / 86400000)));
  }, [nowTick]);
  const todayH = useMemo(
    () => entries.reduce((s, e) => s + parseFloat(e.hour || "0"), 0),
    [entries],
  );
  const weekTotal = useMemo(() => weekH.reduce((s, h) => s + h, 0), [weekH]);

  const xpIntoLevel = xp % 1000;
  const xpRemainingBucket = xpIntoLevel >= 950 ? 'near' : xpIntoLevel >= 750 ? 'late' : xpIntoLevel >= 400 ? 'mid' : xpIntoLevel > 0 ? 'fresh' : 'idle';
  const streakHigh = streak >= 7;
  const weekStrong = weekTotal >= 30;
  useEffect(() => {
    if (!currentUser) return;
    const first = currentUser.username.trim().split(/\s+/)[0] || "";
    const compute = () =>
      setXpCoach(
        xpCoachNote({
          xp,
          xpIntoLevel,
          xpPerLevel: 1000,
          streak,
          weekTotal,
          firstName: first,
          lang,
        }),
      );
    compute();
    const id = window.setInterval(compute, 60 * 60 * 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, lang, xpRemainingBucket, streakHigh, weekStrong]);

  const done = todayH >= GOAL;
  const gpct = Math.min((todayH / GOAL) * 100, 100);

  // Live total for the displayed clock: saved hours + the unsaved running
  // timer, so the Today clock ticks up while the timer runs. `done`/celebration
  // above stay on saved hours so the confetti only fires on a real logged 8h.
  const liveTodayH = todayH + (tSec > 0 ? tSec / 3600 : 0);
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
    const list = await loadProjects(cid);
    setProjectCache((c) => ({ ...c, [cid]: list }));
    return list;
  };

  const addFloat = (txt: string, col: string) => {
    const id = ++fid.current;
    setFloats((f) => [...f, { id, txt, col }]);
    setTimeout(() => setFloats((f) => f.filter((x) => x.id !== id)), 1500);
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
    let saved: { success: boolean; id?: string } | undefined;
    try {
      saved = await saveTimeEntry(payload);
    } catch (err: any) {
      if (err.message === "NOT_AUTHENTICATED") {
        setAuthed(false);
        return;
      }
      addFloat(
        t("form.saveFailed", { err: err.message || "unknown" }),
        "#ef4444",
      );
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
    try {
      await deleteTimeEntry(id);
      setEntries((es) => es.filter((e) => e.id !== id));
    } catch (err: any) {
      addFloat(
        t("form.deleteFailed", { err: err.message || "unknown" }),
        "#ef4444",
      );
    }
  };

  // Group entries by company for Today view
  const groups = useMemo(() => {
    const g: Record<string, { cid: string; h: number; entries: TimeEntry[] }> =
      {};
    entries.forEach((e) => {
      const key = e.company;
      if (!g[key]) g[key] = { cid: e._company_id, h: 0, entries: [] };
      g[key].h = +(g[key].h + parseFloat(e.hour || "0")).toFixed(2);
      g[key].entries.push(e);
    });
    return g;
  }, [entries]);

  // Vanilla-extract theme class — applied to every top-level return so CSS
  // custom properties resolve correctly in both early-return branches and the
  // main app render.
  const themeClass = mode === "dark" ? darkTheme : lightTheme;

  const spinner = (
    <Spinner layout="fill" label={t("form.loadingProjects")} className={themeClass} />
  );
  if (authed === null) return spinner;
  if (!authed)
    return (
      <div className={themeClass}>
        <LoginScreen onLogin={() => window.electronAPI.openAuth()} />
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
    <AppHeader
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
      onMinimize={() => goSize("top")}
    />
  );

  // Progress bar is about today — nothing in the header navigates anymore.
  const pbarDate = new Date();
  const pbarHolidays = getHolidays(pbarDate.getFullYear());
  const pbarDayOff = !isWorkingDay(pbarDate, pbarHolidays);
  const pbarHolidayName = pbarHolidays.get(
    `${pbarDate.getFullYear()}-${String(pbarDate.getMonth() + 1).padStart(2, "0")}-${String(pbarDate.getDate()).padStart(2, "0")}`,
  );

  const streakBadge =
    streak > 0 ? (
      <span
        className={justBumpedStreak ? "streak-pop" : undefined}
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: M.pk,
          fontFamily: '"JetBrains Mono",ui-monospace,monospace',
          display: "inline-flex",
          alignItems: "center",
          gap: 3,
        }}
      >
        <FlameIcon size={12} />
        {streak}d
      </span>
    ) : null;

  const pbar = pbarDayOff ? (
    <div
      style={{
        padding: "10px 14px 10px",
        borderBottom: `1px solid ${M.s2}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 10,
      }}
    >
      <span style={{ fontSize: 11, color: M.t3 }}>
        {t("today.hoursLogged", { hours: fmtHours(todayH) })}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {streakBadge}
        <span style={{ fontSize: 11, fontWeight: 700, color: M.t3 }}>
          {pbarHolidayName
            ? `🎉 ${pbarHolidayName}`
            : `🌴 ${lang === "sv" ? "Ledig dag" : "Day off"}`}
        </span>
      </div>
    </div>
  ) : (
    <div
      style={{ padding: "10px 14px 10px", borderBottom: `1px solid ${M.s2}` }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 6,
          gap: 10,
        }}
      >
        <span style={{ fontSize: 11, color: M.t3 }}>
          {t("today.hoursLogged", { hours: fmtHours(todayH) })}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {streakBadge}
          <span
            style={{ fontSize: 11, fontWeight: 700, color: done ? M.gn : M.t2 }}
          >
            {done
              ? t("today.goalReached")
              : t("today.toGo", { hours: fmtHours(GOAL - todayH) })}
          </span>
        </div>
      </div>
      <div
        style={{
          height: 5,
          background: M.s2,
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${gpct}%`,
            background: done ? M.gn : M.ac,
            borderRadius: 3,
            transition: "width .5s",
          }}
        />
      </div>
    </div>
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
    const holidayMap = getHolidays(todayDate.getFullYear());
    const holidayKey = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, "0")}-${String(todayDate.getDate()).padStart(2, "0")}`;
    const holidayName = holidayMap.get(holidayKey);
    const isDayOff = !isWorkingDay(todayDate, holidayMap);
    const isSat = todayDate.getDay() === 6;
    const emoji = isDayOff
      ? holidayName
        ? "🎉"
        : isSat
          ? "🌴"
          : "🌴"
      : hr >= 5 && hr < 12
        ? "☀️"
        : hr >= 12 && hr < 17
          ? "🌤️"
          : hr >= 17 && hr < 22
            ? "🌆"
            : "🌙";
    const subtitle = isDayOff
      ? holidayName
        ? t("today.dayOffHoliday", { holiday: holidayName })
        : t("today.dayOff")
      : done
        ? t("today.goalReachedLine")
        : t("today.leftToHit", { hours: fmtHours(GOAL - todayH), goal: GOAL });

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
    const todayBillableH = entries.reduce(
      (s, e) => s + (e.invoice === "1" ? parseFloat(e.hour) : 0),
      0,
    );
    const todayBillablePct =
      todayH > 0 ? Math.round((todayBillableH / todayH) * 100) : 0;
    const todayXp = entries.reduce(
      (s, e) => s + Math.round(10 + parseFloat(e.hour) * 8),
      0,
    );

    return (
      <div style={{ paddingBottom: 24 }}>
        {firstName && (
          <div style={{ padding: "16px 14px 4px" }}>
            <div
              style={{
                fontFamily: '"Instrument Serif","Georgia",serif',
                fontStyle: "italic",
                fontSize: 22,
                color: M.t1,
                letterSpacing: -0.3,
                lineHeight: 1.15,
              }}
            >
              {greeting}, {firstName}.
            </div>
            {greetingMsg && (
              <div
                style={{
                  fontFamily: '"Instrument Serif","Georgia",serif',
                  fontStyle: "italic",
                  fontSize: 14,
                  color: M.ac,
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
        <PageEyebrow
          title={t("page.today")}
          hint={t("today.eyebrowHint", { week: isoWeek, day: dayNum })}
          M={M}
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
                fontFamily: '"Instrument Serif","Georgia",serif',
                fontSize: 90,
                fontWeight: 400,
                color: liveDone ? M.gn : M.t1,
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
                  color: liveDone ? M.gn : M.ac,
                  marginLeft: 4,
                }}
              >
                h
              </span>
            </div>
            <div
              style={{
                marginTop: 16,
                fontFamily: '"JetBrains Mono",ui-monospace,monospace',
                fontSize: 12,
                color: M.t3,
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
            <div
              className={`engrave-card${justBumpedStreak ? " streak-pop" : ""}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px 6px 9px",
                borderRadius: 999,
                background: M.pb,
                border: `1px solid ${M.pp}`,
                color: M.pk,
              }}
            >
              <FlameIcon size={11} />
              <span
                style={{
                  fontFamily: '"JetBrains Mono",ui-monospace,monospace',
                  fontSize: 11,
                  fontWeight: 700,
                  color: M.pk,
                  letterSpacing: 0.3,
                }}
              >
                {streak}
              </span>
              <span
                style={{
                  fontFamily: '"JetBrains Mono",ui-monospace,monospace',
                  fontSize: 9,
                  fontWeight: 600,
                  color: M.t3,
                  textTransform: "uppercase",
                  letterSpacing: 1.4,
                }}
              >
                {t("today.stat.streak")}
              </span>
            </div>
            <div
              className="engrave-card"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px 6px 9px",
                borderRadius: 999,
                background: M.gb,
                border: `1px solid ${M.gd}`,
                color: M.gn,
              }}
            >
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
              <span
                style={{
                  fontFamily: '"JetBrains Mono",ui-monospace,monospace',
                  fontSize: 11,
                  fontWeight: 700,
                  color: M.gn,
                  letterSpacing: 0.3,
                }}
              >
                {todayBillablePct}%
              </span>
              <span
                style={{
                  fontFamily: '"JetBrains Mono",ui-monospace,monospace',
                  fontSize: 9,
                  fontWeight: 600,
                  color: M.t3,
                  textTransform: "uppercase",
                  letterSpacing: 1.4,
                }}
              >
                {t("today.stat.billable")}
              </span>
            </div>
           </div>
            <div
              className="engrave-card"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px 6px 11px",
                borderRadius: 999,
                background: `${M.ac}14`,
                border: `1px solid ${M.ac}33`,
              }}
            >
              <span
                style={{
                  fontFamily: '"JetBrains Mono",ui-monospace,monospace',
                  fontSize: 11,
                  fontWeight: 700,
                  color: M.ac,
                  letterSpacing: 0.3,
                }}
              >
                {todayXp}
              </span>
              <span
                style={{
                  fontFamily: '"JetBrains Mono",ui-monospace,monospace',
                  fontSize: 9,
                  fontWeight: 600,
                  color: M.t3,
                  textTransform: "uppercase",
                  letterSpacing: 1.4,
                }}
              >
                {t("today.stat.xpToday")}
              </span>
            </div>
          </div>

          <MeetingsWidget
            onStartForMeeting={(title) => {
              setTD(title);
              setTab("timer");
            }}
          />

          <div style={{ height: 1, background: M.s2 }} />

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
                      fontFamily: '"Instrument Serif","Georgia",serif',
                      fontSize: 17,
                      lineHeight: 1.1,
                      color: M.co[gi % M.co.length],
                      letterSpacing: -0.1,
                    }}
                  >
                    {co}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: M.t3,
                      fontFamily: '"JetBrains Mono",ui-monospace,monospace',
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
                    return (
                      <div
                        key={e.id}
                        style={{ display: "flex", flexDirection: "column" }}
                      >
                        <div
                          className="entry-card"
                          onDoubleClick={() => editEntry(e)}
                          title={t("entry.doubleClickEdit")}
                          style={{
                            background: M.s1,
                            border: `1px solid ${isPending ? "#ef4444" : M.b1}`,
                            borderRadius: 11,
                            padding: "9px 11px",
                            borderBottomLeftRadius: isPending ? 0 : 11,
                            borderBottomRightRadius: isPending ? 0 : 11,
                            borderBottom: isPending
                              ? "none"
                              : `1px solid ${M.b1}`,
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
                                  color: M.t3,
                                  marginBottom: 2,
                                }}
                              >
                                {e.project}
                              </div>
                              <div
                                style={{
                                  fontSize: 12,
                                  color: M.t1,
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
                                    color: M.t3,
                                    marginTop: 4,
                                    fontStyle: "italic",
                                  }}
                                >
                                  {e.internal_description}
                                </div>
                              )}
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
                                  fontFamily: '"JetBrains Mono",ui-monospace,monospace',
                                  fontSize: 12,
                                  fontWeight: 700,
                                  color: M.ac,
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
                                      ? `${M.ac}26`
                                      : "transparent",
                                  color: e.invoice === "1" ? M.ac : M.tf,
                                  border: `1px solid ${e.invoice === "1" ? `${M.ac}55` : M.b1}`,
                                }}
                              >
                                {e.invoice === "1" ? "Billable" : "Internal"}
                              </span>
                              {(() => {
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
                                      background: isActive ? M.pk : M.btn,
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
                              <button
                                onClick={() =>
                                  setPendingDeleteId(isPending ? null : e.id)
                                }
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: isPending ? "#ef4444" : M.t3,
                                  fontSize: 12,
                                  cursor: "pointer",
                                  padding: "2px 4px",
                                  fontWeight: isPending ? 700 : 400,
                                }}
                              >
                                ✕
                              </button>
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
                                background: M.s2,
                                border: "none",
                                color: M.t2,
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
                <div style={{ color: M.t2, fontWeight: 600, marginBottom: 4 }}>
                  {emptyMsg}
                </div>
                <div style={{ color: M.tf, fontSize: 11 }}>
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
              borderTop: `1px solid ${M.s2}`,
            }}
          >
            <span style={{ fontSize: 12, color: M.t3 }}>
              {t("today.totalLabel")}
            </span>
            <span
              style={{
                fontSize: 17,
                fontWeight: 700,
                color: done ? M.gn : M.ac,
                fontFamily: '"JetBrains Mono",ui-monospace,monospace',
              }}
            >
              {fmtHours(todayH)}
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
                border: `1px solid ${M.b1}`,
                color: M.t2,
                cursor: "pointer",
                fontFamily: '"JetBrains Mono",ui-monospace,monospace',
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
      <div
        style={{
          padding: "16px 14px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          minHeight: "100%",
        }}
      >
        <div style={{ margin: "-16px -14px 4px" }}>
          <PageEyebrow title={t("page.timer")} hint={timerHint} M={M} />
        </div>

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
              background: M.ad,
              border: `1px solid ${M.b1}`,
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
                  fontFamily: '"JetBrains Mono",ui-monospace,monospace',
                  fontSize: 8,
                  fontWeight: 700,
                  color: M.tf,
                  textTransform: "uppercase",
                  letterSpacing: 1.6,
                  flexShrink: 0,
                }}
              >
                {t("timer.mainPaused")}
              </span>
              <span
                style={{
                  fontFamily: '"Instrument Serif","Georgia",serif',
                  fontStyle: "italic",
                  fontSize: 15,
                  color: M.at,
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
                  fontFamily: '"JetBrains Mono",ui-monospace,monospace',
                  fontSize: 11,
                  fontWeight: 700,
                  color: M.t2,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {fmtClock(stashedTimer.sec)}
              </span>
              <span
                style={{
                  fontFamily: '"JetBrains Mono",ui-monospace,monospace',
                  fontSize: 8,
                  fontWeight: 700,
                  color: M.ac,
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
          <ActivityRing
            progress={GOAL > 0 ? todayH / GOAL : 0}
            done={done}
            size={210}
            stroke={3}
            withTicks
          >
            <div style={{ textAlign: "center", padding: "0 8px" }}>
              <div
                style={{
                  fontFamily: '"Instrument Serif","Georgia",serif',
                  fontSize: 38,
                  fontWeight: 400,
                  color: tRun ? M.t1 : M.t3,
                  letterSpacing: -1.5,
                  lineHeight: 0.95,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {fmtClock(tSec)}
              </div>
              <div
                style={{
                  fontFamily: '"JetBrains Mono",ui-monospace,monospace',
                  fontSize: 8,
                  color: tRun ? M.pk : M.tf,
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
                      background: M.pk,
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
          </ActivityRing>
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
                  background: M.s1,
                  border: `1px solid ${M.b1}`,
                  color: M.t1,
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
                  background: M.btn,
                  color: "#fff",
                  boxShadow: M.bsh,
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
                  fontFamily: '"Instrument Serif","Georgia",serif',
                  fontStyle: "italic",
                  fontSize: 15,
                  color: M.t3,
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
              fontFamily: '"Instrument Serif","Georgia",serif',
              fontStyle: "italic",
              fontSize: 13,
              color: M.tf,
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
                fontFamily: '"Instrument Serif","Georgia",serif',
                fontStyle: "italic",
                fontSize: 14,
                color: M.pk,
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
                    border: `1px solid ${M.b1}`,
                    borderRadius: 999,
                    color: M.t1,
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
                    background: M.btn,
                    border: "1px solid transparent",
                    borderRadius: 999,
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: 1.4,
                    textTransform: "uppercase",
                    cursor: "pointer",
                    boxShadow: M.bsh,
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
                  background: M.btn,
                  border: "1px solid transparent",
                  borderRadius: 999,
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: 1.4,
                  textTransform: "uppercase",
                  cursor: "pointer",
                  boxShadow: M.bsh,
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
            <div style={{ flex: 1, height: 1, background: M.b1 }} />
            <span
              style={{
                fontSize: 10,
                color: M.t2,
                fontWeight: 700,
                letterSpacing: 1.4,
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              {t("timer.whatWorking")}
            </span>
            <div style={{ flex: 1, height: 1, background: M.b1 }} />
          </div>

          <div data-tour="timer-company">
            <Combobox
              value={tCo}
              items={companies}
              placeholder={`${t("form.searchClient")} (${companies.length})`}
                onChange={async (id) => {
                setTCo(id);
                setTPr("");
                if (id) await ensureProjects(id);
              }}
            />
          </div>

          {tCo && (
            <div data-tour="timer-project">
              <Combobox
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
          )}

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
                  borderBottom: `1px solid ${tD.trim() ? M.ac : M.b1}`,
                  borderRadius: 8,
                  color: M.t1,
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
                          border: `1px solid ${M.b1}`,
                          color: M.t3,
                          fontFamily: '"Instrument Serif","Georgia",serif',
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
                  borderBottom: `1px solid ${M.b1}`,
                  borderRadius: 8,
                  color: M.t1,
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
                    color: M.t2,
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
                    background: tInv ? M.ac : M.b1,
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
                background: M.btn,
                border: "none",
                color: "#fff",
                cursor: "pointer",
                fontFamily: '"JetBrains Mono",ui-monospace,monospace',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1.4,
                textTransform: "uppercase",
                boxShadow: M.bsh,
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
                fontFamily: '"Instrument Serif","Georgia",serif',
                fontSize: 24,
                color: M.t1,
                letterSpacing: -0.3,
                lineHeight: 1.1,
              }}
            >
              {coObj?.name}
            </div>
            {prObj?.name && (
              <div
                style={{
                  fontFamily: '"JetBrains Mono",ui-monospace,monospace',
                  fontSize: 10,
                  color: M.tf,
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
                  fontFamily: '"Instrument Serif","Georgia",serif',
                  fontStyle: "italic",
                  fontSize: 15,
                  color: M.t3,
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
                  border: `1px solid ${M.b1}`,
                  color: M.t3,
                  fontFamily: '"JetBrains Mono",ui-monospace,monospace',
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
                    border: `1px solid ${M.ac}55`,
                    color: M.ac,
                    fontFamily: '"JetBrains Mono",ui-monospace,monospace',
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
                border: `1px solid ${M.b1}`,
                color: M.t1,
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
                background: M.btn,
                border: "none",
                color: "#fff",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: M.bsh,
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
                  : `1px solid ${M.b1}`,
                color: pendingCancelTimer ? "#ef4444" : M.t3,
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
                border: `1px solid ${M.b1}`,
                borderRadius: 999,
                color: M.t2,
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
              borderTop: `1px solid ${M.b1}`,
              textAlign: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: '"Instrument Serif","Georgia",serif',
                  fontSize: 24,
                  color: M.t1,
                  lineHeight: 1,
                  letterSpacing: -0.4,
                }}
              >
                +{sessXP}
              </div>
              <div
                style={{
                  fontFamily: '"JetBrains Mono",ui-monospace,monospace',
                  fontSize: 8,
                  color: M.tf,
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
                  fontFamily: '"Instrument Serif","Georgia",serif',
                  fontSize: 24,
                  color: done ? M.gn : M.t1,
                  lineHeight: 1,
                  letterSpacing: -0.4,
                }}
              >
                {fmtHours(todayH)}
              </div>
              <div
                style={{
                  fontFamily: '"JetBrains Mono",ui-monospace,monospace',
                  fontSize: 8,
                  color: M.tf,
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
                  fontFamily: '"Instrument Serif","Georgia",serif',
                  fontSize: 24,
                  color: M.pk,
                  lineHeight: 1,
                  letterSpacing: -0.4,
                }}
              >
                {streak}
                <span style={{ fontSize: 16, opacity: 0.7 }}>d</span>
              </div>
              <div
                style={{
                  fontFamily: '"JetBrains Mono",ui-monospace,monospace',
                  fontSize: 8,
                  color: M.tf,
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
                  : `1px solid ${M.b1}`,
                color: pendingCancelTimer ? "#ef4444" : M.tf,
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

      </div>
    );
  })();

  // ─── Log view (full-tab; shown when logOpen=true, no tab button) ───────
  const logView = (() => {
    const recent: TimeEntry[] = [];
    const seen = new Set<string>();
    entries.forEach((e) => {
      const k = e._company_id + ":" + e._project_id;
      if (!seen.has(k) && recent.length < 3) {
        seen.add(k);
        recent.push(e);
      }
    });
    const prList = projectCache[fCo] || [];
    const prObj = prList.find((p) => p.id === fPr);
    const co = companies.find((c) => c.id === fCo);
    const pickedDate = editingDate ?? selectedDate;
    const save = async () => {
      if (!fCo || !fPr || !fD.trim()) {
        addFloat(t("form.fillFirst"), "#ef4444");
        return;
      }
      if (!co || !prObj) {
        addFloat(
          t("form.saveFailed", { err: "missing client/project" }),
          "#ef4444",
        );
        return;
      }
      // Commit any pending input by parsing fHInput so a user who clicks Save
      // without blurring the hours input still gets their typed value saved.
      const parsed = parseHoursInput(fHInput);
      const liveHours = parsed == null ? fH : Math.max(0, Math.min(24, parsed));
      await saveNewEntry(
        fCo,
        fPr,
        liveHours,
        fD,
        fInv,
        fNote.trim(),
        pickedDate,
        editingId,
      );
      resetLogForm();
      setLogOpen(false);
    };
    const canSave = !!(fCo && fPr && fD.trim());

    return (
      <div
        style={{
          padding: "15px 14px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 11,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <button
            onClick={() => {
              resetLogForm();
              setLogOpen(false);
            }}
            title={t("form.back")}
            style={{
              background: M.s2,
              border: `1px solid ${M.b1}`,
              color: M.t2,
              borderRadius: 999,
              padding: "6px 12px",
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            ← {t("form.back")}
          </button>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: editingId ? M.at : M.t2,
              letterSpacing: 0.5,
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              flex: 1,
              textAlign: "right",
            }}
          >
            {editingId
              ? t("form.editingEntryOn", {
                  date: pickedDate.toLocaleDateString(locale, {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  }),
                })
              : t("timer.logPastTime")}
          </span>
        </div>

        <div>
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: M.t3,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            {t("timer.logFormDate")}
          </div>
          <input
            type="date"
            value={formatLocalDate(pickedDate)}
            onChange={(e) => {
              const [y, m, d] = e.target.value.split("-").map(Number);
              if (
                !Number.isFinite(y) ||
                !Number.isFinite(m) ||
                !Number.isFinite(d)
              )
                return;
              const next = new Date(y, m - 1, d);
              if (editingId) setEditingDate(next);
              else setSelectedDate(next);
            }}
            style={{
              width: "100%",
              padding: "11px 12px",
              background: M.s1,
              border: `1px solid ${M.b1}`,
              borderRadius: 10,
              color: M.t1,
              fontSize: 13,
              outline: "none",
            }}
          />
        </div>

        {recent.length > 0 && !editingId && (
          <div>
            <div
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: M.t3,
                letterSpacing: 1.2,
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              {t("today.recent")}
            </div>
            <div style={{ fontSize: 11, color: M.tf, marginBottom: 8 }}>
              {t("today.opensTimer")}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {recent.map((r, i) => (
                <div
                  key={r.id}
                  style={{
                    background: M.s1,
                    border: `1px solid ${M.b1}`,
                    borderRadius: 12,
                    padding: "10px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: M.co[i % M.co.length],
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: M.t1,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {r.company}
                    </div>
                    <div style={{ fontSize: 11, color: M.t3, marginTop: 2 }}>
                      {r.project}
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      switchTaskGuarded(
                        r._company_id,
                        r._project_id,
                        r.description,
                      )
                    }
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      background: M.btn,
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      boxShadow: M.bsh,
                    }}
                  >
                    <svg
                      width="11"
                      height="13"
                      viewBox="0 0 13 15"
                      fill="none"
                      style={{ marginLeft: 2 }}
                    >
                      <path
                        d="M1.5 1.5L11.5 7.5L1.5 13.5V1.5Z"
                        fill="white"
                        stroke="white"
                        strokeWidth="1.2"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1, height: 1, background: M.b1 }} />
          <span
            style={{
              fontSize: 10,
              color: M.t3,
              whiteSpace: "nowrap",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            {t("today.orLogManually")}
          </span>
          <div style={{ flex: 1, height: 1, background: M.b1 }} />
        </div>

        <div>
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: M.t3,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            {t("form.client")}
          </div>
          <Combobox
            value={fCo}
            items={companies}
            placeholder={`${t("form.searchClient")} (${companies.length})`}
            onChange={async (id) => {
              setFCo(id);
              setFPr("");
              if (id) await ensureProjects(id);
            }}
          />
        </div>

        {fCo && (
          <div>
            <div
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: M.t3,
                letterSpacing: 1.2,
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              {t("form.project")}
            </div>
            <Combobox
              value={fPr}
              items={prList}
              placeholder={
                prList.length
                  ? `${t("form.searchProject")} (${prList.length})`
                  : t("form.loadingProjects")
              }
                onChange={setFPr}
            />
          </div>
        )}

        <div data-tour="log-hours">
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: M.t3,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            {t("form.hours")}
          </div>
          <div
            style={{
              background: M.s1,
              border: `1px solid ${M.b1}`,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              overflow: "hidden",
            }}
          >
            <button
              onClick={() =>
                setFH((h) => Math.max(0.25, +(h - 0.25).toFixed(2)))
              }
              style={{
                width: 46,
                height: 46,
                background: "transparent",
                border: "none",
                borderRight: `1px solid ${M.b1}`,
                color: M.t3,
                fontSize: 20,
                fontWeight: 200,
                cursor: "pointer",
              }}
            >
              −
            </button>
            <input
              value={fHInput}
              onChange={(e) => setFHInput(e.target.value)}
              onBlur={() => {
                const parsed = parseHoursInput(fHInput);
                if (parsed == null) {
                  setFHInput(fmtHours(fH));
                  return;
                }
                const clamped = Math.max(0, Math.min(24, parsed));
                setFH(clamped);
                setFHInput(fmtHours(clamped));
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter")
                  (e.currentTarget as HTMLInputElement).blur();
              }}
              onFocus={(e) => e.currentTarget.select()}
              style={{
                flex: 1,
                textAlign: "center",
                fontFamily: '"JetBrains Mono",ui-monospace,monospace',
                fontSize: 22,
                fontWeight: 700,
                color: M.t1,
                letterSpacing: -1,
                background: "transparent",
                border: "none",
                outline: "none",
                width: "100%",
                padding: 0,
              }}
            />
            <button
              onClick={() => setFH((h) => Math.min(24, +(h + 0.25).toFixed(2)))}
              style={{
                width: 46,
                height: 46,
                background: "transparent",
                border: "none",
                borderLeft: `1px solid ${M.b1}`,
                color: M.t3,
                fontSize: 20,
                fontWeight: 200,
                cursor: "pointer",
              }}
            >
              +
            </button>
          </div>
          <div
            style={{
              textAlign: "center",
              marginTop: 4,
              fontSize: 11,
              color: M.t3,
            }}
          >
            {t("form.typeHoursHint")}
          </div>
          {prObj && parseFloat(prObj.hour_price) > 0 && (
            <div
              style={{
                textAlign: "center",
                marginTop: 4,
                fontSize: 11,
                color: M.t3,
                fontFamily: '"JetBrains Mono",ui-monospace,monospace',
              }}
            >
              {(fH * parseFloat(prObj.hour_price)).toFixed(0)} kr total ·{" "}
              {parseFloat(prObj.hour_price)}kr/h
            </div>
          )}
        </div>

        <div>
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: M.t3,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            {t("form.description")} *
          </div>
          <textarea
            value={fD}
            onChange={(e) => setFD(e.target.value)}
            placeholder={t("form.descPlaceholder")}
            rows={2}
            style={{
              width: "100%",
              padding: "11px 12px",
              background: M.s1,
              border: `1px solid ${M.b1}`,
              borderRadius: 10,
              color: M.t1,
              fontSize: 13,
              outline: "none",
              resize: "none",
            }}
          />
        </div>

        <div>
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: M.t3,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            {lang === "sv" ? "Interna anteckningar" : "Internal notes"}{" "}
            <span
              style={{
                color: M.tf,
                fontWeight: 400,
                letterSpacing: 0,
                textTransform: "none",
                fontSize: 10,
              }}
            >
              {t("form.internalOptional")}
            </span>
          </div>
          <textarea
            value={fNote}
            onChange={(e) => setFNote(e.target.value)}
            placeholder={t("form.internalPlaceholder")}
            rows={2}
            style={{
              width: "100%",
              padding: "11px 12px",
              background: M.s1,
              border: `1px solid ${M.b1}`,
              borderRadius: 10,
              color: M.t1,
              fontSize: 13,
              outline: "none",
              resize: "none",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 12px",
            background: M.s1,
            border: `1px solid ${M.b1}`,
            borderRadius: 10,
          }}
        >
          <button
            type="button"
            role="switch"
            aria-checked={fInv}
            aria-label={t("timer.invoiceable")}
            onClick={() => setFInv((v) => !v)}
            style={{
              width: 40,
              height: 22,
              borderRadius: 11,
              background: fInv ? M.ac : M.b1,
              display: "flex",
              alignItems: "center",
              padding: 2,
              cursor: "pointer",
              transition: "background .2s",
              border: "none",
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 9,
                background: "#fff",
                transform: `translateX(${fInv ? 18 : 0}px)`,
                transition: "transform .2s",
                boxShadow: "0 1px 4px rgba(0,0,0,.2)",
              }}
            />
          </button>
          <span style={{ fontSize: 13, color: M.t1 }}>
            {t("timer.invoiceable")}
          </span>
        </div>

        <button
          onClick={save}
          disabled={!canSave}
          style={{
            width: "100%",
            height: 46,
            background: canSave ? M.btn : M.s3,
            border: "none",
            borderRadius: 12,
            color: canSave ? "#fff" : M.t3,
            fontSize: 14,
            fontWeight: 700,
            cursor: canSave ? "pointer" : "default",
            boxShadow: canSave ? M.bsh : "none",
          }}
        >
          {editingId ? t("form.saveChanges") : t("form.saveEntry")}
        </button>
      </div>
    );
  })();

  // ─── XP view ───────────────────────────────────────────────────────────
  const xpView = (() => {
    const level = Math.floor(xp / 1000) + 1;
    const xpBase = (level - 1) * 1000;
    const xpNext = level * 1000;
    const pct = Math.min(((xp - xpBase) / (xpNext - xpBase)) * 100, 100);

    return (
      <div
        style={{
          padding: "14px 14px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div style={{ margin: "-14px -14px 4px" }}>
          <PageEyebrow
            title={t("page.progress")}
            hint={`${t("page.level")} ${level}`}
            M={M}
          />
        </div>
        {/* Level hero */}
        <div
          data-tour="xp-level"
          style={{
            textAlign: "center",
            padding: "8px 0 10px",
          }}
        >
          <div
            style={{
              fontFamily: '"JetBrains Mono",ui-monospace,monospace',
              fontSize: 9,
              fontWeight: 700,
              color: M.tf,
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            {t("page.level")}
          </div>
          <div
            style={{
              fontFamily: '"Instrument Serif","Georgia",serif',
              fontSize: 92,
              fontWeight: 400,
              color: M.t1,
              letterSpacing: -3,
              lineHeight: 0.9,
              margin: "4px 0 4px",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {level}
          </div>
          <div
            style={{
              fontFamily: '"Instrument Serif","Georgia",serif',
              fontStyle: "italic",
              fontSize: 16,
              color: M.t3,
              lineHeight: 1.3,
              letterSpacing: -0.1,
            }}
          >
            {level >= 5
              ? t("xp.titlePrincipal")
              : level >= 3
                ? t("xp.titleSenior")
                : t("xp.titleDev")}
          </div>
        </div>

        {/* XP progress bar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div
            style={{
              height: 2,
              background: M.b1,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${pct}%`,
                background: `linear-gradient(90deg, ${M.ac}, ${M.pk})`,
                transition: "width 500ms cubic-bezier(.22,1,.36,1)",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontFamily: '"JetBrains Mono",ui-monospace,monospace',
              fontSize: 10,
              color: M.t3,
              fontWeight: 600,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <span>{xp.toLocaleString()} XP</span>
            <span style={{ color: M.tf }}>
              {(xpNext - xp).toLocaleString()} {t("xp.toNext")}
            </span>
          </div>
        </div>

        {xpCoach && (
          <div
            style={{
              fontFamily: '"Instrument Serif","Georgia",serif',
              fontStyle: "italic",
              fontSize: 14,
              color: M.t3,
              lineHeight: 1.4,
              textAlign: "center",
              padding: "0 8px",
            }}
          >
            {xpCoach}
          </div>
        )}

        {/* Week bar chart */}
        <div
          style={{
            paddingTop: 14,
            borderTop: `1px solid ${M.b1}`,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
            }}
          >
            <span
              style={{
                fontFamily: '"JetBrains Mono",ui-monospace,monospace',
                fontSize: 9,
                fontWeight: 600,
                color: M.t3,
                letterSpacing: 2.2,
                textTransform: "uppercase",
              }}
            >
              {t("xp.thisWeek")}
            </span>
            <span
              style={{
                fontFamily: '"JetBrains Mono",ui-monospace,monospace',
                fontSize: 10,
                color: M.ac,
                fontWeight: 700,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              +{Math.round(weekTotal * 8).toLocaleString()} XP
            </span>
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "flex-end",
              height: 90,
            }}
          >
            {weekH.map((h, i) => {
              const isFut = i > todayI,
                isToday = i === todayI,
                empty = !isFut && h === 0;
              const p2 = isFut ? 0 : Math.min((h / GOAL) * 100, 100);
              const bc = h >= GOAL ? M.gn : isToday ? M.ac : "#d97706";
              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      width: "100%",
                      position: "relative",
                      display: "flex",
                      alignItems: "flex-end",
                    }}
                  >
                    {isFut ? (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          border: `1px dashed ${M.b1}`,
                          borderRadius: 4,
                        }}
                      />
                    ) : empty ? (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          border: "1px dashed rgba(239, 68, 68, 0.35)",
                          background: "rgba(239, 68, 68, 0.05)",
                          borderRadius: 4,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: `${p2}%`,
                          background: bc,
                          borderRadius: 4,
                          minHeight: 6,
                          outline: isToday ? `1.5px solid ${M.ac}` : "none",
                          outlineOffset: 1,
                        }}
                      />
                    )}
                  </div>
                  <span
                    style={{
                      fontFamily:
                        '"JetBrains Mono",ui-monospace,monospace',
                      fontSize: 8,
                      fontWeight: 700,
                      color: empty
                        ? "#ef4444"
                        : isToday
                          ? M.ac
                          : isFut
                            ? M.tf
                            : M.t2,
                      letterSpacing: 0.2,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {isFut ? "—" : fmtHours(h)}
                  </span>
                  <span
                    style={{
                      fontFamily:
                        '"JetBrains Mono",ui-monospace,monospace',
                      fontSize: 8,
                      fontWeight: isToday ? 700 : 600,
                      color: isToday ? M.ac : M.t3,
                      letterSpacing: 1.4,
                      textTransform: "uppercase",
                    }}
                  >
                    {DAYS[i]}
                  </span>
                </div>
              );
            })}
          </div>
          <div
            style={{
              fontFamily: '"Instrument Serif","Georgia",serif',
              fontStyle: "italic",
              fontSize: 13,
              color: M.t3,
              textAlign: "center",
              lineHeight: 1.4,
            }}
          >
            {t("xp.thisWeekLine", { hours: fmtHours(weekTotal) })}
          </div>
        </div>

        <div style={{ paddingTop: 14, borderTop: `1px solid ${M.b1}` }}>
          <ChapterHeading
            title={t("xp.achievements")}
            hint={`${unlocked.length} / ${ACHS.length}`}
          />
        </div>
        <div
          data-tour="xp-achievements"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 8,
          }}
        >
          {ACHS.map((a) => {
            const got = unlocked.includes(a.id);
            return (
              <div
                key={a.id}
                className="engrave-card"
                style={{
                  background: got
                    ? M.id === "dark"
                      ? `${a.co}14`
                      : `${a.co}0d`
                    : "transparent",
                  border: got
                    ? `1px solid ${a.co}55`
                    : `1px solid ${M.b1}`,
                  borderRadius: 10,
                  padding: "12px 6px 10px",
                  textAlign: "center",
                  opacity: got ? 1 : 0.45,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <div
                  style={{
                    fontSize: 22,
                    lineHeight: 1,
                    filter: got ? "none" : "grayscale(1)",
                  }}
                >
                  {a.e}
                </div>
                <div
                  style={{
                    fontFamily: '"Instrument Serif","Georgia",serif',
                    fontSize: 13,
                    color: got ? a.co : M.t3,
                    lineHeight: 1.15,
                    letterSpacing: -0.1,
                    marginTop: 2,
                  }}
                >
                  {got ? achName(a.id, lang) : t("xp.locked")}
                </div>
                {got && (
                  <div
                    style={{
                      fontFamily: '"JetBrains Mono",ui-monospace,monospace',
                      fontSize: 8,
                      fontWeight: 700,
                      color: a.co,
                      letterSpacing: 1.4,
                      textTransform: "uppercase",
                      marginTop: 2,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    +{a.xp} XP
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  })();

  const pickDayForView = (d: Date) => {
    setSelectedDate(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
    setHistoryScale("day");
  };
  const monthView = (
    <MonthView
      M={M}
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
    <WeekView
      M={M}
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

  const dayView = (() => {
    const dayGroups: Record<
      string,
      { cid: string; h: number; entries: TimeEntry[] }
    > = {};
    dayEntries.forEach((e) => {
      const key = e.company;
      if (!dayGroups[key])
        dayGroups[key] = { cid: e._company_id, h: 0, entries: [] };
      dayGroups[key].h = +(
        dayGroups[key].h + parseFloat(e.hour || "0")
      ).toFixed(2);
      dayGroups[key].entries.push(e);
    });
    const dayH = dayEntries.reduce((s, e) => s + parseFloat(e.hour || "0"), 0);
    const dateLabel = selectedDate.toLocaleDateString(locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    const dayClosed = monthClosure.isClosed(selectedDate.getFullYear(), selectedDate.getMonth()) === true;

    void dayClosed;
    const dayBillableH = dayEntries.reduce(
      (s, e) => s + (e.invoice === "1" ? parseFloat(e.hour) : 0),
      0,
    );
    const dayBillablePct = dayH > 0 ? Math.round((dayBillableH / dayH) * 100) : 0;
    const dayDate = smartDate(selectedDate, lang, t);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Editorial date label */}
        <div
          style={{
            fontFamily: '"Instrument Serif","Georgia",serif',
            fontStyle: "italic",
            fontSize: 22,
            color: M.t1,
            letterSpacing: -0.3,
            lineHeight: 1.15,
            textAlign: "center",
            paddingTop: 4,
          }}
        >
          {dayDate}
        </div>

        {/* Day hero */}
        {dayEntries.length > 0 && (
          <div style={{ textAlign: "center", padding: "6px 0 8px" }}>
            <div
              style={{
                fontFamily: '"Instrument Serif","Georgia",serif',
                fontSize: 74,
                fontWeight: 400,
                color: dayH >= GOAL ? M.gn : M.t1,
                letterSpacing: -2.4,
                lineHeight: 0.9,
                fontVariantNumeric: "tabular-nums",
                display: "inline-block",
              }}
            >
              {fmtHours(dayH).split(":")[0]}
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
                <span style={{ width: "0.085em", height: "0.085em", borderRadius: "50%", background: "currentColor" }} />
                <span style={{ width: "0.085em", height: "0.085em", borderRadius: "50%", background: "currentColor" }} />
              </span>
              {fmtHours(dayH).split(":")[1]}
              <span style={{ fontStyle: "italic", fontSize: 34, color: dayH >= GOAL ? M.gn : M.ac, marginLeft: 4 }}>h</span>
            </div>
            <div
              style={{
                marginTop: 10,
                fontFamily: '"JetBrains Mono",ui-monospace,monospace',
                fontSize: 10,
                color: M.t3,
                textTransform: "uppercase",
                letterSpacing: 2.2,
                fontWeight: 500,
              }}
            >
              {dayH >= GOAL
                ? `Day complete · ${dayBillablePct}% billable`
                : `${dayBillablePct}% billable · ${dayEntries.length} ${dayEntries.length === 1 ? "entry" : "entries"}`}
            </div>
          </div>
        )}

        {dayEntries.length === 0 && dayEntriesLoading && (
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
        {dayEntries.length === 0 && !dayEntriesLoading && (
          <div
            style={{
              textAlign: "center",
              padding: "28px 12px",
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            <div style={{ color: M.t2, fontWeight: 600, marginBottom: 4 }}>
              {t("history.noEntriesForDay")}
            </div>
            <div style={{ color: M.tf, fontSize: 11 }}>
              {t("history.emptyHint")}
            </div>
          </div>
        )}

        {(
          Object.entries(dayGroups) as [
            string,
            { cid: string; h: number; entries: TimeEntry[] },
          ][]
        ).map(([co, g], gi) => (
          <div key={co}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 8,
                paddingLeft: 12,
                position: "relative",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  top: 4,
                  bottom: 4,
                  width: 3,
                  borderRadius: 2,
                  background: M.co[gi % M.co.length],
                }}
              />
              <span
                style={{
                  fontFamily: '"Instrument Serif","Georgia",serif',
                  fontSize: 17,
                  color: M.co[gi % M.co.length],
                  letterSpacing: -0.1,
                  lineHeight: 1.1,
                }}
              >
                {co}
              </span>
              <span
                style={{
                  fontFamily: '"JetBrains Mono",ui-monospace,monospace',
                  fontSize: 11,
                  fontWeight: 600,
                  color: M.t2,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {fmtHours(g.h)}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {g.entries.map((e) => {
                const isPending = pendingDeleteId === e.id;
                return (
                  <div
                    key={e.id}
                    style={{ display: "flex", flexDirection: "column" }}
                  >
                    <div
                      onDoubleClick={() => editEntry(e)}
                      title={t("entry.doubleClickEdit")}
                      style={{
                        background: M.s1,
                        border: `1px solid ${isPending ? "#ef4444" : M.b1}`,
                        borderRadius: 11,
                        padding: "9px 11px",
                        borderBottomLeftRadius: isPending ? 0 : 11,
                        borderBottomRightRadius: isPending ? 0 : 11,
                        borderBottom: isPending ? "none" : `1px solid ${M.b1}`,
                        transition: "border-color .15s",
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
                              color: M.t3,
                              marginBottom: 2,
                            }}
                          >
                            {e.project}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: M.t1,
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
                                color: M.t3,
                                marginTop: 4,
                                fontStyle: "italic",
                              }}
                            >
                              {e.internal_description}
                            </div>
                          )}
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
                              fontFamily: '"JetBrains Mono",ui-monospace,monospace',
                              fontSize: 12,
                              fontWeight: 700,
                              color: M.ac,
                            }}
                          >
                            {fmtHours(parseFloat(e.hour))}
                          </span>
                          <button
                            onClick={() => editEntry(e)}
                            title={t("entry.doubleClickEdit")}
                            aria-label={t("entry.doubleClickEdit")}
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: "50%",
                              background: "transparent",
                              border: `1px solid ${M.b1}`,
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              padding: 0,
                              color: M.t2,
                              transition: "all .15s ease",
                            }}
                          >
                            <PencilIcon size={12} />
                          </button>
                          <button
                            onClick={() =>
                              setPendingDeleteId(isPending ? null : e.id)
                            }
                            aria-label={t("entry.delete")}
                            title={t("entry.delete")}
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: "50%",
                              background: isPending
                                ? "rgba(239,68,68,0.10)"
                                : "transparent",
                              border: isPending
                                ? "1px solid #ef4444"
                                : `1px solid ${M.b1}`,
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              padding: 0,
                              color: isPending ? "#ef4444" : M.t3,
                              transition: "all .15s ease",
                            }}
                          >
                            <XIcon size={12} />
                          </button>
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
                            background: M.s2,
                            border: "none",
                            color: M.t2,
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

        {dayEntries.length > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              paddingTop: 12,
              borderTop: `1px solid ${M.b1}`,
            }}
          >
            <span
              style={{
                fontFamily: '"JetBrains Mono",ui-monospace,monospace',
                fontSize: 9,
                color: M.tf,
                textTransform: "uppercase",
                letterSpacing: 2.2,
                fontWeight: 600,
              }}
            >
              {t("today.totalLabel")}
            </span>
            <span
              style={{
                fontFamily: '"Instrument Serif","Georgia",serif',
                fontSize: 22,
                color: dayH >= GOAL ? M.gn : M.t1,
                lineHeight: 1,
                letterSpacing: -0.4,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {fmtHours(dayH)}
            </span>
          </div>
        )}

        <button
          onClick={() => {
            const [y, mo, da] = [
              selectedDate.getFullYear(),
              selectedDate.getMonth(),
              selectedDate.getDate(),
            ];
            setEditingDate(new Date(y, mo, da));
            setLogOpen(true);
          }}
          aria-label={t("timer.logPastTime")}
          title={t("timer.logPastTime")}
          style={{
            alignSelf: "center",
            marginTop: 4,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "9px 18px 9px 14px",
            borderRadius: 999,
            background: "transparent",
            border: `1px solid ${M.b1}`,
            color: M.t2,
            cursor: "pointer",
            fontFamily: '"JetBrains Mono",ui-monospace,monospace',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 1.4,
            textTransform: "uppercase",
          }}
        >
          <PlusIcon size={13} />
          {t("today.logTime")}
        </button>
      </div>
    );
  })();

  const historyView = (
    <div
      style={{
        padding: "16px 14px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ margin: "-16px -14px 0" }}>
        <PageEyebrow
          title={t("page.history")}
          hint={t(`scale.${historyScale}` as "scale.week")}
          M={M}
        />
      </div>
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
                  background: isActive ? M.ac : "transparent",
                  color: isActive ? "#fff" : M.t3,
                  fontFamily: '"JetBrains Mono",ui-monospace,monospace',
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
              border: `1px solid ${M.b1}`,
              color: M.t2,
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
              border: `1px solid ${M.b1}`,
              color: M.t2,
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
                background: M.ac,
                border: "none",
                color: "#fff",
                fontFamily: '"JetBrains Mono",ui-monospace,monospace',
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
      {historyScale === "day"
        ? dayView
        : historyScale === "week"
          ? weekView
          : monthView}
    </div>
  );

  const views = {
    today: todayView,
    timer: timerView,
    history: historyView,
    xp: xpView,
  };

  const hasCtx = !!(tCo && tPr);
  const coObj = companies.find((c) => c.id === tCo);
  const prObj = (projectCache[tCo] || []).find((p) => p.id === tPr);

  const runningXpBonus = tRun ? Math.floor(tSec / 60) : 0;
  const displaySessionXp = sessionXp + runningXpBonus;

  const modeOverlay = (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        background: M.bg,
        zIndex: 999,
        pointerEvents: modeTransition === "out" ? "auto" : "none",
        opacity: modeTransition === "out" ? 1 : 0,
        transition: "opacity 180ms ease-out",
      }}
    />
  );

  const warnColor = tRun ? null : tSec > 0 ? "#f59e0b" : "#ef4444";
  const topBarBg = tRun ? M.bg : tSec > 0 ? "#ff7a00" : "#ff1f1f";
  const topBarFg = tRun ? M.t1 : "#fff";
  const topBarMuted = tRun ? M.t3 : "rgba(255,255,255,0.8)";

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
            background: M.bg,
            display: "flex",
            alignItems: "stretch",
            gap: 0,
            padding: 0,
            fontFamily:
              "-apple-system,'Segoe UI Variable','Segoe UI',system-ui,sans-serif",
            borderBottom: `1px solid ${M.b1}`,
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
                  ? `linear-gradient(90deg, ${M.gn}12 0%, ${M.gn}22 50%, ${M.gn}12 100%)`
                  : `linear-gradient(90deg, ${M.ac}0a 0%, ${M.ac}1c 50%, ${M.ac}0a 100%)`,
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
                background: tRun ? M.pk : M.btn,
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
                  background: tRun ? M.pk : "#fff",
                  boxShadow: tRun
                    ? `0 0 5px ${M.pk}`
                    : "0 0 4px rgba(255,255,255,0.6)",
                  animation: "pulse 1.2s ease-in-out infinite",
                  flexShrink: 0,
                }}
              />
              <div
                style={{
                  fontFamily: '"JetBrains Mono",ui-monospace,monospace',
                  fontSize: 10,
                  fontWeight: 700,
                  color: tRun ? M.ac : topBarFg,
                  letterSpacing: 0.1,
                  minWidth: 48,
                }}
              >
                {fmtClock(tSec)}
              </div>
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
                          fontFamily: '"JetBrains Mono",ui-monospace,monospace',
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
                            fontFamily: '"Instrument Serif","Georgia",serif',
                            fontSize: 14,
                            color: M.t1,
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
                                '"JetBrains Mono",ui-monospace,monospace',
                              fontSize: 8,
                              color: M.tf,
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
                          fontFamily: '"Instrument Serif","Georgia",serif',
                          fontStyle: "italic",
                          fontSize: 13,
                          color: M.t3,
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
                        fontFamily: '"Instrument Serif","Georgia",serif',
                        fontStyle: "italic",
                        fontSize: 13,
                        color: M.ac,
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
              background: M.bg,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              {weekH.map((h, i) => {
                const p = Math.min(1, h / GOAL);
                const filled = p > 0;
                const color = p >= 1 ? M.gn : p > 0 ? M.ac : M.b1;
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
                  fontFamily: '"JetBrains Mono",ui-monospace,monospace',
                  fontSize: 10,
                  fontWeight: 700,
                  color: displaySessionXp > 0 ? M.ac : M.tf,
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: 0.2,
                }}
              >
                +{displaySessionXp}
              </span>
              <span
                style={{
                  fontFamily: '"JetBrains Mono",ui-monospace,monospace',
                  fontSize: 7,
                  color: M.tf,
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
                  style={{ color: M.ac }}
                >
                  +{xpBump.delta}
                </span>
              )}
            </div>

            <ActivityRing
              progress={gpct / 100}
              done={done}
              size={22}
              stroke={1.5}
            >
              <span
                style={{
                  fontSize: 7,
                  fontWeight: 700,
                  fontFamily: '"JetBrains Mono",ui-monospace,monospace',
                  color: done ? M.gn : M.t1,
                  letterSpacing: -0.2,
                  lineHeight: 1,
                  fontVariantNumeric: "tabular-nums",
                }}
                title={`${fmtHours(todayH)} / ${GOAL}h`}
              >
                {fmtHours(todayH)}
              </span>
            </ActivityRing>

            <div
              className={justBumpedStreak ? "streak-pop" : undefined}
              style={{
                display: "inline-flex",
                alignItems: "baseline",
                gap: 3,
                color: M.pk,
              }}
            >
              <FlameIcon size={10} />
              <span
                style={{
                  fontFamily: '"JetBrains Mono",ui-monospace,monospace',
                  fontSize: 10,
                  fontWeight: 700,
                  color: M.pk,
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: 0.2,
                }}
              >
                {streak}
              </span>
              <span
                style={{
                  fontFamily: '"JetBrains Mono",ui-monospace,monospace',
                  fontSize: 7,
                  color: M.tf,
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
                border: `1px solid ${M.b1}`,
                color: M.t2,
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
                background: M.ac,
                border: "none",
                color: "#fff",
                fontFamily: '"JetBrains Mono",ui-monospace,monospace',
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
        className={`mode-root ${themeClass} ${M.id === "dark" ? "app-dark-glow" : ""}`}
        style={{
          height: "100vh",
          background: M.id === "dark" ? undefined : M.bg,
          fontFamily:
            "-apple-system,'Segoe UI Variable','Segoe UI',system-ui,sans-serif",
          color: M.t1,
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {hdr}
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
          {logOpen ? logView : views[tab]}
        </div>
        <div
          style={{
            height: 40,
            flexShrink: 0,
            borderTop: `1px solid ${M.b1}`,
            background: M.bg,
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
              background: M.s2,
              border: `1px solid ${M.b1}`,
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
                  border: mode === m ? `1px solid ${M.b2}` : "none",
                  background: mode === m ? M.s1 : "transparent",
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
              background: M.s2,
              border: `1px solid ${M.b1}`,
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
              background: pinned ? `${M.ac}26` : M.s2,
              border: `1px solid ${pinned ? M.ac : M.b1}`,
              color: pinned ? M.ac : M.t3,
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
              background: M.s2,
              border: `1px solid ${M.b1}`,
              color: M.t3,
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
              color: M.t3,
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
          <IntroOverlay
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
                background: M.s1,
                border: `1.5px solid ${M.ac}`,
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
                  color: M.t1,
                  marginBottom: 6,
                }}
              >
                {confirmation.title}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: M.t3,
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
                    background: M.s2,
                    border: `1px solid ${M.b1}`,
                    borderRadius: 9,
                    color: M.t2,
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
                    background: M.btn,
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

        {floats.map((f) => (
          <div
            key={f.id}
            style={{
              position: "absolute",
              top: "30%",
              left: "50%",
              transform: "translateX(-50%)",
              background: M.s1,
              border: `1px solid ${M.b1}`,
              borderRadius: 13,
              padding: "9px 18px",
              fontSize: 15,
              fontWeight: 800,
              color: f.col,
              fontFamily: '"JetBrains Mono",ui-monospace,monospace',
              pointerEvents: "none",
              animation: "floatUp 1.5s ease-out forwards",
              whiteSpace: "nowrap",
              zIndex: 99,
              boxShadow: `0 4px 24px ${f.col}44`,
            }}
          >
            {f.txt}
          </div>
        ))}

        {saveToast && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                M.id === "dark"
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
                background: M.s1,
                border: `1.5px solid ${M.gn}55`,
                boxShadow: `0 14px 48px ${M.gn}55, 0 0 0 1px ${M.gn}22`,
                animation: "saveFlashCard 2.1s cubic-bezier(.22,1,.36,1) forwards",
              }}
            >
              <svg
                viewBox="0 0 72 72"
                width={72}
                height={72}
                fill="none"
                stroke={M.gn}
                strokeWidth={5}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
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
                    color: M.t1,
                    letterSpacing: -0.2,
                  }}
                >
                  {saveToast.cheer}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: M.t3,
                    fontFamily: '"JetBrains Mono",ui-monospace,monospace',
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
              const palette = [M.ac, M.pk, M.gn, "#e8c060"];
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
              background: M.s1,
              border: `1.5px solid ${M.gn}66`,
              borderRadius: 14,
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: 13,
              zIndex: 101,
              animation: "goalToastIn .6s cubic-bezier(.34,1.56,.64,1)",
              boxShadow: `0 10px 36px ${M.gn}55`,
            }}
            role="status"
            aria-live="polite"
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: `${M.gn}1f`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                color: M.gn,
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
                  color: M.gn,
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
                  color: M.t1,
                  marginBottom: 2,
                  letterSpacing: -0.2,
                }}
              >
                {goalCelebration.title}
              </div>
              <div style={{ fontSize: 11, color: M.t3 }}>
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
              background: M.s1,
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
                  color: M.t1,
                  marginBottom: 2,
                }}
              >
                {achName(ach.id, lang)}
              </div>
              <div style={{ fontSize: 10, color: M.t3 }}>
                {achDescription(ach.id, lang)}
              </div>
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: ach.co,
                fontFamily: '"JetBrains Mono",ui-monospace,monospace',
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
