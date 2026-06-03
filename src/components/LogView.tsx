import { useTranslation, type Lang } from "../lib/i18n";
import { fmtHours, parseHoursInput } from "../lib/hours";
import { formatLocalDate } from "../lib/date";
import type { TimeEntry } from "../api";
import type { UseLogForm } from "../lib/useLogForm";
import { vars } from "../theme";
import { cx } from "../lib/cx";
import * as prim from "../primitives";
import { RetryStrip } from "./RetryStrip";
import { Combobox } from "./Combobox";
import { RecentTaskCard } from "./RecentTaskCard";
import * as s from "./LogView.css";

interface Item {
  id: string;
  name: string;
}

interface Props {
  form: UseLogForm;
  entries: TimeEntry[];
  companies: {
    list: Item[];
    cache: Record<string, Item[]>;
    error: boolean;
    projectErrors: Record<string, boolean>;
    ensure: (id: string) => unknown;
    reload: () => void;
  };
  saveNewEntry: (
    cid: string,
    prid: string,
    hours: number,
    desc: string,
    inv: boolean,
    note: string,
    date: Date,
    editingId: string | null,
  ) => unknown;
  addFloat: (msg: string, color: string) => void;
  switchTaskGuarded: (cid: string, prid: string, desc: string) => void;
  onClose: () => void;
}

