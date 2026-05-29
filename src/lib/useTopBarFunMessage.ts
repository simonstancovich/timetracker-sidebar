import { useEffect, useState } from "react";
import { pickRandomMessage } from "./funMessages";
import { pickTip } from "./productivityTips";
import { type Lang } from "./i18n";

export function useTopBarFunMessage(
  size: "full" | "top",
  lang: Lang,
): string | null {
  const [funMessage, setFunMessage] = useState<string | null>(null);
  useEffect(() => {
    if (size !== "top") {
      setFunMessage(null);
      return;
    }
    let hideId: number | undefined;
    let showTip = false;
    const show = () => {
      setFunMessage(showTip ? pickTip(lang) : pickRandomMessage(lang));
      showTip = !showTip;
      hideId = window.setTimeout(() => setFunMessage(null), 18000);
    };
    const initialId = window.setTimeout(show, 5000);
    const rotateId = window.setInterval(show, 45000);
    return () => {
      clearTimeout(initialId);
      clearInterval(rotateId);
      if (hideId) clearTimeout(hideId);
    };
  }, [size, lang]);
  return funMessage;
}
