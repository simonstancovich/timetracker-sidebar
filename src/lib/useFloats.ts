import { useCallback, useRef, useState } from "react";

export interface Float {
  id: number;
  txt: string;
  col: string;
}

// Toast-style "float up" messages: short status nudges (saved, queued, error)
// that fade in/out of view. Capped at 3 concurrent, deduped by text, auto-
// dismissed after 1.5s. `addFloat` is stable across renders.
export function useFloats() {
  const [floats, setFloats] = useState<Float[]>([]);
  const fid = useRef(0);

  const addFloat = useCallback((txt: string, col: string) => {
    const id = ++fid.current;
    setFloats((f) => {
      // Dedupe an identical message that's already showing; cap at 3 at once.
      if (f.some((x) => x.txt === txt)) return f;
      return [...f, { id, txt, col }].slice(-3);
    });
    setTimeout(() => setFloats((f) => f.filter((x) => x.id !== id)), 1500);
  }, []);

  return { floats, addFloat };
}

export type UseFloats = ReturnType<typeof useFloats>;
