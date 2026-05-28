import { useTranslation } from "../lib/i18n";
import { MONO } from "../lib/fonts";
import { vars } from "../theme";
import { Button } from "../primitives/Button/Button";

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
        background: `color-mix(in srgb, ${vars.typography.error} 10%, transparent)`,
        borderTop: `1px solid color-mix(in srgb, ${vars.typography.error} 25%, transparent)`,
        borderBottom: `1px solid color-mix(in srgb, ${vars.typography.error} 25%, transparent)`,
        color: vars.typography.error,
        fontFamily: MONO,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: 0.5,
      }}
    >
      <span style={{ flex: 1 }}>{t("offline.failedBanner", { n: count })}</span>
      <Button variant="danger" size="xs" shape="pill" mono onClick={onRetry}>
        {t("offline.retry")}
      </Button>
    </div>
  );
}
