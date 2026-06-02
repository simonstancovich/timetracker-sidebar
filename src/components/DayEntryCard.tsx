import { useTranslation } from "../lib/i18n";
import { fmtHours } from "../lib/hours";
import { cx } from "../lib/cx";
import type { TimeEntry } from "../api";
import * as prim from "../primitives";
import { PencilIcon } from "../icons/PencilIcon";
import { XIcon } from "../icons/XIcon";
import * as s from "./DayEntryCard.css";

interface Props {
  entry: TimeEntry;
  isPending: boolean;
  onEdit: (e: TimeEntry) => void;
  onSetPendingDelete: (id: string | null) => void;
  onConfirmDelete: (id: string) => unknown;
}

export function DayEntryCard({
  entry,
  isPending,
  onEdit,
  onSetPendingDelete,
  onConfirmDelete,
}: Props) {
  const { t } = useTranslation();
  return (
    <prim.Stack direction="column">
      <prim.Stack
        onDoubleClick={() => onEdit(entry)}
        title={t("entry.doubleClickEdit")}
        className={cx(s.card, isPending ? s.cardBorder.pending : s.cardBorder.normal)}
      >
        <prim.Stack direction="row" align="start" justify="spaceBetween" gap="sm">
          <prim.Stack flex1 minWidth0>
            <prim.Text as="span" className={s.projectLabel}>
              {entry.project}
            </prim.Text>
            <prim.Text as="span" className={s.description}>
              {entry.description}
            </prim.Text>
            {entry.internal_description && (
              <prim.Text as="span" className={s.internalNote}>
                {entry.internal_description}
              </prim.Text>
            )}
          </prim.Stack>
          <prim.Stack direction="row" align="center" gap="xs" noShrink>
            <prim.MonoText as="span" className={s.hours}>
              {fmtHours(parseFloat(entry.hour))}
            </prim.MonoText>
            <prim.IconButton
              variant="outline"
              size="sm"
              shape="circle"
              onClick={() => onEdit(entry)}
              title={t("entry.doubleClickEdit")}
              aria-label={t("entry.doubleClickEdit")}
              className={s.editBtn}
            >
              <PencilIcon size={12} />
            </prim.IconButton>
            <prim.IconButton
              variant="outline"
              size="sm"
              shape="circle"
              onClick={() => onSetPendingDelete(isPending ? null : entry.id)}
              aria-label={t("entry.delete")}
              title={t("entry.delete")}
              className={isPending ? s.deleteBtnState.pending : s.deleteBtnState.normal}
            >
              <XIcon size={12} />
            </prim.IconButton>
          </prim.Stack>
        </prim.Stack>
      </prim.Stack>
      <prim.Stack
        className={cx(
          s.confirmCollapse,
          isPending ? s.confirmCollapseState.open : s.confirmCollapseState.closed,
        )}
      >
        <prim.Stack direction="row" className={s.confirmStrip}>
          <prim.Button
            variant="secondary"
            size="sm"
            grow
            onClick={() => onSetPendingDelete(null)}
            className={cx(s.confirmBtnReset, s.confirmCancel)}
          >
            {t("entry.cancel")}
          </prim.Button>
          <prim.Button
            variant="danger"
            size="sm"
            grow
            onClick={async () => {
              onSetPendingDelete(null);
              await onConfirmDelete(entry.id);
            }}
            className={cx(s.confirmBtnReset, s.confirmDelete)}
          >
            {t("entry.delete")}
          </prim.Button>
        </prim.Stack>
      </prim.Stack>
    </prim.Stack>
  );
}
