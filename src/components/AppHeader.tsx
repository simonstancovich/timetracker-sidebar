import { useTranslation } from "../lib/i18n";
import { fmtHours } from "../lib/hours";
import {
  ActivityRing,
  IconButton,
  MonoText,
  Stack,
  StatusDot,
  TabButton,
  TabList,
  Text,
} from "../primitives";
import type { StatusDotColor } from "../primitives";
import { ChevronDownIcon } from "../icons/ChevronDownIcon";

export type HeaderTab = "today" | "timer" | "history" | "xp";

interface Props {
  tab: HeaderTab;
  onTabChange: (tab: HeaderTab) => void;
  tRun: boolean;
  tSec: number;
  todayH: number;
  goalHours: number;
  done: boolean;
  justHitGoal?: boolean;
  clockDate: string;
  clockTime: string;
  onMinimize: () => void;
}

const TABS: ReadonlyArray<readonly [HeaderTab, string]> = [
  ["today", "tab.today"],
  ["timer", "tab.timer"],
  ["history", "tab.history"],
  ["xp", "tab.xp"],
];

export function AppHeader({
  tab,
  onTabChange,
  tRun,
  tSec,
  todayH,
  goalHours,
  done,
  justHitGoal = false,
  clockDate,
  clockTime,
  onMinimize,
}: Props) {
  const { t } = useTranslation();

  const statusTitle = tRun
    ? t("status.timerRunning")
    : tSec > 0
      ? t("status.timerPaused")
      : t("status.noTimer");
  const statusDotColor: StatusDotColor = tRun
    ? "pink"
    : tSec > 0
      ? "amber"
      : "red";
  const hoursColor = done ? "green" : todayH > 0 ? "primary" : "faint";

  return (
    <Stack
      background="page"
      paddingTop="md"
      paddingX="md"
      paddingBottom="none"
      gap="md"
    >
      <Stack direction="row" align="center" justify="spaceBetween" gap="sm">
        <Stack direction="column" gap="none" minWidth0>
          <span
            style={{
              fontFamily: '"Instrument Serif","Georgia",serif',
              fontStyle: "italic",
              fontSize: 17,
              lineHeight: 1.15,
              letterSpacing: -0.1,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {clockDate}
          </span>
          <MonoText size="md" weight="medium">
            {clockTime}
          </MonoText>
        </Stack>

        <Stack direction="row" align="center" gap="sm" shrink={false}>
          <button
            type="button"
            onClick={() => onTabChange("timer")}
            title={statusTitle}
            aria-label={statusTitle}
            className={`ring-button${justHitGoal ? " goal-bloom" : ""}`}
          >
            <ActivityRing
              progress={goalHours > 0 ? todayH / goalHours : 0}
              done={done}
              size={42}
              stroke={2}
            >
              <MonoText size="xs" weight="medium" color={hoursColor}>
                {fmtHours(todayH)}
              </MonoText>
            </ActivityRing>
            <span className="ring-status-dot">
              <StatusDot
                color={statusDotColor}
                glow={tRun}
                pulse={tRun}
                size="sm"
              />
            </span>
          </button>
          <IconButton
            onClick={onMinimize}
            title={t("header.minimizeTopBar")}
            aria-label={t("header.minimizeTopBar")}
          >
            <ChevronDownIcon />
          </IconButton>
        </Stack>
      </Stack>

      <TabList>
        {TABS.map(([v, labelKey]) => (
          <TabButton
            key={v}
            data-tour={`tab-${v}`}
            selected={tab === v}
            onClick={() => onTabChange(v)}
          >
            {t(labelKey)}
          </TabButton>
        ))}
      </TabList>
    </Stack>
  );
}
