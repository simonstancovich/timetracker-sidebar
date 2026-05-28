import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { formatLocalDate } from "./date";
import { goalDoneCheer, goalDoneSub } from "./personality";
import type { Lang } from "./i18n";

interface UseProgressFeedbackArgs {
  authed: boolean | null;
  xp: number;
  streak: number;
  tRun: boolean;
  tSec: number;
  done: boolean;
  lang: Lang;
  lastCelebratedDate: string;
  setLastCelebratedDate: Dispatch<SetStateAction<string>>;
}

// Derived/animated UI feedback that reacts to player progression (useProgress)
// + the running timer. Owns sessionXp (xp earned this session), the xpBump
// "+N XP" pop animation, the streak-pop flag, and the 8h goal celebration
// (bloom flag + celebration toast). All effects live here so App stays out
// of animation timing.
export function useProgressFeedback({
  authed,
  xp,
  streak,
  tRun,
  tSec,
  done,
  lang,
  lastCelebratedDate,
  setLastCelebratedDate,
}: UseProgressFeedbackArgs) {
  const [sessionXp, setSessionXp] = useState(0);
  // Settle period after mount: don't count XP loaded from storage as gained.
  const lastXp = useRef<number | null>(null);
  const sessionSettledAt = useRef(Date.now() + 2500);

  // "+N XP" pop above the XP counter.
  const [xpBump, setXpBump] = useState<{ id: number; delta: number } | null>(
    null,
  );
  const xpBumpId = useRef(0);
  const prevDisplayXp = useRef(0);

  // Streak-pop animation on streak increment.
  const [justBumpedStreak, setJustBumpedStreak] = useState(false);
  const prevStreakRef = useRef(0);

  // 8h goal celebration — bloom flag + toast.
  const [justHitGoal, setJustHitGoal] = useState(false);
  const [goalCelebration, setGoalCelebration] = useState<{
    title: string;
    sub: string;
  } | null>(null);

  // xp → sessionXp: each xp gain after the settle period adds to the session.
  useEffect(() => {
    if (Date.now() < sessionSettledAt.current) {
      lastXp.current = xp;
      return;
    }
    if (lastXp.current !== null && xp > lastXp.current) {
      setSessionXp((s) => s + (xp - lastXp.current!));
    }
    lastXp.current = xp;
  }, [xp]);

  // xpBump: any rise in displayed XP (sessionXp + live-timer bonus) pops a toast.
  useEffect(() => {
    const current = sessionXp + (tRun ? Math.floor(tSec / 60) : 0);
    if (current > prevDisplayXp.current) {
      const delta = current - prevDisplayXp.current;
      const id = ++xpBumpId.current;
      setXpBump({ id, delta });
      const t = window.setTimeout(() => {
        setXpBump((cur) => (cur && cur.id === id ? null : cur));
      }, 1500);
      prevDisplayXp.current = current;
      return () => clearTimeout(t);
    }
    prevDisplayXp.current = current;
  }, [sessionXp, tRun, tSec]);

  // Streak increment — pop animation when streak goes up after first hydration.
  useEffect(() => {
    const prev = prevStreakRef.current;
    prevStreakRef.current = streak;
    if (streak > prev && prev > 0) {
      setJustBumpedStreak(true);
      const t = window.setTimeout(() => setJustBumpedStreak(false), 1200);
      return () => clearTimeout(t);
    }
  }, [streak]);

  // 8h goal celebration — fires once per calendar day on first crossing.
  useEffect(() => {
    if (!authed || !done) return;
    const today = formatLocalDate(new Date());
    if (lastCelebratedDate === today) return;
    setGoalCelebration({ title: goalDoneCheer(lang), sub: goalDoneSub(lang) });
    setJustHitGoal(true);
    setLastCelebratedDate(today);
    window.electronAPI.storeSet("lastCelebratedDate", today);
  }, [done, authed, lastCelebratedDate, lang, setLastCelebratedDate]);

  // Auto-dismiss bloom + celebration toast in separate effects keyed on the
  // flags, so the trigger above re-running (it sets lastCelebratedDate, a dep)
  // can't cancel these timers mid-flight and strand them on forever.
  useEffect(() => {
    if (!justHitGoal) return;
    const id = window.setTimeout(() => setJustHitGoal(false), 1700);
    return () => clearTimeout(id);
  }, [justHitGoal]);

  useEffect(() => {
    if (!goalCelebration) return;
    const id = window.setTimeout(() => setGoalCelebration(null), 4200);
    return () => clearTimeout(id);
  }, [goalCelebration]);

  // Reset session XP on sign-out so the next user doesn't inherit it.
  useEffect(() => {
    if (!authed) setSessionXp(0);
  }, [authed]);

  return {
    sessionXp,
    xpBump,
    justBumpedStreak,
    justHitGoal,
    goalCelebration,
  };
}

export type UseProgressFeedback = ReturnType<typeof useProgressFeedback>;
