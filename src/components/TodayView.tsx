import type { CSSProperties, Dispatch, SetStateAction } from "react";
import { useTranslation, type Lang } from "../lib/i18n";
import { fmtHours } from "../lib/hours";
import { isPendingId, LIVE_SESSION_ID } from "../lib/pendingEntries";
import type { Todo } from "../lib/todos";
import { vars, chart } from "../theme";
import { MONO, SERIF } from "../lib/fonts";
import * as prim from "../primitives";
import { FlameIcon } from "../icons/FlameIcon";
import { PlusIcon } from "../icons/PlusIcon";
import type { TimeEntry } from "../api";
import type { HeaderTab } from "./AppHeader";
import { StatChip } from "./StatChip";
import { MeetingsWidget } from "./MeetingsWidget";

// Lazy-import TodoCompactList via the barrel so we don't introduce a sibling
// cycle. (Components only depend on primitives; barrel-only consumers are fine.)
import { TodoCompactList } from "./TodoView";

interface Group {
  cid: string;
  h: number;
  entries: TimeEntry[];
}

interface ContinueFrom {
  entryId: string;
  hours: number;
  note: string;
  invoice: boolean;
}

interface TimerForToday {
  tRun: boolean;
  draftId: string | null;
  tCo: string;
  tPr: string;
  setTRun: Dispatch<SetStateAction<boolean>>;
}

interface Props {
  username: string;
  // Computed totals
  todayH: number;
  liveTodayH: number;
  liveTodayEntries: TimeEntry[];
  liveDone: boolean;
  streak: number;
  goal: number;
  // Animation flags
  justHitGoal: boolean;
  justBumpedStreak: boolean;
  // Entries + grouping
  entries: TimeEntry[];
  entriesLoading: boolean;
  groups: Record<string, Group>;
  failedIds: Set<string>;
  pendingDeleteId: string | null;
  setPendingDeleteId: Dispatch<SetStateAction<string | null>>;
  // Timer state subset
  timer: TimerForToday;
  // Simon-mode to-dos
  simonMode: boolean;
  todos: Todo[];
  activeTaskKey: string | null;
  estimatedTodoFor: (cid: string, prid: string, desc: string) => Todo | undefined;
  todoTrackedH: (td: Todo) => number;
  // Callbacks
  setTab: (tab: HeaderTab) => void;
  setTD: Dispatch<SetStateAction<string>>;
  setLogOpen: Dispatch<SetStateAction<boolean>>;
  startTodo: (todo: Todo) => void;
  editTodo: (todo: Todo) => void;
  editEntry: (entry: TimeEntry) => void;
  delEntry: (id: string) => unknown;
  switchTaskGuarded: (cid: string, prid: string, desc: string, continueFrom?: ContinueFrom) => void;
  // i18n + misc
  greetingMsg: string;
  emptyMsg: string;
  mode: "light" | "dark";
  locale: string;
  lang: Lang;
}

