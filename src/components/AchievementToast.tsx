import { achDescription, achName, useTranslation, type Lang } from "../lib/i18n";
import { vars } from "../theme";
import { MONO } from "../lib/fonts";
import type { Ach } from "../lib/achievements";

interface Props {
  ach: Ach | null;
  lang: Lang;
}

export function AchievementToast({ ach, lang }: Props) {
  const { t } = useTranslation();
  if (!ach) return null;
  return (
    <div
      style={{
        position: "absolute",
        bottom: 14,
        left: 12,
        right: 12,
        background: vars.background.surface,
        border: `1.5px solid ${ach.co}55`,
        borderRadius: 14,
        padding: "12px 14px",
        display: "flex",
        alignItems: "center",
        gap: 11,
        zIndex: 100,
        animation: "achIn .4s cubic-bezier(.34,1.56,.64,1)",
        boxShadow: `0 8px 32px ${ach.co}44`,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 11,
          background: `${ach.co}18`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          flexShrink: 0,
        }}
      >
        {ach.e}
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 9,
            fontWeight: 700,
            color: ach.co,
            letterSpacing: 1.2,
            textTransform: "uppercase",
            marginBottom: 2,
          }}
        >
          {t("xp.achievementUnlocked")}
        </div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: vars.typography.primary,
            marginBottom: 2,
          }}
        >
          {achName(ach.id, lang)}
        </div>
        <div style={{ fontSize: 10, color: vars.typography.tertiary }}>
          {achDescription(ach.id, lang)}
        </div>
      </div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          color: ach.co,
          fontFamily: MONO,
          background: `${ach.co}18`,
          borderRadius: 7,
          padding: "4px 9px",
        }}
      >
        +{ach.xp} XP
      </div>
    </div>
  );
}
