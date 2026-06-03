import { useTranslation, type Lang } from "../lib/i18n";
import { smartDate } from "../lib/smartDate";
import { formatLocalDate } from "../lib/date";
import { fmtHours } from "../lib/hours";
import { cx } from "../lib/cx";
import type { TimeEntry } from "../api";
import type { PendingEntry } from "../lib/pendingEntries";
import { PlusIcon } from "../icons/PlusIcon";
import * as prim from "../primitives";
import { DayEntryCard } from "./DayEntryCard";
import { DayHero } from "./DayHero";
import * as s from "./DayView.css";

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
  onDeleteEntry: (id: string) => unknown;
  onLogPastTime: () => void;
}

const CHART_KEYS = ["0", "1", "2", "3"] as const;

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
  const goalReached = dayH >= goal;
  const heroSubtitle = goalReached
    ? t("today.heroComplete", { pct: dayBillablePct })
    : t("today.heroProgress", { pct: dayBillablePct, count: dayList.length });
  const totalTone = goalReached ? "goal" : "inProgress";

  return (
    <prim.Stack className={s.root}>
      <prim.Text as="span" className={s.dateLabel}>
        {dayDate}
      </prim.Text>

      {dayList.length > 0 && (
        <DayHero hours={dayH} goalReached={goalReached} subtitle={heroSubtitle} />
      )}

      {dayList.length === 0 && dayEntriesLoading && (
        <prim.Stack gap="sm" paddingY="xs">
          <prim.Skeleton className={s.skeletonTitle} />
          {[0, 1].map((i) => (
            <prim.Skeleton key={i} className={s.skeletonRow} />
          ))}
        </prim.Stack>
      )}
      {dayList.length === 0 && !dayEntriesLoading && (
        <prim.Stack className={s.empty}>
          <prim.Text as="span" className={s.emptyTitle}>
            {t("history.noEntriesForDay")}
          </prim.Text>
          <prim.Text as="span" className={s.emptyHint}>
            {t("history.emptyHint")}
          </prim.Text>
        </prim.Stack>
      )}

      {(
        Object.entries(dayGroups) as [
          string,
          { cid: string; h: number; entries: TimeEntry[] },
        ][]
      ).map(([co, g], gi) => {
        const idx = CHART_KEYS[gi % CHART_KEYS.length]!;
        return (
          <prim.Stack key={co} gap="sm">
            <prim.Stack
              direction="row"
              justify="spaceBetween"
              align="baseline"
              position="relative"
              paddingLeft="md"
            >
              <prim.Stack
                as="span"
                inline
                className={cx(s.groupBar, s.groupBarColor[idx])}
              >
                {null}
              </prim.Stack>
              <prim.Text as="span" className={cx(s.groupName, s.groupNameColor[idx])}>
                {co}
              </prim.Text>
              <prim.MonoText as="span" className={s.groupHours}>
                {fmtHours(g.h)}
              </prim.MonoText>
            </prim.Stack>
            <prim.Stack gap="xs">
              {g.entries.map((e) => (
                <DayEntryCard
                  key={e.id}
                  entry={e}
                  isPending={pendingDeleteId === e.id}
                  onEdit={onEditEntry}
                  onSetPendingDelete={onSetPendingDelete}
                  onConfirmDelete={onDeleteEntry}
                />
              ))}
            </prim.Stack>
          </prim.Stack>
        );
      })}

      {dayList.length > 0 && (
        <prim.Stack
          direction="row"
          justify="spaceBetween"
          align="baseline"
          paddingTop="md"
          className={s.totalDivider}
        >
          <prim.Text as="span" className={s.totalLabel}>
            {t("today.totalLabel")}
          </prim.Text>
          <prim.Text
            as="span"
            className={cx(s.totalNumberBase, s.totalNumberColor[totalTone])}
          >
            {fmtHours(dayH)}
          </prim.Text>
        </prim.Stack>
      )}

      <prim.Button
        onClick={onLogPastTime}
        aria-label={t("timer.logPastTime")}
        title={t("timer.logPastTime")}
        variant="ghost"
        size="sm"
        shape="pill"
        className={s.logPastBtn}
      >
        <PlusIcon size={13} />
        {t("today.logTime")}
      </prim.Button>
    </prim.Stack>
  );
}
