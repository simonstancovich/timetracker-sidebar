import { Fragment } from "react";
import { useTranslation } from "../lib/i18n";
import type { Todo, TodoDraft, TodoFormState } from "../lib/todos";
import { sortTodos, taskKey } from "../lib/todos";
import { Page } from "./Page";
import * as prim from "../primitives";
import { TodoForm } from "./TodoForm";
import { TodoRow } from "./TodoRow";
import * as s from "./TodoView.css";

export { TodoCompactList } from "./TodoCompactList";

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

export function TodoView({
  todos,
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

      {sorted.length === 0 ? (
        <prim.EmptyMessage>{t("todo.empty")}</prim.EmptyMessage>
      ) : (
        <prim.Stack className={s.list}>
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
                    taskKey(td.companyId, td.projectId, td.text) === activeTaskKey
                  }
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
              )}
            </Fragment>
          ))}
        </prim.Stack>
      )}
    </Page>
  );
}
