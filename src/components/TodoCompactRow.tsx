import { useTranslation } from "../lib/i18n";
import { cx } from "../lib/cx";
import * as prim from "../primitives";
import type { Todo } from "../lib/todos";
import { taskKey, todoUrgency } from "../lib/todos";
import { livePulseAnim } from "../styles/celebration.css";
import { deadlineLabel, fmtDate, levelTextColor, levelTone } from "./todoHelpers";
import * as s from "./TodoCompactRow.css";

interface Props {
  todo: Todo;
  activeTaskKey: string | null;
  showPressure: boolean;
  onStart: (todo: Todo) => void;
  onEdit: (todo: Todo) => void;
}

export function TodoCompactRow({
  todo,
  activeTaskKey,
  showPressure,
  onStart,
  onEdit,
}: Props) {
  const { t } = useTranslation();
  const u = todoUrgency(todo);
  const active =
    activeTaskKey !== null &&
    taskKey(todo.companyId, todo.projectId, todo.text) === activeTaskKey;
  const dueText = deadlineLabel(todo, t);
  const badge = dueText ?? (todo.plannedDate ? fmtDate(todo.plannedDate) : null);
  const meta = [todo.companyName, todo.projectName].filter(Boolean).join(" · ");
  return (
    <prim.Stack
      onDoubleClick={() => onEdit(todo)}
      title={t("todo.editHint")}
      className={cx(s.card, s.cardLevelBorder[u.level], active && s.cardActive)}
    >
      <prim.Stack className={s.header}>
        <prim.Stack className={s.main}>
          <prim.Text as="div" className={s.text}>
            {todo.text}
          </prim.Text>
          {meta && (
            <prim.Text as="div" className={s.meta}>
              {meta}
            </prim.Text>
          )}
        </prim.Stack>
        {!active && badge && (
          <prim.Text as="span" color={levelTextColor(u.level)} className={s.badge}>
            {badge}
          </prim.Text>
        )}
        {active ? (
          <prim.Text as="span" className={cx(s.runningPill, livePulseAnim)}>
            <prim.Stack as="span" inline className={s.runningDot}>
              {null}
            </prim.Stack>
            {t("todo.running")}
          </prim.Text>
        ) : (
          <prim.Button
            variant="link"
            onClick={() => onStart(todo)}
            title={t("todo.startTask")}
            className={s.startBtn}
          >
            {t("todo.startTask")}
          </prim.Button>
        )}
      </prim.Stack>
      {showPressure && u.pressure > 0 && (
        <prim.Stack className={s.pressureWrap}>
          <prim.ProgressBar value={u.pressure} size="mid" tone={levelTone(u.level)} />
        </prim.Stack>
      )}
    </prim.Stack>
  );
}
