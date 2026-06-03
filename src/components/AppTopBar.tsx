import type { ReactNode } from 'react'
import { useTranslation, type Lang } from '../lib/i18n'
import { fmtClock, fmtHours } from '../lib/hours'
import { cx } from '../lib/cx'
import * as prim from '../primitives'
import { streakPop } from '../styles/celebration.css'
import { FlameIcon } from '../icons/FlameIcon'
import { SunIcon } from '../icons/SunIcon'
import { MoonIcon } from '../icons/MoonIcon'
import { PlayIcon } from '../icons/PlayIcon'
import { PauseIcon } from '../icons/PauseIcon'
import type { Todo } from '../lib/todos'
import * as s from './AppTopBar.css'

const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr']
const MARQUEE_REPEATS = 30

interface Company {
  id: string
  name: string
}
interface Project {
  id: string
  name: string
}

interface Props {
  themeClass: string
  mode: 'light' | 'dark'
  setMode: (m: 'light' | 'dark') => void
  lang: Lang
  goSize: (s: 'full' | 'top') => void
  modeOverlay: ReactNode
  tRun: boolean
  setTRun: (next: (prev: boolean) => boolean) => void
  tSec: number
  funMessage: string | null
  windowFocused: boolean
  sessionXp: number
  xpBump: { id: number; delta: number } | null
  justBumpedStreak: boolean
  todayH: number
  streak: number
  weekH: number[]
  goal: number
  done: boolean
  gpct: number
  companies: Company[]
  projectCache: Record<string, Project[]>
  tCo: string
  tPr: string
  topEstTodo?: Todo
  topEstLiveH: number
}

function buildMarquee(msg: string): string {
  const sep = '   •   '
  return (msg + sep).repeat(MARQUEE_REPEATS)
}

