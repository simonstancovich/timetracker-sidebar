import { useEffect, useRef, useState } from "react";
import { pickGreeting } from "./greetingMessages";
import { getTimerInsight } from "./timerInsights";
import { xpCoachNote } from "./personality";
import type { Lang } from "./i18n";
import type { CurrentUser } from "./useCurrentUser";

const firstNameOf = (u: CurrentUser | null, fallback = "") =>
  u ? u.username.trim().split(/\s+/)[0] || fallback : fallback;

// Picks a fresh greeting every 30 min while we have a signed-in user.
export function useGreetingMessage(
  currentUser: CurrentUser | null,
  lang: Lang,
) {
  const [msg, setMsg] = useState<string>("");
  useEffect(() => {
    if (!currentUser) return;
    const first = firstNameOf(currentUser, "friend");
    setMsg(pickGreeting(first, lang));
    const id = window.setInterval(
      () => setMsg(pickGreeting(first, lang)),
      30 * 60 * 1000,
    );
    return () => clearInterval(id);
  }, [currentUser, lang]);
  return msg;
}

interface TimerInsightInputs {
  tRun: boolean;
  tSec: number;
  tCo: string;
  tPr: string;
  tD: string;
  todayH: number;
  streak: number;
}

// Ambient timer insight — rotates every 2 min. Volatile timer values are read
// via a ref so we don't restart the interval on every tick.
export function useTimerInsight(
  currentUser: CurrentUser | null,
  lang: Lang,
  goal: number,
  entriesCount: number,
  inputs: TimerInsightInputs,
) {
  const [msg, setMsg] = useState<string>("");
  const ref = useRef(inputs);
  ref.current = inputs;
  useEffect(() => {
    if (!currentUser) return;
    const first = firstNameOf(currentUser);
    const compute = () =>
      setMsg(
        getTimerInsight({
          ...ref.current,
          goal,
          entriesToday: entriesCount,
          firstName: first,
          lang,
        }),
      );
    compute();
    const id = window.setInterval(compute, 2 * 60 * 1000);
    return () => clearInterval(id);
  }, [currentUser, lang, entriesCount, goal]);
  return msg;
}

interface XpCoachInputs {
  xp: number;
  xpIntoLevel: number;
  streak: number;
  weekTotal: number;
}

// XP coaching note — rotates every hour. Volatile XP values are read via a
// ref so we don't restart the hourly interval on every XP tick.
export function useXpCoach(
  currentUser: CurrentUser | null,
  lang: Lang,
  inputs: XpCoachInputs,
) {
  const [msg, setMsg] = useState<string>("");
  const ref = useRef(inputs);
  ref.current = inputs;
  useEffect(() => {
    if (!currentUser) return;
    const first = firstNameOf(currentUser);
    const compute = () =>
      setMsg(
        xpCoachNote({
          ...ref.current,
          xpPerLevel: 1000,
          firstName: first,
          lang,
        }),
      );
    compute();
    const id = window.setInterval(compute, 60 * 60 * 1000);
    return () => clearInterval(id);
  }, [currentUser, lang]);
  return msg;
}
