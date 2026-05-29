import { Fragment, useEffect, useMemo, useState, type ReactNode } from 'react'
import { loadTimeEntries, TimeEntry, endMonth } from '../api'
import { getHolidays, isWorkingDay, dateKey } from '../lib/swedishHolidays'
import { monthInsight } from '../lib/personality'
import { useTranslation, type Lang } from '../lib/i18n'
import type { MonthClosureCache } from '../lib/useMonthClosure'
import * as prim from '../primitives'
import { MonthDayCell } from './MonthDayCell'
import { vars, chart } from '../theme'
import { MonthGoalProgress } from './MonthGoalProgress'
import { MonthHeadsUp } from './MonthHeadsUp'
import { MonthStat } from './MonthStat'
import { MonthSummaryStat } from './MonthSummaryStat'
import { MONO, SERIF } from '../lib/fonts'

interface ConfirmOptions {
  title: string
  body: string
  confirmLabel: string
  onConfirm: () => void | Promise<void>
}

interface Props {
  goal: number
  referenceDate: Date
  onPickDay: (date: Date) => void
  onBackfillDay?: (date: Date) => void
  firstName?: string
  confirm?: (opts: ConfirmOptions) => void
  notify?: (message: string, color: string) => void
  monthClosure?: MonthClosureCache
}

function isoWeekOf(d: Date): number {
  const x = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const dayNum = x.getUTCDay() || 7
  x.setUTCDate(x.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(x.getUTCFullYear(), 0, 1))
  return Math.ceil((((+x - +yearStart) / 86400000) + 1) / 7)
}

const fmtHours = (h: number) => {
  const hh = Math.floor(h)
  const mm = Math.round((h - hh) * 60)
  return `${hh}:${String(mm).padStart(2, '0')}`
}