export function LogView({
  form,
  entries,
  companies,
  saveNewEntry,
  addFloat,
  switchTaskGuarded,
  onClose,
}: Props) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as Lang;
  const locale = lang === "sv" ? "sv-SE" : "en-GB";

  const {
    fCo, setFCo, fPr, setFPr, fH, setFH, fD, setFD, fNote, setFNote,
    fInv, setFInv, fHInput, setFHInput, editingId, formDate, setFormDate, reset,
  } = form;

  const isInternalCompany = (companyId: string) =>
    /devcore/i.test(companies.list.find((c) => c.id === companyId)?.name || "");

  const recent: TimeEntry[] = [];
  const seen = new Set<string>();
  entries.forEach((e) => {
    const k = e._company_id + ":" + e._project_id;
    if (!seen.has(k) && recent.length < 3) {
      seen.add(k);
      recent.push(e);
    }
  });
  const prList = companies.cache[fCo] || [];
  const prObj = prList.find((p) => p.id === fPr);
  const co = companies.list.find((c) => c.id === fCo);
  const save = async () => {
    if (!fCo || !fPr || !fD.trim()) {
      addFloat(t("form.fillFirst"), vars.typography.error);
      return;
    }
    if (!co || !prObj) {
      addFloat(t("form.saveFailed", { err: "missing client/project" }), vars.typography.error);
      return;
    }
    const parsed = parseHoursInput(fHInput);
    const liveHours = parsed == null ? fH : Math.max(0, Math.min(24, parsed));
    await saveNewEntry(fCo, fPr, liveHours, fD, fInv, fNote.trim(), formDate, editingId);
    reset();
    onClose();
  };
  const canSave = !!(fCo && fPr && fD.trim());
  const back = () => {
    reset();
    onClose();
  };
  const headingText = editingId
    ? t("form.editingEntryOn", {
        date: formDate.toLocaleDateString(locale, {
          weekday: "short",
          day: "numeric",
          month: "short",
        }),
      })
    : t("timer.logPastTime");
  const internalLabel = lang === "sv" ? "Interna anteckningar" : "Internal notes";

  return (
    <prim.Stack className={s.root}>
      <prim.Stack direction="row" align="center" justify="spaceBetween" gap="sm">
        <prim.Button
          variant="link"
          onClick={back}
          title={t("form.back")}
          className={s.backBtn}
        >
          ← {t("form.back")}
        </prim.Button>
        <prim.Text
          as="span"
          className={cx(s.heading, editingId ? s.headingTone.editing : s.headingTone.default)}
        >
          {headingText}
        </prim.Text>
      </prim.Stack>

      <prim.Field label={t("timer.logFormDate")}>
        <prim.TextInput
          type="date"
          fullWidth
          value={formatLocalDate(formDate)}
          onChange={(e) => {
            const [y, m, d] = e.target.value.split("-").map(Number);
            if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return;
            setFormDate(new Date(y, m - 1, d));
          }}
          className={s.dateInput}
        />
      </prim.Field>

      {recent.length > 0 && !editingId && (
        <prim.Stack>
          <prim.FieldLabel>{t("today.recent")}</prim.FieldLabel>
          <prim.Text as="span" className={s.recentHint}>
            {t("today.opensTimer")}
          </prim.Text>
          <prim.Stack gap="xs">
            {recent.map((r, i) => (
              <RecentTaskCard
                key={r.id}
                index={i}
                company={r.company}
                project={r.project}
                onPlay={() => switchTaskGuarded(r._company_id, r._project_id, r.description)}
              />
            ))}
          </prim.Stack>
        </prim.Stack>
      )}

      <prim.Stack direction="row" align="center" gap="sm">
        <prim.Divider grow />
        <prim.Text as="span" className={s.dividerLabel}>
          {t("today.orLogManually")}
        </prim.Text>
        <prim.Divider grow />
      </prim.Stack>

      <prim.Field label={t("form.client")}>
        {companies.error && companies.list.length === 0 && (
          <RetryStrip label={t("error.loadClients")} onRetry={companies.reload} />
        )}
        <Combobox
          value={fCo}
          items={companies.list}
          placeholder={`${t("form.searchClient")} (${companies.list.length})`}
          onChange={async (id) => {
            setFCo(id);
            setFPr("");
            if (isInternalCompany(id)) setFInv(false);
            if (id) await companies.ensure(id);
          }}
        />
      </prim.Field>

      {fCo && (
        <prim.Field label={t("form.project")}>
          {companies.projectErrors[fCo] && prList.length === 0 ? (
            <RetryStrip label={t("error.loadProjects")} onRetry={() => void companies.ensure(fCo)} />
          ) : (
            <Combobox
              value={fPr}
              items={prList}
              placeholder={
                prList.length
                  ? `${t("form.searchProject")} (${prList.length})`
                  : t("form.loadingProjects")
              }
              onChange={setFPr}
            />
          )}
        </prim.Field>
      )}

      <prim.Stack data-tour="log-hours">
        <prim.FieldLabel>{t("form.hours")}</prim.FieldLabel>
        <prim.Stack direction="row" align="center" className={s.hoursWrap}>
          <prim.Button
            variant="link"
            aria-label="Decrease hours"
            onClick={() => setFH((h) => Math.max(0.25, +(h - 0.25).toFixed(2)))}
            className={cx(s.stepperBtn, s.stepperBorderLeft)}
          >
            −
          </prim.Button>
          <prim.TextInput
            className={s.hoursInput}
            aria-label={t("form.hours")}
            value={fHInput}
            onChange={(e) => setFHInput(e.target.value)}
            onBlur={() => {
              const parsed = parseHoursInput(fHInput);
              if (parsed == null) {
                setFHInput(fmtHours(fH));
                return;
              }
              const clamped = Math.max(0, Math.min(24, parsed));
              setFH(clamped);
              setFHInput(fmtHours(clamped));
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.currentTarget as HTMLInputElement).blur();
            }}
            onFocus={(e) => e.currentTarget.select()}
          />
          <prim.Button
            variant="link"
            aria-label="Increase hours"
            onClick={() => setFH((h) => Math.min(24, +(h + 0.25).toFixed(2)))}
            className={cx(s.stepperBtn, s.stepperBorderRight)}
          >
            +
          </prim.Button>
        </prim.Stack>
        <prim.Text as="span" className={s.hoursHint}>
          {t("form.typeHoursHint")}
        </prim.Text>
      </prim.Stack>

      <prim.Field label={`${t("form.description")} *`}>
        <prim.TextArea
          fullWidth
          rows={2}
          value={fD}
          onChange={(e) => setFD(e.target.value)}
          placeholder={t("form.descPlaceholder")}
          className={s.textareaField}
        />
      </prim.Field>

      <prim.Stack>
        <prim.FieldLabel>
          {internalLabel}{" "}
          <prim.Text as="span" className={s.notesOptional}>
            {t("form.internalOptional")}
          </prim.Text>
        </prim.FieldLabel>
        <prim.TextArea
          fullWidth
          rows={2}
          value={fNote}
          onChange={(e) => setFNote(e.target.value)}
          placeholder={t("form.internalPlaceholder")}
          className={s.textareaField}
        />
      </prim.Stack>

      <prim.Stack direction="row" align="center" className={s.toggleRow}>
        <prim.Button
          variant="link"
          role="switch"
          aria-checked={fInv}
          aria-label={t("timer.invoiceable")}
          onClick={() => setFInv((v) => !v)}
          className={cx(s.toggleSwitch, fInv ? s.toggleSwitchState.on : s.toggleSwitchState.off)}
        >
          <prim.Stack
            as="span"
            inline
            className={cx(s.toggleKnob, fInv ? s.toggleKnobState.on : s.toggleKnobState.off)}
          >
            {null}
          </prim.Stack>
        </prim.Button>
        <prim.Text as="span" className={s.toggleLabel}>
          {t("timer.invoiceable")}
        </prim.Text>
      </prim.Stack>

      <prim.Button
        variant="primary"
        onClick={save}
        disabled={!canSave}
        className={s.saveBtn}
      >
        {editingId ? t("form.saveChanges") : t("form.saveEntry")}
      </prim.Button>
    </prim.Stack>
  );
}
