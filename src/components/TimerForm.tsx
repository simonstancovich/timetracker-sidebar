import { useTranslation } from "../lib/i18n";
import { cx } from "../lib/cx";
import * as prim from "../primitives";
import type { TimeEntry } from "../api";
import type { CompaniesForTimer, Item, TimerState } from "./timerTypes";
import { Combobox } from "./Combobox";
import { RetryStrip } from "./RetryStrip";
import { RecentDescChips } from "./RecentDescChips";
import { InvoiceableToggle } from "./InvoiceableToggle";
import * as s from "./TimerForm.css";

interface Props {
  timer: TimerState;
  companies: CompaniesForTimer;
  projects: Item[];
  entries: TimeEntry[];
  canStart: boolean;
  isInternalCompany: (cid: string) => boolean;
  onStopAndLog: () => void;
  onDone: () => void;
}

export function TimerForm({
  timer,
  companies,
  projects,
  entries,
  canStart,
  isInternalCompany,
  onStopAndLog,
  onDone,
}: Props) {
  const { t } = useTranslation();
  const {
    tCo, tPr, tD, tNote, tInv, tSec, tRun,
    setTCo, setTPr, setTD, setTNote, setTInv, setTRun,
  } = timer;
  return (
    <prim.Stack className={s.formColumn}>
      {tRun && !canStart && (
        <prim.Text as="div" className={s.needFields}>
          {t("timer.runningNeedFields")}
        </prim.Text>
      )}
      {!tRun &&
        (tSec > 0 && canStart ? (
          <prim.Grid columns={2} gap="sm">
            <prim.Button variant="link" onClick={() => setTRun(true)} className={s.resumeBtn}>
              {t("timer.resume")}
            </prim.Button>
            <prim.Button variant="link" onClick={onStopAndLog} className={s.stopLogBtn}>
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
        <RetryStrip label={t("error.loadClients")} onRetry={companies.reload} />
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
        (companies.projectErrors[tCo] && projects.length === 0 ? (
          <RetryStrip
            label={t("error.loadProjects")}
            onRetry={() => void companies.ensure(tCo)}
          />
        ) : (
          <prim.Stack data-tour="timer-project">
            <Combobox
              value={tPr}
              items={projects}
              placeholder={
                projects.length
                  ? `${t("form.searchProject")} (${projects.length})`
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
          <RecentDescChips entries={entries} projectId={tPr} onSelect={setTD} />
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
          onClick={onDone}
          className={s.formDoneBtn}
        >
          {t("timer.formDone")}
        </prim.Button>
      )}
    </prim.Stack>
  );
}
