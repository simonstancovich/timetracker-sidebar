import type { MouseEvent } from "react";
import { useTranslation } from "../lib/i18n";
import { useAppContext } from "../lib/AppContext";
import { fmtHours } from "../lib/hours";
import { isPendingId, LIVE_SESSION_ID } from "../lib/pendingEntries";
import { cx } from "../lib/cx";
import * as prim from "../primitives";
import type { TimeEntry } from "../api";
import type { Todo } from "../lib/todos";
import { EntryBadge } from "./EntryBadge";
import { EntryTodoProgress } from "./EntryTodoProgress";
import { EntryActionButton } from "./EntryActionButton";
import * as s from "./EntryRow.css";

interface Props {
  entry: TimeEntry;
  pendingDelete: boolean;
  failedPending: boolean;
  active: boolean;
  showLiveBadge: boolean;
  running: boolean;
  estimatedTodo: Todo | undefined;
  todoLoggedH: number;
  onDoubleClick: () => void;
  onToggleDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
  onAction: (e: MouseEvent<HTMLButtonElement>) => void;
}

export function EntryRow({
  entry,
  pendingDelete,
  failedPending,
  active,
  showLiveBadge,
  running,
  estimatedTodo,
  todoLoggedH,
  onDoubleClick,
  onToggleDelete,
  onCancelDelete,
  onConfirmDelete,
  onAction,
}: Props) {
  const { t } = useTranslation();
  const { simonMode } = useAppContext();
  const isLive = entry.id === LIVE_SESSION_ID;
  const isPending = isPendingId(entry.id);
  const billable = entry.invoice === "1";
  return (
    <prim.Stack className={s.wrap}>
      <prim.Stack
        onDoubleClick={onDoubleClick}
        title={t("entry.doubleClickEdit")}
        className={cx(s.card, pendingDelete && s.cardPendingDelete)}
      >
        <prim.Stack className={s.cardBody}>
          <prim.Stack className={s.headerRow}>
            <prim.Text as="div" className={s.project}>
              {entry.project}
            </prim.Text>
            <prim.Text as="span" className={s.hours}>
              {fmtHours(parseFloat(entry.hour))}
            </prim.Text>
          </prim.Stack>
          <prim.Text as="div" className={s.description}>
            {entry.description}
          </prim.Text>
          {entry.internal_description && (
            <prim.Text as="div" className={s.internalNote}>
              {entry.internal_description}
            </prim.Text>
          )}
          {simonMode && estimatedTodo && (
            <EntryTodoProgress todo={estimatedTodo} loggedHours={todoLoggedH} />
          )}
          <prim.Stack className={s.metaRow}>
            <prim.Stack className={s.badges}>
              <EntryBadge
                tone={billable ? "billable" : "internal"}
                title={billable ? "Billable — shows up on invoice" : "Internal — not billed"}
              >
                {billable ? "Billable" : "Internal"}
              </EntryBadge>
              {isPending && (
                <EntryBadge tone={failedPending ? "failed" : "pending"}>
                  {failedPending ? t("offline.failedBadge") : t("offline.pendingBadge")}
                </EntryBadge>
              )}
              {showLiveBadge && (
                <EntryBadge tone={running ? "live" : "paused"} pulse={running}>
                  {running ? t("timer.recording") : t("status.paused")}
                </EntryBadge>
              )}
            </prim.Stack>
            <prim.Stack className={s.actions}>
              {!isPending && !isLive && (
                <EntryActionButton
                  active={active}
                  onClick={onAction}
                  title={
                    active
                      ? "Pause the running timer"
                      : "Continue this task — timer resumes from logged hours"
                  }
                />
              )}
              {!isLive && (
                <prim.Button
                  variant="link"
                  onClick={onToggleDelete}
                  className={cx(s.deleteBtn, pendingDelete && s.deleteBtnArmed)}
                >
                  ✕
                </prim.Button>
              )}
            </prim.Stack>
          </prim.Stack>
        </prim.Stack>
      </prim.Stack>
      <prim.Stack className={cx(s.confirmDrawer, pendingDelete && s.confirmDrawerOpen)}>
        <prim.Stack className={s.confirmRow}>
          <prim.Button variant="link" onClick={onCancelDelete} className={s.confirmCancel}>
            {t("entry.cancel")}
          </prim.Button>
          <prim.Button variant="link" onClick={onConfirmDelete} className={s.confirmDelete}>
            {t("entry.delete")}
          </prim.Button>
        </prim.Stack>
      </prim.Stack>
    </prim.Stack>
  );
}
