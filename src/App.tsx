import { useEffect, useState } from "react";
import { lightTheme, darkTheme } from "./theme";
import * as prim from "./primitives";
import { LoginScreen } from "./components/LoginScreen";
import { AppShell } from "./AppShell";
import {
  type Lang,
  useTranslation,
  setLang as setI18nLang,
} from "./lib/i18n";
import { isTestMode } from "./lib/testMode";

type WindowSize = "full" | "top";

const TEST_MODE = isTestMode();

export default function App() {
  const { t } = useTranslation();
  const [authed, setAuthed] = useState<boolean | null>(TEST_MODE ? true : null);
  const [mode, setMode] = useState<"light" | "dark">("light");
  const [lang, setLang] = useState<Lang>("en");
  const [pinned, setPinned] = useState(false);
  const [size, setWindowSize] = useState<WindowSize>("full");

  useEffect(() => {
    if (TEST_MODE) return;
    window.electronAPI.checkAuth().then(setAuthed);
    const unsubs = [
      window.electronAPI.onAuthSuccess(() => setAuthed(true)),
      window.electronAPI.onSignedOut(() => setAuthed(false)),
      window.electronAPI.onSessionLost(() => setAuthed(false)),
      window.electronAPI.onForcedSize(setWindowSize),
    ];
    return () => unsubs.forEach((off) => typeof off === "function" && off());
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [m, l, p] = await Promise.all([
        window.electronAPI.storeGet("mode"),
        window.electronAPI.storeGet("lang"),
        window.electronAPI.storeGet("pinned"),
      ]);
      if (cancelled) return;
      if (m === "dark" || m === "light") setMode(m);
      if (l === "en" || l === "sv") setLang(l);
      if (typeof p === "boolean") setPinned(p);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    window.electronAPI.storeSet("mode", mode);
  }, [mode]);
  useEffect(() => {
    window.electronAPI.storeSet("lang", lang);
    setI18nLang(lang);
  }, [lang]);
  useEffect(() => {
    window.electronAPI.storeSet("pinned", pinned);
  }, [pinned]);

  const themeClass = mode === "dark" ? darkTheme : lightTheme;
  const spinner = (
    <prim.Spinner
      layout="fill"
      label={t("form.loadingProjects")}
      className={themeClass}
    />
  );

  if (authed === null) return spinner;
  if (!authed)
    return (
      <prim.Stack fullHeight background="page" className={themeClass}>
        <LoginScreen
          onAuthed={() => setAuthed(true)}
          onOpenBrowser={() => window.electronAPI.openAuth()}
        />
      </prim.Stack>
    );

  return (
    <AppShell
      mode={mode}
      setMode={setMode}
      lang={lang}
      setLang={setLang}
      pinned={pinned}
      setPinned={setPinned}
      size={size}
      setWindowSize={setWindowSize}
      themeClass={themeClass}
      onSignOut={() => {
        setAuthed(false);
        window.electronAPI.signOut();
      }}
    />
  );
}
