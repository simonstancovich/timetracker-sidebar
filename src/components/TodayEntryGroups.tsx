import type { MouseEvent } from "react";
import { useTranslation } from "../lib/i18n";
import { useAppContext } from "../lib/AppContext";
import { fmtHours } from "../lib/hours";
import { LIVE_SESSION_ID } from "../lib/pendingEntries";
import * as prim from "../primitives";
import type { TimeEntry } from "../api";
import type { Todo } from "../lib/todos";
import { EntryRow } from "./EntryRow";
import * as s from "./TodayEntryGroups.css";

interface Group {
  cid: string;
  h: number;
  entries: TimeEntry[];
}

interface Props {
  groups: Record<string, Group>;
  entries: TimeEntry[];
  entriesLoading: boolean;
  emptyMsg: string;
  pendingDeleteId: string | null;
  failedIds: Set<string>;
  running: boolean;
  draftId: string | null;
  estimatedTodoFor: (cid: string, prid: string, desc: string) => Todo | undefined;
  todoTrackedH: (td: Todo) => number;
  onEntryDoubleClick: (entry: TimeEntry) => void;
  onEntryAction: (entry: TimeEntry, e: MouseEvent<HTMLButtonElement>) => void;
  onSetPendingDelete: (id: string | null) => void;
  onDeleteEntry: (id: string) => unknown;
}

export function TodayEntryGroups({
  groups,
  entries,
  entriesLoading,
  emptyMsg,
  pendingDeleteId,
  failedIds,
  running,
  draftId,
  estimatedTodoFor,
  todoTrackedH,
  onEntryDoubleClick,
  onEntryAction,
  onSetPendingDelete,
  onDeleteEntry,
}: Props) {
  const { t } = useTranslation();
  const { locale } = useAppContext();
  return (
    <prim.Stack data-tour="today-entries" className={s.wrap}>
      {(Object.entries(groups) as [string, Group][]).map(([co, g], gi) => (
        <prim.Stack key={co} className={s.group}>
          <prim.Stack className={s.groupHeader}>
            <prim.ChartLabel colorIndex={gi} className={s.groupName}>
              {co}
            </prim.ChartLabel>
            <prim.Text as="span" className={s.groupHours}>
              {fmtHours(g.h)}
            </prim.Text>
          </prim.Stack>
          <prim.Stack className={s.entryList}>
            {g.entries.map((entry) => {
              const isLive = entry.id === LIVE_SESSION_ID;
              const active = running && draftId === entry.id;
              const todo = estimatedTodoFor(
                entry._company_id,
                entry._project_id,
                entry.description,
              );
              return (
                <EntryRow
                  key={entry.id}
                  entry={entry}
                  pendingDelete={pendingDeleteId === entry.id}
                  failedPending={failedIds.has(entry.id)}
                  active={active}
                  showLiveBadge={isLive || active}
                  running={running}
                  estimatedTodo={todo}
                  todoLoggedH={todo ? todoTrackedH(todo) : 0}
                  onDoubleClick={() => onEntryDoubleClick(entry)}
                  onToggleDelete={() =>
                    onSetPendingDelete(pendingDeleteId === entry.id ? null : entry.id)
                  }
                  onCancelDelete={() => onSetPendingDelete(null)}
                  onConfirmDelete={async () => {
                    onSetPendingDelete(null);
                    await onDeleteEntry(entry.id);
                  }}
                  onAction={(e) => onEntryAction(entry, e)}
                />
              );
            })}
          </prim.Stack>
        </prim.Stack>
      ))}

      {entries.length === 0 && entriesLoading && (
        <prim.Stack className={s.skeletonStack}>
          <prim.Skeleton radius="xs" className={s.skeletonHeading} />
          <prim.Skeleton radius="lg" className={s.skeletonCard} />
          <prim.Skeleton radius="lg" className={s.skeletonCard} />
        </prim.Stack>
      )}
      {entries.length === 0 && !entriesLoading && (
        <prim.Stack className={s.emptyWrap}>
          <prim.Text as="div" className={s.emptyHeading}>
            {emptyMsg}
          </prim.Text>
          <prim.Text as="div" className={s.emptySubtitle}>
            {t("today.noEntriesHeader", {
              date: new Date().toLocaleDateString(locale, {
                weekday: "short",
                day: "numeric",
                month: "short",
              }),
            })}
          </prim.Text>
        </prim.Stack>
      )}
    </prim.Stack>
  );
}
