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
import { formatLocalDate, mondayOf } from "./lib/date";
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
import {
  emptyTodayMessage,
  saveCheer,
} from "./lib/personality";
import { Lang, useTranslation } from "./lib/i18n";
import { useLogForm, type StoredLogForm } from "./lib/useLogForm";
import { useTimer, type StoredTimer } from "./lib/useTimer";
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
import { useWindowFocus } from "./lib/useWindowFocus";
import { useGlobalErrorLogging } from "./lib/useGlobalErrorLogging";
import { useHistoryScale } from "./lib/useHistoryScale";
import { useTopBarFunMessage } from "./lib/useTopBarFunMessage";
import { usePersistedStore } from "./lib/usePersistedStore";

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
  const authed = true as const;
  const { t } = useTranslation();
  const [tab, setTab] = useState<ui.HeaderTab>("today");
  const [logOpen, setLogOpen] = useState(false);
  const monthClosure = useMonthClosure();
  const {
    selectedDate, setSelectedDate,
    historyScale, setHistoryScale,
    stepHistoryDate,
    historyIsOnCurrent,
    jumpHistoryToCurrent,
  } = useHistoryScale();

  const nowTick = useNowTick();
  const funMessage = useTopBarFunMessage(size, lang);

  const confirmSignOut = () => {
    if (window.confirm(t("footer.confirmSignOut"))) {
      window.electronAPI.signOut();
    }
  };

  const onUnauthenticated = useCallback(() => onSignOut(), [onSignOut]);
  const onCannotResolveUser = useCallback(() => {
    window.electronAPI.signOut();
  }, []);
  const { currentUser } = useCurrentUser({
    authed,
    onUnresolvable: onCannotResolveUser,
  });
  const {
    entries, setEntries,
    entriesLoading,
    pendingDeleteId, setPendingDeleteId,
  } = useEntries({ authed, nowTick, onUnauthenticated });
  const {
    xp, setXp,
    streak, setStreak,
    unlocked, setUnlocked,
    weekH, setWeekH,
    achStats, setAchStats,
    lastCelebratedDate, setLastCelebratedDate,
    ach,
    setPendingAchs,
  } = useProgress({ authed });

  const { floats, addFloat } = useFloats();
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
  const windowFocused = useWindowFocus();
  const { online, setOnline } = useConnection();
  const {
    companies,
    companiesError,
    projectErrors,
    projectCache,
    ensureProjects,
    reload: reloadCompanies,
  } = useCompanies({ authed, onOnlineChange: setOnline });
  const { simonMode, tapCorner: tapSimonCorner } = useSimonMode(addFloat);
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
  const draftIdRef = useRef<string | null>(null);
  useEffect(() => {
    draftIdRef.current = draftId;
  }, [draftId]);
  const [timerFormOpen, setTimerFormOpen] = useState(true);

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

  const logFormApi = useLogForm();
  const {
    fCo, setFCo,
    fPr, setFPr,
    fH, setFH,
    fD, setFD,
    fNote, setFNote,
    fInv, setFInv,
    openForEdit,
    hydrate: hydrateLogForm,
  } = logFormApi;
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
      setConfirmation({
        title: t("timer.confirmSwitchTitle"),
        body: t("timer.confirmSwitchBody"),
        confirmLabel: t("timer.confirmSwitchOk"),
        onConfirm: saveCurrentAndSwitch,
      });
    } else if (canSaveCurrent) {
      saveCurrentAndSwitch();
    } else {
      applySwitch();
    }
  };

  const editEntry = async (entry: TimeEntry) => {
    const [y, mo, d] = (entry.task_date || "").split("-").map(Number);
    const date =
      Number.isFinite(y) && Number.isFinite(mo) && Number.isFinite(d)
        ? new Date(y, mo - 1, d)
        : new Date();
    openForEdit(entry.id, date);
    setFCo(entry._company_id);
    await ensureProjects(entry._company_id);
    setFPr(entry._project_id);
    setFH(parseFloat(entry.hour) || 0);
    setFD(entry.description || "");
    setFNote(entry.internal_description || "");
    setFInv(entry.invoice === "1");
    setLogOpen(true);
  };

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
    window.electronAPI.setBlurCollapseDisabled(showIntro || pinned);
  }, [showIntro, pinned]);

  const greetingMsg = useGreetingMessage(currentUser, lang);

  const emptyMsg = useMemo(() => emptyTodayMessage(lang), [lang]);

  const timerPayload = useMemo(() => ({
    tCo, tPr, tD, tNote, tInv,
    tSec: tRun ? 0 : tSecRef.current,
    running: tRun,
    startedAt: tRun ? Date.now() - tSecRef.current * 1000 : null,
    draftId,
  }), [tCo, tPr, tD, tNote, tInv, tRun, draftId, tSecRef]);
  usePersistedStore({
    key: "timer",
    payload: timerPayload,
    hydrate: (t: StoredTimer) => {
      hydrateTimer(t);
      if (t.tCo) void ensureProjects(t.tCo);
    },
  });

  const logFormPayload = useMemo(
    () => ({ fCo, fPr, fH, fD, fNote, fInv }),
    [fCo, fPr, fH, fD, fNote, fInv],
  );
  usePersistedStore({
    key: "logForm",
    payload: logFormPayload,
    hydrate: (f: StoredLogForm) => {
      hydrateLogForm(f);
      if (f.fCo) void ensureProjects(f.fCo);
    },
  });

  useEffect(() => {
    monthClosure.ensure(selectedDate.getFullYear(), selectedDate.getMonth());
  }, [selectedDate, monthClosure]);

  const { dayEntries, setDayEntries, dayEntriesLoading } = useDayEntries({
    authed,
    active: historyScale === "day" && tab === "history",
    selectedDate,
    reloadKey: entries,
  });

  useEffect(() => {
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
  }, [entries, setWeekH]);

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

  useEffect(() => {
    if (!saveToast) return;
    const t = window.setTimeout(() => setSaveToast(null), 2100);
    return () => clearTimeout(t);
  }, [saveToast]);

  useGlobalErrorLogging();

  useEffect(() => {
    if (!simonMode && tab === "todo") setTab("today");
  }, [simonMode, tab]);

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

  const trackedHForTodo = (td: Todo) =>
    todoTrackedH(td, entries, { tCo, tPr, tD, tRun, tSec, draftId });

  const activeTaskKey = tRun ? taskKey(tCo, tPr, tD) : null;

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
    internalNote: string,
    entryDate: Date,
    existingId: string | null,
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

    const savedDateISO = formatLocalDate(entryDate);
    const todayISOStr = formatLocalDate(new Date());
    if (savedDateISO === todayISOStr) {
      const fresh = await loadTimeEntries(new Date());
      setEntries(fresh);
    }
    if (
      savedDateISO === formatLocalDate(selectedDate) &&
      historyScale === "day"
    ) {
      loadTimeEntries(selectedDate)
        .then(setDayEntries)
        .catch(() => {});
    }
    setWeekH((w) => {
      if (savedDateISO !== todayISOStr) return w;
      const n = [...w];
      n[todayI] = +(n[todayI] + hours).toFixed(2);
      return n;
    });

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

    if (existingId) return saved?.id || existingId || null;

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
    }
  };
  useAutoSaveDraft(tRun, autoSaveDraft);

  const delEntry = async (id: string) => {
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

  const locale = lang === "sv" ? "sv-SE" : "en-GB";
  const { clockDate, clockTime } = useMemo(() => {
    void nowTick;
    const now = new Date();
    return {
      clockDate: now.toLocaleDateString(locale, {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
      clockTime: now.toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  }, [locale, nowTick]);

  const spinner = (
    <prim.Spinner layout="fill" label={t("form.loadingProjects")} className={themeClass} />
  );
  if (!currentUser) return spinner;

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

  const topEstTodo = !simonMode
    ? undefined
    : (activeTodoId
        ? todos.find((td) => td.id === activeTodoId && td.estimateH > 0)
        : undefined) ?? estimatedTodoFor(tCo, tPr, tD);
  const topEstLiveH = topEstTodo ? trackedHForTodo(topEstTodo) : 0;

  if (size === "top") {
    return (
      <ui.AppTopBar
        themeClass={themeClass}
        mode={mode}
        setMode={setMode}
        lang={lang}
        goSize={goSize}
        modeOverlay={<ui.ModeTransitionOverlay phase={modeTransition} />}
        tRun={tRun}
        setTRun={setTRun}
        tSec={tSec}
        funMessage={funMessage}
        windowFocused={windowFocused}
        sessionXp={sessionXp}
        xpBump={xpBump}
        justBumpedStreak={justBumpedStreak}
        todayH={todayH}
        streak={streak}
        weekH={weekH}
        goal={GOAL}
        done={done}
        gpct={gpct}
        companies={companies}
        projectCache={projectCache}
        tCo={tCo}
        tPr={tPr}
        topEstTodo={topEstTodo}
        topEstLiveH={topEstLiveH}
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
      modeOverlay={<ui.ModeTransitionOverlay phase={modeTransition} />}
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
          openForNew={logFormApi.openForNew}
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
