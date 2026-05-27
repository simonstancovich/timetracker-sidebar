import { useTranslation } from "../lib/i18n";
import { ChevronDownIcon } from "../icons/ChevronDownIcon";
import * as prim from "../primitives";
import { HoursRingButton } from "./HoursRingButton";

export type HeaderTab = "today" | "todo" | "timer" | "history" | "xp";

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
  showTodo?: boolean;
  onMinimize: () => void;
}

const TABS: ReadonlyArray<readonly [HeaderTab, string]> = [
  ["today", "tab.today"],
  ["todo", "tab.todo"],
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
  showTodo = false,
  onMinimize,
}: Props) {
  const { t } = useTranslation();
  const tabs = TABS.filter(([v]) => v !== "todo" || showTodo);

  return (
    <prim.Stack
      background="page"
      paddingTop="md"
      paddingX="md"
      paddingBottom="none"
      gap="md"
    >
      <prim.Stack direction="row" align="center" justify="spaceBetween" gap="sm">
        <prim.Stack direction="column" gap="none" minWidth0>
          <prim.DisplayText size="2xl" italic truncate>
            {clockDate}
          </prim.DisplayText>
          <prim.MonoText size="md" weight="medium">
            {clockTime}
          </prim.MonoText>
        </prim.Stack>

        <prim.Stack direction="row" align="center" gap="sm" shrink={false}>
          <HoursRingButton
            tRun={tRun}
            tSec={tSec}
            todayH={todayH}
            goalHours={goalHours}
            done={done}
            justHitGoal={justHitGoal}
            onClick={() => onTabChange("timer")}
          />
          <prim.IconButton
            onClick={onMinimize}
            title={t("header.minimizeTopBar")}
            aria-label={t("header.minimizeTopBar")}
          >
            <ChevronDownIcon />
          </prim.IconButton>
        </prim.Stack>
      </prim.Stack>

      <prim.TabList>
        {tabs.map(([v, labelKey]) => (
          <prim.TabButton
            key={v}
            data-tour={`tab-${v}`}
            selected={tab === v}
            onClick={() => onTabChange(v)}
          >
            {t(labelKey)}
          </prim.TabButton>
        ))}
      </prim.TabList>
    </prim.Stack>
  );
}