export function MonthView({ goal, referenceDate, onPickDay, onBackfillDay, firstName, confirm, notify, monthClosure }: Props) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as Lang
  const locale = lang === 'sv' ? 'sv-SE' : 'en-GB'
  const anchor = useMemo(
    () => new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1),
    [referenceDate],
  )
  const [hoursByDate, setHoursByDate] = useState<Record<string, number>>({})
  const [entriesByDate, setEntriesByDate] = useState<Record<string, TimeEntry[]>>({})
  const [loading, setLoading] = useState(false)
  const [prevMonthTotal, setPrevMonthTotal] = useState<number | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [closing, setClosing] = useState(false)

  const year = anchor.getFullYear()
  const month = anchor.getMonth()
  const firstOfMonth = useMemo(() => new Date(year, month, 1), [year, month])
  const lastOfMonth = useMemo(() => new Date(year, month + 1, 0), [year, month])
  const holidays = useMemo(() => getHolidays(year), [year])

  // Mon-first: JS getDay() → 0=Sun,1=Mon,...6=Sat. Shift so Mon=0.
  const firstCol = (firstOfMonth.getDay() + 6) % 7
  const daysInMonth = lastOfMonth.getDate()
  const cells: Array<{ date: Date | null; key: string }> = []
  for (let i = 0; i < firstCol; i++) cells.push({ date: null, key: `pad-${i}` })
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    cells.push({ date, key: dateKey(date) })
  }
  while (cells.length % 7 !== 0) cells.push({ date: null, key: `pad-end-${cells.length}` })

  // Load all days of the month in parallel
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setLoaded(false)
      const dates: Date[] = []
      for (let d = 1; d <= daysInMonth; d++) dates.push(new Date(year, month, d))
      const results = await Promise.all(
        dates.map((d) => loadTimeEntries(d).catch(() => [] as TimeEntry[])),
      )
      if (cancelled) return
      const nextHours: Record<string, number> = {}
      const nextEntries: Record<string, TimeEntry[]> = {}
      dates.forEach((d, i) => {
        const k = dateKey(d)
        const rows = results[i] || []
        nextEntries[k] = rows
        nextHours[k] = rows.reduce((s, e) => s + (parseFloat(e.hour) || 0), 0)
      })
      setHoursByDate(nextHours)
      setEntriesByDate(nextEntries)
      setLoading(false)
      setLoaded(true)
    }
    load()
    return () => { cancelled = true }
  }, [year, month, daysInMonth])

  // Previous month total (for delta)
  useEffect(() => {
    let cancelled = false
    const prevYear = month === 0 ? year - 1 : year
    const prevMonth = month === 0 ? 11 : month - 1
    const prevLast = new Date(prevYear, prevMonth + 1, 0).getDate()
    const dates: Date[] = []
    for (let d = 1; d <= prevLast; d++) dates.push(new Date(prevYear, prevMonth, d))
    Promise.all(dates.map((d) => loadTimeEntries(d).catch(() => [] as TimeEntry[])))
      .then((results) => {
        if (cancelled) return
        let total = 0
        for (const rows of results) for (const r of rows) total += parseFloat(r.hour || '0')
        setPrevMonthTotal(total)
      })
    return () => { cancelled = true }
  }, [year, month])

  useEffect(() => {
    monthClosure?.ensure(year, month)
  }, [year, month, monthClosure])

  const isClosed = monthClosure?.isClosed(year, month) ?? null
  const isFutureMonth = firstOfMonth > new Date()
  const monthLabel = anchor.toLocaleDateString(locale, { month: 'long', year: 'numeric' })

  const handleCloseMonth = () => {
    if (!confirm) return
    confirm({
      title: t('month.closeConfirmTitle', { month: monthLabel }),
      body: t('month.closeConfirmBody', { month: monthLabel }),
      confirmLabel: t('month.closeConfirm'),
      onConfirm: async () => {
        setClosing(true)
        try {
          const ok = await endMonth(anchor)
          if (ok) {
            monthClosure?.setClosed(year, month, true)
            notify?.(t('month.closeSuccess'), vars.typography.green)
          } else {
            notify?.(t('month.closeError'), vars.typography.error)
          }
        } catch {
          notify?.(t('month.closeError'), vars.typography.error)
        } finally {
          setClosing(false)
        }
      },
    })
  }

  const monthTotal = useMemo<number>(
    () => (Object.values(hoursByDate) as number[]).reduce((s, h) => s + h, 0),
    [hoursByDate],
  )
  const workingDays = useMemo(() => {
    let count = 0, hit = 0, partial = 0, missed = 0
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d)
      if (date > new Date()) continue
      if (!isWorkingDay(date, holidays)) continue
      count++
      const h = hoursByDate[dateKey(date)] || 0
      if (h >= goal) hit++
      else if (h > 0) partial++
      else missed++
    }
    return { count, hit, partial, missed }
  }, [year, month, daysInMonth, holidays, hoursByDate, goal])

  const missingDays = useMemo(() => {
    const out: Date[] = []
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d)
      if (date > new Date()) continue
      if (!isWorkingDay(date, holidays)) continue
      if ((hoursByDate[dateKey(date)] || 0) === 0) out.push(date)
    }
    return out
  }, [year, month, daysInMonth, holidays, hoursByDate])

  const avgPerWorkday = workingDays.count > 0 ? monthTotal / workingDays.count : 0
  const flexBalance = monthTotal - workingDays.count * goal
  // Full-month expected: count all workdays of the month (past + future)
  const allWorkdaysInMonth = useMemo(() => {
    let n = 0
    for (let d = 1; d <= daysInMonth; d++) {
      if (isWorkingDay(new Date(year, month, d), holidays)) n++
    }
    return n
  }, [year, month, daysInMonth, holidays])
  const expectedMonthHours = allWorkdaysInMonth * goal

  // Overtime / weekend / long-day signals
  const weekendHours = useMemo(() => {
    let s = 0
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d)
      if (date.getDay() !== 0 && date.getDay() !== 6) continue
      s += hoursByDate[dateKey(date)] || 0
    }
    return s
  }, [year, month, daysInMonth, hoursByDate])
  const longDayCount = useMemo(() => {
    let n = 0
    for (let d = 1; d <= daysInMonth; d++) {
      const h = hoursByDate[dateKey(new Date(year, month, d))] || 0
      if (h > 10) n++
    }
    return n
  }, [year, month, daysInMonth, hoursByDate])
  const overtimeHours = Math.max(0, monthTotal - workingDays.count * goal)

  const billable = useMemo(() => {
    let b = 0
    for (const rows of Object.values(entriesByDate) as TimeEntry[][]) {
      for (const r of rows) if (r.invoice === '1') b += parseFloat(r.hour || '0')
    }
    return b
  }, [entriesByDate])
  const nonBillable = monthTotal - billable
  const billablePct = monthTotal > 0 ? (billable / monthTotal) * 100 : 0

  const clientTotals = useMemo(() => {
    const m: Record<string, { name: string; hours: number }> = {}
    for (const rows of Object.values(entriesByDate) as TimeEntry[][]) {
      for (const r of rows) {
        const key = r._company_id
        if (!m[key]) m[key] = { name: r.company, hours: 0 }
        m[key].hours += parseFloat(r.hour || '0')
      }
    }
    return Object.values(m).sort((a, b) => b.hours - a.hours)
  }, [entriesByDate])

  // Weekly rollup: group dates by ISO week
  const weeklyRollup = useMemo(() => {
    const m: Record<number, { week: number; hours: number }> = {}
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d)
      const w = isoWeekOf(date)
      if (!m[w]) m[w] = { week: w, hours: 0 }
      m[w].hours += hoursByDate[dateKey(date)] || 0
    }
    return Object.values(m).sort((a, b) => a.week - b.week)
  }, [year, month, daysInMonth, hoursByDate])

  const bestWeek = useMemo(() => {
    if (weeklyRollup.length === 0) return null
    return weeklyRollup.reduce((best, w) => (w.hours > best.hours ? w : best))
  }, [weeklyRollup])

  const isFinished = lastOfMonth < new Date()
  const topClient = clientTotals[0]
  const insight = useMemo(() => monthInsight({
    monthTotal,
    prevMonthTotal,
    hit: workingDays.hit,
    workDayCount: workingDays.count,
    billable,
    bestWeekLabel: bestWeek ? t('scale.weekNum', { n: bestWeek.week }) : undefined,
    bestWeekHours: bestWeek?.hours,
    topClientName: topClient?.name,
    topClientShare: topClient && monthTotal > 0 ? topClient.hours / monthTotal : undefined,
    firstName,
    isFinished,
    lang,
  }), [monthTotal, prevMonthTotal, workingDays.hit, workingDays.count, billable, bestWeek, topClient, firstName, isFinished, lang, t])

  const monthDelta = prevMonthTotal != null ? monthTotal - prevMonthTotal : null

  let deltaContent: ReactNode = null
  if (monthDelta != null) {
    if (monthDelta === 0) {
      deltaContent = t('month.sameAsLast')
    } else {
      const prefix = monthDelta > 0 ? '+' : ''
      const deltaColor = monthDelta > 0 ? 'green' : 'warning'
      deltaContent = (
        <>
          <prim.Text as="span" weight="bold" color={deltaColor}>{prefix}{fmtHours(monthDelta)}</prim.Text>
          {' '}{t('month.vsLast')}
        </>
      )
    }
  }

  void deltaContent;

  const monthLabelEditorial = anchor.toLocaleDateString(locale, { month: 'long', year: 'numeric' })
  const dayHeader = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const

  return (
    <prim.Stack gap="lg" paddingTop="md" paddingX="md" paddingBottom="xl">
      {/* Editorial month label */}
      <prim.DisplayText size="4xl" align="center" italic tracking="tight">
        {monthLabelEditorial}
      </prim.DisplayText>

      {/* Day-of-week header */}
      <prim.Grid columns={7} gap="xs">
        {dayHeader.map((d, i) => (
          <Fragment key={d}>
            <prim.MonoText
              size="2xs"
              weight="bold"
              tracking="loosest"
              align="center"
              color={i >= 5 ? 'faint' : 'tertiary'}
            >
              {d}
            </prim.MonoText>
          </Fragment>
        ))}
      </prim.Grid>

      {/* Calendar grid */}
      <prim.Grid columns={7} gap="xs">
        {cells.map((cell) => (
          <Fragment key={cell.key}>
            <MonthDayCell
              date={cell.date}
              dayKey={cell.key}
              hours={cell.date ? hoursByDate[cell.key] || 0 : 0}
              holiday={cell.date ? holidays.get(cell.key) : undefined}
              goal={goal}
              loaded={loaded}
              onPick={onPickDay}
            />
          </Fragment>
        ))}
      </prim.Grid>

      {/* 3-stat row */}
      <prim.Grid columns={3} gap="sm" paddingY="md" borderY align="center">
        <MonthStat
          value={loaded ? fmtHours(monthTotal) : '—'}
          label={t('month.thisMonth')}
        />
        <MonthStat
          value={loaded && avgPerWorkday > 0 ? avgPerWorkday.toFixed(1) : '—'}
          unit={loaded && avgPerWorkday > 0 ? 'h' : undefined}
          unitColor="accent"
          label={t('week.avgDay')}
        />
        <MonthStat
          value={loaded && monthTotal > 0 ? Math.round(billablePct) : '—'}
          unit={loaded && monthTotal > 0 ? '%' : undefined}
          unitColor="green"
          label={t('week.billable')}
        />
      </prim.Grid>

      {/* Earnings + goal-hit ratio subtitle */}
      {loaded && monthTotal > 0 && (
        <prim.Stack direction="row" justify="center" align="baseline" wrap gap="lg">
          {workingDays.count > 0 && (
            <MonthSummaryStat
              value={`${workingDays.hit}/${workingDays.count}`}
              valueColor={workingDays.hit === workingDays.count ? 'green' : 'primary'}
              label="at goal"
            />
          )}
          {billable > 0 && (
            <MonthSummaryStat value={fmtHours(billable)} valueColor="green" label="billable" />
          )}
          {nonBillable > 0 && (
            <MonthSummaryStat value={fmtHours(nonBillable)} valueColor="secondary" label="internal" />
          )}
        </prim.Stack>
      )}

      {/* Monthly goal progress + delta + flex */}
      {loaded && expectedMonthHours > 0 && (
        <MonthGoalProgress
          monthTotal={monthTotal}
          expectedMonthHours={expectedMonthHours}
          monthDelta={monthDelta}
          flexBalance={flexBalance}
          workingDaysCount={workingDays.count}
        />
      )}

      {/* Heads up */}
      {loaded && (overtimeHours > 0 || weekendHours > 0 || longDayCount > 0) && (
        <MonthHeadsUp
          overtimeHours={overtimeHours}
          longDayCount={longDayCount}
          weekendHours={weekendHours}
          workingDaysCount={workingDays.count}
          goal={goal}
        />
      )}

      {/* Per client */}
      {!loaded ? (
        <prim.Stack gap="xs">
          <prim.Skeleton height="xs" width="2xl" radius="xs" />
          <prim.Skeleton height="sm" radius="xs" />
          <prim.Skeleton height="sm" radius="xs" />
        </prim.Stack>
      ) : clientTotals.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <div style={{
            fontFamily: MONO,
            fontSize: 9,
            fontWeight: 600,
            color: vars.typography.tertiary,
            letterSpacing: 2.2,
            textTransform: 'uppercase',
            marginBottom: 10,
          }}>{t('week.perClient')}</div>
          {clientTotals.map((c, gi) => {
            const stripe = chart[gi % chart.length]
            return (
              <div key={c.name} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                gap: 12,
                padding: '8px 0 8px 12px',
                position: 'relative',
              }}>
                <span style={{
                  position: 'absolute',
                  left: 0,
                  top: 8,
                  bottom: 8,
                  width: 3,
                  borderRadius: 2,
                  background: stripe,
                }} />
                <span style={{
                  fontFamily: SERIF,
                  fontSize: 17,
                  color: stripe,
                  letterSpacing: -0.1,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  minWidth: 0,
                  flex: 1,
                }}>{c.name}</span>
                <span style={{
                  fontFamily: MONO,
                  fontSize: 12,
                  color: vars.typography.secondary,
                  fontWeight: 600,
                  fontVariantNumeric: 'tabular-nums',
                }}>{fmtHours(c.hours)}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Missing days */}
      {loaded && missingDays.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{
            fontFamily: MONO,
            fontSize: 9,
            fontWeight: 600,
            color: '#d97706',
            letterSpacing: 2.2,
            textTransform: 'uppercase',
          }}>
            {missingDays.length === 1 ? t('month.workdaysWithoutEntries', { n: 1 }) : t('month.workdaysWithoutEntriesPlural', { n: missingDays.length })}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {missingDays.slice(0, 8).map((d) => (
              <button
                key={dateKey(d)}
                onClick={() => (onBackfillDay || onPickDay)(d)}
                title={d.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'short' })}
                style={{
                  background: 'transparent',
                  border: `1px solid ${vars.border.soft}`,
                  color: vars.typography.secondary,
                  borderRadius: 999,
                  padding: '5px 12px',
                  fontFamily: MONO,
                  fontSize: 10,
                  cursor: 'pointer',
                  fontWeight: 600,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                }}
              >
                {d.toLocaleDateString(locale, { weekday: 'short', day: 'numeric' })}
              </button>
            ))}
            {missingDays.length > 8 && (
              <span style={{
                fontFamily: MONO,
                fontSize: 10,
                color: vars.typography.faint,
                alignSelf: 'center',
                letterSpacing: 1,
                textTransform: 'uppercase',
                fontWeight: 600,
              }}>{t('month.moreDays', { n: missingDays.length - 8 })}</span>
            )}
          </div>
        </div>
      )}

      {/* Insight card */}
      {loaded && insight && (
        <prim.Card tone="tinted" radius="lg" pad="lg">
          <div style={{
            fontFamily: SERIF,
            fontStyle: 'italic',
            fontSize: 15,
            color: vars.typography.accentInk,
            lineHeight: 1.4,
            letterSpacing: -0.1,
          }}>&ldquo;{insight}&rdquo;</div>
          <div style={{
            fontFamily: MONO,
            fontSize: 8,
            color: vars.typography.tertiary,
            textTransform: 'uppercase',
            letterSpacing: 1.8,
            marginTop: 10,
            fontWeight: 600,
          }}>— {t('week.coachNote')} · {t('month.monthlyInsight')}</div>
        </prim.Card>
      )}

      {/* Close-month action (subtle, only when closable) */}
      {!isFutureMonth && isClosed === false && confirm && (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 4 }}>
          <button
            onClick={handleCloseMonth}
            disabled={closing}
            style={{
              padding: '8px 18px',
              borderRadius: 999,
              background: 'transparent',
              border: `1px solid ${vars.border.soft}`,
              color: vars.typography.secondary,
              cursor: closing ? 'default' : 'pointer',
              fontFamily: MONO,
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: 1.4,
              textTransform: 'uppercase',
              opacity: closing ? 0.6 : 1,
            }}
          >
            {closing ? t('month.closing') : t('month.closeMonth')}
          </button>
        </div>
      )}

      {loading && loaded && (
        <div style={{
          fontFamily: MONO,
          fontSize: 9,
          color: vars.typography.faint,
          textAlign: 'center',
          letterSpacing: 1.4,
          textTransform: 'uppercase',
        }}>{t('week.refreshing')}</div>
      )}
    </prim.Stack>
  )
}
