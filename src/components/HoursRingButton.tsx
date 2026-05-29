import { useTranslation } from "../lib/i18n";
import { fmtHours } from "../lib/hours";
import * as prim from "../primitives";

interface Props {
  tRun: boolean;
  tSec: number;
  todayH: number;
  goalHours: number;
  done: boolean;
  justHitGoal?: boolean;
  onClick: () => void;
}

export function HoursRingButton({
  tRun,
  tSec,
  todayH,
  goalHours,
  done,
  justHitGoal = false,
  onClick,
}: Props) {
  const { t } = useTranslation();

  const status = tRun ? "running" : tSec > 0 ? "paused" : "idle";

  const statusTitle = t(
    status === "running"
      ? "status.timerRunning"
      : status === "paused"
        ? "status.timerPaused"
        : "status.noTimer",
  );
  const statusDotColor: prim.StatusDotColor =
    status === "running" ? "pink" : status === "paused" ? "warning" : "error";
  const hoursColor = done ? "green" : todayH > 0 ? "primary" : "faint";

  return (
    <prim.IconButton
      variant="ring"
      size="fit"
      onClick={onClick}
      title={statusTitle}
      aria-label={statusTitle}
      className={justHitGoal ? "goal-bloom" : undefined}
      badge={
        <prim.StatusDot
          color={statusDotColor}
          glow={status === "running"}
          pulse={status === "running"}
          size="sm"
        />
      }
    >
      <prim.ActivityRing
        progress={goalHours > 0 ? todayH / goalHours : 0}
        done={done}
        size={42}
        stroke={2}
      >
        <prim.MonoText size="xs" weight="medium" color={hoursColor}>
          {fmtHours(todayH)}
        </prim.MonoText>
      </prim.ActivityRing>
    </prim.IconButton>
  );
}
