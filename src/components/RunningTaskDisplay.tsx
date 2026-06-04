import { useTranslation } from "../lib/i18n";
import * as prim from "../primitives";
import * as s from "./RunningTaskDisplay.css";

interface Props {
  coName: string | undefined;
  prName: string | undefined;
  description: string;
  onSwitchTask: () => void;
  onSideQuest: (() => void) | null;
}

export function RunningTaskDisplay({
  coName,
  prName,
  description,
  onSwitchTask,
  onSideQuest,
}: Props) {
  const { t } = useTranslation();
  return (
    <prim.Stack className={s.block}>
      <prim.Text as="div" className={s.client}>
        {coName}
      </prim.Text>
      {prName && (
        <prim.Text as="div" className={s.project}>
          {prName}
        </prim.Text>
      )}
      {description && (
        <prim.Text as="div" className={s.desc}>
          &ldquo;{description}&rdquo;
        </prim.Text>
      )}
      <prim.Stack direction="row" className={s.actionsRow}>
        <prim.Button
          data-tour="timer-switch"
          variant="ghost"
          size="xs"
          shape="pill"
          mono
          onClick={onSwitchTask}
        >
          {t("timer.switchTask")}
        </prim.Button>
        {onSideQuest && (
          <prim.Button
            variant="link"
            data-tour="timer-sidequest"
            onClick={onSideQuest}
            title={t("timer.sideQuestHint")}
            className={s.sideQuestBtn}
          >
            ↯ {t("timer.sideQuest")}
          </prim.Button>
        )}
      </prim.Stack>
    </prim.Stack>
  );
}
