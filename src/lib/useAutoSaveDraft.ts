import { useEffect, useRef } from "react";

// Crash-safety auto-save: fires `save` every 5 minutes while the timer is
// running, reading the latest closure through a ref so typing into the
// description doesn't restart the 5-minute clock.
export function useAutoSaveDraft(
  tRun: boolean,
  save: () => Promise<void> | void,
) {
  const ref = useRef(save);
  useEffect(() => {
    ref.current = save;
  });
  useEffect(() => {
    if (!tRun) return;
    const h = window.setInterval(
      () => {
        void ref.current();
      },
      5 * 60 * 1000,
    );
    return () => clearInterval(h);
  }, [tRun]);
}
