import { useTranslation, type Lang } from "../lib/i18n";
import { fmtHours, parseHoursInput } from "../lib/hours";
import { formatLocalDate } from "../lib/date";
import type { TimeEntry } from "../api";
import type { UseLogForm } from "../lib/useLogForm";
import { vars, chart } from "../theme";
import { MONO } from "../lib/fonts";
import * as prim from "../primitives";
import { RetryStrip } from "./RetryStrip";
import { Combobox } from "./Combobox";

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
  selectedDate: Date;
  setSelectedDate: (d: Date) => void;
  onClose: () => void;
}

// The manual time-entry / "log past time" form: date, recent-task shortcuts,
// client/project pickers, hours stepper, description, invoice toggle, save.
export function LogView({
  form,
  entries,
  companies,
  saveNewEntry,
  addFloat,
  switchTaskGuarded,
  selectedDate,
  setSelectedDate,
  onClose,
}: Props) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as Lang;
  const locale = lang === "sv" ? "sv-SE" : "en-GB";

  const {
    fCo, setFCo, fPr, setFPr, fH, setFH, fD, setFD, fNote, setFNote,
    fInv, setFInv, fHInput, setFHInput, editingId, editingDate, setEditingDate, reset,
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
  const pickedDate = editingDate ?? selectedDate;
  const save = async () => {
    if (!fCo || !fPr || !fD.trim()) {
      addFloat(t("form.fillFirst"), "#ef4444");
      return;
    }
    if (!co || !prObj) {
      addFloat(t("form.saveFailed", { err: "missing client/project" }), "#ef4444");
      return;
    }
    // Commit any pending input by parsing fHInput so a user who clicks Save
    // without blurring the hours input still gets their typed value saved.
    const parsed = parseHoursInput(fHInput);
    const liveHours = parsed == null ? fH : Math.max(0, Math.min(24, parsed));
    await saveNewEntry(fCo, fPr, liveHours, fD, fInv, fNote.trim(), pickedDate, editingId);
    reset();
    onClose();
  };
  const canSave = !!(fCo && fPr && fD.trim());

  return (
    <div style={{ padding: "15px 14px 24px", display: "flex", flexDirection: "column", gap: 11 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <button
          onClick={() => {
            reset();
            onClose();
          }}
          title={t("form.back")}
          style={{
            background: vars.background.raised,
            border: `1px solid ${vars.border.soft}`,
            color: vars.typography.secondary,
            borderRadius: 999,
            padding: "6px 12px",
            fontSize: 11,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          ← {t("form.back")}
        </button>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: editingId ? vars.typography.accentInk : vars.typography.secondary,
            letterSpacing: 0.5,
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            flex: 1,
            textAlign: "right",
          }}
        >
          {editingId
            ? t("form.editingEntryOn", {
                date: pickedDate.toLocaleDateString(locale, {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                }),
              })
            : t("timer.logPastTime")}
        </span>
      </div>

      <div>
        <div
          style={{
            fontSize: 9,
            fontWeight: 700,
            color: vars.typography.tertiary,
            letterSpacing: 1.2,
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          {t("timer.logFormDate")}
        </div>
        <input
          type="date"
          value={formatLocalDate(pickedDate)}
          onChange={(e) => {
            const [y, m, d] = e.target.value.split("-").map(Number);
            if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return;
            const next = new Date(y, m - 1, d);
            if (editingId) setEditingDate(next);
            else setSelectedDate(next);
          }}
          style={{
            width: "100%",
            padding: "11px 12px",
            background: vars.background.surface,
            border: `1px solid ${vars.border.soft}`,
            borderRadius: 10,
            color: vars.typography.primary,
            fontSize: 13,
            outline: "none",
          }}
        />
      </div>

      {recent.length > 0 && !editingId && (
        <div>
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: vars.typography.tertiary,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            {t("today.recent")}
          </div>
          <div style={{ fontSize: 11, color: vars.typography.faint, marginBottom: 8 }}>
            {t("today.opensTimer")}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {recent.map((r, i) => (
              <div
                key={r.id}
                style={{
                  background: vars.background.surface,
                  border: `1px solid ${vars.border.soft}`,
                  borderRadius: 12,
                  padding: "10px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: chart[i % chart.length],
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: vars.typography.primary,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {r.company}
                  </div>
                  <div style={{ fontSize: 11, color: vars.typography.tertiary, marginTop: 2 }}>
                    {r.project}
                  </div>
                </div>
                <button
                  onClick={() => switchTaskGuarded(r._company_id, r._project_id, r.description)}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: vars.background.button,
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: vars.shadow.button,
                  }}
                >
                  <svg width="11" height="13" viewBox="0 0 13 15" fill="none" style={{ marginLeft: 2 }}>
                    <path
                      d="M1.5 1.5L11.5 7.5L1.5 13.5V1.5Z"
                      fill="white"
                      stroke="white"
                      strokeWidth="1.2"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <prim.Divider grow />
        <span
          style={{
            fontSize: 10,
            color: vars.typography.tertiary,
            whiteSpace: "nowrap",
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          {t("today.orLogManually")}
        </span>
        <prim.Divider grow />
      </div>

      <div>
        <div
          style={{
            fontSize: 9,
            fontWeight: 700,
            color: vars.typography.tertiary,
            letterSpacing: 1.2,
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          {t("form.client")}
        </div>
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
      </div>

      {fCo && (
        <div>
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: vars.typography.tertiary,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            {t("form.project")}
          </div>
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
        </div>
      )}

      <div data-tour="log-hours">
        <div
          style={{
            fontSize: 9,
            fontWeight: 700,
            color: vars.typography.tertiary,
            letterSpacing: 1.2,
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          {t("form.hours")}
        </div>
        <div
          style={{
            background: vars.background.surface,
            border: `1px solid ${vars.border.soft}`,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          <button
            onClick={() => setFH((h) => Math.max(0.25, +(h - 0.25).toFixed(2)))}
            style={{
              width: 46,
              height: 46,
              background: "transparent",
              border: "none",
              borderRight: `1px solid ${vars.border.soft}`,
              color: vars.typography.tertiary,
              fontSize: 20,
              fontWeight: 200,
              cursor: "pointer",
            }}
          >
            −
          </button>
          <input
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
            style={{
              flex: 1,
              textAlign: "center",
              fontFamily: MONO,
              fontSize: 22,
              fontWeight: 700,
              color: vars.typography.primary,
              letterSpacing: -1,
              background: "transparent",
              border: "none",
              outline: "none",
              width: "100%",
              padding: 0,
            }}
          />
          <button
            onClick={() => setFH((h) => Math.min(24, +(h + 0.25).toFixed(2)))}
            style={{
              width: 46,
              height: 46,
              background: "transparent",
              border: "none",
              borderLeft: `1px solid ${vars.border.soft}`,
              color: vars.typography.tertiary,
              fontSize: 20,
              fontWeight: 200,
              cursor: "pointer",
            }}
          >
            +
          </button>
        </div>
        <div style={{ textAlign: "center", marginTop: 4, fontSize: 11, color: vars.typography.tertiary }}>
          {t("form.typeHoursHint")}
        </div>
      </div>

      <div>
        <div
          style={{
            fontSize: 9,
            fontWeight: 700,
            color: vars.typography.tertiary,
            letterSpacing: 1.2,
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          {t("form.description")} *
        </div>
        <textarea
          value={fD}
          onChange={(e) => setFD(e.target.value)}
          placeholder={t("form.descPlaceholder")}
          rows={2}
          style={{
            width: "100%",
            padding: "11px 12px",
            background: vars.background.surface,
            border: `1px solid ${vars.border.soft}`,
            borderRadius: 10,
            color: vars.typography.primary,
            fontSize: 13,
            outline: "none",
            resize: "none",
          }}
        />
      </div>

      <div>
        <div
          style={{
            fontSize: 9,
            fontWeight: 700,
            color: vars.typography.tertiary,
            letterSpacing: 1.2,
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          {lang === "sv" ? "Interna anteckningar" : "Internal notes"}{" "}
          <span
            style={{
              color: vars.typography.faint,
              fontWeight: 400,
              letterSpacing: 0,
              textTransform: "none",
              fontSize: 10,
            }}
          >
            {t("form.internalOptional")}
          </span>
        </div>
        <textarea
          value={fNote}
          onChange={(e) => setFNote(e.target.value)}
          placeholder={t("form.internalPlaceholder")}
          rows={2}
          style={{
            width: "100%",
            padding: "11px 12px",
            background: vars.background.surface,
            border: `1px solid ${vars.border.soft}`,
            borderRadius: 10,
            color: vars.typography.primary,
            fontSize: 13,
            outline: "none",
            resize: "none",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 12px",
          background: vars.background.surface,
          border: `1px solid ${vars.border.soft}`,
          borderRadius: 10,
        }}
      >
        <button
          type="button"
          role="switch"
          aria-checked={fInv}
          aria-label={t("timer.invoiceable")}
          onClick={() => setFInv((v) => !v)}
          style={{
            width: 40,
            height: 22,
            borderRadius: 11,
            background: fInv ? vars.typography.accent : vars.border.soft,
            display: "flex",
            alignItems: "center",
            padding: 2,
            cursor: "pointer",
            transition: "background .2s",
            border: "none",
          }}
        >
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 9,
              background: "#fff",
              transform: `translateX(${fInv ? 18 : 0}px)`,
              transition: "transform .2s",
              boxShadow: "0 1px 4px rgba(0,0,0,.2)",
            }}
          />
        </button>
        <span style={{ fontSize: 13, color: vars.typography.primary }}>
          {t("timer.invoiceable")}
        </span>
      </div>

      <button
        onClick={save}
        disabled={!canSave}
        style={{
          width: "100%",
          height: 46,
          background: canSave ? vars.background.button : vars.background.glass,
          border: "none",
          borderRadius: 12,
          color: canSave ? "#fff" : vars.typography.tertiary,
          fontSize: 14,
          fontWeight: 700,
          cursor: canSave ? "pointer" : "default",
          boxShadow: canSave ? vars.shadow.button : "none",
        }}
      >
        {editingId ? t("form.saveChanges") : t("form.saveEntry")}
      </button>
    </div>
  );
}
