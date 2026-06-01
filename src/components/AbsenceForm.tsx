import { useState } from "react";
import { useTranslation } from "../lib/i18n";
import { workingDaysInRange } from "../lib/absence";
import * as prim from "../primitives";
import { Combobox } from "./Combobox";
import { Page } from "./Page";

interface Item {
  id: string;
  name: string;
}

interface Props {
  company: Item | null;
  projects: Item[];
  minFromISO: string;
  todayISO: string;
  saving: boolean;
  onSubmit: (projectId: string, fromISO: string, toISO: string, note: string) => void;
  onClose: () => void;
}

export function AbsenceForm({ company,
  projects,
  minFromISO,
  todayISO,
  saving,
  onSubmit,
  onClose,
}: Props) {
  const { t } = useTranslation();
  const [project, setProject] = useState("");
  const [from, setFrom] = useState(todayISO);
  const [to, setTo] = useState(todayISO);
  const [note, setNote] = useState("");

  const effectiveFrom = from < minFromISO ? minFromISO : from;
  const days = workingDaysInRange(effectiveFrom, to);
  const canSubmit =
    !!company &&
    !!project &&
    note.trim().length > 0 &&
    days.length > 0 &&
    !saving;

  return (
    <Page
      title={t("absence.title")}
      hint={company ? company.name : t("absence.noClient")}
    >
      {!company ? (
        <prim.EmptyMessage>{t("absence.noClient")}</prim.EmptyMessage>
      ) : (
        <prim.FormCard>
          <prim.Field label={t("absence.type")}>
            <Combobox
              value={project}
              items={projects}
              placeholder={t("form.searchProject")}
              onChange={setProject}
            />
          </prim.Field>
          <prim.Grid columns={2} gap="sm">
            <prim.Field label={t("absence.from")}>
              <prim.TextField
                type="date"
                value={from}
                min={minFromISO}
                onChange={(e) => setFrom(e.target.value)}
              />
            </prim.Field>
            <prim.Field label={t("absence.to")}>
              <prim.TextField
                type="date"
                value={to}
                min={effectiveFrom}
                onChange={(e) => setTo(e.target.value)}
              />
            </prim.Field>
          </prim.Grid>
          <prim.Field label={t("absence.note")}>
            <prim.TextField
              serif
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("absence.notePlaceholder")}
            />
          </prim.Field>
          <prim.MonoText
            size="xs"
            weight="bold"
            tracking="wider"
            align="center"
            color={days.length > 0 ? "accent" : "faint"}
          >
            {days.length > 0
              ? t("absence.preview", { days: days.length, hours: days.length * 8 })
              : t("absence.noDays")}
          </prim.MonoText>
          <prim.Stack direction="row" justify="end" gap="sm">
            <prim.Button variant="ghost" shape="pill" mono size="sm" onClick={onClose}>
              {t("absence.cancel")}
            </prim.Button>
            <prim.Button
              shape="pill"
              mono
              size="sm"
              disabled={!canSubmit}
              onClick={() => canSubmit && onSubmit(project, effectiveFrom, to, note)}
            >
              {saving ? t("absence.saving") : t("absence.submit")}
            </prim.Button>
          </prim.Stack>
        </prim.FormCard>
      )}
    </Page>
  );
}
