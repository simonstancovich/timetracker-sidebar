import { useEffect, useMemo, useState } from 'react'
import { loadTimeEntries, TimeEntry } from '../api'
import { getHolidays, isWorkingDay, dateKey } from '../lib/swedishHolidays'
import { monthInsight } from '../lib/personality'
import { Lang, t as tr } from '../lib/i18n'

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
}

interface Props {
  M: Theme
  goal: number
  referenceDate: Date
  onPickDay: (date: Date) => void
  onBackfillDay?: (date: Date) => void
  firstName?: string
  lang?: Lang
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

export function MonthView({ M, goal, referenceDate, onPickDay, onBackfillDay, firstName, lang = 'en' }: Props) {
  const t = (k: Parameters<typeof tr>[0], v?: Parameters<typeof tr>[2]) => tr(k, lang, v)
  const anchor = useMemo(
    () => new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1),
    [referenceDate],
  )
  const [hoursByDate, setHoursByDate] = useState<Record<string, number>>({})
  const [entriesByDate, setEntriesByDate] = useState<Record<string, TimeEntry[]>>({})
  const [loading, setLoading] = useState(false)
  const [prevMonthTotal, setPrevMonthTotal] = useState<number | null>(null)
  const [loaded, setLoaded] = useState(false)

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

  const monthTotal = useMemo(
    () => Object.values(hoursByDate).reduce((s, h) => s + h, 0),
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
    for (const rows of Object.values(entriesByDate)) {
      for (const r of rows) if (r.invoice === '1') b += parseFloat(r.hour || '0')
    }
    return b
  }, [entriesByDate])
  const earnings = useMemo(() => {
    let total = 0
    for (const rows of Object.values(entriesByDate)) {
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
    for (const rows of Object.values(entriesByDate)) {
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
    for (const rows of Object.values(entriesByDate)) {
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

  return (
    <div style={{ padding: '14px 14px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>

      {loaded ? (insight && (
        <div style={{ background: `${M.ac}12`, border: `1px solid ${M.ac}33`, borderRadius: 10, padding: '9px 11px', fontSize: 12, color: M.t1, lineHeight: 1.4, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 14, lineHeight: 1 }}>💭</span>
          <span>{insight}</span>
        </div>
      )) : (
        <div className="skeleton" style={{ height: 38, borderRadius: 10 }} />
      )}

      {/* Totals + delta + avg + utilization */}
      <div style={{ background: M.s1, border: `1px solid ${M.b1}`, borderRadius: 10, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: M.t3, letterSpacing: 0.8, textTransform: 'uppercase' }}>{t('month.thisMonth')}</span>
          <span style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
            {monthTotal > 0 && (
              <span style={{ fontSize: 11, color: M.t3 }}>
                <strong style={{ color: M.pk, fontFamily: 'monospace' }}>{Math.round((billable / monthTotal) * 100)}%</strong> {t('month.utilization')}
              </span>
            )}
            <span style={{ fontSize: 11, color: M.t3, fontFamily: 'monospace' }}>
              <strong style={{ color: M.t1 }}>{fmtHours(monthTotal)}</strong>
              <span style={{ color: M.t3 }}> / {fmtHours(expectedMonthHours)}</span>
            </span>
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: M.t3, gap: 8, flexWrap: 'wrap' }}>
          <span>
            {monthDelta == null ? '' :
              monthDelta === 0 ? t('month.sameAsLast') :
                monthDelta > 0 ? <><strong style={{ color: M.gn }}>+{fmtHours(monthDelta)}</strong> {t('month.vsLast')}</> :
                  <><strong style={{ color: '#f59e0b' }}>{fmtHours(monthDelta)}</strong> {t('month.vsLast')}</>}
          </span>
          <span style={{ display: 'flex', gap: 10 }}>
            {avgPerWorkday > 0 && (
              <span>Ø <strong style={{ color: M.t2, fontFamily: 'monospace' }}>{fmtHours(avgPerWorkday)}</strong>/{t('week.day')}</span>
            )}
            {workingDays.count > 0 && (
              <span>
                {t('week.flex')}{' '}
                <strong style={{ color: flexBalance >= 0 ? M.gn : '#f59e0b', fontFamily: 'monospace' }}>
                  {flexBalance >= 0 ? '+' : ''}{fmtHours(flexBalance)}
                </strong>
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Overtime / weekend warnings */}
      {loaded && (overtimeHours > 0 || weekendHours > 0 || longDayCount > 0) && (
        <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 9, padding: '9px 11px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontSize: 10, color: '#f59e0b', fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' }}>
            {t('week.headsUp')}
          </div>
          <div style={{ fontSize: 11, color: M.t2, lineHeight: 1.5 }}>
            {overtimeHours > 0 && <div>· <strong>{fmtHours(overtimeHours)}</strong> over expected ({workingDays.count} workdays × 8h)</div>}
            {longDayCount > 0 && <div>· {longDayCount} day{longDayCount > 1 ? 's' : ''} over 10h</div>}
            {weekendHours > 0 && <div>· <strong>{fmtHours(weekendHours)}</strong> logged on weekends</div>}
          </div>
        </div>
      )}

      {/* Billable split + earnings */}
      {monthTotal > 0 && (
        <div style={{ background: M.s1, border: `1px solid ${M.b1}`, borderRadius: 10, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: M.t3, letterSpacing: 0.8, textTransform: 'uppercase' }}>{t('month.billableSplit')}</span>
            {earnings > 0 && (
              <span style={{ fontSize: 14, fontWeight: 800, color: M.pk, fontFamily: 'monospace' }}>
                {Math.round(earnings).toLocaleString('sv-SE')} kr
              </span>
            )}
          </div>
          <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', background: M.s2 }}>
            <div style={{ width: `${billablePct}%`, background: M.pk }} />
            <div style={{ width: `${100 - billablePct}%`, background: M.t3, opacity: 0.4 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: M.t3 }}>
            <span>{t('week.billableLine', { hours: fmtHours(billable) })} · {Math.round(billablePct)}%</span>
            <span>{t('week.internalLine', { hours: fmtHours(nonBillable) })}</span>
          </div>
        </div>
      )}

      {/* Weekly strip */}
      {weeklyRollup.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: M.t3, letterSpacing: 1.2, textTransform: 'uppercase' }}>{t('month.weeks')}</div>
          <div style={{ display: 'flex', gap: 5, alignItems: 'flex-end', height: 70 }}>
            {weeklyRollup.map((w) => {
              const max = Math.max(...weeklyRollup.map((x) => x.hours), 1)
              const pct = (w.hours / max) * 100
              const isBest = bestWeek && w.week === bestWeek.week && w.hours > 0
              return (
                <div key={w.week} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, height: '100%' }}>
                  <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end' }}>
                    <div style={{ width: '100%', height: `${Math.max(pct, w.hours > 0 ? 6 : 0)}%`, minHeight: w.hours > 0 ? 4 : 0, background: isBest ? M.gn : M.ac, borderRadius: 4, opacity: w.hours > 0 ? 1 : 0 }} />
                  </div>
                  <span style={{ fontSize: 9, color: isBest ? M.gn : M.t3, fontWeight: 700, fontFamily: 'monospace' }}>{w.hours > 0 ? fmtHours(w.hours) : '—'}</span>
                  <span style={{ fontSize: 9, color: M.t3 }}>v.{w.week}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Missing days */}
      {missingDays.length > 0 && (
        <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.35)', borderRadius: 9, padding: '8px 11px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 10, color: '#f59e0b', fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' }}>
            {missingDays.length === 1 ? t('month.workdaysWithoutEntries', { n: 1 }) : t('month.workdaysWithoutEntriesPlural', { n: missingDays.length })}
          </div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {missingDays.slice(0, 5).map((d) => (
              <button
                key={dateKey(d)}
                onClick={() => (onBackfillDay || onPickDay)(d)}
                title={d.toLocaleDateString(lang === 'sv' ? 'sv-SE' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}
                style={{ background: M.s1, border: `1px solid ${M.b1}`, color: M.t2, borderRadius: 6, padding: '3px 8px', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}
              >
                {d.toLocaleDateString(lang === 'sv' ? 'sv-SE' : 'en-GB', { weekday: 'short', day: 'numeric' })}
              </button>
            ))}
            {missingDays.length > 5 && (
              <span style={{ fontSize: 11, color: M.t3, padding: '3px 4px' }}>{t('month.moreDays', { n: missingDays.length - 5 })}</span>
            )}
          </div>
        </div>
      )}

      {/* Day header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {DAYS_SHORT.map((d, i) => (
          <div key={d} style={{ fontSize: 9, fontWeight: 700, color: i >= 5 ? M.tf : M.t3, textTransform: 'uppercase', letterSpacing: 0.8, textAlign: 'center', paddingBottom: 4 }}>
            {d}
          </div>
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

          let bg: string, border: string
          const heatPct = Math.min(1, hours / goal)
          const OFF_BG = M.id === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'
          const OFF_BORDER = M.id === 'dark' ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.13)'
          if (hours > 0) {
            // Logged hours — always heatmap green, even on weekends / holidays
            const alphaHex = Math.round(90 + heatPct * 165).toString(16).padStart(2, '0')
            bg = `${M.gn}${alphaHex}`
            border = `${M.gn}`
          } else if (!isWorkday) {
            // Off day (past or future), no hours — distinctly greyed out
            bg = OFF_BG; border = OFF_BORDER
          } else if (isFuture) {
            // Future workday — transparent, awaiting
            bg = 'transparent'; border = M.b1
          } else {
            // Past workday with 0 hours — red tint to flag it
            bg = '#ef444420'; border = '#ef444466'
          }
          const hasHours = !isFuture && hours > 0
          const textColor = hasHours ? '#ffffff' : isWorkday ? M.t1 : M.t3
          const hoursColor = hasHours ? '#ffffff'
            : !isWorkday ? M.tf
              : hours === 0 ? '#ef4444'
                : M.t2
          const hoursWeight = hours >= goal ? 800 : 700

          if (!loaded) {
            return (
              <div
                key={k}
                className="skeleton"
                style={{ aspectRatio: '1 / 1', borderRadius: 7 }}
              />
            )
          }
          return (
            <button
              key={k}
              onClick={() => onPickDay(d)}
              title={
                holiday
                  ? `${d.getDate()} · ${holiday}${hours > 0 ? ` · ${fmtHours(hours)}h` : ''}`
                  : isWorkday
                    ? `${d.getDate()} · ${fmtHours(hours)}h logged`
                    : `${d.getDate()}`
              }
              style={{
                aspectRatio: '1 / 1',
                background: bg,
                border: `1px solid ${border}`,
                borderRadius: 7,
                padding: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                justifyContent: 'space-between',
                cursor: 'pointer',
                position: 'relative',
                outline: isToday ? `2px solid ${M.ac}` : 'none',
                outlineOffset: -1,
                minWidth: 0,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: textColor, lineHeight: 1 }}>{d.getDate()}</span>
                {holiday && (
                  <span title={holiday} style={{ fontSize: 8, color: M.t3, flexShrink: 0 }}>✦</span>
                )}
              </div>
              {!isFuture && (isWorkday || hours > 0) && (
                <span style={{ fontSize: 9, fontWeight: hoursWeight, color: hoursColor, fontFamily: 'monospace', textAlign: 'right', lineHeight: 1 }}>
                  {hours > 0 ? fmtHours(hours) : '—'}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Legend — heatmap scale */}
      <div style={{ display: 'flex', gap: 10, fontSize: 10, color: M.t3, flexWrap: 'wrap', alignItems: 'center' }}>
        <span>{t('month.less')}</span>
        <div style={{ display: 'flex', gap: 2 }}>
          {[0.15, 0.35, 0.55, 0.8, 1].map((a, i) => {
            const alphaHex = Math.round(90 + a * 165).toString(16).padStart(2, '0')
            return <span key={i} style={{ width: 11, height: 11, borderRadius: 3, background: `${M.gn}${alphaHex}`, border: `1px solid ${M.gn}aa` }} />
          })}
        </div>
        <span>{t('month.more')}</span>
        <span style={{ marginLeft: 'auto' }}>
          <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: '#ef444420', border: '1px solid #ef444466', verticalAlign: 'middle', marginRight: 4 }} />
          {t('month.missed')}
        </span>
      </div>

      {!loaded ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div className="skeleton" style={{ height: 42, borderRadius: 9 }} />
          <div className="skeleton" style={{ height: 42, borderRadius: 9 }} />
          <div className="skeleton" style={{ height: 42, borderRadius: 9 }} />
        </div>
      ) : clientTotals.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: M.t3, letterSpacing: 1.2, textTransform: 'uppercase' }}>{t('week.byClient')}</div>
          {clientTotals.map((c) => {
            const pct = monthTotal > 0 ? (c.hours / monthTotal) * 100 : 0
            return (
              <div key={c.name} style={{ background: M.s1, border: `1px solid ${M.b1}`, borderRadius: 9, padding: '8px 11px', fontSize: 12, display: 'flex', flexDirection: 'column', gap: 5 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: M.t1, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</span>
                  <span style={{ color: M.ac, fontFamily: 'monospace', fontWeight: 700, flexShrink: 0 }}>{fmtHours(c.hours)}</span>
                </div>
                <div style={{ height: 3, background: M.s2, borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: M.ac }} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {projectTotals.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: M.t3, letterSpacing: 1.2, textTransform: 'uppercase' }}>{t('week.topProjects')}</div>
          {projectTotals.map((p) => {
            const pct = monthTotal > 0 ? (p.hours / monthTotal) * 100 : 0
            return (
              <div key={`${p.company}::${p.name}`} style={{ background: M.s1, border: `1px solid ${M.b1}`, borderRadius: 8, padding: '7px 10px', fontSize: 11, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ color: M.t2, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                    <div style={{ color: M.tf, fontSize: 9 }}>{p.company}</div>
                  </div>
                  <span style={{ color: M.t2, fontFamily: 'monospace', fontWeight: 700, flexShrink: 0 }}>{fmtHours(p.hours)}</span>
                </div>
                <div style={{ height: 3, background: M.s2, borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: M.pk, opacity: 0.7 }} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {loading && loaded && (
        <div style={{ fontSize: 10, color: M.tf, textAlign: 'center' }}>{t('week.refreshing')}</div>
      )}
    </div>
  )
}


