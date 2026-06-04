import type { Dispatch, SetStateAction } from "react";
import { useTranslation } from "../lib/i18n";
import { useAppContext } from "../lib/AppContext";
import { getTimerVibe } from "../lib/timerVibe";
import { cx } from "../lib/cx";
import { vars } from "../theme";
import * as prim from "../primitives";
import { XIcon } from "../icons/XIcon";
import { Page } from "./Page";
import type { TimeEntry } from "../api";
import type { HeaderTab } from "./AppHeader";
import type {
  CompaniesForTimer,
  StashedTimer,
  TimerState,
  TodosForTimer,
} from "./timerTypes";
import { StashedTimerBanner } from "./StashedTimerBanner";
import { TimerDial } from "./TimerDial";
import { TimerForm } from "./TimerForm";
import { TimerStatsStrip } from "./TimerStatsStrip";
import { TimerRunningControls } from "./TimerRunningControls";
import { RunningTaskDisplay } from "./RunningTaskDisplay";
import * as s from "./TimerView.css";

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
  const { tCo, tPr, tD, tNote, tInv, tSec, tRun, draftId, setTRun } = timer;
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

      <TimerDial
        progress={goal > 0 ? todayH / goal : 0}
        done={done}
        running={tRun}
        seconds={tSec}
        onPause={() => setTRun(false)}
        onStop={stop}
      />

      {!tRun &&
        (() => {
          const v = getTimerVibe(tSec, tRun, lang);
          return (
            <prim.Text as="div" className={s.vibe}>
              {v.text}
              {v.icon && (
                <prim.Text as="span" className={s.vibeIcon}>
                  {v.icon}
                </prim.Text>
              )}
            </prim.Text>
          );
        })()}
      {!tRun && timerInsight && (
        <prim.Text as="div" className={s.insight}>
          {timerInsight}
        </prim.Text>
      )}

      {(!tRun || !hasCtx || timerFormOpen) && (
        <TimerForm
          timer={timer}
          companies={companies}
          projects={prList}
          entries={entries}
          canStart={canStart}
          isInternalCompany={isInternalCompany}
          onStopAndLog={() => void stopAndLogCurrent()}
          onDone={() => setTimerFormOpen(false)}
        />
      )}

      {tRun && hasCtx && !timerFormOpen && (
        <RunningTaskDisplay
          coName={coObj?.name}
          prName={prObj?.name}
          description={tD}
          onSwitchTask={() => setTimerFormOpen(true)}
          onSideQuest={stashedTimer ? null : startSideQuest}
        />
      )}

      {tRun && (
        <TimerRunningControls
          cancelArmed={pendingCancelTimer}
          onPause={() => setTRun(false)}
          onStop={stop}
          onToggleCancel={() => setPendingCancelTimer((v) => !v)}
          onConfirmCancel={() => void cancelTimer()}
        />
      )}

      {tRun && (
        <TimerStatsStrip
          sessXP={sessXP}
          todayHours={todayH}
          streak={streak}
          goalReached={done}
        />
      )}

      {!tRun && tSec > 0 && (
        <prim.Stack direction="row" className={s.idleCancelRow}>
          <prim.Button
            variant="link"
            onClick={() => setPendingCancelTimer((v) => !v)}
            aria-label={t("timer.cancel")}
            title={t("timer.cancel")}
            className={cx(
              s.idleCancelBase,
              s.idleCancelTone[pendingCancelTimer ? "armed" : "idle"],
            )}
          >
            <XIcon size={14} />
          </prim.Button>
        </prim.Stack>
      )}

      <prim.Stack direction="row" className={s.absenceRow}>
        <prim.Button variant="ghost" size="sm" shape="pill" mono onClick={openAbsence}>
          {t("absence.button")}
        </prim.Button>
      </prim.Stack>
    </Page>
  );
}