export function AppTopBar({
  themeClass,
  mode,
  setMode,
  lang: _lang,
  goSize,
  modeOverlay,
  tRun,
  setTRun,
  tSec,
  funMessage,
  windowFocused,
  sessionXp,
  xpBump,
  justBumpedStreak,
  todayH,
  streak,
  weekH,
  goal,
  done,
  gpct,
  companies,
  projectCache,
  tCo,
  tPr,
  topEstTodo,
  topEstLiveH,
}: Props) {
  void _lang
  const { t } = useTranslation()
  const coObj = companies.find((c) => c.id === tCo)
  const prObj = (projectCache[tCo] || []).find((p) => p.id === tPr)
  const displaySessionXp = sessionXp + (tRun ? Math.floor(tSec / 60) : 0)

  const leftBgClass = tRun
    ? s.leftBg.running
    : tSec > 0
      ? s.leftBg.pausedWithTime
      : s.leftBg.pausedNoTime
  const marqueeMsg = !tRun ? buildMarquee(tSec > 0 ? t('status.pausedTask') : t('status.notTracking')) : null

  return (
    <>
      <prim.Stack
        key="mode-top"
        direction="row"
        align="stretch"
        className={cx(s.root, 'mode-root', themeClass)}
        onDoubleClick={() => goSize('full')}
        title={t('top.dblClickToOpen')}
      >
        <prim.Stack direction="row" align="center" className={cx(s.leftPane, leftBgClass)}>
          <prim.ProgressFill
            progress={gpct / 100}
            tone={done ? 'done' : 'accent'}
            className={cx(!windowFocused && 'paused')}
          />

          <prim.IconButton
            variant="solid"
            size="xs"
            shape="circle"
            onClick={() => setTRun((r) => !r)}
            title={tRun ? t('top.pause') : t('top.start')}
            aria-label={tRun ? t('top.pause') : t('top.start')}
            className={cx('top-play-btn', tRun && s.playBtnRunning)}
          >
            {tRun ? <PauseIcon size={6} /> : <PlayIcon size={6} />}
          </prim.IconButton>

          <prim.Stack direction="row" align="center" className={s.clockGroup}>
            <prim.StatusDot color={tRun ? 'pink' : 'onAccent'} size="xs" glow pulse />
            <prim.MonoText
              size="xs"
              weight="bold"
              color={tRun ? 'accent' : 'onAccent'}
              className={s.clockText}
            >
              {fmtClock(tSec)}
            </prim.MonoText>
            {topEstTodo && (
              <prim.MonoText
                size="2xs"
                weight="bold"
                tracking="wide"
                color={
                  topEstLiveH >= topEstTodo.estimateH ? 'green' : tRun ? 'tertiary' : 'onAccent'
                }
                title={t('todo.loggedOfEstimate', {
                  logged: fmtHours(topEstLiveH),
                  estimate: fmtHours(topEstTodo.estimateH),
                })}
                className={s.estimateOverlay}
              >
                / {fmtHours(topEstTodo.estimateH)}
              </prim.MonoText>
            )}
          </prim.Stack>

          <prim.Stack direction="row" align="center" className={s.middleZone}>
            {!tRun ? (
              <prim.Marquee
                paused={!windowFocused}
                className={s.marqueeZ}
                trackClassName={s.marqueeTrack}
              >
                {marqueeMsg}
              </prim.Marquee>
            ) : (
              <>
                <prim.Stack direction="row" align="center" className={s.taskInfo}>
                  {coObj ? (
                    <>
                      <prim.DisplayText size="lg" color="primary" truncate className={s.coName}>
                        {coObj.name}
                      </prim.DisplayText>
                      {prObj?.name && (
                        <prim.MonoText
                          size="3xs"
                          weight="semibold"
                          color="faint"
                          tracking="loose"
                          transform="uppercase"
                          className={s.prName}
                        >
                          · {prObj.name}
                        </prim.MonoText>
                      )}
                    </>
                  ) : (
                    <prim.DisplayText size="md" italic color="tertiary">
                      {t('timer.noTaskSelected')}
                    </prim.DisplayText>
                  )}
                </prim.Stack>

                {funMessage && (
                  <prim.DisplayText
                    key={funMessage}
                    size="md"
                    italic
                    color="accent"
                    truncate
                    tracking="tight"
                    className={cx('fun-msg', s.funMsg)}
                  >
                    &ldquo;{funMessage}&rdquo;
                  </prim.DisplayText>
                )}
              </>
            )}
          </prim.Stack>
        </prim.Stack>

        <prim.Stack direction="row" align="center" className={s.rightPane}>
          <prim.Stack direction="row" align="center" className={s.weekDots}>
            {weekH.map((h, i) => {
              const p = Math.min(1, h / goal)
              const filled = p > 0
              const color = p >= 1 ? 'green' : p > 0 ? 'accent' : 'softBorder'
              return (
                <prim.StatusDot
                  key={i}
                  color={color}
                  size="2xs"
                  opacity={filled ? 0.4 + p * 0.6 : 0.35}
                  title={`${DAYS[i]}: ${fmtHours(h)}h`}
                />
              )
            })}
          </prim.Stack>

          <prim.Stack direction="row" align="baseline" inline className={s.xpGroup}>
            <prim.MonoText
              size="xs"
              weight="bold"
              tabular
              tracking="wide"
              color={displaySessionXp > 0 ? 'accent' : 'faint'}
            >
              +{displaySessionXp}
            </prim.MonoText>
            <prim.MonoText
              size="3xs"
              weight="semibold"
              color="faint"
              tracking="loose"
              transform="uppercase"
            >
              xp
            </prim.MonoText>
            {xpBump && (
              <prim.MonoText
                key={xpBump.id}
                size="xs"
                weight="bold"
                color="accent"
                className="xp-bump"
              >
                +{xpBump.delta}
              </prim.MonoText>
            )}
          </prim.Stack>

          <prim.ActivityRing progress={gpct / 100} done={done} size={22} stroke={1.5}>
            <prim.MonoText
              size="3xs"
              weight="bold"
              tabular
              tracking="tight"
              color={done ? 'green' : 'primary'}
              title={`${fmtHours(todayH)} / ${goal}h`}
              className={s.ringHours}
            >
              {fmtHours(todayH)}
            </prim.MonoText>
          </prim.ActivityRing>

          <prim.Stack
            direction="row"
            align="baseline"
            inline
            className={cx(s.streakGroup, justBumpedStreak && streakPop)}
          >
            <FlameIcon size={10} />
            <prim.MonoText size="xs" weight="bold" tabular tracking="wide" color="pink">
              {streak}
            </prim.MonoText>
            <prim.MonoText
              size="3xs"
              weight="semibold"
              color="faint"
              tracking="loose"
              transform="uppercase"
            >
              {t('today.stat.streak')}
            </prim.MonoText>
          </prim.Stack>

          <prim.IconButton
            variant="outline"
            size="sm"
            shape="circle"
            onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
            title={mode === 'light' ? t('top.switchToDark') : t('top.switchToLight')}
            aria-label={mode === 'light' ? t('top.switchToDark') : t('top.switchToLight')}
          >
            {mode === 'light' ? <SunIcon size={11} /> : <MoonIcon size={11} />}
          </prim.IconButton>

          <prim.Button
            variant="accent"
            size="2xs"
            shape="pill"
            mono
            onClick={() => goSize('full')}
            title={t('top.openSidebar')}
            aria-label={t('top.openSidebar')}
          >
            {t('top.open')}
          </prim.Button>
        </prim.Stack>
      </prim.Stack>
      {modeOverlay}
    </>
  )
}
