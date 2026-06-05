import { useEffect, useMemo, useState } from "react";
import { loadTimeEntries, type TimeEntry } from "../api";
import { mondayOf } from "../lib/date";
import { dateKey, getHolidays, isWorkingDay } from "../lib/swedishHolidays";
import type { MonthClosureCache } from "../lib/useMonthClosure";

interface ClientTotal {
  name: string;
  hours: number;
}

interface BestDay {
  date: Date;
  hours: number;
}

export interface WeekData {
  monday: Date;
  weekDates: Date[];
  todayKey: string;
  holidays: Map<string, string>;
  hoursByDate: Record<string, number>;
  weekTotal: number;
  workDayCount: number;
  hitGoalDays: number;
  billable: number;
  billablePct: number;
  clientTotals: ClientTotal[];
  topClient: ClientTotal | undefined;
  weeklyGoal: number;
  goalPct: number;
  avgPerWorkday: number;
  weekDelta: number | null;
  flexBalance: number;
  overtimeHours: number;
  weekendHours: number;
  longDays: Date[];
  bestDay: BestDay | null;
  missingDays: Date[];
  loading: boolean;
  loaded: boolean;
  isFinished: boolean;
}

export function useWeekData(
  referenceDate: Date,
  goal: number,
  monthClosure?: MonthClosureCache,
): WeekData {
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [entriesByDate, setEntriesByDate] = useState<Record<string, TimeEntry[]>>({});
  const [prevWeekTotal, setPrevWeekTotal] = useState<number | null>(null);

  const monday = useMemo(() => mondayOf(referenceDate), [referenceDate]);
  const weekDates = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(d.getDate() + i);
        return d;
      }),
    [monday],
  );
  const prevWeekDates = useMemo(() => {
    const prev = new Date(monday);
    prev.setDate(prev.getDate() - 7);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [monday]);
  const holidays = useMemo(() => getHolidays(monday.getFullYear()), [monday]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoaded(false);
    Promise.all(
      weekDates.map((d) => loadTimeEntries(d).catch(() => [] as TimeEntry[])),
    ).then((results) => {
      if (cancelled) return;
      const next: Record<string, TimeEntry[]> = {};
      weekDates.forEach((d, i) => {
        next[dateKey(d)] = results[i] || [];
      });
      setEntriesByDate(next);
      setLoading(false);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [weekDates]);

  useEffect(() => {
    if (!loaded) return;
    let cancelled = false;
    Promise.all(
      prevWeekDates.map((d) => loadTimeEntries(d).catch(() => [] as TimeEntry[])),
    ).then((results) => {
      if (cancelled) return;
      let total = 0;
      for (const rows of results)
        for (const r of rows) total += parseFloat(r.hour || "0");
      setPrevWeekTotal(total);
    });
    return () => {
      cancelled = true;
    };
  }, [prevWeekDates, loaded]);

  useEffect(() => {
    if (!monthClosure) return;
    const seen = new Set<string>();
    for (const d of weekDates) {
      const k = `${d.getFullYear()}-${d.getMonth()}`;
      if (seen.has(k)) continue;
      seen.add(k);
      monthClosure.ensure(d.getFullYear(), d.getMonth());
    }
  }, [weekDates, monthClosure]);

  const hoursByDate = useMemo<Record<string, number>>(() => {
    const o: Record<string, number> = {};
    for (const [k, rows] of Object.entries(entriesByDate) as [string, TimeEntry[]][]) {
      o[k] = rows.reduce((sum, e) => sum + (parseFloat(e.hour) || 0), 0);
    }
    return o;
  }, [entriesByDate]);

  const billable = useMemo(() => {
    let b = 0;
    for (const rows of Object.values(entriesByDate) as TimeEntry[][]) {
      for (const r of rows) if (r.invoice === "1") b += parseFloat(r.hour || "0");
    }
    return b;
  }, [entriesByDate]);

  const clientTotals = useMemo(() => {
    const m: Record<string, ClientTotal> = {};
    for (const rows of Object.values(entriesByDate) as TimeEntry[][]) {
      for (const r of rows) {
        const key = r._company_id;
        if (!m[key]) m[key] = { name: r.company, hours: 0 };
        m[key].hours += parseFloat(r.hour || "0");
      }
    }
    return Object.values(m).sort((a, b) => b.hours - a.hours);
  }, [entriesByDate]);

  const missingDays = useMemo(() => {
    const now = new Date();
    return weekDates.filter((d) => {
      if (d > now) return false;
      if (!isWorkingDay(d, holidays)) return false;
      return (hoursByDate[dateKey(d)] || 0) === 0;
    });
  }, [weekDates, holidays, hoursByDate]);

  const now = new Date();
  const weekTotal = (Object.values(hoursByDate) as number[]).reduce((s, h) => s + h, 0);
  const workDays = weekDates.filter((d) => isWorkingDay(d, holidays) && d <= now);
  const workDayCount = workDays.length;
  const hitGoalDays = workDays.filter((d) => (hoursByDate[dateKey(d)] || 0) >= goal).length;
  const billablePct = weekTotal > 0 ? (billable / weekTotal) * 100 : 0;
  const allWorkdaysInWeek = weekDates.filter((d) => isWorkingDay(d, holidays));
  const weeklyGoal = allWorkdaysInWeek.length * goal;
  const goalPct = weeklyGoal > 0 ? Math.min(100, (weekTotal / weeklyGoal) * 100) : 0;
  const avgPerWorkday = workDayCount > 0 ? weekTotal / workDayCount : 0;
  const weekDelta = prevWeekTotal != null ? weekTotal - prevWeekTotal : null;
  const flexBalance = weekTotal - workDayCount * goal;
  const overtimeHours = Math.max(0, weekTotal - weeklyGoal);
  const weekendHours = weekDates.reduce((sum, d) => {
    if (d.getDay() !== 0 && d.getDay() !== 6) return sum;
    return sum + (hoursByDate[dateKey(d)] || 0);
  }, 0);
  const longDays = weekDates.filter((d) => (hoursByDate[dateKey(d)] || 0) > 10);
  const bestDay = (() => {
    let best: BestDay | null = null;
    for (const d of weekDates) {
      const h = hoursByDate[dateKey(d)] || 0;
      if (!best || h > best.hours) best = { date: d, hours: h };
    }
    return best && best.hours > 0 ? best : null;
  })();
  const topClient = clientTotals[0];
  const lastDay = weekDates[6];
  const isFinished = lastDay !== undefined && lastDay < now;

  return {
    monday,
    weekDates,
    todayKey: dateKey(now),
    holidays,
    hoursByDate,
    weekTotal,
    workDayCount,
    hitGoalDays,
    billable,
    billablePct,
    clientTotals,
    topClient,
    weeklyGoal,
    goalPct,
    avgPerWorkday,
    weekDelta,
    flexBalance,
    overtimeHours,
    weekendHours,
    longDays,
    bestDay,
    missingDays,
    loading,
    loaded,
    isFinished,
  };
}
