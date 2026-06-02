import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Lang } from "./i18n";

export interface AppContextValue {
  mode: "light" | "dark";
  lang: Lang;
  locale: string;
  simonMode: boolean;
  username: string;
  firstName: string;
}

const AppContext = createContext<AppContextValue | null>(null);

interface ProviderProps {
  mode: "light" | "dark";
  lang: Lang;
  simonMode: boolean;
  username: string;
  children: ReactNode;
}

export function AppContextProvider({ mode, lang, simonMode, username, children }: ProviderProps) {
  const value = useMemo<AppContextValue>(() => {
    const locale = lang === "sv" ? "sv-SE" : "en-GB";
    const firstName = username.trim().split(/\s+/)[0] || username;
    return { mode, lang, locale, simonMode, username, firstName };
  }, [mode, lang, simonMode, username]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used inside <AppContextProvider>");
  return ctx;
}
