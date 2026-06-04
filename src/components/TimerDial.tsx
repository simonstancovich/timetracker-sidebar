import { useTranslation } from "../lib/i18n";
import { fmtClock } from "../lib/hours";
import { cx } from "../lib/cx";
import { vars } from "../theme";
import * as prim from "../primitives";
import { PauseIcon } from "../icons/PauseIcon";
import { StopIcon } from "../icons/StopIcon";
import * as s from "./TimerDial.css";

interface Props {
  progress: number;
  done: boolean;
  running: boolean;
  seconds: number;
  onPause: () => void;
  onStop: () => void;
}

export function TimerDial({ progress, done, running, seconds, onPause, onStop }: Props) {
  const { t } = useTranslation();
  const statusText = running
    ? t("timer.recording")
    : seconds > 0
      ? t("status.paused")
      : t("status.idle");
  return (
    <prim.Stack direction="row" justify="center" className={cx(s.dialZone, s.dialZonePad)}>
      <prim.Stack className={s.dialContent}>
        <prim.ActivityRing progress={progress} done={done} size={210} stroke={3} withTicks>
          <prim.Stack className={s.dialCenter}>
            <prim.Text
              as="div"
              className={cx(s.dialClockBase, s.dialClockColor[running ? "running" : "paused"])}
            >
              {fmtClock(seconds)}
            </prim.Text>
            <prim.Text
              as="div"
              className={cx(s.dialStatusBase, s.dialStatusColor[running ? "running" : "idle"])}
            >
              {running && (
                <prim.LivePulseDot
                  size={5}
                  background={vars.typography.pink}
                  ringColor="rgba(244,114,182,.5)"
                />
              )}
              {statusText}
            </prim.Text>
          </prim.Stack>
        </prim.ActivityRing>
      </prim.Stack>
      {running && (
        <prim.Stack direction="row" align="center" justify="center" className={s.dialControls}>
          <prim.Button
            variant="link"
            onClick={onPause}
            aria-label={t("timer.pause")}
            title={t("timer.pause")}
            className={cx(s.dialBtnBase, s.dialBtnTone.pause)}
          >
            <PauseIcon size={22} />
          </prim.Button>
          <prim.Button
            variant="link"
            onClick={onStop}
            aria-label={t("timer.stopLog")}
            title={t("timer.stopLog")}
            className={cx(s.dialBtnBase, s.dialBtnTone.stop)}
          >
            <StopIcon size={22} />
          </prim.Button>
        </prim.Stack>
      )}
    </prim.Stack>
  );
}
