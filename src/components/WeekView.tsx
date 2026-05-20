import { useEffect, useMemo, useState } from 'react'
import { loadTimeEntries, TimeEntry } from '../api'
import { mondayOf } from '../lib/date'
import { getHolidays, isWorkingDay, dateKey } from '../lib/swedishHolidays'
import { weekInsight } from '../lib/personality'
import { useTranslation, type Lang } from '../lib/i18n'
import type { MonthClosureCache } from '../lib/useMonthClosure'

type Theme = {
  bg: string
  s1: string
  s2: string
  b1: string
  t1: string
  t2: string
  t3: string
  tf: string
  ac: string
  ad: string
  at: string
  gn: string
  pk: string
  bsh: string
  co: readonly string[]
}

interface Props {
  M: Theme
  goal: number
  referenceDate: Date
  onPickDay: (d: Date) => void
  onBackfillDay?: (d: Date) => void
  firstName?: string
  monthClosure?: MonthClosureCache
}

const fmtHours = (h: number) => {
  const hh = Math.floor(h)
  const mm = Math.round((h - hh) * 60)
  return `${hh}:${String(mm).padStart(2, '0')}`
}

export function WeekView({ M, goal, referenceDate, onPickDay, onBackfillDay, firstName, monthClosure }: Props) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as Lang
  const locale = lang === 'sv' ? 'sv-SE' : 'en-GB'
  const [loading, setLoading] = useState(false)
  const [entriesByDate, setEntriesByDate] = useState<Record<string, TimeEntry[]>>({})
  const [prevWeekTotal, setPrevWeekTotal] = useState<number | null>(null)
  const [loaded, setLoaded] = useState(false)

  const monday = useMemo(() => mondayOf(referenceDate), [referenceDate])
  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday); d.setDate(d.getDate() + i); return d
    })
  }, [monday])
  const prevWeekDates = useMemo(() => {
    const prev = new Date(monday); prev.setDate(prev.getDate() - 7)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(prev); d.setDate(d.getDate() + i); return d
    })
  }, [monday])
  const holidays = useMemo(() => getHolidays(monday.getFullYear()), [monday])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setLoaded(false)
    Promise.all(
      weekDates.map((d) => loadTimeEntries(d).catch(() => [] as TimeEntry[])),
    ).then((results) => {
      if (cancelled) return
      const next: Record<string, TimeEntry[]> = {}
      weekDates.forEach((d, i) => { next[dateKey(d)] = results[i] || [] })
      setEntriesByDate(next)
      setLoading(false)
      setLoaded(true)
    })
    return () => { cancelled = true }
  }, [weekDates])

  useEffect(() => {
    let cancelled = false
    Promise.all(
      prevWeekDates.map((d) => loadTimeEntries(d).catch(() => [] as TimeEntry[])),
    ).then((results) => {
      if (cancelled) return
      let total = 0
      for (const rows of results) for (const r of rows) total += parseFloat(r.hour || '0')
      setPrevWeekTotal(total)
    })
    return () => { cancelled = true }
  }, [prevWeekDates])

  const hoursByDate = useMemo<Record<string, number>>(() => {
    const o: Record<string, number> = {}
    for (const [k, rows] of Object.entries(entriesByDate) as [string, TimeEntry[]][]) {
      o[k] = rows.reduce((s, e) => s + (parseFloat(e.hour) || 0), 0)
    }
    return o
  }, [entriesByDate])

  const weekTotal: number = (Object.values(hoursByDate) as number[]).reduce((s, h) => s + h, 0)
  const workDays = weekDates.filter((d) => isWorkingDay(d, holidays) && d <= new Date())
  const hit = workDays.filter((d) => (hoursByDate[dateKey(d)] || 0) >= goal).length
  const billable = useMemo(() => {
    let b = 0
    for (const rows of Object.values(entriesByDate) as TimeEntry[][]) {
      for (const r of rows) if (r.invoice === '1') b += parseFloat(r.hour || '0')
    }
    return b
  }, [entriesByDate])

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

  const billablePct = weekTotal > 0 ? (billable / weekTotal) * 100 : 0
  const allWorkdaysInWeek = weekDates.filter((d) => isWorkingDay(d, holidays))
  const weeklyGoal = allWorkdaysInWeek.length * goal
  const bestDay = (() => {
    let best: { date: Date; hours: number } | null = null
    for (const d of weekDates) {
      const h = hoursByDate[dateKey(d)] || 0
      if (!best || h > best.hours) best = { date: d, hours: h }
    }
    return best && best.hours > 0 ? best : null
  })()

  const avgPerWorkday = workDays.length > 0 ? weekTotal / workDays.length : 0
  const weekDelta = prevWeekTotal != null ? weekTotal - prevWeekTotal : null
  const goalPct = weeklyGoal > 0 ? Math.min(100, (weekTotal / weeklyGoal) * 100) : 0
  const flexBalance = weekTotal - workDays.length * goal
  const overtimeHours = Math.max(0, weekTotal - weeklyGoal)
  const weekendHours = weekDates.reduce((s, d) => {
    if (d.getDay() !== 0 && d.getDay() !== 6) return s
    return s + (hoursByDate[dateKey(d)] || 0)
  }, 0)
  const longDays = weekDates.filter((d) => (hoursByDate[dateKey(d)] || 0) > 10)

  const missingDays = useMemo(() => {
    return weekDates.filter((d) => {
      if (d > new Date()) return false
      if (!isWorkingDay(d, holidays)) return false
      return (hoursByDate[dateKey(d)] || 0) === 0
    })
  }, [weekDates, holidays, hoursByDate])

  useEffect(() => {
    if (!monthClosure) return
    const seen = new Set<string>()
    for (const d of weekDates) {
      const k = `${d.getFullYear()}-${d.getMonth()}`
      if (seen.has(k)) continue
      seen.add(k)
      monthClosure.ensure(d.getFullYear(), d.getMonth())
    }
  }, [weekDates, monthClosure])

  const weekClosed = useMemo(() => {
    if (!monthClosure) return false
    return weekDates.some((d) => monthClosure.isClosed(d.getFullYear(), d.getMonth()) === true)
  }, [weekDates, monthClosure])

  const isFinished = weekDates[6] < new Date()
  const topClient = clientTotals[0]
  const insight = useMemo(() => weekInsight({
    weekTotal,
    weeklyGoal,
    hit,
    workDayCount: workDays.length,
    billable,
    prevWeekTotal,
    bestDayName: bestDay ? bestDay.date.toLocaleDateString(locale, { weekday: 'long' }) : null,
    bestDayHours: bestDay?.hours,
    topClientName: topClient?.name,
    topClientShare: topClient && weekTotal > 0 ? topClient.hours / weekTotal : undefined,
    firstName,
    isFinished,
    lang,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [weekTotal, billable, prevWeekTotal, hit, workDays.length, bestDay?.hours, topClient?.hours, topClient?.name, firstName, isFinished, lang])

  const weekdayLabels = ['MON', 'TUE', 'WED', 'THU', 'FRI'] as const
  const mondayToFriday = weekDates.slice(0, 5)
  const todayKey = dateKey(new Date())

  return (
    <div style={{ padding: '14px 14px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Day cards Mon–Fri */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
        {mondayToFriday.map((d, idx) => {
          const k = dateKey(d)
          const h = hoursByDate[k] || 0
          const isToday = todayKey === k
          const holiday = holidays.get(k)
          const isFuture = d > new Date()
          const isWorkday = isWorkingDay(d, holidays)
          // Hours color: today=accent · past hit goal=green · past under goal=amber · past missing workday=red · future/weekend=muted
          const hoursColor = isToday
            ? M.ac
            : isFuture
              ? M.tf
              : h >= goal
                ? M.gn
                : h > 0
                  ? '#d97706'
                  : isWorkday
                    ? '#ef4444'
                    : M.tf
          return (
            <button
              key={k}
              onClick={() => onPickDay(d)}
              disabled={!loaded}
              title={holiday ? `${d.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'short' })} · ${holiday}` : d.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'short' })}
              className="engrave-card"
              style={{
                background: isToday ? `${M.ac}1a` : M.s1,
                border: isToday ? `1.5px solid ${M.ac}` : `1px solid ${M.b1}`,
                borderRadius: 10,
                padding: '12px 4px',
                cursor: loaded ? 'pointer' : 'default',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'all 160ms cubic-bezier(.22,1,.36,1)',
                textAlign: 'center',
              }}
            >
              <span style={{
                fontFamily: '"JetBrains Mono",ui-monospace,monospace',
                fontSize: 8,
                fontWeight: 700,
                letterSpacing: 1.6,
                color: isToday ? M.ac : M.t3,
                lineHeight: 1,
              }}>{weekdayLabels[idx]}</span>
              <span style={{
                fontFamily: '"Instrument Serif","Georgia",serif',
                fontSize: 24,
                color: isToday ? M.ac : M.t1,
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: -0.4,
              }}>
                {loaded ? d.getDate() : ' '}
              </span>
              <span style={{
                fontFamily: '"JetBrains Mono",ui-monospace,monospace',
                fontSize: 9,
                color: hoursColor,
                fontWeight: 600,
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: 0.2,
              }}>{loaded ? (h > 0 ? fmtHours(h) : isFuture || !isWorkday ? '—' : '0:00') : ' '}</span>
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
          <div style={{ fontFamily: '"Instrument Serif","Georgia",serif', fontSize: 24, color: M.t1, lineHeight: 1, fontVariantNumeric: 'tabular-nums', letterSpacing: -0.4 }}>{loaded ? fmtHours(weekTotal) : '—'}</div>
          <div style={{ fontFamily: '"JetBrains Mono",ui-monospace,monospace', fontSize: 8, color: M.tf, textTransform: 'uppercase', letterSpacing: 1.6, marginTop: 5, fontWeight: 600 }}>{t('week.total')}</div>
        </div>
        <div>
          <div style={{ fontFamily: '"Instrument Serif","Georgia",serif', fontSize: 24, color: M.t1, lineHeight: 1, fontVariantNumeric: 'tabular-nums', letterSpacing: -0.4 }}>
            {loaded && avgPerWorkday > 0 ? avgPerWorkday.toFixed(1) : '—'}
            {loaded && avgPerWorkday > 0 && (
              <span style={{ fontStyle: 'italic', fontSize: 15, color: M.ac, marginLeft: 1 }}>h</span>
            )}
          </div>
          <div style={{ fontFamily: '"JetBrains Mono",ui-monospace,monospace', fontSize: 8, color: M.tf, textTransform: 'uppercase', letterSpacing: 1.6, marginTop: 5, fontWeight: 600 }}>{t('week.avgDay')}</div>
        </div>
        <div>
          <div style={{ fontFamily: '"Instrument Serif","Georgia",serif', fontSize: 24, color: M.t1, lineHeight: 1, fontVariantNumeric: 'tabular-nums', letterSpacing: -0.4 }}>
            {loaded && weekTotal > 0 ? Math.round(billablePct) : '—'}
            {loaded && weekTotal > 0 && (
              <span style={{ fontStyle: 'italic', fontSize: 15, color: M.gn, marginLeft: 1 }}>%</span>
            )}
          </div>
          <div style={{ fontFamily: '"JetBrains Mono",ui-monospace,monospace', fontSize: 8, color: M.tf, textTransform: 'uppercase', letterSpacing: 1.6, marginTop: 5, fontWeight: 600 }}>{t('week.billable')}</div>
        </div>
      </div>

      {/* Weekly goal progress + delta + flex */}
      {loaded && weeklyGoal > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{
              fontFamily: '"JetBrains Mono",ui-monospace,monospace',
              fontSize: 9,
              fontWeight: 600,
              color: M.t3,
              letterSpacing: 2.2,
              textTransform: 'uppercase',
            }}>{t('week.weeklyGoal')}</span>
            <span style={{
              fontFamily: '"JetBrains Mono",ui-monospace,monospace',
              fontSize: 11,
              color: M.t2,
              fontWeight: 600,
              fontVariantNumeric: 'tabular-nums',
            }}>
              <span style={{ color: weekTotal >= weeklyGoal ? M.gn : M.t1 }}>{fmtHours(weekTotal)}</span>
              <span style={{ color: M.tf }}> / {fmtHours(weeklyGoal)}</span>
            </span>
          </div>
          <div style={{ height: 2, background: M.b1, position: 'relative', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${goalPct}%`,
              background: weekTotal >= weeklyGoal ? M.gn : M.ac,
              transition: 'width 500ms cubic-bezier(.22,1,.36,1)',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
            <span style={{
              fontFamily: '"Instrument Serif","Georgia",serif',
              fontStyle: 'italic',
              fontSize: 13,
              color: M.t3,
              lineHeight: 1.3,
            }}>
              {weekDelta == null ? '' :
                weekDelta === 0 ? t('week.sameAsLastWeek') :
                  weekDelta > 0 ? <>+{fmtHours(weekDelta)} {t('week.vsLastWeek')}</> :
                    <>{fmtHours(weekDelta)} {t('week.vsLastWeek')}</>}
            </span>
            <span style={{
              fontFamily: '"JetBrains Mono",ui-monospace,monospace',
              fontSize: 10,
              color: M.tf,
              letterSpacing: 0.4,
              fontVariantNumeric: 'tabular-nums',
            }}>
              <span style={{ textTransform: 'uppercase', letterSpacing: 1.6, fontWeight: 600 }}>{t('week.flex')} </span>
              <span style={{ color: flexBalance >= 0 ? M.gn : '#d97706', fontWeight: 700 }}>
                {flexBalance >= 0 ? '+' : ''}{fmtHours(flexBalance)}
              </span>
            </span>
          </div>
        </div>
      )}

      {/* Heads up — only when there's a signal */}
      {loaded && (overtimeHours > 0 || weekendHours > 0 || longDays.length > 0) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{
            fontFamily: '"JetBrains Mono",ui-monospace,monospace',
            fontSize: 9,
            fontWeight: 600,
            color: '#d97706',
            letterSpacing: 2.2,
            textTransform: 'uppercase',
          }}>{t('week.headsUp')}</div>
          <div style={{
            fontFamily: '"Instrument Serif","Georgia",serif',
            fontStyle: 'italic',
            fontSize: 13,
            color: M.t2,
            lineHeight: 1.5,
          }}>
            {overtimeHours > 0 && <div>· {fmtHours(overtimeHours)} {t('week.overtime', { goal: fmtHours(weeklyGoal) })}</div>}
            {longDays.length > 0 && <div>· {t(longDays.length === 1 ? 'week.overTenDays' : 'week.overTenDaysPlural', { n: longDays.length })} ({longDays.map((d) => d.toLocaleDateString(locale, { weekday: 'short' })).join(', ')})</div>}
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
            color: '#f59e0b',
            letterSpacing: 2.2,
            textTransform: 'uppercase',
          }}>
            {missingDays.length === 1 ? t('week.daysWithoutEntries', { n: 1 }) : t('week.daysWithoutEntriesPlural', { n: missingDays.length })}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {missingDays.map((d) => (
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
          }}>— {t('week.coachNote')} · {t('week.weeklyInsight')}</div>
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
