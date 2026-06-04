import { useTranslation } from "../lib/i18n";
import type { TodoFormState } from "../lib/todos";
import * as prim from "../primitives";
import { Combobox } from "./Combobox";

interface Item {
  id: string;
  name: string;
}

interface Props {
  draft: TodoFormState;
  onDraftChange: (patch: Partial<TodoFormState>) => void;
  companies: Item[];
  getProjects: (companyId: string) => Item[];
  ensureProjects: (companyId: string) => Promise<void>;
  editing: boolean;
  canSubmit: boolean;
  onSubmit: () => void;
  onCancel?: () => void;
}

export function TodoForm({
  draft,
  onDraftChange,
  companies,
  getProjects,
  ensureProjects,
  editing,
  canSubmit,
  onSubmit,
  onCancel,
}: Props) {
  const { t } = useTranslation();
  const { text, estimate, planned, deadline, co, pr } = draft;
  return (
    <prim.FormCard accent={editing}>
      {editing && <prim.FieldLabel tone="accent">{t("todo.editing")}</prim.FieldLabel>}
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
