import { useTranslation, type Lang } from "../lib/i18n";
import { vars } from "../theme";

interface Props {
  mode: "light" | "dark";
  setMode: (m: "light" | "dark") => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  pinned: boolean;
  setPinned: (next: (prev: boolean) => boolean) => void;
  onShowIntro: () => void;
  onSignOut: () => void;
}

export function AppFooter({
  mode, setMode, lang, setLang, pinned, setPinned, onShowIntro, onSignOut,
}: Props) {
  const { t } = useTranslation();
  return (
<div
  style={{
    height: 40,
    flexShrink: 0,
    borderTop: `1px solid ${vars.border.soft}`,
    background: vars.background.page,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 14px",
    gap: 10,
  }}
>
  <div
    data-tour="footer-theme"
    style={{
      display: "flex",
      gap: 2,
      background: vars.background.raised,
      border: `1px solid ${vars.border.soft}`,
      borderRadius: 7,
      padding: 2,
    }}
  >
    {(["light", "dark"] as const).map((m) => (
      <button
        key={m}
        onClick={() => setMode(m)}
        style={{
          width: 22,
          height: 22,
          borderRadius: 5,
          border: mode === m ? `1px solid ${vars.border.strong}` : "none",
          background: mode === m ? vars.background.surface : "transparent",
          fontSize: 11,
          cursor: "pointer",
        }}
      >
        {m === "light" ? "☀️" : "🌙"}
      </button>
    ))}
  </div>
  <button
    data-tour="footer-lang"
    onClick={() => setLang(lang === "en" ? "sv" : "en")}
    title={t("lang.switchTo")}
    style={{
      width: 22,
      height: 22,
      borderRadius: 5,
      background: vars.background.raised,
      border: `1px solid ${vars.border.soft}`,
      fontSize: 12,
      cursor: "pointer",
      padding: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {lang === "en" ? "🇸🇪" : "🇬🇧"}
  </button>
  <button
    type="button"
    data-tour="footer-pin"
    onClick={() => setPinned((v) => !v)}
    aria-pressed={pinned}
    title={pinned ? t("footer.unpinSidebar") : t("footer.pinSidebar")}
    style={{
      width: 22,
      height: 22,
      borderRadius: 5,
      background: pinned ? `color-mix(in srgb, ${vars.typography.accent} 15%, transparent)` : vars.background.raised,
      border: `1px solid ${pinned ? vars.typography.accent : vars.border.soft}`,
      color: pinned ? vars.typography.accent : vars.typography.tertiary,
      fontSize: 11,
      cursor: "pointer",
      padding: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    📌
  </button>
  <button
    data-tour="footer-help"
    onClick={onShowIntro}
    title={t("footer.showIntro")}
    style={{
      width: 22,
      height: 22,
      borderRadius: 5,
      background: vars.background.raised,
      border: `1px solid ${vars.border.soft}`,
      color: vars.typography.tertiary,
      fontSize: 11,
      fontWeight: 700,
      cursor: "pointer",
    }}
  >
    ?
  </button>
  <button
    onClick={onSignOut}
    title={t("footer.signOut")}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 6,
      background: "none",
      border: "none",
      color: vars.typography.tertiary,
      fontSize: 12,
      cursor: "pointer",
      padding: "4px 8px",
    }}
  >
    <span>{t("footer.signOut")}</span>
    <span style={{ fontSize: 13 }}>⎋</span>
  </button>
</div>
  );
}
