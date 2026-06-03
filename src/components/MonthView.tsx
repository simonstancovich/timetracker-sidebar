import { useEffect, useMemo, useState } from 'react'
import { loadTimeEntries, TimeEntry, endMonth } from '../api'
import { getHolidays, isWorkingDay, dateKey } from '../lib/swedishHolidays'
import { monthInsight } from '../lib/personality'
import { useTranslation, type Lang } from '../lib/i18n'
import { fmtHours } from '../lib/hours'
import { cx } from '../lib/cx'
import type { MonthClosureCache } from '../lib/useMonthClosure'
import * as prim from '../primitives'
import { MonthDayCell } from './MonthDayCell'
import { vars } from '../theme'
import { MonthGoalProgress } from './MonthGoalProgress'
import { MonthHeadsUp } from './MonthHeadsUp'
import { MonthStat } from './MonthStat'
import { MonthSummaryStat } from './MonthSummaryStat'
import * as s from './MonthView.css'

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

const CHART_KEYS = ['0', '1', '2', '3'] as const
const DAY_HEADER = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const

function isoWeekOf(d: Date): number {
  const x = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const dayNum = x.getUTCDay() || 7
  x.setUTCDate(x.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(x.getUTCFullYear(), 0, 1))
  return Math.ceil((((+x - +yearStart) / 86400000) + 1) / 7)
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

  const firstCol = (firstOfMonth.getDay() + 6) % 7
  const daysInMonth = lastOfMonth.getDate()
  const cells: Array<{ date: Date | null; key: string }> = []
  for (let i = 0; i < firstCol; i++) cells.push({ date: null, key: `pad-${i}` })
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    cells.push({ date, key: dateKey(date) })
  }
  while (cells.length % 7 !== 0) cells.push({ date: null, key: `pad-end-${cells.length}` })

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
    const now = new Date()
    let count = 0, hit = 0, partial = 0, missed = 0
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d)
      if (date > now) continue
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
    const now = new Date()
    const out: Date[] = []
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d)
      if (date > now) continue
      if (!isWorkingDay(date, holidays)) continue
      if ((hoursByDate[dateKey(date)] || 0) === 0) out.push(date)
    }
    return out
  }, [year, month, daysInMonth, holidays, hoursByDate])

  const avgPerWorkday = workingDays.count > 0 ? monthTotal / workingDays.count : 0
  const flexBalance = monthTotal - workingDays.count * goal
  const allWorkdaysInMonth = useMemo(() => {
    let n = 0
    for (let d = 1; d <= daysInMonth; d++) {
      if (isWorkingDay(new Date(year, month, d), holidays)) n++
    }
    return n
  }, [year, month, daysInMonth, holidays])
  const expectedMonthHours = allWorkdaysInMonth * goal

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
  const showAvg = loaded && avgPerWorkday > 0
  const showPct = loaded && monthTotal > 0

  return (
    <prim.Stack gap="lg" paddingTop="md" paddingX="md" paddingBottom="xl">
      <prim.DisplayText size="4xl" align="center" italic tracking="tight">
        {monthLabel}
      </prim.DisplayText>

      <prim.Grid columns={7} gap="xs">
        {DAY_HEADER.map((d, i) => (
          <prim.MonoText
            key={d}
            size="2xs"
            tracking="loosest"
            align="center"
            color={i >= 5 ? 'faint' : 'tertiary'}
          >
            {d}
          </prim.MonoText>
        ))}
      </prim.Grid>

      <prim.Grid columns={7} gap="xs">
        {cells.map((cell) => (
          <MonthDayCell
            key={cell.key}
            date={cell.date}
            dayKey={cell.key}
            hours={cell.date ? hoursByDate[cell.key] || 0 : 0}
            holiday={cell.date ? holidays.get(cell.key) : undefined}
            goal={goal}
            loaded={loaded}
            onPick={onPickDay}
          />
        ))}
      </prim.Grid>

      <prim.Grid columns={3} gap="sm" paddingY="md" borderY align="center">
        <MonthStat
          value={loaded ? fmtHours(monthTotal) : '—'}
          label={t('month.thisMonth')}
        />
        <MonthStat
          value={showAvg ? avgPerWorkday.toFixed(1) : '—'}
          unit={showAvg ? 'h' : undefined}
          unitColor="accent"
          label={t('week.avgDay')}
        />
        <MonthStat
          value={showPct ? Math.round(billablePct) : '—'}
          unit={showPct ? '%' : undefined}
          unitColor="green"
          label={t('week.billable')}
        />
      </prim.Grid>

      {loaded && monthTotal > 0 && (
        <prim.Stack direction="row" justify="center" align="baseline" wrap gap="lg">
          {workingDays.count > 0 && (
            <MonthSummaryStat
              value={`${workingDays.hit}/${workingDays.count}`}
              valueColor={workingDays.hit === workingDays.count ? 'green' : 'primary'}
              label={t('month.atGoal')}
            />
          )}
          {billable > 0 && (
            <MonthSummaryStat value={fmtHours(billable)} valueColor="green" label={t('week.billable')} />
          )}
          {nonBillable > 0 && (
            <MonthSummaryStat value={fmtHours(nonBillable)} valueColor="secondary" label={t('month.internal')} />
          )}
        </prim.Stack>
      )}

      {loaded && expectedMonthHours > 0 && (
        <MonthGoalProgress
          monthTotal={monthTotal}
          expectedMonthHours={expectedMonthHours}
          monthDelta={monthDelta}
          flexBalance={flexBalance}
          workingDaysCount={workingDays.count}
        />
      )}

      {loaded && (overtimeHours > 0 || weekendHours > 0 || longDayCount > 0) && (
        <MonthHeadsUp
          overtimeHours={overtimeHours}
          longDayCount={longDayCount}
          weekendHours={weekendHours}
          workingDaysCount={workingDays.count}
          goal={goal}
        />
      )}

      {!loaded ? (
        <prim.Stack gap="xs">
          <prim.Skeleton height="xs" width="2xl" radius="xs" />
          <prim.Skeleton height="sm" radius="xs" />
          <prim.Skeleton height="sm" radius="xs" />
        </prim.Stack>
      ) : clientTotals.length > 0 && (
        <prim.Stack>
          <prim.Text as="span" className={s.sectionLabel}>{t('week.perClient')}</prim.Text>
          {clientTotals.map((c, gi) => {
            const idx = CHART_KEYS[gi % CHART_KEYS.length]!
            return (
              <prim.Stack
                key={c.name}
                direction="row"
                justify="spaceBetween"
                align="baseline"
                gap="md"
                position="relative"
                className={s.clientRow}
              >
                <prim.Stack as="span" inline className={cx(s.clientStripe, s.clientStripeColor[idx])}>{null}</prim.Stack>
                <prim.Text as="span" truncate className={cx(s.clientName, s.clientNameColor[idx])}>
                  {c.name}
                </prim.Text>
                <prim.MonoText tabular className={s.clientHours}>
                  {fmtHours(c.hours)}
                </prim.MonoText>
              </prim.Stack>
            )
          })}
        </prim.Stack>
      )}

      {loaded && missingDays.length > 0 && (
        <prim.Stack gap="sm">
          <prim.Text as="span" className={s.missingLabel}>
            {missingDays.length === 1
              ? t('month.workdaysWithoutEntries', { n: 1 })
              : t('month.workdaysWithoutEntriesPlural', { n: missingDays.length })}
          </prim.Text>
          <prim.Stack direction="row" gap="xs" wrap>
            {missingDays.slice(0, 8).map((d) => (
              <prim.Button
                key={dateKey(d)}
                variant="link"
                onClick={() => (onBackfillDay || onPickDay)(d)}
                title={d.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'short' })}
                className={s.missingPill}
              >
                {d.toLocaleDateString(locale, { weekday: 'short', day: 'numeric' })}
              </prim.Button>
            ))}
            {missingDays.length > 8 && (
              <prim.Text as="span" className={s.moreDaysHint}>
                {t('month.moreDays', { n: missingDays.length - 8 })}
              </prim.Text>
            )}
          </prim.Stack>
        </prim.Stack>
      )}

      {loaded && insight && (
        <prim.Card tone="tinted" radius="lg" pad="lg">
          <prim.Text as="span" className={s.insightQuote}>&ldquo;{insight}&rdquo;</prim.Text>
          <prim.Text as="span" className={s.insightAttribution}>
            — {t('week.coachNote')} · {t('month.monthlyInsight')}
          </prim.Text>
        </prim.Card>
      )}

      {!isFutureMonth && isClosed === false && confirm && (
        <prim.Stack direction="row" justify="center" paddingTop="xs">
          <prim.Button
            variant="link"
            onClick={handleCloseMonth}
            disabled={closing}
            className={s.closeBtn}
          >
            {closing ? t('month.closing') : t('month.closeMonth')}
          </prim.Button>
        </prim.Stack>
      )}

      {loading && loaded && (
        <prim.MonoText size="2xs" color="faint" className={s.refreshing}>
          {t('week.refreshing')}
        </prim.MonoText>
      )}
    </prim.Stack>
  )
}
