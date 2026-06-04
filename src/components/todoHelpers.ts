import { daysUntil, type Todo, type TodoLevel } from "../lib/todos";
import type * as prim from "../primitives";

export type Translate = (key: string, vars?: Record<string, string | number>) => string;

export const fmtDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

export const levelTextColor = (level: TodoLevel): prim.TextColor => {
  switch (level) {
    case "overdue":
      return "error";
    case "urgent":
      return "urgent";
    case "soon":
      return "soon";
    case "today":
      return "accent";
    default:
      return "tertiary";
  }
};

export const levelTone = (level: TodoLevel): prim.ProgressBarTone => {
  switch (level) {
    case "overdue":
      return "danger";
    case "urgent":
      return "urgent";
    case "soon":
      return "soon";
    case "today":
      return "accent";
    default:
      return "muted";
  }
};

export const deadlineLabel = (todo: Todo, t: Translate): string | null => {
  const d = daysUntil(todo.deadline);
  if (d === null) return null;
  if (d < 0) return t("todo.overdue");
  if (d === 0) return t("todo.dueToday");
  if (d === 1) return t("todo.dueTomorrow");
  return t("todo.dueInDays", { n: d });
};