// The Today tab: greeting, hero hours number, stat chips (streak/billable/XP),
// optional meetings + todo-today section (simonMode), per-company entry list,
// total footer, "log past time" CTA. Read-only aggregator — all state comes in
// via props and writes go back through callbacks.
export function TodayView({
  username,
  todayH,
  liveTodayH,
  liveTodayEntries,
  liveDone,
  streak,
  goal,
  justHitGoal,
  justBumpedStreak,
  entries,
  entriesLoading,
  groups,
  failedIds,
  pendingDeleteId,
  setPendingDeleteId,
  timer,
  simonMode,
  todos,
  activeTaskKey,
  estimatedTodoFor,
  todoTrackedH,
  setTab,
  setTD,
  setLogOpen,
  startTodo,
  editTodo,
  editEntry,
  delEntry,
  switchTaskGuarded,
  greetingMsg,
  emptyMsg,
  mode,
  locale,
  lang: _lang,
}: Props) {
  void _lang;
  const { t } = useTranslation();
  const { tRun, draftId, tCo, tPr, setTRun } = timer;
  const firstName = username.trim().split(/\s+/)[0];
  const hr = new Date().getHours();
  const greeting =
    hr >= 5 && hr < 12
      ? t("greet.morning")
      : hr >= 12 && hr < 17
        ? t("greet.afternoon")
        : hr >= 17 && hr < 22
          ? t("greet.evening")
          : t("greet.latenight");
  const todayDate = new Date();
  // ISO week + 1-indexed weekday for the page eyebrow hint.
  const eyebrowDate = new Date(
    Date.UTC(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate()),
  );
  const dayNum = eyebrowDate.getUTCDay() || 7;
  eyebrowDate.setUTCDate(eyebrowDate.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(eyebrowDate.getUTCFullYear(), 0, 1));
  const isoWeek = Math.ceil(
    ((eyebrowDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );

  // Today XP + billable % for the chip row.
  const todayBillableH = liveTodayEntries.reduce(
    (s, e) => s + (e.invoice === "1" ? parseFloat(e.hour) : 0),
    0,
  );
  const todayBillablePct =
    todayH > 0 ? Math.round((todayBillableH / todayH) * 100) : 0;
  const todayXp = liveTodayEntries.reduce(
    (s, e) => s + Math.round(10 + parseFloat(e.hour) * 8),
    0,
  );

  return (
    <div style={{ paddingBottom: 24 }}>
      {firstName && (
        <div style={{ padding: "16px 14px 4px" }}>
          <div
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontSize: 22,
              color: vars.typography.primary,
              letterSpacing: -0.3,
              lineHeight: 1.15,
            }}
          >
            {greeting}, {firstName}.
          </div>
          {greetingMsg && (
            <div
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontSize: 14,
                color: vars.typography.accent,
                marginTop: 6,
                lineHeight: 1.4,
                letterSpacing: -0.1,
              }}
            >
              {greetingMsg}
            </div>
          )}
        </div>
      )}
      <prim.PageEyebrow
        title={t("page.today")}
        hint={t("today.eyebrowHint", { week: isoWeek, day: dayNum })}
      />
      <div
        style={{
          padding: "12px 14px 0",
          display: "flex",
          flexDirection: "column",
          gap: 11,
        }}
      >
        <div
          data-tour="today-stats"
          style={{ textAlign: "center", padding: "20px 0 22px" }}
        >
          <div
            className={justHitGoal ? "goal-bloom" : undefined}
            style={{
              fontFamily: SERIF,
              fontSize: 90,
              fontWeight: 400,
              color: liveDone ? vars.typography.green : vars.typography.primary,
              letterSpacing: -3,
              lineHeight: 0.9,
              display: "inline-block",
              textDecoration: "none",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {fmtHours(liveTodayH).split(":")[0]}
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
              <span
                style={{
                  width: "0.085em",
                  height: "0.085em",
                  borderRadius: "50%",
                  background: "currentColor",
                }}
              />
              <span
                style={{
                  width: "0.085em",
                  height: "0.085em",
                  borderRadius: "50%",
                  background: "currentColor",
                }}
              />
            </span>
            {fmtHours(liveTodayH).split(":")[1]}
            <span
              style={{
                fontStyle: "italic",
                fontSize: 40,
                color: liveDone ? vars.typography.green : vars.typography.accent,
                marginLeft: 4,
              }}
            >
              h
            </span>
          </div>
          <div
            style={{
              marginTop: 16,
              fontFamily: MONO,
              fontSize: 12,
              color: vars.typography.tertiary,
              lineHeight: 1.4,
              textTransform: "uppercase",
              letterSpacing: 2.4,
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            {liveDone
              ? t("today.dayDoneSubtitle", { extra: fmtHours(liveTodayH - goal) })
              : t("today.toGoSubtitle", {
                  remaining: fmtHours(Math.max(0, goal - liveTodayH)),
                })}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            <StatChip
              tone="pink"
              icon={<FlameIcon size={11} />}
              value={streak}
              label={t("today.stat.streak")}
              popped={justBumpedStreak}
            />
            <StatChip
              tone="green"
              icon={
                <svg
                  viewBox="0 0 24 24"
                  width="11"
                  height="11"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              }
              value={`${todayBillablePct}%`}
              label={t("today.stat.billable")}
            />
          </div>
          <StatChip tone="accent" value={todayXp} label={t("today.stat.xpToday")} />
        </div>

        {simonMode && (
          <MeetingsWidget
            onStartForMeeting={(title) => {
              setTD(title);
              setTab("timer");
            }}
          />
        )}

        {simonMode && (
          <TodoCompactList
            title={t("todo.todaySection")}
            todos={todos}
            activeTaskKey={activeTaskKey}
            showPressure
            onStart={startTodo}
            onEdit={editTodo}
          />
        )}

        <prim.Divider tone="raised" />

        <div
          data-tour="today-entries"
          style={{ display: "flex", flexDirection: "column", gap: 11 }}
        >
          {(Object.entries(groups) as [string, Group][]).map(([co, g], gi) => (
            <div key={co}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <span
                  style={{
                    fontFamily: SERIF,
                    fontSize: 17,
                    lineHeight: 1.1,
                    color: chart[gi % chart.length],
                    letterSpacing: -0.1,
                  }}
                >
                  {co}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: vars.typography.tertiary,
                    fontFamily: MONO,
                  }}
                >
                  {fmtHours(g.h)}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {g.entries.map((e) => {
                  const isPending = pendingDeleteId === e.id;
                  const isLive = e.id === LIVE_SESSION_ID;
                  return (
                    <div
                      key={e.id}
                      style={{ display: "flex", flexDirection: "column" }}
                    >
                      <div
                        className="entry-card"
                        onDoubleClick={() =>
                          isLive ? setTab("timer") : editEntry(e)
                        }
                        title={t("entry.doubleClickEdit")}
                        style={{
                          background: vars.background.surface,
                          border: `1px solid ${isPending ? vars.typography.error : vars.border.soft}`,
                          borderRadius: 11,
                          padding: "9px 11px",
                          borderBottomLeftRadius: isPending ? 0 : 11,
                          borderBottomRightRadius: isPending ? 0 : 11,
                          borderBottom: isPending
                            ? "none"
                            : `1px solid ${vars.border.soft}`,
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
                            {(() => {
                              if (!simonMode) return null;
                              const eTodo = estimatedTodoFor(
                                e._company_id,
                                e._project_id,
                                e.description,
                              );
                              if (!eTodo) return null;
                              const loggedH = todoTrackedH(eTodo);
                              const pct = Math.min(
                                100,
                                (loggedH / eTodo.estimateH) * 100,
                              );
                              const complete = loggedH >= eTodo.estimateH;
                              return (
                                <div
                                  style={{
                                    marginTop: 6,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 7,
                                  }}
                                >
                                  <div
                                    style={{
                                      flex: 1,
                                      maxWidth: 96,
                                      height: 3,
                                      borderRadius: 2,
                                      background: vars.border.soft,
                                      overflow: "hidden",
                                    }}
                                  >
                                    <div
                                      style={{
                                        height: "100%",
                                        width: `${pct}%`,
                                        background: complete ? vars.typography.green : vars.typography.accent,
                                      }}
                                    />
                                  </div>
                                  <span
                                    style={{
                                      fontFamily: MONO,
                                      fontSize: 9,
                                      fontVariantNumeric: "tabular-nums",
                                      color: complete ? vars.typography.green : vars.typography.tertiary,
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {fmtHours(loggedH)} /{" "}
                                    {fmtHours(eTodo.estimateH)}
                                  </span>
                                </div>
                              );
                            })()}
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
                            <span
                              title={
                                e.invoice === "1"
                                  ? "Billable — shows up on invoice"
                                  : "Internal — not billed"
                              }
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                height: 16,
                                padding: "0 6px",
                                borderRadius: 4,
                                fontSize: 9,
                                fontWeight: 700,
                                letterSpacing: 0.5,
                                textTransform: "uppercase",
                                background:
                                  e.invoice === "1"
                                    ? `color-mix(in srgb, ${vars.typography.accent} 15%, transparent)`
                                    : "transparent",
                                color: e.invoice === "1" ? vars.typography.accent : vars.typography.faint,
                                border: `1px solid ${e.invoice === "1" ? `color-mix(in srgb, ${vars.typography.accent} 33%, transparent)` : vars.border.soft}`,
                              }}
                            >
                              {e.invoice === "1" ? "Billable" : "Internal"}
                            </span>
                            {isPendingId(e.id) &&
                              (failedIds.has(e.id) ? (
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    height: 16,
                                    padding: "0 6px",
                                    borderRadius: 4,
                                    fontSize: 9,
                                    fontWeight: 700,
                                    letterSpacing: 0.5,
                                    textTransform: "uppercase",
                                    background: `color-mix(in srgb, ${vars.typography.error} 15%, transparent)`,
                                    color: vars.typography.error,
                                    border: `1px solid color-mix(in srgb, ${vars.typography.error} 33%, transparent)`,
                                  }}
                                >
                                  {t("offline.failedBadge")}
                                </span>
                              ) : (
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    height: 16,
                                    padding: "0 6px",
                                    borderRadius: 4,
                                    fontSize: 9,
                                    fontWeight: 700,
                                    letterSpacing: 0.5,
                                    textTransform: "uppercase",
                                    background: `color-mix(in srgb, ${vars.typography.warning} 15%, transparent)`,
                                    color: mode === "dark" ? "#fbbf24" : "#b45309",
                                    border: `1px solid color-mix(in srgb, ${vars.typography.warning} 33%, transparent)`,
                                  }}
                                >
                                  {t("offline.pendingBadge")}
                                </span>
                              ))}
                            {(isLive || (tRun && draftId === e.id)) && (
                              <span
                                className={tRun ? "todo-live-dot" : undefined}
                                style={
                                  {
                                    display: "inline-flex",
                                    alignItems: "center",
                                    height: 16,
                                    padding: "0 6px",
                                    borderRadius: 4,
                                    fontSize: 9,
                                    fontWeight: 700,
                                    letterSpacing: 0.5,
                                    textTransform: "uppercase",
                                    background: tRun ? `color-mix(in srgb, ${vars.typography.pink} 15%, transparent)` : vars.background.raised,
                                    color: tRun ? vars.typography.pink : vars.typography.tertiary,
                                    border: `1px solid ${tRun ? `color-mix(in srgb, ${vars.typography.pink} 33%, transparent)` : vars.border.soft}`,
                                    "--todo-live-ring": `color-mix(in srgb, ${vars.typography.pink} 40%, transparent)`,
                                  } as CSSProperties
                                }
                              >
                                {tRun ? t("timer.recording") : t("status.paused")}
                              </span>
                            )}
                            {(() => {
                              if (isPendingId(e.id) || isLive) return null;
                              const isActive = tRun && draftId === e.id;
                              return (
                                <button
                                  onClick={(ev) => {
                                    ev.stopPropagation();
                                    if (isActive) {
                                      setTRun(false);
                                      return;
                                    }
                                    if (
                                      draftId === e.id &&
                                      tCo === e._company_id &&
                                      tPr === e._project_id
                                    ) {
                                      setTRun(true);
                                      setTab("timer");
                                      return;
                                    }
                                    switchTaskGuarded(
                                      e._company_id,
                                      e._project_id,
                                      e.description,
                                      {
                                        entryId: e.id,
                                        hours: parseFloat(e.hour) || 0,
                                        note: e.internal_description || "",
                                        invoice: e.invoice === "1",
                                      },
                                    );
                                  }}
                                  title={
                                    isActive
                                      ? "Pause the running timer"
                                      : "Continue this task — timer resumes from logged hours"
                                  }
                                  style={{
                                    width: 22,
                                    height: 22,
                                    borderRadius: "50%",
                                    background: isActive ? vars.typography.pink : vars.background.button,
                                    border: "none",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    padding: 0,
                                  }}
                                >
                                  {isActive ? (
                                    <svg
                                      width="8"
                                      height="10"
                                      viewBox="0 0 12 14"
                                      fill="none"
                                    >
                                      <rect
                                        x="1"
                                        y="1"
                                        width="3"
                                        height="12"
                                        rx="1"
                                        fill="white"
                                      />
                                      <rect
                                        x="8"
                                        y="1"
                                        width="3"
                                        height="12"
                                        rx="1"
                                        fill="white"
                                      />
                                    </svg>
                                  ) : (
                                    <svg
                                      width="8"
                                      height="10"
                                      viewBox="0 0 13 15"
                                      fill="none"
                                      style={{ marginLeft: 1 }}
                                    >
                                      <path
                                        d="M1.5 1.5L11.5 7.5L1.5 13.5V1.5Z"
                                        fill="white"
                                        stroke="white"
                                        strokeWidth="1.2"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                  )}
                                </button>
                              );
                            })()}
                            {!isLive && (
                              <button
                                onClick={() =>
                                  setPendingDeleteId(isPending ? null : e.id)
                                }
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: isPending ? vars.typography.error : vars.typography.tertiary,
                                  fontSize: 12,
                                  cursor: "pointer",
                                  padding: "2px 4px",
                                  fontWeight: isPending ? 700 : 400,
                                }}
                              >
                                ✕
                              </button>
                            )}
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
                            border: `1px solid ${vars.typography.error}`,
                            borderTop: "none",
                          }}
                        >
                          <button
                            onClick={() => setPendingDeleteId(null)}
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
                              setPendingDeleteId(null);
                              await delEntry(e.id);
                            }}
                            style={{
                              flex: 1,
                              padding: "10px 0",
                              background: vars.typography.error,
                              border: "none",
                              color: vars.typography.onAccent,
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

          {entries.length === 0 && entriesLoading && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                padding: "4px 0",
              }}
            >
              <div
                className="skeleton"
                style={{ height: 18, width: "40%", borderRadius: 6 }}
              />
              <div
                className="skeleton"
                style={{ height: 52, borderRadius: 11 }}
              />
              <div
                className="skeleton"
                style={{ height: 52, borderRadius: 11 }}
              />
            </div>
          )}
          {entries.length === 0 && !entriesLoading && (
            <div
              style={{
                textAlign: "center",
                padding: "28px 12px",
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              <div style={{ color: vars.typography.secondary, fontWeight: 600, marginBottom: 4 }}>
                {emptyMsg}
              </div>
              <div style={{ color: vars.typography.faint, fontSize: 11 }}>
                {t("today.noEntriesHeader", {
                  date: new Date().toLocaleDateString(locale, {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  }),
                })}
              </div>
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 8,
            paddingTop: 8,
            borderTop: `1px solid ${vars.background.raised}`,
          }}
        >
          <span style={{ fontSize: 12, color: vars.typography.tertiary }}>
            {t("today.totalLabel")}
          </span>
          <span
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: liveDone ? vars.typography.green : vars.typography.accent,
              fontFamily: MONO,
            }}
          >
            {fmtHours(liveTodayH)}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingTop: 14,
          }}
        >
          <button
            type="button"
            onClick={() => {
              setTab("timer");
              setLogOpen(true);
            }}
            aria-label={t("timer.logPastTime")}
            style={{
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
              transition: "all .15s ease",
            }}
          >
            <PlusIcon size={13} />
            {t("today.logTime")}
          </button>
        </div>
      </div>
    </div>
  );
}
