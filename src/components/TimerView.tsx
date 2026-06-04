import type { Dispatch, SetStateAction } from "react";
import { useTranslation } from "../lib/i18n";
import { useAppContext } from "../lib/AppContext";
import { fmtClock, fmtHours } from "../lib/hours";
import { getTimerVibe } from "../lib/timerVibe";
import { MONO, SERIF } from "../lib/fonts";
import { vars } from "../theme";
import * as prim from "../primitives";
import { PauseIcon } from "../icons/PauseIcon";
import { StopIcon } from "../icons/StopIcon";
import { XIcon } from "../icons/XIcon";
import { Page } from "./Page";
import { Combobox } from "./Combobox";
import { RetryStrip } from "./RetryStrip";
import type { TimeEntry } from "../api";
import type { HeaderTab } from "./AppHeader";
import { StashedTimerBanner } from "./StashedTimerBanner";
import * as s from "./TimerView.css";

interface Item {
  id: string;
  name: string;
}

interface StashedTimer {
  co: string;
  pr: string;
  desc: string;
  note: string;
  inv: boolean;
  sec: number;
  draftId: string | null;
  coName: string;
}

interface TimerState {
  tCo: string;
  tPr: string;
  tD: string;
  tNote: string;
  tInv: boolean;
  tSec: number;
  tRun: boolean;
  draftId: string | null;
  setTCo: Dispatch<SetStateAction<string>>;
  setTPr: Dispatch<SetStateAction<string>>;
  setTD: Dispatch<SetStateAction<string>>;
  setTNote: Dispatch<SetStateAction<string>>;
  setTInv: Dispatch<SetStateAction<boolean>>;
  setTRun: Dispatch<SetStateAction<boolean>>;
}

interface TodosForTimer {
  activeTodoId: string | null;
  setActiveTodoId: Dispatch<SetStateAction<string | null>>;
  accrueTodoHours: (todoId: string | null, totalHours: number) => void;
}

interface CompaniesForTimer {
  list: Item[];
  cache: Record<string, Item[]>;
  error: boolean;
  projectErrors: Record<string, boolean>;
  ensure: (cid: string) => unknown;
  reload: () => void;
}

interface Props {
  timer: TimerState;
  todos: TodosForTimer;
  companies: CompaniesForTimer;
  entries: TimeEntry[];
  saveNewEntry: (
    cid: string,
    prid: string,
    hours: number,
    desc: string,
    inv: boolean,
    internalNote: string,
    entryDate: Date,
    existingId: string | null,
  ) => unknown;
  stopAndLogCurrent: () => unknown;
  cancelTimer: () => unknown;
  startSideQuest: () => void;
  restoreStashedTimer: () => void;
  resetTimer: () => void;
  addFloat: (msg: string, color: string) => void;
  isInternalCompany: (companyId: string) => boolean;
  setTab: (tab: HeaderTab) => void;
  timerFormOpen: boolean;
  setTimerFormOpen: Dispatch<SetStateAction<boolean>>;
  pendingCancelTimer: boolean;
  setPendingCancelTimer: Dispatch<SetStateAction<boolean>>;
  stashedTimer: StashedTimer | null;
  todayH: number;
  streak: number;
  done: boolean;
  goal: number;
  timerInsight: string;
  openAbsence: () => void;
}

