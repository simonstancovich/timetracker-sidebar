import type { ReactNode } from "react";
import { useTranslation } from "../lib/i18n";
import { useAppContext } from "../lib/AppContext";
import { cx } from "../lib/cx";
import type { Todo } from "../lib/todos";
import * as prim from "../primitives";
import { ChevronLeftIcon } from "../icons/ChevronLeftIcon";
import { ChevronRightIcon } from "../icons/ChevronRightIcon";
import { Page } from "./Page";
import { TodoCompactList } from "./TodoView";
import * as s from "./HistoryView.css";

export type HistoryScale = "day" | "week" | "month";

interface Props {
  historyScale: HistoryScale;
  setHistoryScale: (s: HistoryScale) => void;
  stepHistoryDate: (dir: 1 | -1) => void;
  historyIsOnCurrent: boolean;
  jumpHistoryToCurrent: () => void;
  dayView: ReactNode;
  weekView: ReactNode;
  monthView: ReactNode;
  upcomingTodos: Todo[];
  activeTaskKey: string | null;
  startTodo: (todo: Todo) => void;
  editTodo: (todo: Todo) => void;
}

const SCALES = [
  { value: "day" as const, labelKey: "history.daily" },
  { value: "week" as const, labelKey: "history.weekly" },
  { value: "month" as const, labelKey: "history.monthly" },
];

export function HistoryView({
  historyScale,
  setHistoryScale,
  stepHistoryDate,
  historyIsOnCurrent,
  jumpHistoryToCurrent,
  dayView,
  weekView,
  monthView,
  upcomingTodos,
  activeTaskKey,
  startTodo,
  editTodo,
}: Props) {
  const { t } = useTranslation();
  const { simonMode } = useAppContext();
  const scaleLabel = t(`scale.${historyScale}` as "scale.week");
  return (
    <Page title={t("page.history")} hint={scaleLabel} gap={12}>
      <prim.Stack
        direction="row"
        align="center"
        justify="spaceBetween"
        gap="sm"
      >
        <prim.Stack role="tablist" direction="row" gap="xs">
          {SCALES.map(({ value, labelKey }) => {
            const isActive = historyScale === value;
            return (
              <prim.Button
                key={value}
                variant="link"
                role="tab"
                aria-selected={isActive}
                onClick={() => setHistoryScale(value)}
                className={cx(
                  s.scaleTab,
                  isActive ? s.scaleTabState.selected : s.scaleTabState.unselected,
                )}
              >
                {t(labelKey)}
              </prim.Button>
            );
          })}
        </prim.Stack>
        <prim.Stack direction="row" align="center" gap="xs">
          <prim.IconButton
            variant="ghost"
            size="sm"
            shape="circle"
            onClick={() => stepHistoryDate(-1)}
            aria-label={t("scale.prev", { scale: scaleLabel })}
            className={s.navBtn}
          >
            <ChevronLeftIcon size={12} />
          </prim.IconButton>
          <prim.IconButton
            variant="ghost"
            size="sm"
            shape="circle"
            onClick={() => stepHistoryDate(1)}
            aria-label={t("scale.next", { scale: scaleLabel })}
            className={s.navBtn}
          >
            <ChevronRightIcon size={12} />
          </prim.IconButton>
          {!historyIsOnCurrent && (
            <prim.Button
              variant="link"
              onClick={jumpHistoryToCurrent}
              className={s.nowPill}
            >
              {t("header.now")}
            </prim.Button>
          )}
        </prim.Stack>
      </prim.Stack>
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
