import { useTranslation } from "../lib/i18n";
import { vars } from "../theme";

interface Celebration {
  title: string;
  sub: string;
}

interface Props {
  celebration: Celebration | null;
  liftedForAch: boolean;
}

export function GoalCelebrationToast({ celebration, liftedForAch }: Props) {
  const { t } = useTranslation();
  if (!celebration) return null;
  return (
    <div
      style={{
        position: "absolute",
        bottom: liftedForAch ? 90 : 14,
        left: 12,
        right: 12,
        background: vars.background.surface,
        border: `1.5px solid color-mix(in srgb, ${vars.typography.green} 40%, transparent)`,
        borderRadius: 14,
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        gap: 13,
        zIndex: 101,
        animation: "goalToastIn .6s cubic-bezier(.34,1.56,.64,1)",
        boxShadow: `0 10px 36px color-mix(in srgb, ${vars.typography.green} 33%, transparent)`,
      }}
      role="status"
      aria-live="polite"
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: `color-mix(in srgb, ${vars.typography.green} 12%, transparent)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: vars.typography.green,
        }}
      >
        <svg
          viewBox="0 0 24 24"
          width={24}
          height={24}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 9,
            fontWeight: 700,
            color: vars.typography.green,
            letterSpacing: 1.4,
            textTransform: "uppercase",
            marginBottom: 3,
          }}
        >
          {t("goal.eyebrow")}
        </div>
        <div
          style={{
            fontSize: 15,
            fontWeight: 800,
            color: vars.typography.primary,
            marginBottom: 2,
            letterSpacing: -0.2,
          }}
        >
          {celebration.title}
        </div>
        <div style={{ fontSize: 11, color: vars.typography.tertiary }}>
          {celebration.sub}
        </div>
      </div>
    </div>
  );
}
