import { useTranslation } from "../lib/i18n";
import { vars } from "../theme";
import { MONO } from "../lib/fonts";

interface Props {
  label: string;
  onRetry: () => void;
}

// Inline failstate for a load that didn't arrive (clients / projects), so the
// user sees a clear reason + a way to recover instead of a stuck "Loading…".
export function RetryStrip({ label, onRetry }: Props) {
  const { t } = useTranslation();
  return (
    <div
      role="status"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "7px 10px",
        borderRadius: 8,
        background: "#ef44441a",
        border: "1px solid #ef444440",
      }}
    >
      <span
        style={{
          flex: 1,
          fontSize: 11,
          fontWeight: 600,
          color: vars.typography.danger,
          fontFamily: MONO,
        }}
      >
        {label}
      </span>
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
