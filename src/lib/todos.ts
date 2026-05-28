// Local to-do list (electron-store only — DevCore's API stores time entries,
// not tasks). A to-do carries a time estimate, an optional planned date (when
// you mean to do it) and an optional deadline (when it must be done), plus an
// optional client/project so starting it can auto-fill + log the timer.

export interface Todo {
  id: string;
  text: string;
  estimateH: number;
  loggedH: number;
  plannedDate: string | null; // YYYY-MM-DD — when you intend to start
  deadline: string | null; // YYYY-MM-DD — hard due date
  companyId: string | null;
  companyName: string | null;
  projectId: string | null;
  projectName: string | null;
  done: boolean;
  createdAt: number;
}

export const TODOS_STORE_KEY = "todos";

export interface TodoDraft {
  text: string;
  estimateH: number;
  plannedDate: string | null;
  deadline: string | null;
  companyId: string | null;
  companyName: string | null;
  projectId: string | null;
  projectName: string | null;
}

// Raw form fields, lifted into App so the draft survives top-bar collapse.
export interface TodoFormState {
  text: string;
  estimate: string;
  planned: string;
  deadline: string;
  co: string;
  pr: string;
}

export function createTodo(draft: TodoDraft): Todo {
  return {
    id: `todo_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    text: draft.text,
    estimateH: draft.estimateH,
    loggedH: 0,
    plannedDate: draft.plannedDate,
    deadline: draft.deadline,
    companyId: draft.companyId,
    companyName: draft.companyName,
    projectId: draft.projectId,
    projectName: draft.projectName,
    done: false,
    createdAt: Date.now(),
  };
}

// Identity of a tracked task (client + project + description). Used to tell
// whether a to-do's task is the one currently running, independent of any
// ephemeral "active to-do" state.
export const taskKey = (
  companyId: string | null,
  projectId: string | null,
  text: string,
) => `${companyId ?? ""}${projectId ?? ""}${text}`;

// Normalize a stored to-do that predates a field (e.g. plannedDate).
export function normalizeTodo(raw: Todo): Todo {
  return { ...raw, plannedDate: raw.plannedDate ?? null };
}

// Days until a date (negative = past). null when no/invalid date.
export function daysUntil(date: string | null): number | null {
  if (!date) return null;
  const due = new Date(`${date}T00:00:00`);
  if (Number.isNaN(due.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / 86_400_000);
}

export type TodoLevel = "upcoming" | "today" | "soon" | "urgent" | "overdue";

export interface TodoUrgency {
  inPlay: boolean; // belongs in Today (planned date reached / deadline here)
  upcoming: boolean; // belongs in History (future planned/deadline)
  pressure: number; // 0..1 — progress from planned date toward the deadline
  level: TodoLevel;
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

// How urgent a to-do is right now. Pressure ramps from 0 on the planned date to
// 1 at the deadline, so the closer we are to the deadline the louder it shows.
export function todoUrgency(todo: Todo): TodoUrgency {
  const plannedIn = daysUntil(todo.plannedDate);
  const deadlineIn = daysUntil(todo.deadline);

  const plannedReached = plannedIn !== null && plannedIn <= 0;
  const deadlineReached = deadlineIn !== null && deadlineIn <= 0;

  const inPlay =
    !todo.done &&
    (plannedReached || (todo.plannedDate === null && deadlineReached));

  const upcoming =
    !todo.done &&
    !inPlay &&
    ((plannedIn !== null && plannedIn > 0) ||
      (todo.plannedDate === null && deadlineIn !== null && deadlineIn > 0));

  let pressure = 0;
  if (deadlineIn !== null) {
    if (deadlineIn <= 0) {
      pressure = 1;
    } else if (plannedIn !== null && deadlineIn > plannedIn) {
      // Progress through the planned→deadline window (today is day 0).
      pressure = clamp01((0 - plannedIn) / (deadlineIn - plannedIn));
    } else {
      // No planned window — ramp over the final week before the deadline.
      pressure = clamp01(1 - deadlineIn / 7);
    }
  }

  let level: TodoLevel;
  if (deadlineIn !== null && deadlineIn < 0) level = "overdue";
  else if (pressure >= 0.66) level = "urgent";
  else if (pressure >= 0.34) level = "soon";
  else if (inPlay) level = "today";
  else level = "upcoming";

  return { inPlay, upcoming, pressure, level };
}

// Open to-dos to work on today (planned date reached or deadline here), most
// pressured first.
export function todosInPlay(todos: Todo[]): Todo[] {
  return todos
    .filter((t) => todoUrgency(t).inPlay)
    .sort((a, b) => {
      const pd = todoUrgency(b).pressure - todoUrgency(a).pressure;
      if (pd !== 0) return pd;
      return (daysUntil(a.deadline) ?? 1e9) - (daysUntil(b.deadline) ?? 1e9);
    });
}

// Open to-dos with a future planned date (or future deadline), soonest first.
export function todosUpcoming(todos: Todo[]): Todo[] {
  return todos
    .filter((t) => todoUrgency(t).upcoming)
    .sort((a, b) => {
      const ka = daysUntil(a.plannedDate ?? a.deadline) ?? 1e9;
      const kb = daysUntil(b.plannedDate ?? b.deadline) ?? 1e9;
      return ka - kb;
    });
}

interface TimerSnapshotForTodo {
  tCo: string;
  tPr: string;
  tD: string;
  tRun: boolean;
  tSec: number;
  draftId: string | null;
}

interface EntryForTodo {
  id: string;
  _company_id: string;
  _project_id: string;
  description: string;
  hour: string;
}

// Hours tracked against a to-do, derived from its actual time entries (the
// source of truth, kept in sync with the per-client totals). The running
// session counts live: a resumed entry uses the live clock, and a fresh
// session not yet saved is added on top so progress ticks up in real time.
export function todoTrackedH(
  td: Todo,
  entries: EntryForTodo[],
  timer: TimerSnapshotForTodo,
): number {
  const { tCo, tPr, tD, tRun, tSec, draftId } = timer;
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
}

// Sort: open before done; within open, soonest deadline first (no-deadline
// last), then newest. Done items keep newest-first.
export function sortTodos(todos: Todo[]): Todo[] {
  return [...todos].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    if (!a.done) {
      const da = daysUntil(a.deadline);
      const db = daysUntil(b.deadline);
      if (da !== db) {
        if (da === null) return 1;
        if (db === null) return -1;
        return da - db;
      }
    }
    return b.createdAt - a.createdAt;
  });
}
