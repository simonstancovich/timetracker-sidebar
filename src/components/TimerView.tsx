import type { Dispatch, SetStateAction } from "react";
import { useTranslation } from "../lib/i18n";
import { useAppContext } from "../lib/AppContext";
import { getTimerVibe } from "../lib/timerVibe";
import { cx } from "../lib/cx";
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
import { TimerDial } from "./TimerDial";
import { TimerStatsStrip } from "./TimerStatsStrip";
import { InvoiceableToggle } from "./InvoiceableToggle";
import { RunningTaskDisplay } from "./RunningTaskDisplay";
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
        <prim.Stack className={s.formColumn}>
          {tRun && !canStart && (
            <prim.Text as="div" className={s.needFields}>
              {t("timer.runningNeedFields")}
            </prim.Text>
          )}
          {!tRun &&
            (tSec > 0 && canStart ? (
              <prim.Grid columns={2} gap="sm">
                <prim.Button
                  variant="link"
                  onClick={() => setTRun(true)}
                  className={s.resumeBtn}
                >
                  {t("timer.resume")}
                </prim.Button>
                <prim.Button
                  variant="link"
                  onClick={() => void stopAndLogCurrent()}
                  className={s.stopLogBtn}
                >
                  {t("timer.stopLog")}
                </prim.Button>
              </prim.Grid>
            ) : (
              <prim.Button
                variant="link"
                data-tour="timer-start"
                onClick={() => setTRun(true)}
                className={s.startBtn}
              >
                {tSec > 0 ? t("timer.resume") : t("timer.start")}
              </prim.Button>
            ))}
          <prim.Stack direction="row" className={s.ctxRow}>
            <prim.Divider grow />
            <prim.Text as="span" className={s.ctxLabel}>
              {t("timer.whatWorking")}
            </prim.Text>
            <prim.Divider grow />
          </prim.Stack>

          {companies.error && companies.list.length === 0 && (
            <RetryStrip
              label={t("error.loadClients")}
              onRetry={companies.reload}
            />
          )}
          <prim.Stack data-tour="timer-company">
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
          </prim.Stack>

          {tCo &&
            (companies.projectErrors[tCo] && prList.length === 0 ? (
              <RetryStrip
                label={t("error.loadProjects")}
                onRetry={() => void companies.ensure(tCo)}
              />
            ) : (
              <prim.Stack data-tour="timer-project">
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
              </prim.Stack>
            ))}

          {tCo && tPr && (
            <>
              <prim.TextInput
                data-tour="timer-description"
                value={tD}
                onChange={(e) => setTD(e.target.value)}
                placeholder={t("timer.taskDescription")}
                className={cx(s.inlineDesc, tD.trim() && s.inlineInputFocused)}
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
                  <prim.Stack direction="row" className={s.recentDescChips}>
                    {recentDescs.map((d) => (
                      <prim.Button
                        key={d}
                        variant="link"
                        onClick={() => setTD(d)}
                        title={d}
                        className={s.recentDescChip}
                      >
                        &ldquo;{d}&rdquo;
                      </prim.Button>
                    ))}
                  </prim.Stack>
                );
              })()}
              <prim.TextArea
                data-tour="timer-note"
                value={tNote}
                onChange={(e) => setTNote(e.target.value)}
                placeholder={t("timer.internalNotes")}
                rows={2}
                className={s.inlineNote}
              />
              <InvoiceableToggle value={tInv} onToggle={() => setTInv((v) => !v)} />
            </>
          )}
          {tRun && canStart && (
            <prim.Button
              variant="link"
              data-tour="timer-done"
              onClick={() => setTimerFormOpen(false)}
              className={s.formDoneBtn}
            >
              {t("timer.formDone")}
            </prim.Button>
          )}
        </prim.Stack>
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
        <prim.Stack direction="row" data-tour="timer-controls" className={s.runningControls}>
          <prim.Button
            variant="link"
            onClick={() => setTRun(false)}
            aria-label={t("timer.pause")}
            title={t("timer.pause")}
            className={s.ctrlPause}
          >
            <PauseIcon size={16} />
          </prim.Button>
          <prim.Button
            variant="link"
            onClick={stop}
            aria-label={t("timer.stopLog")}
            title={t("timer.stopLog")}
            className={s.ctrlStop}
          >
            <StopIcon size={16} />
          </prim.Button>
          <prim.Button
            variant="link"
            onClick={() => setPendingCancelTimer((v) => !v)}
            aria-label={t("timer.cancel")}
            title={t("timer.cancel")}
            className={cx(
              s.ctrlCancelBase,
              s.ctrlCancelTone[pendingCancelTimer ? "armed" : "idle"],
            )}
          >
            <XIcon size={14} />
          </prim.Button>
        </prim.Stack>
      )}

      {tRun && pendingCancelTimer && (
        <prim.Stack direction="row" className={s.cancelConfirmRow}>
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
        </prim.Stack>
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
