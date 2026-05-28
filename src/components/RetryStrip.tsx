import { useTranslation } from "../lib/i18n";
import { vars } from "../theme";
import { MONO } from "../lib/fonts";
import { Button } from "../primitives/Button/Button";

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
        background: `color-mix(in srgb, ${vars.typography.error} 10%, transparent)`,
        border: `1px solid color-mix(in srgb, ${vars.typography.error} 25%, transparent)`,
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
      <Button variant="danger" size="xs" shape="pill" mono onClick={onRetry}>
        {t("offline.retry")}
      </Button>
    </div>
  );
}
