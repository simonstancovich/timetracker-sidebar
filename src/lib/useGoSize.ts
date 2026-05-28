import {
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { HeaderTab } from "../components/AppHeader";

export type WindowSize = "full" | "top";

interface UseGoSizeArgs {
  size: WindowSize;
  setWindowSize: Dispatch<SetStateAction<WindowSize>>;
  tRun: boolean;
  setTab: (t: HeaderTab) => void;
}

// Window-size transition: a brief opacity fade-out → resize via the main
// process → fade-in. `modeTransition` drives the overlay so the renderer can
// hide the resize jank. Going to "full" while a timer is running auto-switches
// to the Timer tab so the user lands where they left off. Refs let the
// one-time intro effect call goSize / read size without re-running on changes.
export function useGoSize({
  size,
  setWindowSize,
  tRun,
  setTab,
}: UseGoSizeArgs) {
  const [modeTransition, setModeTransition] = useState<"idle" | "out" | "in">(
    "idle",
  );

  const goSize = async (s: WindowSize) => {
    if (s === "full" && tRun) setTab("timer");
    if (modeTransition !== "idle") return;
    setModeTransition("out");
    await new Promise((r) => setTimeout(r, 180));
    setWindowSize(s);
    await window.electronAPI.setSize(s);
    setModeTransition("in");
    setTimeout(() => setModeTransition("idle"), 200);
  };

  const goSizeRef = useRef(goSize);
  goSizeRef.current = goSize;
  const sizeRef = useRef(size);
  sizeRef.current = size;

  return { goSize, goSizeRef, sizeRef, modeTransition };
}
