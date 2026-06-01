import type { Dispatch, SetStateAction } from "react";
import type { TimeEntry } from "../api";
import type { PendingEntry } from "../lib/pendingEntries";
import type { Todo, TodoDraft, TodoFormState } from "../lib/todos";
import { todosInPlay, todosUpcoming } from "../lib/todos";
import type { Lang } from "../lib/i18n";
import type { Ach } from "../lib/achievements";
import type { MonthClosureCache } from "../lib/useMonthClosure";
import type { CompanyGroup } from "../lib/useTodayDerivations";
import type { HeaderTab } from "./AppHeader";
import type { ConfirmationRequest } from "./ConfirmationModal";
import { TodayView } from "./TodayView";
import { TimerView } from "./TimerView";
import { MonthView } from "./MonthView";
import { WeekView } from "./WeekView";
import { DayView } from "./DayView";
import { HistoryView } from "./HistoryView";
import { TodoView } from "./TodoView";
import { XpView } from "./XpView";

interface Company {
  id: string;
  name: string;
}
interface Project {
  id: string;
  name: string;
}

interface ContinueFrom {
  entryId: string;
  hours: number;
  note: string;
  invoice: boolean;
}

interface TimerStateBundle {
  tCo: string;
  tPr: string;
  tD: string;
  tNote: string;
  tInv: boolean;
  tSec: number;
  tRun: boolean;
  draftId: string | null;
  setTCo: Dispatch<SetStateAction<string>>;
  setTPr: Dispatch<SetStateAction<string>>;
  setTD: Dispatch<SetStateAction<string>>;
  setTNote: Dispatch<SetStateAction<string>>;
  setTInv: Dispatch<SetStateAction<boolean>>;
  setTRun: Dispatch<SetStateAction<boolean>>;
}

interface Props {
  tab: HeaderTab;
  // Auth/user
  username: string;
  // Timer
  timer: TimerStateBundle;
  setActiveTodoId: Dispatch<SetStateAction<string | null>>;
  activeTodoId: string | null;
  accrueTodoHours: (id: string | null, h: number) => void;
  // Companies
  companies: Company[];
  projectCache: Record<string, Project[]>;
  companiesError: boolean;
  projectErrors: Record<string, boolean>;
  ensureProjects: (cid: string) => Promise<Project[]> | Project[];
  reloadCompanies: () => void;
  isInternalCompany: (cid: string) => boolean;
  // Entries
  entries: TimeEntry[];
  entriesLoading: boolean;
  dayEntries: TimeEntry[];
  dayEntriesLoading: boolean;
  pendingQueue: PendingEntry[];
  failedQueue: PendingEntry[];
  pendingDeleteId: string | null;
  setPendingDeleteId: Dispatch<SetStateAction<string | null>>;
  // Today derivations
  todayH: number;
  liveTodayH: number;
  liveTodayEntries: TimeEntry[];
  liveDone: boolean;
  groups: Record<string, CompanyGroup>;
  failedIds: Set<string>;
  // Progress
  streak: number;
  xp: number;
  unlocked: string[];
  weekH: number[];
  weekTotal: number;
  todayI: number;
  goal: number;
  justHitGoal: boolean;
  justBumpedStreak: boolean;
  // Todos
  todos: Todo[];
  activeTaskKey: string | null;
  estimatedTodoFor: (cid: string, prid: string, desc: string) => Todo | undefined;
  todoTrackedH: (t: Todo) => number;
  todoDraft: TodoFormState;
  setTodoDraft: Dispatch<SetStateAction<TodoFormState>>;
  editingTodoId: string | null;
  addTodo: (draft: TodoDraft) => void;
  updateTodo: (id: string, draft: TodoDraft) => void;
  resetTodoForm: () => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  startTodo: (todo: Todo) => void;
  editTodo: (todo: Todo) => Promise<void> | void;
  // Save flow
  saveNewEntry: (
    cid: string,
    prid: string,
    hours: number,
    desc: string,
    inv: boolean,
    internalNote: string,
    entryDate: Date,
    existingId: string | null,
  ) => Promise<unknown>;
  editEntry: (e: TimeEntry) => Promise<void> | void;
  delEntry: (id: string) => Promise<unknown> | void;
  switchTaskGuarded: (
    cid: string,
    prid: string,
    desc: string,
    continueFrom?: ContinueFrom,
  ) => void;
  stopAndLogCurrent: () => Promise<void> | void;
  cancelTimer: () => Promise<void> | void;
  startSideQuest: () => void;
  restoreStashedTimer: () => void;
  resetTimer: () => void;
  stashedTimer: import("../lib/useSideQuest").StashedTimer | null;
  // History
  historyScale: "day" | "week" | "month";
  setHistoryScale: (s: "day" | "week" | "month") => void;
  stepHistoryDate: (dir: 1 | -1) => void;
  historyIsOnCurrent: boolean;
  jumpHistoryToCurrent: () => void;
  selectedDate: Date;
  setSelectedDate: Dispatch<SetStateAction<Date>>;
  openForNew: (date: Date) => void;
  // UI
  setTab: (t: HeaderTab) => void;
  setTD: Dispatch<SetStateAction<string>>;
  setLogOpen: Dispatch<SetStateAction<boolean>>;
  timerFormOpen: boolean;
  setTimerFormOpen: Dispatch<SetStateAction<boolean>>;
  pendingCancelTimer: boolean;
  setPendingCancelTimer: Dispatch<SetStateAction<boolean>>;
  setConfirmation: Dispatch<SetStateAction<ConfirmationRequest | null>>;
  // Misc
  simonMode: boolean;
  mode: "light" | "dark";
  lang: Lang;
  locale: string;
  greetingMsg: string;
  emptyMsg: string;
  timerInsight: string;
  xpCoach: string;
  done: boolean;
  monthClosure: MonthClosureCache;
  ach: Ach | null;
  addFloat: (msg: string, col: string) => void;
  openAbsence: () => Promise<void> | void;
}

