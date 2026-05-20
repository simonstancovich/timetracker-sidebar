import { Fragment, useEffect, useMemo, useState, type ReactNode } from 'react'
import { loadTimeEntries, TimeEntry, endMonth } from '../api'
import { getHolidays, isWorkingDay, dateKey } from '../lib/swedishHolidays'
import { monthInsight } from '../lib/personality'
import { useTranslation, type Lang } from '../lib/i18n'
import type { MonthClosureCache } from '../lib/useMonthClosure'
import { Button, MonoText, Skeleton, Stack, Text } from '../primitives'

interface ConfirmOptions {
  title: string
  body: string
  confirmLabel: string
  onConfirm: () => void | Promise<void>
}

type Theme = {
  bg: string
  s1: string
  s2: string
  s3: string
  b1: string
  b2: string
  t1: string
  t2: string
  t3: string
  tf: string
  ac: string
  ad: string
  at: string
  gn: string
  pk: string
  btn: string
  bsh: string
  id: string
  co: readonly string[]
}

interface Props {
  M: Theme
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

const DAYS_SHORT = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön']

const fmtHours = (h: number) => {
  const hh = Math.floor(h)
  const mm = Math.round((h - hh) * 60)
  return `${hh}:${String(mm).padStart(2, '0')}`
}

export function MonthView({ M, goal, referenceDate, onPickDay, onBackfillDay, firstName, confirm, notify, monthClosure }: Props) {
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
            notify?.(t('month.closeSuccess'), M.gn)
          } else {
            notify?.(t('month.closeError'), '#ef4444')
          }
        } catch {
          notify?.(t('month.closeError'), '#ef4444')
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
  const earnings = useMemo(() => {
    let total = 0
    for (const rows of Object.values(entriesByDate) as TimeEntry[][]) {
      for (const r of rows) {
        if (r.invoice !== '1') continue
        total += parseFloat(r.hour || '0') * parseFloat(r.hour_price || '0')
      }
    }
    return total
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

  const projectTotals = useMemo(() => {
    const m: Record<string, { name: string; company: string; hours: number }> = {}
    for (const rows of Object.values(entriesByDate) as TimeEntry[][]) {
      for (const r of rows) {
        const key = r._project_id
        if (!m[key]) m[key] = { name: r.project, company: r.company, hours: 0 }
        m[key].hours += parseFloat(r.hour || '0')
      }
    }
    return Object.values(m).sort((a, b) => b.hours - a.hours).slice(0, 6)
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [monthTotal, prevMonthTotal, workingDays.hit, workingDays.count, billable, bestWeek?.hours, topClient?.hours, firstName, isFinished, lang])

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
          <Text inline weight="bold" color={deltaColor}>{prefix}{fmtHours(monthDelta)}</Text>
          {' '}{t('month.vsLast')}
        </>
      )
    }
  }

  void deltaContent;

  const monthLabelEditorial = anchor.toLocaleDateString(locale, { month: 'long', year: 'numeric' })
  const dayHeader = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const

  return (
    <div style={{ padding: '14px 14px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Editorial month label */}
      <div style={{
        fontFamily: '"Instrument Serif","Georgia",serif',
        fontStyle: 'italic',
        fontSize: 22,
        color: M.t1,
        letterSpacing: -0.3,
        lineHeight: 1.15,
        textAlign: 'center',
        paddingTop: 2,
      }}>{monthLabelEditorial}</div>

      {/* Day-of-week header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {dayHeader.map((d, i) => (
          <span
            key={d}
            style={{
              fontFamily: '"JetBrains Mono",ui-monospace,monospace',
              fontSize: 8,
              fontWeight: 700,
              letterSpacing: 1.4,
              color: i >= 5 ? M.tf : M.t3,
              textAlign: 'center',
              lineHeight: 1,
            }}
          >{d}</span>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {cells.map((cell) => {
          if (!cell.date) return <div key={cell.key} />
          const d = cell.date
          const k = cell.key
          const hours = hoursByDate[k] || 0
          const holiday = holidays.get(k)
          const isToday = dateKey(new Date()) === k
          const isFuture = d > new Date()
          const isWeekend = d.getDay() === 0 || d.getDay() === 6
          const isWorkday = !isWeekend && !holiday

          if (!loaded) {
            return <div key={k} className="skeleton" style={{ aspectRatio: '1 / 1', borderRadius: 8 }} />
          }

          let bg = M.s1
          let border = `1px solid ${M.b1}`
          let numColor = M.t1
          let hoursColor = M.t2
          if (isToday) {
            bg = `${M.ac}1a`
            border = `1.5px solid ${M.ac}`
            numColor = M.ac
            hoursColor = M.ac
          } else if (hours >= goal) {
            const heatPct = Math.min(1, hours / (goal * 1.5))
            const alphaHex = Math.round(50 + heatPct * 110).toString(16).padStart(2, '0')
            bg = `${M.gn}${alphaHex}`
            border = `1px solid ${M.gn}66`
            numColor = M.id === 'dark' ? M.t1 : '#0f4d2a'
            hoursColor = M.id === 'dark' ? M.t1 : '#0f4d2a'
          } else if (!isFuture && hours > 0) {
            bg = 'rgba(217, 119, 6, 0.12)'
            border = '1px solid rgba(217, 119, 6, 0.45)'
            numColor = M.t1
            hoursColor = '#925706'
          } else if (!isFuture && isWorkday) {
            bg = 'rgba(239, 68, 68, 0.08)'
            border = '1px solid rgba(239, 68, 68, 0.35)'
            numColor = M.t1
            hoursColor = '#b1170a'
          } else if (!isWorkday) {
            bg = 'transparent'
            border = `1px dashed ${M.b1}`
            numColor = M.tf
          } else {
            bg = 'transparent'
            border = `1px solid ${M.b1}`
            numColor = M.tf
          }

          return (
            <button
              key={k}
              onClick={() => onPickDay(d)}
              title={holiday ? `${d.getDate()} · ${holiday}${hours > 0 ? ` · ${fmtHours(hours)}` : ''}` : isWorkday ? `${d.getDate()} · ${fmtHours(hours)}` : `${d.getDate()}`}
              style={{
                aspectRatio: '1 / 1',
                background: bg,
                border,
                borderRadius: 8,
                padding: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 140ms ease',
              }}
            >
              <span style={{
                fontFamily: '"Instrument Serif","Georgia",serif',
                fontSize: 18,
                color: numColor,
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: -0.4,
              }}>{d.getDate()}</span>
              {!isFuture && (hours > 0 || isWorkday) && (
                <span style={{
                  fontFamily: '"JetBrains Mono",ui-monospace,monospace',
                  fontSize: 9,
                  color: hoursColor,
                  fontWeight: 700,
                  lineHeight: 1,
                  fontVariantNumeric: 'tabular-nums',
                  letterSpacing: 0.3,
                }}>{hours > 0 ? fmtHours(hours) : '0:00'}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* 3-stat row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 8,
        paddingTop: 14,
        paddingBottom: 12,
        borderTop: `1px solid ${M.b1}`,
        borderBottom: `1px solid ${M.b1}`,
        textAlign: 'center',
      }}>
        <div>
          <div style={{ fontFamily: '"Instrument Serif","Georgia",serif', fontSize: 24, color: M.t1, lineHeight: 1, fontVariantNumeric: 'tabular-nums', letterSpacing: -0.4 }}>{loaded ? fmtHours(monthTotal) : '—'}</div>
          <div style={{ fontFamily: '"JetBrains Mono",ui-monospace,monospace', fontSize: 8, color: M.tf, textTransform: 'uppercase', letterSpacing: 1.6, marginTop: 5, fontWeight: 600 }}>{t('month.thisMonth')}</div>
        </div>
        <div>
          <div style={{ fontFamily: '"Instrument Serif","Georgia",serif', fontSize: 24, color: M.t1, lineHeight: 1, fontVariantNumeric: 'tabular-nums', letterSpacing: -0.4 }}>
            {loaded && avgPerWorkday > 0 ? avgPerWorkday.toFixed(1) : '—'}
            {loaded && avgPerWorkday > 0 && <span style={{ fontStyle: 'italic', fontSize: 15, color: M.ac, marginLeft: 1 }}>h</span>}
          </div>
          <div style={{ fontFamily: '"JetBrains Mono",ui-monospace,monospace', fontSize: 8, color: M.tf, textTransform: 'uppercase', letterSpacing: 1.6, marginTop: 5, fontWeight: 600 }}>{t('week.avgDay')}</div>
        </div>
        <div>
          <div style={{ fontFamily: '"Instrument Serif","Georgia",serif', fontSize: 24, color: M.t1, lineHeight: 1, fontVariantNumeric: 'tabular-nums', letterSpacing: -0.4 }}>
            {loaded && monthTotal > 0 ? Math.round(billablePct) : '—'}
            {loaded && monthTotal > 0 && <span style={{ fontStyle: 'italic', fontSize: 15, color: M.gn, marginLeft: 1 }}>%</span>}
          </div>
          <div style={{ fontFamily: '"JetBrains Mono",ui-monospace,monospace', fontSize: 8, color: M.tf, textTransform: 'uppercase', letterSpacing: 1.6, marginTop: 5, fontWeight: 600 }}>{t('week.billable')}</div>
        </div>
      </div>

      {/* Earnings + goal-hit ratio subtitle */}
      {loaded && monthTotal > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 18,
          flexWrap: 'wrap',
          fontFamily: '"JetBrains Mono",ui-monospace,monospace',
          fontSize: 10,
          color: M.t3,
          fontVariantNumeric: 'tabular-nums',
          marginTop: -6,
        }}>
          {workingDays.count > 0 && (
            <span>
              <span style={{ fontWeight: 700, color: workingDays.hit === workingDays.count ? M.gn : M.t1 }}>{workingDays.hit}/{workingDays.count}</span>
              <span style={{ marginLeft: 4, textTransform: 'uppercase', letterSpacing: 1.4, fontSize: 9, color: M.tf }}>at goal</span>
            </span>
          )}
          {earnings > 0 && (
            <span>
              <span style={{ fontWeight: 700, color: M.pk }}>{Math.round(earnings).toLocaleString('sv-SE')}</span>
              <span style={{ marginLeft: 4, textTransform: 'uppercase', letterSpacing: 1.4, fontSize: 9, color: M.tf }}>kr earned</span>
            </span>
          )}
          {billable > 0 && (
            <span>
              <span style={{ fontWeight: 700, color: M.gn }}>{fmtHours(billable)}</span>
              <span style={{ marginLeft: 4, textTransform: 'uppercase', letterSpacing: 1.4, fontSize: 9, color: M.tf }}>billable</span>
            </span>
          )}
          {nonBillable > 0 && (
            <span>
              <span style={{ fontWeight: 700, color: M.t2 }}>{fmtHours(nonBillable)}</span>
              <span style={{ marginLeft: 4, textTransform: 'uppercase', letterSpacing: 1.4, fontSize: 9, color: M.tf }}>internal</span>
            </span>
          )}
        </div>
      )}

      {/* Monthly goal progress + delta + flex */}
      {loaded && expectedMonthHours > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontFamily: '"JetBrains Mono",ui-monospace,monospace', fontSize: 9, fontWeight: 600, color: M.t3, letterSpacing: 2.2, textTransform: 'uppercase' }}>{t('month.thisMonth')}</span>
            <span style={{ fontFamily: '"JetBrains Mono",ui-monospace,monospace', fontSize: 11, color: M.t2, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
              <span style={{ color: monthTotal >= expectedMonthHours ? M.gn : M.t1 }}>{fmtHours(monthTotal)}</span>
              <span style={{ color: M.tf }}> / {fmtHours(expectedMonthHours)}</span>
            </span>
          </div>
          <div style={{ height: 2, background: M.b1, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${Math.min(100, (monthTotal / expectedMonthHours) * 100)}%`,
              background: monthTotal >= expectedMonthHours ? M.gn : M.ac,
              transition: 'width 500ms cubic-bezier(.22,1,.36,1)',
            }} />
          </div>
          {(monthDelta != null || workingDays.count > 0) && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
              <span style={{ fontFamily: '"Instrument Serif","Georgia",serif', fontStyle: 'italic', fontSize: 13, color: M.t3, lineHeight: 1.3 }}>
                {monthDelta == null ? '' :
                  monthDelta === 0 ? t('month.sameAsLast') :
                    monthDelta > 0 ? <>+{fmtHours(monthDelta)} {t('month.vsLast')}</> :
                      <>{fmtHours(monthDelta)} {t('month.vsLast')}</>}
              </span>
              {workingDays.count > 0 && (
                <span style={{ fontFamily: '"JetBrains Mono",ui-monospace,monospace', fontSize: 10, color: M.tf, fontVariantNumeric: 'tabular-nums' }}>
                  <span style={{ textTransform: 'uppercase', letterSpacing: 1.6, fontWeight: 600 }}>{t('week.flex')} </span>
                  <span style={{ color: flexBalance >= 0 ? M.gn : '#d97706', fontWeight: 700 }}>
                    {flexBalance >= 0 ? '+' : ''}{fmtHours(flexBalance)}
                  </span>
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Heads up */}
      {loaded && (overtimeHours > 0 || weekendHours > 0 || longDayCount > 0) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ fontFamily: '"JetBrains Mono",ui-monospace,monospace', fontSize: 9, fontWeight: 600, color: '#d97706', letterSpacing: 2.2, textTransform: 'uppercase' }}>
            {t('week.headsUp')}
          </div>
          <div style={{ fontFamily: '"Instrument Serif","Georgia",serif', fontStyle: 'italic', fontSize: 13, color: M.t2, lineHeight: 1.5 }}>
            {overtimeHours > 0 && <div>· {fmtHours(overtimeHours)} {t('week.overtime', { goal: fmtHours(workingDays.count * goal) })}</div>}
            {longDayCount > 0 && <div>· {t(longDayCount === 1 ? 'week.overTenDays' : 'week.overTenDaysPlural', { n: longDayCount })}</div>}
            {weekendHours > 0 && <div>· {fmtHours(weekendHours)} {t('week.weekendHours')}</div>}
          </div>
        </div>
      )}

      {/* Per client */}
      {!loaded ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div className="skeleton" style={{ height: 12, width: 80, borderRadius: 4 }} />
          <div className="skeleton" style={{ height: 28, borderRadius: 6 }} />
          <div className="skeleton" style={{ height: 28, borderRadius: 6 }} />
        </div>
      ) : clientTotals.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <div style={{
            fontFamily: '"JetBrains Mono",ui-monospace,monospace',
            fontSize: 9,
            fontWeight: 600,
            color: M.t3,
            letterSpacing: 2.2,
            textTransform: 'uppercase',
            marginBottom: 10,
          }}>{t('week.perClient')}</div>
          {clientTotals.map((c, gi) => {
            const stripe = M.co[gi % M.co.length]
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
                  fontFamily: '"Instrument Serif","Georgia",serif',
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
                  fontFamily: '"JetBrains Mono",ui-monospace,monospace',
                  fontSize: 12,
                  color: M.t2,
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
            fontFamily: '"JetBrains Mono",ui-monospace,monospace',
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
                  border: `1px solid ${M.b1}`,
                  color: M.t2,
                  borderRadius: 999,
                  padding: '5px 12px',
                  fontFamily: '"JetBrains Mono",ui-monospace,monospace',
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
                fontFamily: '"JetBrains Mono",ui-monospace,monospace',
                fontSize: 10,
                color: M.tf,
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
        <div style={{
          background: M.ad,
          border: `1px solid ${M.b1}`,
          borderRadius: 12,
          padding: '14px 16px',
        }}>
          <div style={{
            fontFamily: '"Instrument Serif","Georgia",serif',
            fontStyle: 'italic',
            fontSize: 15,
            color: M.at,
            lineHeight: 1.4,
            letterSpacing: -0.1,
          }}>&ldquo;{insight}&rdquo;</div>
          <div style={{
            fontFamily: '"JetBrains Mono",ui-monospace,monospace',
            fontSize: 8,
            color: M.t3,
            textTransform: 'uppercase',
            letterSpacing: 1.8,
            marginTop: 10,
            fontWeight: 600,
          }}>— {t('week.coachNote')} · {t('month.monthlyInsight')}</div>
        </div>
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
              border: `1px solid ${M.b1}`,
              color: M.t2,
              cursor: closing ? 'default' : 'pointer',
              fontFamily: '"JetBrains Mono",ui-monospace,monospace',
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
          fontFamily: '"JetBrains Mono",ui-monospace,monospace',
          fontSize: 9,
          color: M.tf,
          textAlign: 'center',
          letterSpacing: 1.4,
          textTransform: 'uppercase',
        }}>{t('week.refreshing')}</div>
      )}
    </div>
  )
}
