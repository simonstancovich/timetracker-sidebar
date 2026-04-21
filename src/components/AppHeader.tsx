import { useTranslation } from '../lib/i18n'
import { fmtClock, fmtHours } from '../lib/hours'

type Theme = {
  bg: string
  b1: string
  s2: string
  t1: string
  t3: string
  tf: string
  ac: string
  gn: string
  pk: string
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
  const statusDotColor = tRun ? M.pk : tSec > 0 ? '#f59e0b' : '#ef4444'
  const hoursColor = done ? M.gn : todayH > 0 ? M.t1 : M.tf

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
          <span
            style={{
              whiteSpace: 'nowrap',
              color: M.t3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {clockDate}
          </span>
          <span
            style={{
              fontFamily: 'monospace',
              fontWeight: 700,
              color: M.t1,
              fontSize: 13,
            }}
          >
            {clockTime}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: hoursColor,
              fontFamily: 'monospace',
              display: 'inline-flex',
              alignItems: 'center',
              height: 22,
              lineHeight: 1,
            }}
          >
            {fmtHours(todayH)}
          </span>
          <button
            type="button"
            onClick={() => onTabChange('timer')}
            title={statusTitle}
            aria-label={statusTitle}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              cursor: 'pointer',
              background: tRun ? `${M.pk}1f` : 'transparent',
              border: `1px solid ${tRun ? `${M.pk}55` : M.b1}`,
              borderRadius: 100,
              padding: '0 7px',
              height: 22,
              font: 'inherit',
              color: 'inherit',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: statusDotColor,
                boxShadow: tRun ? `0 0 6px ${M.pk}` : 'none',
                animation: tRun ? 'pulse 1.2s ease-in-out infinite' : 'none',
              }}
            />
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: tRun ? M.pk : M.t3,
                fontFamily: 'monospace',
                letterSpacing: 0.3,
              }}
            >
              {statusLabel}
            </span>
          </button>
          <button
            onClick={onMinimize}
            title={t('header.minimizeTopBar')}
            aria-label={t('header.minimizeTopBar')}
            style={{
              width: 24,
              height: 24,
              borderRadius: 7,
              background: M.s2,
              border: `1px solid ${M.b1}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: 9,
              color: M.t3,
              fontWeight: 700,
            }}
          >
            ▼
          </button>
        </div>
      </div>

      <div role="tablist" style={{ display: 'flex' }}>
        {TABS.map(([v, labelKey]) => (
          <button
            key={v}
            data-tour={`tab-${v}`}
            role="tab"
            aria-selected={tab === v}
            onClick={() => onTabChange(v)}
            style={{
              flex: 1,
              padding: '9px 0',
              border: 'none',
              borderBottom: `2px solid ${tab === v ? M.ac : 'transparent'}`,
              background: 'transparent',
              color: tab === v ? M.t1 : M.t3,
              fontSize: 12,
              fontWeight: tab === v ? 700 : 500,
              cursor: 'pointer',
              marginBottom: -1,
            }}
          >
            {t(labelKey)}
          </button>
        ))}
      </div>
    </div>
  )
}