export function AppViews(p: Props) {
  void p.ach; // not currently consumed; kept for future router slots
  const firstName = p.username.trim().split(/\s+/)[0];
  const pickDayForView = (d: Date) => {
    p.setSelectedDate(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
    p.setHistoryScale("day");
  };
  const onBackfillDay = (d: Date) => {
    const [y, mo, da] = [d.getFullYear(), d.getMonth(), d.getDate()];
    p.openForNew(new Date(y, mo, da));
    p.setTab("timer");
    p.setLogOpen(true);
  };
  const onLogPastToday = () => {
    p.openForNew(new Date());
    p.setTab("timer");
    p.setLogOpen(true);
  };

  const dayView = (
    <DayView
      selectedDate={p.selectedDate}
      dayEntries={p.dayEntries}
      dayEntriesLoading={p.dayEntriesLoading}
      pendingQueue={p.pendingQueue}
      failedQueue={p.failedQueue}
      goal={p.goal}
      pendingDeleteId={p.pendingDeleteId}
      onEditEntry={p.editEntry}
      onSetPendingDelete={p.setPendingDeleteId}
      onDeleteEntry={p.delEntry}
      onLogPastTime={() => {
        const [y, mo, da] = [
          p.selectedDate.getFullYear(),
          p.selectedDate.getMonth(),
          p.selectedDate.getDate(),
        ];
        p.openForNew(new Date(y, mo, da));
        p.setLogOpen(true);
      }}
    />
  );
  const weekView = (
    <WeekView
      goal={p.goal}
      referenceDate={p.selectedDate}
      onPickDay={pickDayForView}
      onBackfillDay={onBackfillDay}
      firstName={firstName}
      monthClosure={p.monthClosure}
    />
  );
  const monthView = (
    <MonthView
      goal={p.goal}
      referenceDate={p.selectedDate}
      onPickDay={pickDayForView}
      onBackfillDay={onBackfillDay}
      firstName={firstName}
      confirm={(opts) => p.setConfirmation(opts)}
      notify={(msg, col) => p.addFloat(msg, col)}
      monthClosure={p.monthClosure}
    />
  );

  switch (p.tab) {
    case "today":
      return (
        <TodayView
          username={p.username}
          todayH={p.todayH}
          liveTodayH={p.liveTodayH}
          liveTodayEntries={p.liveTodayEntries}
          liveDone={p.liveDone}
          streak={p.streak}
          goal={p.goal}
          justHitGoal={p.justHitGoal}
          justBumpedStreak={p.justBumpedStreak}
          entries={p.entries}
          entriesLoading={p.entriesLoading}
          groups={p.groups}
          failedIds={p.failedIds}
          pendingDeleteId={p.pendingDeleteId}
          setPendingDeleteId={p.setPendingDeleteId}
          timer={{
            tRun: p.timer.tRun,
            draftId: p.timer.draftId,
            tCo: p.timer.tCo,
            tPr: p.timer.tPr,
            setTRun: p.timer.setTRun,
          }}
          simonMode={p.simonMode}
          todos={todosInPlay(p.todos)}
          activeTaskKey={p.activeTaskKey}
          estimatedTodoFor={p.estimatedTodoFor}
          todoTrackedH={p.todoTrackedH}
          setTab={p.setTab}
          setTD={p.setTD}
          onLogPastToday={onLogPastToday}
          startTodo={p.startTodo}
          editTodo={p.editTodo}
          editEntry={p.editEntry}
          delEntry={p.delEntry}
          switchTaskGuarded={p.switchTaskGuarded}
          greetingMsg={p.greetingMsg}
          emptyMsg={p.emptyMsg}
          mode={p.mode}
          locale={p.locale}
          lang={p.lang}
        />
      );
    case "timer":
      return (
        <TimerView
          timer={p.timer}
          todos={{
            activeTodoId: p.activeTodoId,
            setActiveTodoId: p.setActiveTodoId,
            accrueTodoHours: p.accrueTodoHours,
          }}
          companies={{
            list: p.companies,
            cache: p.projectCache,
            error: p.companiesError,
            projectErrors: p.projectErrors,
            ensure: p.ensureProjects,
            reload: p.reloadCompanies,
          }}
          entries={p.entries}
          saveNewEntry={p.saveNewEntry}
          stopAndLogCurrent={p.stopAndLogCurrent}
          cancelTimer={p.cancelTimer}
          startSideQuest={p.startSideQuest}
          restoreStashedTimer={p.restoreStashedTimer}
          resetTimer={p.resetTimer}
          addFloat={p.addFloat}
          isInternalCompany={p.isInternalCompany}
          setTab={p.setTab}
          timerFormOpen={p.timerFormOpen}
          setTimerFormOpen={p.setTimerFormOpen}
          pendingCancelTimer={p.pendingCancelTimer}
          setPendingCancelTimer={p.setPendingCancelTimer}
          stashedTimer={p.stashedTimer}
          todayH={p.todayH}
          streak={p.streak}
          done={p.done}
          goal={p.goal}
          lang={p.lang}
          timerInsight={p.timerInsight}
          openAbsence={p.openAbsence}
        />
      );
    case "history":
      return (
        <HistoryView
          historyScale={p.historyScale}
          setHistoryScale={p.setHistoryScale}
          stepHistoryDate={p.stepHistoryDate}
          historyIsOnCurrent={p.historyIsOnCurrent}
          jumpHistoryToCurrent={p.jumpHistoryToCurrent}
          dayView={dayView}
          weekView={weekView}
          monthView={monthView}
          simonMode={p.simonMode}
          upcomingTodos={todosUpcoming(p.todos)}
          activeTaskKey={p.activeTaskKey}
          startTodo={p.startTodo}
          editTodo={p.editTodo}
        />
      );
    case "todo":
      return (
        <TodoView
          todos={p.todos}
          companies={p.companies}
          getProjects={(cid) => p.projectCache[cid] || []}
          ensureProjects={async (cid) => {
            await p.ensureProjects(cid);
          }}
          draft={p.todoDraft}
          onDraftChange={(patch) => p.setTodoDraft((d) => ({ ...d, ...patch }))}
          activeTaskKey={p.activeTaskKey}
          editingId={p.editingTodoId}
          onAdd={p.addTodo}
          onUpdate={p.updateTodo}
          onResetForm={p.resetTodoForm}
          onEdit={p.editTodo}
          onToggle={p.toggleTodo}
          onDelete={p.deleteTodo}
        />
      );
    case "xp":
      return (
        <XpView
          xp={p.xp}
          xpCoach={p.xpCoach}
          weekTotal={p.weekTotal}
          weekH={p.weekH}
          todayI={p.todayI}
          unlocked={p.unlocked}
          mode={p.mode}
          goal={p.goal}
        />
      );
    default:
      return null;
  }
}
