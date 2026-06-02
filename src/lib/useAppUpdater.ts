import { useEffect } from "react";
import { vars } from "../theme";
import { useTranslation } from "./i18n";

type AddFloat = (txt: string, col: string) => void;

export function useAppUpdater(addFloat: AddFloat) {
  const { t } = useTranslation();
  useEffect(() => {
    return window.electronAPI.onUpdateStatus((status) => {
      if (status.state === "available") {
        addFloat(t("update.available", { v: status.version }), vars.typography.accent);
      } else if (status.state === "ready") {
        addFloat(t("update.ready", { v: status.version }), vars.typography.green);
        const restart = window.confirm(t("update.restartPrompt", { v: status.version }));
        if (restart) window.electronAPI.updaterQuitAndInstall();
      } else if (status.state === "error") {
        addFloat(t("update.failed", { err: status.error }), vars.typography.error);
      }
    });
  }, [addFloat, t]);
}
