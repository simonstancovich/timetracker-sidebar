import { useEffect } from "react";

export function useGlobalErrorLogging() {
  useEffect(() => {
    const onErr = (e: ErrorEvent) =>
      console.error("[window-error]", e.error || e.message);
    const onRej = (e: PromiseRejectionEvent) =>
      console.error("[unhandled-rejection]", e.reason);
    window.addEventListener("error", onErr);
    window.addEventListener("unhandledrejection", onRej);
    return () => {
      window.removeEventListener("error", onErr);
      window.removeEventListener("unhandledrejection", onRej);
    };
  }, []);
}
