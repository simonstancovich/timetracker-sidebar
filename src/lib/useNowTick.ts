import { useEffect, useState } from "react";

// Bumps once at the top of every wall-clock minute. Other effects depend on
// `nowTick` to recompute time-derived values (header clock, midnight rollover
// for the entries fetch, greeting, todayI).
export function useNowTick() {
  const [nowTick, setNowTick] = useState(0);
  useEffect(() => {
    let id = 0;
    const schedule = () => {
      const now = new Date();
      const nextMinute = new Date(now);
      nextMinute.setSeconds(0, 0);
      nextMinute.setMinutes(nextMinute.getMinutes() + 1);
      id = window.setTimeout(
        () => {
          setNowTick((n) => n + 1);
          schedule();
        },
        Math.max(200, +nextMinute - +now),
      );
    };
    schedule();
    return () => clearTimeout(id);
  }, []);
  return nowTick;
}
