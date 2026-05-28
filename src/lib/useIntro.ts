import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type MutableRefObject,
} from "react";
import { buildIntroSteps } from "./introSteps";
import type { Lang } from "./i18n";
import type { HeaderTab } from "../components/AppHeader";

type WindowSize = "full" | "top";

interface UseIntroArgs {
  authed: boolean | null;
  lang: Lang;
  tab: HeaderTab;
  tCo: string;
  tPr: string;
  tD: string;
  tRun: boolean;
  timerFormOpen: boolean;
  sizeRef: MutableRefObject<WindowSize>;
  goSizeRef: MutableRefObject<(s: WindowSize) => Promise<unknown> | void>;
}

// First-run intro tour: shows on auth if `intro_seen` is unset; steps auto-
// advance as the user interacts (opens timer tab, starts the clock, picks
// client/project, types a description, etc.). Owns showIntro/introStep + the
// step table + the auto-advance + the persist-on-dismiss effect.
export function useIntro({
  authed,
  lang,
  tab,
  tCo,
  tPr,
  tD,
  tRun,
  timerFormOpen,
  sizeRef,
  goSizeRef,
}: UseIntroArgs) {
  const [showIntro, setShowIntro] = useState(false);
  const [introChecked, setIntroChecked] = useState(false);
  const [introStep, setIntroStep] = useState(0);

  const introSteps = useMemo(() => buildIntroSteps(lang), [lang]);
  const introIndex = useMemo(() => {
    const m: Record<string, number> = {};
    introSteps.forEach((s, i) => {
      m[s.key] = i;
    });
    return m;
  }, [introSteps]);

  // Check intro_seen once on auth; force full mode if showing the tour.
  useEffect(() => {
    if (!authed || introChecked) return;
    window.electronAPI.storeGet("intro_seen").then((seen) => {
      if (!seen) {
        setShowIntro(true);
        setIntroStep(0);
        if (sizeRef.current !== "full") goSizeRef.current("full");
      }
      setIntroChecked(true);
    });
  }, [authed, introChecked, sizeRef, goSizeRef]);

  const dismissIntro = useCallback(() => {
    setShowIntro(false);
    setIntroStep(0);
    window.electronAPI.storeSet("intro_seen", true);
    window.electronAPI.setBlurCollapseDisabled(false);
  }, []);

  const advanceIntro = useCallback(() => {
    setIntroStep((s) => {
      const next = s + 1;
      if (next >= introSteps.length) {
        dismissIntro();
        return 0;
      }
      return next;
    });
  }, [introSteps.length, dismissIntro]);

  // Auto-advance when the user does the thing the current step is pointing at.
  // Any client / project works — not restricted to DevCore / Utbildning — so
  // the tour continues for tenants without those exact names.
  useEffect(() => {
    if (!showIntro) return;
    const at = (key: string) => introStep === introIndex[key];
    if (at("openTimer") && tab === "timer") setIntroStep(introIndex.startClock);
    if (at("startClock") && tRun) setIntroStep(introIndex.pickClient);
    if (at("pickClient") && tCo) setIntroStep(introIndex.pickProject);
    if (at("pickProject") && tPr) setIntroStep(introIndex.describe);
    if (at("revealRunning") && !timerFormOpen)
      setIntroStep(introIndex.liveActions);
    if (at("openToday") && tab === "today") setIntroStep(introIndex.todayStats);
    if (at("openHistory") && tab === "history")
      setIntroStep(introIndex.historyScale);
    if (at("openXp") && tab === "xp") setIntroStep(introIndex.xpLevel);
  }, [showIntro, introStep, introIndex, tab, tCo, tPr, tRun, timerFormOpen]);

  // Describe step needs a non-empty description before Next is allowed.
  const introCanAdvance =
    introStep === introIndex.describe ? tD.trim().length > 0 : true;

  return {
    showIntro,
    setShowIntro,
    introStep,
    setIntroStep,
    introSteps,
    introIndex,
    introCanAdvance,
    dismissIntro,
    advanceIntro,
  };
}

export type UseIntro = ReturnType<typeof useIntro>;
