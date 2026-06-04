import { useTranslation } from "../lib/i18n";
import { fmtHours } from "../lib/hours";
import { cx } from "../lib/cx";
import { vars } from "../theme";
import * as prim from "../primitives";
import type { Todo } from "../lib/todos";
import { todoUrgency } from "../lib/todos";
import { TodoCheckbox } from "./TodoCheckbox";
import { deadlineLabel, fmtDate, levelTextColor } from "./todoHelpers";
import * as s from "./TodoRow.css";

interface Props {
  todo: Todo;
  active: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: Todo) => void;
}

export function TodoRow({ todo, active, onToggle, onDelete, onEdit }: Props) {
  const { t } = useTranslation();
  const pct =
    todo.estimateH > 0 ? Math.min(100, (todo.loggedH / todo.estimateH) * 100) : 0;
  const complete = todo.estimateH > 0 && todo.loggedH >= todo.estimateH;
  const u = todoUrgency(todo);
  const dueLabel = todo.done ? null : deadlineLabel(todo, t);
  const meta = [todo.companyName, todo.projectName].filter(Boolean).join(" · ");
  return (
    <prim.Stack
      onDoubleClick={() => onEdit(todo)}
      title={t("todo.editHint")}
      className={cx(s.card, active && s.cardActive, todo.done && s.cardDone)}
    >
      <prim.Stack className={s.header}>
        <TodoCheckbox done={todo.done} onToggle={() => onToggle(todo.id)} />
        <prim.Stack className={s.main}>
          <prim.Text as="div" className={cx(s.text, todo.done && s.textDone)}>
            {todo.text}
          </prim.Text>
          {meta && (
            <prim.Text as="div" className={s.meta}>
              {meta}
            </prim.Text>
          )}
          {todo.plannedDate && !todo.done && (
            <prim.Text as="div" className={s.planned}>
              {t("todo.plannedOn", { date: fmtDate(todo.plannedDate) })}
            </prim.Text>
          )}
        </prim.Stack>
        {active ? (
          <prim.Text as="span" className={s.runningPill}>
            <prim.LivePulseDot
              size={5}
              background={vars.typography.onAccent}
              ringColor="rgba(255,255,255,.6)"
            />
            {t("todo.running")}
          </prim.Text>
        ) : (
          dueLabel && (
            <prim.Text as="span" color={levelTextColor(u.level)} className={s.dueBadge}>
              {dueLabel}
            </prim.Text>
          )
        )}
      </prim.Stack>

      <prim.Stack className={s.progressRow}>
        <prim.ProgressBar
          grow
          value={todo.estimateH > 0 ? pct / 100 : 0}
          size="thick"
          tone={complete ? "green" : "accent"}
        />
        <prim.Text as="span" className={cx(s.progressLabel, complete && s.progressLabelComplete)}>
          {todo.estimateH > 0
            ? t("todo.loggedOfEstimate", {
                logged: fmtHours(todo.loggedH),
                estimate: fmtHours(todo.estimateH),
              })
            : `${fmtHours(todo.loggedH)} · ${t("todo.noEstimate")}`}
        </prim.Text>
        <prim.Button
          variant="link"
          onClick={() => onDelete(todo.id)}
          aria-label={t("todo.delete")}
          className={s.deleteBtn}
        >
          ✕
        </prim.Button>
      </prim.Stack>
    </prim.Stack>
  );
}
