import type { ReactNode } from "react";
import { useTranslation } from "../lib/i18n";
import type { Todo } from "../lib/todos";
import { vars } from "../theme";
import { MONO } from "../lib/fonts";
import { Page } from "./Page";
import { TodoCompactList } from "./TodoView";

export type HistoryScale = "day" | "week" | "month";

interface Props {
  historyScale: HistoryScale;
  setHistoryScale: (s: HistoryScale) => void;
  stepHistoryDate: (dir: 1 | -1) => void;
  historyIsOnCurrent: boolean;
  jumpHistoryToCurrent: () => void;
  // The actual day/week/month panels — rendered by App so they can stay wired
  // to whatever state they need without us re-plumbing it through here.
  dayView: ReactNode;
  weekView: ReactNode;
  monthView: ReactNode;
  // Simon-mode "upcoming to-dos" strip below the active panel.
  simonMode: boolean;
  upcomingTodos: Todo[];
  activeTaskKey: string | null;
  startTodo: (todo: Todo) => void;
  editTodo: (todo: Todo) => void;
}

// The History tab: a scale selector (Daily / Weekly / Monthly), prev/next nav,
// jump-to-current button, and the active scale's panel.
export function HistoryView({
  historyScale,
  setHistoryScale,
  stepHistoryDate,
  historyIsOnCurrent,
  jumpHistoryToCurrent,
  dayView,
  weekView,
  monthView,
  simonMode,
  upcomingTodos,
  activeTaskKey,
  startTodo,
  editTodo,
}: Props) {
  const { t } = useTranslation();
  return (
    <Page
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
        <div role="tablist" style={{ display: "flex", gap: 4 }}>
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
                  color: isActive ? vars.typography.onAccent : vars.typography.tertiary,
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
            <svg
              viewBox="0 0 24 24"
              width={12}
              height={12}
              fill="none"
              stroke="currentColor"
              strokeWidth={2.25}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
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
            <svg
              viewBox="0 0 24 24"
              width={12}
              height={12}
              fill="none"
              stroke="currentColor"
              strokeWidth={2.25}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
          {!historyIsOnCurrent && (
            <button
              onClick={jumpHistoryToCurrent}
              style={{
                background: vars.typography.accent,
                border: "none",
                color: vars.typography.onAccent,
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
      {historyScale === "day" ? dayView : historyScale === "week" ? weekView : monthView}

      {simonMode && (
        <TodoCompactList
          title={t("todo.upcomingSection")}
          todos={upcomingTodos}
          activeTaskKey={activeTaskKey}
          showPressure={false}
          onStart={startTodo}
          onEdit={editTodo}
        />
      )}
    </Page>
  );
}
