import { useTranslation, type Lang } from "../lib/i18n";
import { smartDate } from "../lib/smartDate";
import { formatLocalDate } from "../lib/date";
import { fmtHours } from "../lib/hours";
import type { TimeEntry } from "../api";
import type { PendingEntry } from "../lib/pendingEntries";
import { vars, chart } from "../theme";
import { MONO, SERIF } from "../lib/fonts";
import { PencilIcon } from "../icons/PencilIcon";
import { XIcon } from "../icons/XIcon";
import { PlusIcon } from "../icons/PlusIcon";

interface Props {
  selectedDate: Date;
  dayEntries: TimeEntry[];
  dayEntriesLoading: boolean;
  pendingQueue: PendingEntry[];
  failedQueue: PendingEntry[];
  goal: number;
  pendingDeleteId: string | null;
  onEditEntry: (e: TimeEntry) => void;
  onSetPendingDelete: (id: string | null) => void;
  onDeleteEntry: (id: string) => void | Promise<void>;
  onLogPastTime: () => void;
}

// The selected-day detail: hero total, per-client entry groups with inline
// edit/delete, day total, and a "log past time" action.
export function DayView({
  selectedDate,
  dayEntries,
  dayEntriesLoading,
  pendingQueue,
  failedQueue,
  goal,
  pendingDeleteId,
  onEditEntry,
  onSetPendingDelete,
  onDeleteEntry,
  onLogPastTime,
}: Props) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as Lang;

  // Merge queued / quarantined entries for the selected day with server rows.
  const sdISO = formatLocalDate(selectedDate);
  const dayIds = new Set(dayEntries.map((e) => e.id));
  const dayList = [
    ...[...pendingQueue, ...failedQueue]
      .filter((x) => x.entry.task_date === sdISO && !dayIds.has(x.entry.id))
      .map((x) => x.entry),
    ...dayEntries,
  ];
  const dayGroups: Record<string, { cid: string; h: number; entries: TimeEntry[] }> = {};
  dayList.forEach((e) => {
    const key = e.company;
    if (!dayGroups[key]) dayGroups[key] = { cid: e._company_id, h: 0, entries: [] };
    dayGroups[key].h = +(dayGroups[key].h + parseFloat(e.hour || "0")).toFixed(2);
    dayGroups[key].entries.push(e);
  });
  const dayH = dayList.reduce((s, e) => s + parseFloat(e.hour || "0"), 0);
  const dayBillableH = dayList.reduce(
    (s, e) => s + (e.invoice === "1" ? parseFloat(e.hour) : 0),
    0,
  );
  const dayBillablePct = dayH > 0 ? Math.round((dayBillableH / dayH) * 100) : 0;
  const dayDate = smartDate(selectedDate, lang, t);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Editorial date label */}
      <div
        style={{
          fontFamily: SERIF,
          fontStyle: "italic",
          fontSize: 22,
          color: vars.typography.primary,
          letterSpacing: -0.3,
          lineHeight: 1.15,
          textAlign: "center",
          paddingTop: 4,
        }}
      >
        {dayDate}
      </div>

      {/* Day hero */}
      {dayList.length > 0 && (
        <div style={{ textAlign: "center", padding: "6px 0 8px" }}>
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 74,
              fontWeight: 400,
              color: dayH >= goal ? vars.typography.green : vars.typography.primary,
              letterSpacing: -2.4,
              lineHeight: 0.9,
              fontVariantNumeric: "tabular-nums",
              display: "inline-block",
            }}
          >
            {fmtHours(dayH).split(":")[0]}
            <span
              aria-hidden
              style={{
                display: "inline-flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: "0.13em",
                height: "0.65em",
                verticalAlign: "0.18em",
                margin: "0 0.12em",
              }}
            >
              <span style={{ width: "0.085em", height: "0.085em", borderRadius: "50%", background: "currentColor" }} />
              <span style={{ width: "0.085em", height: "0.085em", borderRadius: "50%", background: "currentColor" }} />
            </span>
            {fmtHours(dayH).split(":")[1]}
            <span style={{ fontStyle: "italic", fontSize: 34, color: dayH >= goal ? vars.typography.green : vars.typography.accent, marginLeft: 4 }}>h</span>
          </div>
          <div
            style={{
              marginTop: 10,
              fontFamily: MONO,
              fontSize: 10,
              color: vars.typography.tertiary,
              textTransform: "uppercase",
              letterSpacing: 2.2,
              fontWeight: 500,
            }}
          >
            {dayH >= goal
              ? `Day complete · ${dayBillablePct}% billable`
              : `${dayBillablePct}% billable · ${dayList.length} ${dayList.length === 1 ? "entry" : "entries"}`}
          </div>
        </div>
      )}

      {dayList.length === 0 && dayEntriesLoading && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            padding: "4px 0",
          }}
        >
          <div className="skeleton" style={{ height: 18, width: "40%", borderRadius: 6 }} />
          <div className="skeleton" style={{ height: 52, borderRadius: 11 }} />
          <div className="skeleton" style={{ height: 52, borderRadius: 11 }} />
        </div>
      )}
      {dayList.length === 0 && !dayEntriesLoading && (
        <div
          style={{
            textAlign: "center",
            padding: "28px 12px",
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          <div style={{ color: vars.typography.secondary, fontWeight: 600, marginBottom: 4 }}>
            {t("history.noEntriesForDay")}
          </div>
          <div style={{ color: vars.typography.faint, fontSize: 11 }}>
            {t("history.emptyHint")}
          </div>
        </div>
      )}

      {(
        Object.entries(dayGroups) as [
          string,
          { cid: string; h: number; entries: TimeEntry[] },
        ][]
      ).map(([co, g], gi) => (
        <div key={co}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 8,
              paddingLeft: 12,
              position: "relative",
            }}
          >
            <span
              style={{
                position: "absolute",
                left: 0,
                top: 4,
                bottom: 4,
                width: 3,
                borderRadius: 2,
                background: chart[gi % chart.length],
              }}
            />
            <span
              style={{
                fontFamily: SERIF,
                fontSize: 17,
                color: chart[gi % chart.length],
                letterSpacing: -0.1,
                lineHeight: 1.1,
              }}
            >
              {co}
            </span>
            <span
              style={{
                fontFamily: MONO,
                fontSize: 11,
                fontWeight: 600,
                color: vars.typography.secondary,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {fmtHours(g.h)}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {g.entries.map((e) => {
              const isPending = pendingDeleteId === e.id;
              return (
                <div key={e.id} style={{ display: "flex", flexDirection: "column" }}>
                  <div
                    onDoubleClick={() => onEditEntry(e)}
                    title={t("entry.doubleClickEdit")}
                    style={{
                      background: vars.background.surface,
                      border: `1px solid ${isPending ? "#ef4444" : vars.border.soft}`,
                      borderRadius: 11,
                      padding: "9px 11px",
                      borderBottomLeftRadius: isPending ? 0 : 11,
                      borderBottomRightRadius: isPending ? 0 : 11,
                      borderBottom: isPending ? "none" : `1px solid ${vars.border.soft}`,
                      transition: "border-color .15s",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: 8,
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            color: vars.typography.tertiary,
                            marginBottom: 2,
                          }}
                        >
                          {e.project}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: vars.typography.primary,
                            lineHeight: 1.4,
                            wordBreak: "break-word",
                          }}
                        >
                          {e.description}
                        </div>
                        {e.internal_description && (
                          <div
                            style={{
                              fontSize: 11,
                              color: vars.typography.tertiary,
                              marginTop: 4,
                              fontStyle: "italic",
                            }}
                          >
                            {e.internal_description}
                          </div>
                        )}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          flexShrink: 0,
                          paddingTop: 1,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: MONO,
                            fontSize: 12,
                            fontWeight: 700,
                            color: vars.typography.accent,
                          }}
                        >
                          {fmtHours(parseFloat(e.hour))}
                        </span>
                        <button
                          onClick={() => onEditEntry(e)}
                          title={t("entry.doubleClickEdit")}
                          aria-label={t("entry.doubleClickEdit")}
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            background: "transparent",
                            border: `1px solid ${vars.border.soft}`,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            padding: 0,
                            color: vars.typography.secondary,
                            transition: "all .15s ease",
                          }}
                        >
                          <PencilIcon size={12} />
                        </button>
                        <button
                          onClick={() => onSetPendingDelete(isPending ? null : e.id)}
                          aria-label={t("entry.delete")}
                          title={t("entry.delete")}
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            background: isPending ? "rgba(239,68,68,0.10)" : "transparent",
                            border: isPending ? "1px solid #ef4444" : `1px solid ${vars.border.soft}`,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            padding: 0,
                            color: isPending ? "#ef4444" : vars.typography.tertiary,
                            transition: "all .15s ease",
                          }}
                        >
                          <XIcon size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      maxHeight: isPending ? 44 : 0,
                      overflow: "hidden",
                      transition: "max-height .22s ease",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        borderRadius: "0 0 11px 11px",
                        overflow: "hidden",
                        border: `1px solid #ef4444`,
                        borderTop: "none",
                      }}
                    >
                      <button
                        onClick={() => onSetPendingDelete(null)}
                        style={{
                          flex: 1,
                          padding: "10px 0",
                          background: vars.background.raised,
                          border: "none",
                          color: vars.typography.secondary,
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {t("entry.cancel")}
                      </button>
                      <button
                        onClick={async () => {
                          onSetPendingDelete(null);
                          await onDeleteEntry(e.id);
                        }}
                        style={{
                          flex: 1,
                          padding: "10px 0",
                          background: "#ef4444",
                          border: "none",
                          color: "#fff",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        {t("entry.delete")}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {dayList.length > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            paddingTop: 12,
            borderTop: `1px solid ${vars.border.soft}`,
          }}
        >
          <span
            style={{
              fontFamily: MONO,
              fontSize: 9,
              color: vars.typography.faint,
              textTransform: "uppercase",
              letterSpacing: 2.2,
              fontWeight: 600,
            }}
          >
            {t("today.totalLabel")}
          </span>
          <span
            style={{
              fontFamily: SERIF,
              fontSize: 22,
              color: dayH >= goal ? vars.typography.green : vars.typography.primary,
              lineHeight: 1,
              letterSpacing: -0.4,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {fmtHours(dayH)}
          </span>
        </div>
      )}

      <button
        onClick={onLogPastTime}
        aria-label={t("timer.logPastTime")}
        title={t("timer.logPastTime")}
        style={{
          alignSelf: "center",
          marginTop: 4,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "9px 18px 9px 14px",
          borderRadius: 999,
          background: "transparent",
          border: `1px solid ${vars.border.soft}`,
          color: vars.typography.secondary,
          cursor: "pointer",
          fontFamily: MONO,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: 1.4,
          textTransform: "uppercase",
        }}
      >
        <PlusIcon size={13} />
        {t("today.logTime")}
      </button>
    </div>
  );
}
