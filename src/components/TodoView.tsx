import { Fragment, type CSSProperties } from "react";
import { vars } from "../theme";
import { useTranslation } from "../lib/i18n";
import { fmtHours } from "../lib/hours";
import type { Todo, TodoDraft, TodoFormState, TodoLevel } from "../lib/todos";
import { daysUntil, sortTodos, taskKey, todoUrgency } from "../lib/todos";
import { MONO, SERIF } from "../lib/fonts";
import { Combobox } from "./Combobox";
import { Page } from "./Page";
import * as prim from "../primitives";
import { livePulseAnim } from "../styles/celebration.css";

interface Item {
  id: string;
  name: string;
}

interface Props {
  todos: Todo[];
  companies: Item[];
  getProjects: (companyId: string) => Item[];
  ensureProjects: (companyId: string) => Promise<void>;
  draft: TodoFormState;
  onDraftChange: (patch: Partial<TodoFormState>) => void;
  activeTaskKey: string | null;
  editingId: string | null;
  onAdd: (draft: TodoDraft) => void;
  onUpdate: (id: string, draft: TodoDraft) => void;
  onResetForm: () => void;
  onEdit: (todo: Todo) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const fmtDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

// Escalating color for each urgency level.
const levelColor = (level: TodoLevel): string => {
  switch (level) {
    case "overdue":
      return vars.typography.error;
    case "urgent":
      return "#ea580c";
    case "soon":
      return "#d97706";
    case "today":
      return vars.typography.accent;
    default:
      return vars.typography.tertiary;
  }
};

// Same escalation as levelColor, expressed as a ProgressBar tone.
const levelTone = (level: TodoLevel): prim.ProgressBarTone => {
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

// Deadline countdown label (null when no deadline).
const deadlineLabel = (todo: Todo, t: Translate): string | null => {
  const d = daysUntil(todo.deadline);
  if (d === null) return null;
  if (d < 0) return t("todo.overdue");
  if (d === 0) return t("todo.dueToday");
  if (d === 1) return t("todo.dueTomorrow");
  return t("todo.dueInDays", { n: d });
};

export function TodoView({ todos,
  companies,
  getProjects,
  ensureProjects,
  draft,
  onDraftChange,
  activeTaskKey,
  editingId,
  onAdd,
  onUpdate,
  onResetForm,
  onEdit,
  onToggle,
  onDelete,
}: Props) {
  const { t } = useTranslation();

  const { text, estimate, planned, deadline, co, pr } = draft;
  const isEditing = editingId !== null;

  const openCount = todos.filter((td) => !td.done).length;
  const doneCount = todos.length - openCount;
  const sorted = sortTodos(todos);

  const canAdd = text.trim().length > 0;
  const submit = () => {
    if (!canAdd) return;
    const est = parseFloat(estimate.replace(",", "."));
    const payload: TodoDraft = {
      text: text.trim(),
      estimateH: Number.isFinite(est) && est > 0 ? est : 0,
      plannedDate: planned || null,
      deadline: deadline || null,
      companyId: co || null,
      companyName: companies.find((c) => c.id === co)?.name || null,
      projectId: pr || null,
      projectName: getProjects(co).find((p) => p.id === pr)?.name || null,
    };
    if (editingId) onUpdate(editingId, payload);
    else onAdd(payload);
    onResetForm();
  };

  return (
    <Page
      title={t("todo.eyebrow")}
      hint={t("todo.eyebrowHint", { open: openCount, done: doneCount })}
    >
      {!isEditing && (
        <TodoForm
          draft={draft}
          onDraftChange={onDraftChange}
          companies={companies}
          getProjects={getProjects}
          ensureProjects={ensureProjects}
          editing={false}
          canSubmit={canAdd}
          onSubmit={submit}
        />
      )}

      {/* List */}
      {sorted.length === 0 ? (
        <prim.EmptyMessage>{t("todo.empty")}</prim.EmptyMessage>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {sorted.map((td) => (
            <Fragment key={td.id}>
              {td.id === editingId ? (
                <TodoForm
                  draft={draft}
                  onDraftChange={onDraftChange}
                  companies={companies}
                  getProjects={getProjects}
                  ensureProjects={ensureProjects}
                  editing
                  canSubmit={canAdd}
                  onSubmit={submit}
                  onCancel={onResetForm}
                />
              ) : (
                <TodoRow
                  todo={td}
                  active={
                    activeTaskKey !== null &&
                    taskKey(td.companyId, td.projectId, td.text) ===
                      activeTaskKey
                  }
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  t={t}
                />
              )}
            </Fragment>
          ))}
        </div>
      )}
    </Page>
  );
}

function TodoForm({ draft,
  onDraftChange,
  companies,
  getProjects,
  ensureProjects,
  editing,
  canSubmit,
  onSubmit,
  onCancel,
}: {
  draft: TodoFormState;
  onDraftChange: (patch: Partial<TodoFormState>) => void;
  companies: Item[];
  getProjects: (companyId: string) => Item[];
  ensureProjects: (companyId: string) => Promise<void>;
  editing: boolean;
  canSubmit: boolean;
  onSubmit: () => void;
  onCancel?: () => void;
}) {
  const { t } = useTranslation();
  const { text, estimate, planned, deadline, co, pr } = draft;

  return (
    <prim.FormCard accent={editing}>
      {editing && (
        <prim.FieldLabel tone="accent">
          {t("todo.editing")}
        </prim.FieldLabel>
      )}
      <prim.TextField
        serif
        value={text}
        onChange={(e) => onDraftChange({ text: e.target.value })}
        onKeyDown={(e) => e.key === "Enter" && onSubmit()}
        placeholder={t("todo.taskPlaceholder")}
        filled={editing}
      />
      <prim.Field label={t("todo.estimateLabel")}>
        <prim.TextField
          value={estimate}
          onChange={(e) => onDraftChange({ estimate: e.target.value })}
          placeholder="2"
          inputMode="decimal"
          filled={editing}
        />
      </prim.Field>
      <prim.Grid columns={2} gap="sm">
        <prim.Field label={t("todo.plannedLabel")}>
          <prim.TextField
            type="date"
            value={planned}
            onChange={(e) => onDraftChange({ planned: e.target.value })}
            filled={editing}
          />
        </prim.Field>
        <prim.Field label={t("todo.deadlineLabel")}>
          <prim.TextField
            type="date"
            value={deadline}
            onChange={(e) => onDraftChange({ deadline: e.target.value })}
            filled={editing}
          />
        </prim.Field>
      </prim.Grid>
      <Combobox
        value={co}
        items={companies}
        placeholder={t("form.searchClient")}
        onChange={async (id) => {
          onDraftChange({ co: id, pr: "" });
          if (id) await ensureProjects(id);
        }}
      />
      {co && (
        <Combobox
          value={pr}
          items={getProjects(co)}
          placeholder={t("form.searchProject")}
          onChange={(id) => onDraftChange({ pr: id })}
        />
      )}
      <prim.Stack direction="row" justify="end" gap="sm">
        {onCancel && (
          <prim.Button variant="ghost" shape="pill" mono size="sm" onClick={onCancel}>
            {t("todo.cancel")}
          </prim.Button>
        )}
        <prim.Button shape="pill" mono size="sm" disabled={!canSubmit} onClick={onSubmit}>
          {editing ? t("todo.save") : t("todo.add")}
        </prim.Button>
      </prim.Stack>
    </prim.FormCard>
  );
}

type Translate = (key: string, vars?: Record<string, string | number>) => string;

function TodoRow({ todo,
  active,
  onToggle,
  onDelete,
  onEdit,
  t,
}: {
  todo: Todo;
  active: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: Todo) => void;
  t: Translate;
}) {
  const pct =
    todo.estimateH > 0 ? Math.min(100, (todo.loggedH / todo.estimateH) * 100) : 0;
  const complete = todo.estimateH > 0 && todo.loggedH >= todo.estimateH;

  const u = todoUrgency(todo);
  const dueLabel = todo.done ? null : deadlineLabel(todo, t);
  const dueColor = levelColor(u.level);

  return (
    <div
      onDoubleClick={() => onEdit(todo)}
      title={t("todo.editHint")}
      style={{
        border: `1px solid ${active ? vars.typography.accent : vars.border.soft}`,
        borderRadius: 12,
        padding: "11px 13px",
        background: active ? vars.background.accent : vars.background.surface,
        opacity: todo.done ? 0.55 : 1,
        boxShadow: active ? `0 0 0 1px color-mix(in srgb, ${vars.typography.accent} 33%, transparent)` : "var(--shadow-engrave)",
        transition: "border-color 200ms ease-out, background 200ms ease-out",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <button
          type="button"
          onClick={() => onToggle(todo.id)}
          aria-label={todo.done ? t("todo.markUndone") : t("todo.markDone")}
          style={{
            flexShrink: 0,
            width: 20,
            height: 20,
            marginTop: 1,
            borderRadius: 6,
            border: `1.5px solid ${todo.done ? vars.typography.green : vars.border.soft}`,
            background: todo.done ? vars.typography.green : "transparent",
            color: vars.typography.onAccent,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
          }}
        >
          {todo.done ? "✓" : ""}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              color: vars.typography.primary,
              lineHeight: 1.35,
              textDecoration: todo.done ? "line-through" : "none",
              overflowWrap: "anywhere",
              wordBreak: "break-word",
            }}
          >
            {todo.text}
          </div>
          {(todo.companyName || todo.projectName) && (
            <div
              style={{
                fontFamily: MONO,
                fontSize: 9,
                color: vars.typography.faint,
                textTransform: "uppercase",
                letterSpacing: 1.2,
                marginTop: 4,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {[todo.companyName, todo.projectName].filter(Boolean).join(" · ")}
            </div>
          )}
          {todo.plannedDate && !todo.done && (
            <div
              style={{
                fontFamily: MONO,
                fontSize: 9,
                color: vars.typography.tertiary,
                letterSpacing: 0.6,
                marginTop: 4,
              }}
            >
              {t("todo.plannedOn", { date: fmtDate(todo.plannedDate) })}
            </div>
          )}
        </div>
        {active ? (
          <span
            style={{
              flexShrink: 0,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "3px 7px",
              borderRadius: 999,
              background: vars.typography.accent,
              color: vars.typography.onAccent,
              fontFamily: MONO,
              fontSize: 8,
              fontWeight: 700,
              letterSpacing: 1.2,
              textTransform: "uppercase",
            }}
          >
            <prim.LivePulseDot size={5} background={vars.typography.onAccent} ringColor="rgba(255,255,255,.6)" />
            {t("todo.running")}
          </span>
        ) : (
          dueLabel && (
            <span
              style={{
                flexShrink: 0,
                fontFamily: MONO,
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: "uppercase",
                color: dueColor,
              }}
            >
              {dueLabel}
            </span>
          )
        )}
      </div>

      {/* Estimate progress */}
      <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 9 }}>
        <prim.ProgressBar
          grow
          value={todo.estimateH > 0 ? pct / 100 : 0}
          size="thick"
          tone={complete ? "green" : "accent"}
        />
        <span
          style={{
            fontFamily: MONO,
            fontSize: 9.5,
            fontVariantNumeric: "tabular-nums",
            color: complete ? vars.typography.green : vars.typography.tertiary,
            whiteSpace: "nowrap",
          }}
        >
          {todo.estimateH > 0
            ? t("todo.loggedOfEstimate", {
                logged: fmtHours(todo.loggedH),
                estimate: fmtHours(todo.estimateH),
              })
            : `${fmtHours(todo.loggedH)} · ${t("todo.noEstimate")}`}
        </span>
        <button
          type="button"
          onClick={() => onDelete(todo.id)}
          aria-label={t("todo.delete")}
          style={{
            flexShrink: 0,
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: "transparent",
            border: "none",
            color: vars.typography.faint,
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// Compact list used on the Today and History tabs. Read-only-ish: each row can
// be started, and the most pressured items rise to the top via the caller's
// sort. `showPressure` draws the planned→deadline pressure bar (Today only).
export function TodoCompactList({ title,
  todos,
  activeTaskKey,
  showPressure,
  onStart,
  onEdit,
}: {
  title: string;
  todos: Todo[];
  activeTaskKey: string | null;
  showPressure: boolean;
  onStart: (todo: Todo) => void;
  onEdit: (todo: Todo) => void;
}) {
  const { t } = useTranslation();
  if (todos.length === 0) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontFamily: SERIF, fontSize: 17, color: vars.typography.primary }}>
          {title}
        </span>
        <span
          style={{
            fontFamily: MONO,
            fontSize: 10,
            fontWeight: 700,
            color: vars.typography.tertiary,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {todos.length}
        </span>
      </div>
      {todos.map((td) => (
        <Fragment key={td.id}>
          <TodoCompactRow
            todo={td}
            active={
              activeTaskKey !== null &&
              taskKey(td.companyId, td.projectId, td.text) === activeTaskKey
            }
            showPressure={showPressure}
            onStart={onStart}
            onEdit={onEdit}
            t={t}
          />
        </Fragment>
      ))}
    </div>
  );
}

function TodoCompactRow({ todo,
  active,
  showPressure,
  onStart,
  onEdit,
  t,
}: {
  todo: Todo;
  active: boolean;
  showPressure: boolean;
  onStart: (todo: Todo) => void;
  onEdit: (todo: Todo) => void;
  t: Translate;
}) {
  const u = todoUrgency(todo);
  const color = levelColor(u.level);
  const dueText = deadlineLabel(todo, t);
  const badge = dueText ?? (todo.plannedDate ? fmtDate(todo.plannedDate) : null);

  return (
    <div
      onDoubleClick={() => onEdit(todo)}
      title={t("todo.editHint")}
      style={{
        border: `1px solid ${active ? vars.typography.accent : vars.border.soft}`,
        borderLeft: `3px solid ${active ? vars.typography.accent : color}`,
        borderRadius: 9,
        padding: "8px 10px",
        background: active ? vars.background.accent : vars.background.surface,
        boxShadow: "var(--shadow-engrave)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              color: vars.typography.primary,
              lineHeight: 1.3,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {todo.text}
          </div>
          {(todo.companyName || todo.projectName) && (
            <div
              style={{
                fontFamily: MONO,
                fontSize: 8.5,
                color: vars.typography.faint,
                textTransform: "uppercase",
                letterSpacing: 1,
                marginTop: 2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {[todo.companyName, todo.projectName].filter(Boolean).join(" · ")}
            </div>
          )}
        </div>
        {!active && badge && (
          <span
            style={{
              flexShrink: 0,
              fontFamily: MONO,
              fontSize: 8.5,
              fontWeight: 700,
              letterSpacing: 0.8,
              textTransform: "uppercase",
              color,
            }}
          >
            {badge}
          </span>
        )}
        {active ? (
          <span
            className={livePulseAnim}
            style={
              {
                flexShrink: 0,
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "5px 10px",
                borderRadius: 999,
                background: vars.typography.accent,
                color: vars.typography.onAccent,
                fontFamily: MONO,
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: "uppercase",
                "--live-pulse-ring": `color-mix(in srgb, ${vars.typography.accent} 40%, transparent)`,
              } as CSSProperties
            }
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: vars.typography.onAccent,
              }}
            />
            {t("todo.running")}
          </span>
        ) : (
          <button
            type="button"
            onClick={() => onStart(todo)}
            title={t("todo.startTask")}
            style={{
              flexShrink: 0,
              padding: "6px 12px",
              borderRadius: 999,
              background: vars.background.button,
              color: vars.typography.onAccent,
              border: "none",
              fontFamily: MONO,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: "uppercase",
              cursor: "pointer",
              boxShadow: vars.shadow.button,
              whiteSpace: "nowrap",
            }}
          >
            {t("todo.startTask")}
          </button>
        )}
      </div>
      {showPressure && u.pressure > 0 && (
        <div style={{ marginTop: 7 }}>
          <prim.ProgressBar value={u.pressure} size="mid" tone={levelTone(u.level)} />
        </div>
      )}
    </div>
  );
}
