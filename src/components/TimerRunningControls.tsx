import { useTranslation } from "../lib/i18n";
import { cx } from "../lib/cx";
import * as prim from "../primitives";
import { PauseIcon } from "../icons/PauseIcon";
import { StopIcon } from "../icons/StopIcon";
import { XIcon } from "../icons/XIcon";
import * as s from "./TimerRunningControls.css";

interface Props {
  cancelArmed: boolean;
  onPause: () => void;
  onStop: () => void;
  onToggleCancel: () => void;
  onConfirmCancel: () => void;
}

export function TimerRunningControls({
  cancelArmed,
  onPause,
  onStop,
  onToggleCancel,
  onConfirmCancel,
}: Props) {
  const { t } = useTranslation();
  return (
    <>
      <prim.Stack direction="row" data-tour="timer-controls" className={s.controls}>
        <prim.Button
          variant="link"
          onClick={onPause}
          aria-label={t("timer.pause")}
          title={t("timer.pause")}
          className={s.pauseBtn}
        >
          <PauseIcon size={16} />
        </prim.Button>
        <prim.Button
          variant="link"
          onClick={onStop}
          aria-label={t("timer.stopLog")}
          title={t("timer.stopLog")}
          className={s.stopBtn}
        >
          <StopIcon size={16} />
        </prim.Button>
        <prim.Button
          variant="link"
          onClick={onToggleCancel}
          aria-label={t("timer.cancel")}
          title={t("timer.cancel")}
          className={cx(s.cancelBtnBase, s.cancelBtnTone[cancelArmed ? "armed" : "idle"])}
        >
          <XIcon size={14} />
        </prim.Button>
      </prim.Stack>
      {cancelArmed && (
        <prim.Stack direction="row" className={s.confirmRow}>
          <prim.Button variant="ghost" size="sm" shape="pill" mono onClick={onToggleCancel}>
            {t("entry.cancel")}
          </prim.Button>
          <prim.Button variant="danger" size="sm" shape="pill" mono onClick={onConfirmCancel}>
            {t("timer.cancelDiscard")}
          </prim.Button>
        </prim.Stack>
      )}
    </>
  );
}
