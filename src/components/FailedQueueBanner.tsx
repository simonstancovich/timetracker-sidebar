import { useTranslation } from "../lib/i18n";
import { MONO } from "../lib/fonts";

interface Props {
  count: number;
  onRetry: () => void;
}

export function FailedQueueBanner({ count, onRetry }: Props) {
  const { t } = useTranslation();
  if (count === 0) return null;
  return (
    <div
      role="status"
      style={{
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "7px 14px",
        background: "#ef44441a",
        borderTop: `1px solid #ef444440`,
        borderBottom: `1px solid #ef444440`,
        color: "#ef4444",
        fontFamily: MONO,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: 0.5,
      }}
    >
      <span style={{ flex: 1 }}>{t("offline.failedBanner", { n: count })}</span>
      <button
        type="button"
        onClick={onRetry}
        style={{
          padding: "3px 10px",
          borderRadius: 999,
          background: "#ef4444",
          color: "#fff",
          border: "none",
          fontFamily: MONO,
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: 1,
          textTransform: "uppercase",
          cursor: "pointer",
        }}
      >
        {t("offline.retry")}
      </button>
    </div>
  );
}
