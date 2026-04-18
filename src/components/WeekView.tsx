import { useEffect, useMemo, useState } from 'react'
import { loadTimeEntries, TimeEntry } from '../api'
import { getHolidays, isWorkingDay, dateKey } from '../lib/swedishHolidays'
import { weekInsight } from '../lib/personality'

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
  gn: string
  pk: string
  bsh: string
}

interface Props {
  M: Theme
  goal: number
  referenceDate: Date
  onPickDay: (d: Date) => void
  onBackfillDay?: (d: Date) => void
  firstName?: string
}

const DAYS = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön']

const fmtHours = (h: number) => {
  const hh = Math.floor(h)
  const mm = Math.round((h - hh) * 60)
  return `${hh}:${String(mm).padStart(2, '0')}`
}

function mondayOf(d: Date): Date {
  const out = new Date(d)
  const day = (out.getDay() + 6) % 7
  out.setDate(out.getDate() - day)
  out.setHours(0, 0, 0, 0)
  return out
}

export function WeekView({ M, goal, referenceDate, onPickDay, onBackfillDay, firstName }: Props) {
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

  const hoursByDate = useMemo(() => {
    const o: Record<string, number> = {}
    for (const [k, rows] of Object.entries(entriesByDate)) {
      o[k] = rows.reduce((s, e) => s + (parseFloat(e.hour) || 0), 0)
    }
    return o
  }, [entriesByDate])

  const weekTotal = Object.values(hoursByDate).reduce((s, h) => s + h, 0)
  const workDays = weekDates.filter((d) => isWorkingDay(d, holidays) && d <= new Date())
  const hit = workDays.filter((d) => (hoursByDate[dateKey(d)] || 0) >= goal).length
  const billable = useMemo(() => {
    let b = 0
    for (const rows of Object.values(entriesByDate)) {
      for (const r of rows) if (r.invoice === '1') b += parseFloat(r.hour || '0')
    }
    return b
  }, [entriesByDate])

  // Group entries by client for the week
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

  const nonBillable = weekTotal - billable
  const billablePct = weekTotal > 0 ? (billable / weekTotal) * 100 : 0
  const weeklyGoal = goal * 5
  const goalPct = Math.min(1, weekTotal / weeklyGoal) * 100
  const weekDelta = prevWeekTotal != null ? weekTotal - prevWeekTotal : null
  const bestDay = (() => {
    let best: { date: Date; hours: number } | null = null
    for (const d of weekDates) {
      const h = hoursByDate[dateKey(d)] || 0
      if (!best || h > best.hours) best = { date: d, hours: h }
    }
    return best && best.hours > 0 ? best : null
  })()

  const avgPerWorkday = workDays.length > 0 ? weekTotal / workDays.length : 0
  const flexBalance = weekTotal - weeklyGoal
  const missingDays = useMemo(() => {
    return weekDates.filter((d) => {
      if (d > new Date()) return false
      if (!isWorkingDay(d, holidays)) return false
      return (hoursByDate[dateKey(d)] || 0) === 0
    })
  }, [weekDates, holidays, hoursByDate])

  const isFinished = weekDates[6] < new Date()
  const topClient = clientTotals[0]
  const insight = useMemo(() => weekInsight({
    weekTotal,
    weeklyGoal,
    hit,
    workDayCount: workDays.length,
    billable,
    prevWeekTotal,
    bestDayName: bestDay ? bestDay.date.toLocaleDateString('sv-SE', { weekday: 'long' }) : null,
    bestDayHours: bestDay?.hours,
    topClientName: topClient?.name,
    topClientShare: topClient && weekTotal > 0 ? topClient.hours / weekTotal : undefined,
    firstName,
    isFinished,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [weekTotal, billable, prevWeekTotal, hit, workDays.length, bestDay?.hours, topClient?.hours, topClient?.name, firstName, isFinished])

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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
        <Stat M={M} label="Total" value={loaded ? fmtHours(weekTotal) : null} color={M.ac} />
        <Stat M={M} label="Hit goal" value={loaded ? `${hit}/${workDays.length}` : null} color={M.gn} />
        <Stat M={M} label="Billable" value={loaded ? fmtHours(billable) : null} color={M.pk} />
      </div>

      {/* Weekly goal progress + prev week delta */}
      <div style={{ background: M.s1, border: `1px solid ${M.b1}`, borderRadius: 10, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 7 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: M.t3, letterSpacing: 0.8, textTransform: 'uppercase' }}>
            Weekly goal
          </span>
          {loaded ? (
            <span style={{ fontSize: 11, color: M.t2, fontFamily: 'monospace' }}>
              <strong style={{ color: weekTotal >= weeklyGoal ? M.gn : M.t1 }}>{fmtHours(weekTotal)}</strong>
              <span style={{ color: M.t3 }}> / {fmtHours(weeklyGoal)}</span>
            </span>
          ) : (
            <span className="skeleton" style={{ width: 70, height: 12 }} />
          )}
        </div>
        <div style={{ height: 6, background: M.s2, borderRadius: 3, overflow: 'hidden' }}>
          {loaded && <div style={{ height: '100%', width: `${goalPct}%`, background: weekTotal >= weeklyGoal ? M.gn : M.ac, transition: 'width 300ms ease' }} />}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: M.t3, gap: 8 }}>
          <span>
            {weekDelta == null ? '' :
              weekDelta === 0 ? 'Same as last week' :
                weekDelta > 0 ? <><strong style={{ color: M.gn }}>+{fmtHours(weekDelta)}</strong> vs last wk</> :
                  <><strong style={{ color: '#f59e0b' }}>{fmtHours(weekDelta)}</strong> vs last wk</>}
          </span>
          <span style={{ display: 'flex', gap: 10 }}>
            {avgPerWorkday > 0 && (
              <span>Ø <strong style={{ color: M.t2, fontFamily: 'monospace' }}>{fmtHours(avgPerWorkday)}</strong>/day</span>
            )}
            <span>
              Flex{' '}
              <strong style={{ color: flexBalance >= 0 ? M.gn : '#f59e0b', fontFamily: 'monospace' }}>
                {flexBalance >= 0 ? '+' : ''}{fmtHours(flexBalance)}
              </strong>
            </span>
          </span>
        </div>
      </div>

      {/* Billable vs internal split */}
      {!loaded ? (
        <div className="skeleton" style={{ height: 60, borderRadius: 10 }} />
      ) : weekTotal > 0 && (
        <div style={{ background: M.s1, border: `1px solid ${M.b1}`, borderRadius: 10, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: M.t3, letterSpacing: 0.8, textTransform: 'uppercase' }}>Billable split</span>
            <span style={{ fontSize: 11, color: M.t2, fontFamily: 'monospace' }}>{Math.round(billablePct)}% billable</span>
          </div>
          <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', background: M.s2 }}>
            <div style={{ width: `${billablePct}%`, background: M.pk }} />
            <div style={{ width: `${100 - billablePct}%`, background: M.t3, opacity: 0.4 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: M.t3 }}>
            <span>Billable {fmtHours(billable)}{earnings > 0 ? ` · ${Math.round(earnings).toLocaleString('sv-SE')} kr` : ''}</span>
            <span>Internal {fmtHours(nonBillable)}</span>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 140 }}>
        {weekDates.map((d, idx) => {
          const k = dateKey(d)
          const h = hoursByDate[k] || 0
          const holiday = holidays.get(k)
          const isFuture = d > new Date()
          const isToday = dateKey(new Date()) === k
          const workday = isWorkingDay(d, holidays)
          const pct = Math.min(1, h / goal)
          const barColor = !workday ? M.b1
            : isFuture ? M.b1
              : h >= goal ? M.gn
                : h > 0 ? '#f59e0b'
                  : '#ef4444'
          return (
            <button
              key={k}
              onClick={() => onPickDay(d)}
              disabled={!loaded}
              title={holiday ? `${d.toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric', month: 'short' })} · ${holiday}` : d.toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric', month: 'short' })}
              style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, border: 'none', background: 'transparent', cursor: loaded ? 'pointer' : 'default', padding: 0 }}
            >
              <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', minHeight: 0 }}>
                {loaded ? (
                  <div style={{
                    width: '100%',
                    height: workday && !isFuture ? `${Math.max(pct * 100, h > 0 ? 8 : 4)}%` : '100%',
                    minHeight: 4,
                    background: workday && !isFuture ? barColor : 'transparent',
                    border: workday && !isFuture ? 'none' : `2px dashed ${M.b1}`,
                    borderRadius: 6,
                    outline: isToday ? `2px solid ${M.ac}` : 'none',
                    outlineOffset: 1,
                  }} />
                ) : (
                  <div className="skeleton" style={{ width: '100%', height: `${40 + ((idx * 13) % 50)}%`, minHeight: 20, borderRadius: 6 }} />
                )}
              </div>
              {loaded ? (
                <span style={{ fontSize: 9, fontWeight: 700, color: workday && !isFuture && h > 0 ? barColor : M.tf, fontFamily: 'monospace' }}>
                  {isFuture || !workday ? '' : h > 0 ? fmtHours(h) : '—'}
                </span>
              ) : (
                <span className="skeleton" style={{ width: 18, height: 8 }} />
              )}
              <span style={{ fontSize: 10, fontWeight: isToday ? 800 : 600, color: isToday ? M.ac : holiday ? M.pk : M.t3 }}>
                {DAYS[(d.getDay() + 6) % 7]} {d.getDate()}
              </span>
            </button>
          )
        })}
      </div>

      {missingDays.length > 0 && (
        <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.35)', borderRadius: 9, padding: '8px 11px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 10, color: '#f59e0b', fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' }}>
            {missingDays.length === 1 ? '1 day without entries' : `${missingDays.length} days without entries`}
          </div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {missingDays.map((d) => (
              <button
                key={dateKey(d)}
                onClick={() => (onBackfillDay || onPickDay)(d)}
                title={d.toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric', month: 'short' })}
                style={{ background: M.s1, border: `1px solid ${M.b1}`, color: M.t2, borderRadius: 6, padding: '3px 8px', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}
              >
                {d.toLocaleDateString('sv-SE', { weekday: 'short', day: 'numeric' })}
              </button>
            ))}
          </div>
        </div>
      )}

      {bestDay && (
        <div style={{ fontSize: 11, color: M.t3, textAlign: 'center', fontStyle: 'italic' }}>
          Strongest day: <strong style={{ color: M.t2 }}>{bestDay.date.toLocaleDateString('sv-SE', { weekday: 'long' })}</strong> with <strong style={{ color: M.gn }}>{fmtHours(bestDay.hours)}</strong>
        </div>
      )}

      {!loaded ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div className="skeleton" style={{ height: 42, borderRadius: 9 }} />
          <div className="skeleton" style={{ height: 42, borderRadius: 9 }} />
        </div>
      ) : clientTotals.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: M.t3, letterSpacing: 1.2, textTransform: 'uppercase' }}>By client</div>
          {clientTotals.map((c) => {
            const pct = weekTotal > 0 ? (c.hours / weekTotal) * 100 : 0
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
          <div style={{ fontSize: 9, fontWeight: 700, color: M.t3, letterSpacing: 1.2, textTransform: 'uppercase' }}>Top projects</div>
          {projectTotals.map((p) => {
            const pct = weekTotal > 0 ? (p.hours / weekTotal) * 100 : 0
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

      {loading && loaded && <div style={{ fontSize: 10, color: M.tf, textAlign: 'center' }}>Refreshing…</div>}
    </div>
  )
}

const Stat = ({ M, label, value, color }: { M: Theme; label: string; value: string | null; color: string }) => (
  <div style={{ background: M.s1, border: `1px solid ${M.b1}`, borderRadius: 10, padding: '9px 10px', textAlign: 'center' }}>
    {value === null ? (
      <div className="skeleton" style={{ height: 16, width: '60%', margin: '0 auto' }} />
    ) : (
      <div style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
    )}
    <div style={{ fontSize: 9, color: M.t3, marginTop: 3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6 }}>{label}</div>
  </div>
)
