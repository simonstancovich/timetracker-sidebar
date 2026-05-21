import { useTranslation } from "../lib/i18n";
import {
  DisplayText,
  IconButton,
  MonoText,
  Stack,
  TabButton,
  TabList,
} from "../primitives";
import { ChevronDownIcon } from "../icons/ChevronDownIcon";
import { HoursRingButton } from "./HoursRingButton";

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
          <DisplayText size="2xl" italic truncate>
            {clockDate}
          </DisplayText>
          <MonoText size="md" weight="medium">
            {clockTime}
          </MonoText>
        </Stack>

        <Stack direction="row" align="center" gap="sm" shrink={false}>
          <HoursRingButton
            tRun={tRun}
            tSec={tSec}
            todayH={todayH}
            goalHours={goalHours}
            done={done}
            justHitGoal={justHitGoal}
            onClick={() => onTabChange("timer")}
          />
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