// The Timer tab: activity ring + clock, client/project pickers, description &
// notes, invoiceable toggle, start/pause/stop/cancel controls, switch-task and
// side-quest entries, plus the running-state stats strip.
export function TimerView({
  timer,
  todos,
  companies,
  entries,
  saveNewEntry,
  stopAndLogCurrent,
  cancelTimer,
  startSideQuest,
  restoreStashedTimer,
  resetTimer,
  addFloat,
  isInternalCompany,
  setTab,
  timerFormOpen,
  setTimerFormOpen,
  pendingCancelTimer,
  setPendingCancelTimer,
  stashedTimer,
  todayH,
  streak,
  done,
  goal,
  timerInsight,
  openAbsence,
}: Props) {
  const { t } = useTranslation();
  const { lang } = useAppContext();
  const {
    tCo, tPr, tD, tNote, tInv, tSec, tRun, draftId,
    setTCo, setTPr, setTD, setTNote, setTInv, setTRun,
  } = timer;
  const { activeTodoId, setActiveTodoId, accrueTodoHours } = todos;

  const coObj = companies.list.find((c) => c.id === tCo);
  const prList = companies.cache[tCo] || [];
  const prObj = prList.find((p) => p.id === tPr);
  const hasCtx = !!(tCo && tPr);
  const sessXP = Math.round((tSec / 3600) * 8 + 2);

  const canStart = !!(tCo && tPr && tD.trim());
  const stop = async () => {
    if (!canStart) {
      addFloat(t("form.fillFirst"), vars.typography.error);
      return;
    }
    const h = Math.max(1, Math.ceil(tSec / 60)) / 60;
    await saveNewEntry(
      tCo,
      tPr,
      h,
      tD.trim(),
      tInv,
      tNote.trim(),
      new Date(),
      draftId,
    );
    accrueTodoHours(activeTodoId, h);
    setActiveTodoId(null);
    if (stashedTimer) {
      // Side quest logged — pop the main timer back (paused).
      restoreStashedTimer();
    } else {
      resetTimer();
      setTab("today");
    }
  };

  const timerHint = tRun
    ? t("page.timerRunning")
    : tSec > 0
      ? t("page.timerPaused")
      : t("page.timerIdle");

  return (
    <Page title={t("page.timer")} hint={timerHint} gap="sm" fullHeight>
      {stashedTimer && (
        <StashedTimerBanner
          coName={stashedTimer.coName}
          seconds={stashedTimer.sec}
          onReturn={restoreStashedTimer}
        />
      )}

      <div className={s.dialZone} style={{ padding: "12px 0 6px" }}>
        <div className={s.dialContent}>
          <prim.ActivityRing
            progress={goal > 0 ? todayH / goal : 0}
            done={done}
            size={210}
            stroke={3}
            withTicks
          >
            <div style={{ textAlign: "center", padding: "0 8px" }}>
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 38,
                  fontWeight: 400,
                  color: tRun ? vars.typography.primary : vars.typography.tertiary,
                  letterSpacing: -1.5,
                  lineHeight: 0.95,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {fmtClock(tSec)}
              </div>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 8,
                  color: tRun ? vars.typography.pink : vars.typography.faint,
                  fontWeight: 700,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  marginTop: 8,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                {tRun && (
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: vars.typography.pink,
                      animation: "pulse 1.2s ease-in-out infinite",
                    }}
                  />
                )}
                {tRun
                  ? t("timer.recording")
                  : tSec > 0
                    ? t("status.paused")
                    : t("status.idle")}
              </div>
            </div>
          </prim.ActivityRing>
        </div>
        {tRun && (
          <div className={s.dialControls}>
            <button
              type="button"
              onClick={() => setTRun(false)}
              aria-label={t("timer.pause")}
              title={t("timer.pause")}
              className={s.dialBtn}
              style={{
                background: vars.background.surface,
                border: `1px solid ${vars.border.soft}`,
                color: vars.typography.primary,
              }}
            >
              <PauseIcon size={22} />
            </button>
            <button
              type="button"
              onClick={stop}
              aria-label={t("timer.stopLog")}
              title={t("timer.stopLog")}
              className={s.dialBtn}
              style={{
                background: vars.background.button,
                color: vars.typography.onAccent,
                boxShadow: vars.shadow.button,
              }}
            >
              <StopIcon size={22} />
            </button>
          </div>
        )}
      </div>

      {!tRun &&
        (() => {
          const v = getTimerVibe(tSec, tRun, lang);
          return (
            <div
              style={{
                textAlign: "center",
                fontFamily: SERIF,
                fontStyle: "italic",
                fontSize: 15,
                color: vars.typography.tertiary,
                lineHeight: 1.3,
                padding: "0 8px",
              }}
            >
              {v.text}
              {v.icon && <span style={{ marginLeft: 6 }}>{v.icon}</span>}
            </div>
          );
        })()}
      {!tRun && timerInsight && (
        <div
          style={{
            textAlign: "center",
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 13,
            color: vars.typography.faint,
            padding: "0 18px",
            lineHeight: 1.4,
          }}
        >
          {timerInsight}
        </div>
      )}

      {(!tRun || !hasCtx || timerFormOpen) && (
        <div
          style={{
            padding: "4px 0 0",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {tRun && !canStart && (
            <div
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontSize: 14,
                color: vars.typography.pink,
                textAlign: "center",
                padding: "4px 8px",
                lineHeight: 1.4,
              }}
            >
              {t("timer.runningNeedFields")}
            </div>
          )}
          {!tRun &&
            (tSec > 0 && canStart ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                }}
              >
                <button
                  onClick={() => setTRun(true)}
                  style={{
                    height: 44,
                    background: "transparent",
                    border: `1px solid ${vars.border.soft}`,
                    borderRadius: 999,
                    color: vars.typography.primary,
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: 1.4,
                    textTransform: "uppercase",
                    cursor: "pointer",
                  }}
                >
                  {t("timer.resume")}
                </button>
                <button
                  onClick={() => void stopAndLogCurrent()}
                  style={{
                    height: 44,
                    background: vars.background.button,
                    border: "1px solid transparent",
                    borderRadius: 999,
                    color: vars.typography.onAccent,
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: 1.4,
                    textTransform: "uppercase",
                    cursor: "pointer",
                    boxShadow: vars.shadow.button,
                  }}
                >
                  {t("timer.stopLog")}
                </button>
              </div>
            ) : (
              <button
                data-tour="timer-start"
                onClick={() => setTRun(true)}
                style={{
                  width: "100%",
                  height: 44,
                  background: vars.background.button,
                  border: "1px solid transparent",
                  borderRadius: 999,
                  color: vars.typography.onAccent,
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: 1.4,
                  textTransform: "uppercase",
                  cursor: "pointer",
                  boxShadow: vars.shadow.button,
                }}
              >
                {tSec > 0 ? t("timer.resume") : t("timer.start")}
              </button>
            ))}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              margin: "20px 0 14px",
            }}
          >
            <prim.Divider grow />
            <span
              style={{
                fontSize: 10,
                color: vars.typography.secondary,
                fontWeight: 700,
                letterSpacing: 1.4,
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              {t("timer.whatWorking")}
            </span>
            <prim.Divider grow />
          </div>

          {companies.error && companies.list.length === 0 && (
            <RetryStrip
              label={t("error.loadClients")}
              onRetry={companies.reload}
            />
          )}
          <div data-tour="timer-company">
            <Combobox
              value={tCo}
              items={companies.list}
              placeholder={`${t("form.searchClient")} (${companies.list.length})`}
              onChange={async (id) => {
                setTCo(id);
                setTPr("");
                if (isInternalCompany(id)) setTInv(false);
                if (id) await companies.ensure(id);
              }}
            />
          </div>

          {tCo &&
            (companies.projectErrors[tCo] && prList.length === 0 ? (
              <RetryStrip
                label={t("error.loadProjects")}
                onRetry={() => void companies.ensure(tCo)}
              />
            ) : (
              <div data-tour="timer-project">
                <Combobox
                  value={tPr}
                  items={prList}
                  placeholder={
                    prList.length
                      ? `${t("form.searchProject")} (${prList.length})`
                      : t("form.loadingProjects")
                  }
                  onChange={setTPr}
                />
              </div>
            ))}

          {tCo && tPr && (
            <>
              <input
                data-tour="timer-description"
                value={tD}
                onChange={(e) => setTD(e.target.value)}
                placeholder={t("timer.taskDescription")}
                style={{
                  padding: "8px 6px",
                  background: "transparent",
                  border: "none",
                  borderBottom: `1px solid ${tD.trim() ? vars.typography.accent : vars.border.soft}`,
                  borderRadius: 8,
                  color: vars.typography.primary,
                  fontSize: 14,
                  outline: "none",
                  width: "100%",
                }}
              />
              {(() => {
                const recentDescs = Array.from(
                  new Set(
                    entries
                      .filter((e) => e._project_id === tPr && e.description?.trim())
                      .map((e) => e.description.trim()),
                  ),
                ).slice(0, 3);
                if (recentDescs.length === 0) return null;
                return (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: -2 }}>
                    {recentDescs.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setTD(d)}
                        title={d}
                        style={{
                          display: "inline-flex",
                          padding: "4px 10px",
                          borderRadius: 999,
                          background: "transparent",
                          border: `1px solid ${vars.border.soft}`,
                          color: vars.typography.tertiary,
                          fontFamily: SERIF,
                          fontStyle: "italic",
                          fontSize: 12,
                          cursor: "pointer",
                          maxWidth: 220,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          lineHeight: 1.2,
                        }}
                      >
                        &ldquo;{d}&rdquo;
                      </button>
                    ))}
                  </div>
                );
              })()}
              <textarea
                data-tour="timer-note"
                value={tNote}
                onChange={(e) => setTNote(e.target.value)}
                placeholder={t("timer.internalNotes")}
                rows={2}
                style={{
                  padding: "8px 6px",
                  background: "transparent",
                  border: "none",
                  borderBottom: `1px solid ${vars.border.soft}`,
                  borderRadius: 8,
                  color: vars.typography.primary,
                  fontSize: 13,
                  outline: "none",
                  width: "100%",
                  resize: "none",
                  fontFamily: "inherit",
                }}
              />
              <button
                type="button"
                data-tour="timer-invoiceable"
                role="switch"
                aria-checked={tInv}
                aria-label={t("timer.invoiceable")}
                onClick={() => setTInv((v) => !v)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  padding: "8px 2px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  font: "inherit",
                  color: "inherit",
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: vars.typography.secondary,
                    textTransform: "uppercase",
                    letterSpacing: 1.4,
                    fontWeight: 600,
                  }}
                >
                  {t("timer.invoiceable")}
                </span>
                <div
                  style={{
                    width: 28,
                    height: 16,
                    borderRadius: 999,
                    background: tInv ? vars.typography.accent : vars.border.soft,
                    display: "flex",
                    alignItems: "center",
                    padding: 2,
                    transition: "background .2s",
                  }}
                >
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: vars.typography.onAccent,
                      transform: `translateX(${tInv ? 12 : 0}px)`,
                      transition: "transform .2s",
                    }}
                  />
                </div>
              </button>
            </>
          )}
          {tRun && canStart && (
            <button
              type="button"
              data-tour="timer-done"
              onClick={() => setTimerFormOpen(false)}
              style={{
                alignSelf: "center",
                marginTop: 8,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 22px",
                borderRadius: 999,
                background: vars.background.button,
                border: "none",
                color: vars.typography.onAccent,
                cursor: "pointer",
                fontFamily: MONO,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1.4,
                textTransform: "uppercase",
                boxShadow: vars.shadow.button,
              }}
            >
              {t("timer.formDone")}
            </button>
          )}
        </div>
      )}

      {tRun && hasCtx && !timerFormOpen && (
        <div style={{ textAlign: "center", padding: "4px 14px" }}>
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 24,
              color: vars.typography.primary,
              letterSpacing: -0.3,
              lineHeight: 1.1,
            }}
          >
            {coObj?.name}
          </div>
          {prObj?.name && (
            <div
              style={{
                fontFamily: MONO,
                fontSize: 10,
                color: vars.typography.faint,
                textTransform: "uppercase",
                letterSpacing: 1.8,
                fontWeight: 600,
                marginTop: 6,
              }}
            >
              {prObj.name}
            </div>
          )}
          {tD && (
            <div
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontSize: 15,
                color: vars.typography.tertiary,
                marginTop: 14,
                padding: "0 6px",
                lineHeight: 1.45,
              }}
            >
              &ldquo;{tD}&rdquo;
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 14 }}>
            <prim.Button
              data-tour="timer-switch"
              variant="ghost"
              size="xs"
              shape="pill"
              mono
              onClick={() => setTimerFormOpen(true)}
            >
              {t("timer.switchTask")}
            </prim.Button>
            {tRun && !stashedTimer && (
              <button
                type="button"
                data-tour="timer-sidequest"
                onClick={startSideQuest}
                title={t("timer.sideQuestHint")}
                style={{
                  padding: "6px 14px",
                  borderRadius: 999,
                  background: "transparent",
                  border: `1px solid color-mix(in srgb, ${vars.typography.accent} 33%, transparent)`,
                  color: vars.typography.accent,
                  fontFamily: MONO,
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: 1.6,
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "all .15s ease",
                }}
              >
                ↯ {t("timer.sideQuest")}
              </button>
            )}
          </div>
        </div>
      )}

      {tRun && (
        <div
          data-tour="timer-controls"
          style={{
            marginTop: "auto",
            display: "flex",
            justifyContent: "center",
            gap: 18,
            paddingBottom: 16,
          }}
        >
          <button
            type="button"
            onClick={() => setTRun(false)}
            aria-label={t("timer.pause")}
            title={t("timer.pause")}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "transparent",
              border: `1px solid ${vars.border.soft}`,
              color: vars.typography.primary,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all .15s ease",
            }}
          >
            <PauseIcon size={16} />
          </button>
          <button
            type="button"
            onClick={stop}
            aria-label={t("timer.stopLog")}
            title={t("timer.stopLog")}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: vars.background.button,
              border: "none",
              color: vars.typography.onAccent,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: vars.shadow.button,
              transition: "all .15s ease",
            }}
          >
            <StopIcon size={16} />
          </button>
          <button
            type="button"
            onClick={() => setPendingCancelTimer((v) => !v)}
            aria-label={t("timer.cancel")}
            title={t("timer.cancel")}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: pendingCancelTimer
                ? `color-mix(in srgb, ${vars.typography.error} 12%, transparent)`
                : "transparent",
              border: pendingCancelTimer
                ? `1px solid ${vars.typography.error}`
                : `1px solid ${vars.border.soft}`,
              color: pendingCancelTimer ? vars.typography.error : vars.typography.tertiary,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all .15s ease",
            }}
          >
            <XIcon size={14} />
          </button>
        </div>
      )}

      {tRun && pendingCancelTimer && (
        <div
          style={{
            display: "flex",
            gap: 8,
            padding: "0 0 12px",
            justifyContent: "center",
          }}
        >
          <prim.Button
            variant="ghost"
            size="sm"
            shape="pill"
            mono
            onClick={() => setPendingCancelTimer(false)}
          >
            {t("entry.cancel")}
          </prim.Button>
          <prim.Button
            variant="danger"
            size="sm"
            shape="pill"
            mono
            onClick={() => void cancelTimer()}
          >
            {t("timer.cancelDiscard")}
          </prim.Button>
        </div>
      )}

      {tRun && (
        <div
          data-tour="timer-stats"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 8,
            paddingTop: 18,
            borderTop: `1px solid ${vars.border.soft}`,
            textAlign: "center",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: SERIF,
                fontSize: 24,
                color: vars.typography.primary,
                lineHeight: 1,
                letterSpacing: -0.4,
              }}
            >
              +{sessXP}
            </div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 8,
                color: vars.typography.faint,
                textTransform: "uppercase",
                letterSpacing: 1.6,
                fontWeight: 600,
                marginTop: 3,
              }}
            >
              {t("timer.statSessionXp")}
            </div>
          </div>
          <div>
            <div
              style={{
                fontFamily: SERIF,
                fontSize: 24,
                color: done ? vars.typography.green : vars.typography.primary,
                lineHeight: 1,
                letterSpacing: -0.4,
              }}
            >
              {fmtHours(todayH)}
            </div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 8,
                color: vars.typography.faint,
                textTransform: "uppercase",
                letterSpacing: 1.6,
                fontWeight: 600,
                marginTop: 3,
              }}
            >
              {t("timer.statToday")}
            </div>
          </div>
          <div>
            <div
              style={{
                fontFamily: SERIF,
                fontSize: 24,
                color: vars.typography.pink,
                lineHeight: 1,
                letterSpacing: -0.4,
              }}
            >
              {streak}
              <span style={{ fontSize: 16, opacity: 0.7 }}>d</span>
            </div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 8,
                color: vars.typography.faint,
                textTransform: "uppercase",
                letterSpacing: 1.6,
                fontWeight: 600,
                marginTop: 3,
              }}
            >
              {t("timer.statStreak")}
            </div>
          </div>
        </div>
      )}

      {!tRun && tSec > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 14,
            paddingTop: 4,
          }}
        >
          <button
            type="button"
            onClick={() => setPendingCancelTimer((v) => !v)}
            aria-label={t("timer.cancel")}
            title={t("timer.cancel")}
            style={{
              width: 32,
              height: 32,
              padding: 0,
              borderRadius: "50%",
              background: pendingCancelTimer
                ? `color-mix(in srgb, ${vars.typography.error} 10%, transparent)`
                : "transparent",
              border: pendingCancelTimer
                ? `1px solid ${vars.typography.error}`
                : `1px solid ${vars.border.soft}`,
              color: pendingCancelTimer ? vars.typography.error : vars.typography.faint,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all .15s ease",
            }}
          >
            <XIcon size={14} />
          </button>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
        <prim.Button variant="ghost" size="sm" shape="pill" mono onClick={openAbsence}>
          {t("absence.button")}
        </prim.Button>
      </div>
    </Page>
  );
}
