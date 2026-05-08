import { useTranslation } from '../lib/i18n'
import { fmtClock, fmtHours } from '../lib/hours'
import { IconButton, MonoText, Pill, Stack, StatusDot, TabButton, TabList, Text } from '../primitives'
import type { StatusDotColor } from '../primitives'

type Theme = {
  bg: string
  b1: string
  t1: string
  t3: string
}

export type HeaderTab = 'today' | 'timer' | 'history' | 'xp'

interface Props {
  M: Theme
  tab: HeaderTab
  onTabChange: (tab: HeaderTab) => void
  // Running-timer status — drives the clickable pill + live pulse dot.
  tRun: boolean
  tSec: number
  // Today's hours + whether the 8h goal is met (drives the color of the hour badge).
  todayH: number
  done: boolean
  // Pre-formatted clock strings from the parent so the nowTick minute tick
  // stays owned in one place.
  clockDate: string
  clockTime: string
  // Dock the window as the thin top bar.
  onMinimize: () => void
}

const TABS: ReadonlyArray<readonly [HeaderTab, string]> = [
  ['today',   'tab.today'],
  ['timer',   'tab.timer'],
  ['history', 'tab.history'],
  ['xp',      'tab.xp'],
]

export function AppHeader({
  M,
  tab,
  onTabChange,
  tRun,
  tSec,
  todayH,
  done,
  clockDate,
  clockTime,
  onMinimize,
}: Props) {
  const { t } = useTranslation()

  const statusTitle = tRun
    ? t('status.timerRunning')
    : tSec > 0
      ? t('status.timerPaused')
      : t('status.noTimer')
  const statusLabel = tRun
    ? fmtClock(tSec)
    : tSec > 0
      ? t('status.paused')
      : t('status.idle')
  const statusDotColor: StatusDotColor = tRun ? 'pink' : tSec > 0 ? 'amber' : 'red'
  const hoursColor = done ? 'green' : todayH > 0 ? 'primary' : 'faint'

  return (
    <div
      style={{
        padding: '12px 14px 0',
        background: M.bg,
        borderBottom: `1px solid ${M.b1}`,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
          gap: 8,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 6,
            fontSize: 11,
            color: M.t3,
            minWidth: 0,
          }}
        >
          <Text inline size="sm" color="tertiary" truncate>{clockDate}</Text>
          <MonoText size="md">{clockTime}</MonoText>
        </div>

        <Stack direction="row" align="center" gap="sm" shrink={false}>
          <MonoText size="md" color={hoursColor}>{fmtHours(todayH)}</MonoText>
          <Pill
            highlight={tRun ? 'pink' : undefined}
            onClick={() => onTabChange('timer')}
            title={statusTitle}
            aria-label={statusTitle}
          >
            <StatusDot color={statusDotColor} glow={tRun} pulse={tRun} />
            <MonoText
              size="xs"
              color={tRun ? 'pink' : 'tertiary'}
              tracking="wide"
            >
              {statusLabel}
            </MonoText>
          </Pill>
          <IconButton
            onClick={onMinimize}
            title={t('header.minimizeTopBar')}
            aria-label={t('header.minimizeTopBar')}
          >
            ▼
          </IconButton>
        </Stack>
      </div>

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
    </div>
  )
}
