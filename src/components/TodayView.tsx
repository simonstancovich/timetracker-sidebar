import type { Dispatch, MouseEvent, SetStateAction } from "react";
import { useTranslation } from "../lib/i18n";
import { useAppContext } from "../lib/AppContext";
import type { Todo } from "../lib/todos";
import { fmtHours } from "../lib/hours";
import { LIVE_SESSION_ID } from "../lib/pendingEntries";
import * as prim from "../primitives";
import { DayHero } from "./DayHero";
import type { TimeEntry } from "../api";
import type { HeaderTab } from "./AppHeader";
import { MeetingsWidget } from "./MeetingsWidget";
import { TodoCompactList } from "./TodoView";
import { TodayGreeting } from "./TodayGreeting";
import { TodayStatChips } from "./TodayStatChips";
import { TodayEntryGroups } from "./TodayEntryGroups";
import { TodayTotalFooter } from "./TodayTotalFooter";
import { LogPastTimeBtn } from "./LogPastTimeBtn";
import * as s from "./TodayView.css";

interface Group {
  cid: string;
  h: number;
  entries: TimeEntry[];
}

interface ContinueFrom {
  entryId: string;
  hours: number;
  note: string;
  invoice: boolean;
}

interface TimerForToday {
  tRun: boolean;
  draftId: string | null;
  tCo: string;
  tPr: string;
  setTRun: Dispatch<SetStateAction<boolean>>;
}

interface Props {
  todayH: number;
  liveTodayH: number;
  liveTodayEntries: TimeEntry[];
  liveDone: boolean;
  streak: number;
  goal: number;
  justHitGoal: boolean;
  justBumpedStreak: boolean;
  entries: TimeEntry[];
  entriesLoading: boolean;
  groups: Record<string, Group>;
  failedIds: Set<string>;
  pendingDeleteId: string | null;
  setPendingDeleteId: Dispatch<SetStateAction<string | null>>;
  timer: TimerForToday;
  todos: Todo[];
  activeTaskKey: string | null;
  estimatedTodoFor: (cid: string, prid: string, desc: string) => Todo | undefined;
  todoTrackedH: (td: Todo) => number;
  setTab: (tab: HeaderTab) => void;
  setTD: Dispatch<SetStateAction<string>>;
  onLogPastToday: () => void;
  startTodo: (todo: Todo) => void;
  editTodo: (todo: Todo) => void;
  editEntry: (entry: TimeEntry) => void;
  delEntry: (id: string) => unknown;
  switchTaskGuarded: (cid: string, prid: string, desc: string, continueFrom?: ContinueFrom) => void;
  greetingMsg: string;
  emptyMsg: string;
}

export function TodayView({
  todayH,
  liveTodayH,
  liveTodayEntries,
  liveDone,
  streak,
  goal,
  justHitGoal,
  justBumpedStreak,
  entries,
  entriesLoading,
  groups,
  failedIds,
  pendingDeleteId,
  setPendingDeleteId,
  timer,
  todos,
  activeTaskKey,
  estimatedTodoFor,
  todoTrackedH,
  setTab,
  setTD,
  onLogPastToday,
  startTodo,
  editTodo,
  editEntry,
  delEntry,
  switchTaskGuarded,
  greetingMsg,
  emptyMsg,
}: Props) {
  const { username, simonMode } = useAppContext();
  const { t } = useTranslation();
  const { tRun, draftId, tCo, tPr, setTRun } = timer;
  const firstName = username.trim().split(/\s+/)[0] ?? "";

  const todayDate = new Date();
  const eyebrowDate = new Date(
    Date.UTC(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate()),
  );
  const dayNum = eyebrowDate.getUTCDay() || 7;
  eyebrowDate.setUTCDate(eyebrowDate.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(eyebrowDate.getUTCFullYear(), 0, 1));
  const isoWeek = Math.ceil(
    ((eyebrowDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );

  const todayBillableH = liveTodayEntries.reduce(
    (sum, e) => sum + (e.invoice === "1" ? parseFloat(e.hour) : 0),
    0,
  );
  const todayBillablePct =
    todayH > 0 ? Math.round((todayBillableH / todayH) * 100) : 0;
  const todayXp = liveTodayEntries.reduce(
    (sum, e) => sum + Math.round(10 + parseFloat(e.hour) * 8),
    0,
  );

  const handleEntryDoubleClick = (entry: TimeEntry) => {
    if (entry.id === LIVE_SESSION_ID) {
      setTab("timer");
    } else {
      editEntry(entry);
    }
  };

  const handleEntryAction = (
    entry: TimeEntry,
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();
    const isActive = tRun && draftId === entry.id;
    if (isActive) {
      setTRun(false);
      return;
    }
    if (
      draftId === entry.id &&
      tCo === entry._company_id &&
      tPr === entry._project_id
    ) {
      setTRun(true);
      setTab("timer");
      return;
    }
    switchTaskGuarded(entry._company_id, entry._project_id, entry.description, {
      entryId: entry.id,
      hours: parseFloat(entry.hour) || 0,
      note: entry.internal_description || "",
      invoice: entry.invoice === "1",
    });
  };

  return (
    <prim.Stack className={s.page}>
      <TodayGreeting firstName={firstName} message={greetingMsg} />
      <prim.PageEyebrow
        title={t("page.today")}
        hint={t("today.eyebrowHint", { week: isoWeek, day: dayNum })}
      />
      <prim.Stack className={s.content}>
        <DayHero
          data-tour="today-stats"
          variant="today"
          bloom={justHitGoal}
          hours={liveTodayH}
          goalReached={liveDone}
          subtitle={
            liveDone
              ? t("today.dayDoneSubtitle", { extra: fmtHours(liveTodayH - goal) })
              : t("today.toGoSubtitle", {
                  remaining: fmtHours(Math.max(0, goal - liveTodayH)),
                })
          }
        />

        <TodayStatChips
          streak={streak}
          streakPopped={justBumpedStreak}
          billablePercent={todayBillablePct}
          xp={todayXp}
        />

        {simonMode && (
          <MeetingsWidget
            onStartForMeeting={(title) => {
              setTD(title);
              setTab("timer");
            }}
          />
        )}

        {simonMode && (
          <TodoCompactList
            title={t("todo.todaySection")}
            todos={todos}
            activeTaskKey={activeTaskKey}
            showPressure
            onStart={startTodo}
            onEdit={editTodo}
          />
        )}

        <prim.Divider tone="raised" />

        <TodayEntryGroups
          groups={groups}
          entries={entries}
          entriesLoading={entriesLoading}
          emptyMsg={emptyMsg}
          pendingDeleteId={pendingDeleteId}
          failedIds={failedIds}
          running={tRun}
          draftId={draftId}
          estimatedTodoFor={estimatedTodoFor}
          todoTrackedH={todoTrackedH}
          onEntryDoubleClick={handleEntryDoubleClick}
          onEntryAction={handleEntryAction}
          onSetPendingDelete={setPendingDeleteId}
          onDeleteEntry={delEntry}
        />

        <TodayTotalFooter hours={liveTodayH} goalReached={liveDone} />
        <LogPastTimeBtn onClick={onLogPastToday} />
      </prim.Stack>
    </prim.Stack>
  );
}
