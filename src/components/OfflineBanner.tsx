import { useTranslation } from "../lib/i18n";
import { vars } from "../theme";
import { MONO } from "../lib/fonts";

interface Props {
  online: boolean;
  pendingCount: number;
  syncing: boolean;
  mode: "light" | "dark";
}

export function OfflineBanner({ online, pendingCount, syncing, mode }: Props) {
  const { t } = useTranslation();
  if (online && pendingCount === 0) return null;

  const syncMode = online;
  const accent = syncMode ? vars.typography.accent : vars.typography.warning;
  const text = !online
    ? pendingCount > 0
      ? t("offline.banner", { n: pendingCount })
      : t("error.offlineBanner")
    : t("offline.syncing", { n: pendingCount });

  return (
    <div
      role="status"
      style={{
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        gap: 7,
        padding: "7px 14px",
        background: `${accent}1a`,
        borderTop: `1px solid ${accent}40`,
        borderBottom: `1px solid ${accent}40`,
        color: syncMode
          ? vars.typography.accent
          : mode === "dark"
            ? "#fbbf24"
            : "#b45309",
        fontFamily: MONO,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: 0.5,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: accent,
          flexShrink: 0,
          animation:
            syncMode || syncing
              ? "pulse 1.2s ease-in-out infinite"
              : undefined,
        }}
      />
      {text}
    </div>
  );
}
