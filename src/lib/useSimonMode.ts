import { useEffect, useRef, useState } from "react";

// Hidden dev gate: triple-click the secret corner within 1.5s to toggle a
// flag that reveals features kept deactivated for tester/demo builds.
// Persisted in electron-store.
export function useSimonMode(
  addFloat: (msg: string, col: string) => void,
) {
  const [simonMode, setSimonMode] = useState(false);
  const clicksRef = useRef(0);
  const resetRef = useRef<number | null>(null);

  useEffect(() => {
    window.electronAPI.storeGet("simonMode").then((v) =>
      setSimonMode(v === true),
    );
  }, []);

  const tapCorner = () => {
    clicksRef.current += 1;
    if (resetRef.current) clearTimeout(resetRef.current);
    resetRef.current = window.setTimeout(() => {
      clicksRef.current = 0;
    }, 1500);
    if (clicksRef.current < 3) return;
    clicksRef.current = 0;
    setSimonMode((m) => {
      const next = !m;
      window.electronAPI.storeSet("simonMode", next);
      addFloat(
        next ? "Simon mode ON" : "Simon mode OFF",
        next ? "#10b981" : "#ef4444",
      );
      return next;
    });
  };

  return { simonMode, tapCorner };
}
