import { useTranslation } from "../lib/i18n";
import * as prim from "../primitives";
import * as s from "./FailedQueueBanner.css";

interface Props {
  count: number;
  onRetry: () => void;
}

export function FailedQueueBanner({ count, onRetry }: Props) {
  const { t } = useTranslation();
  if (count === 0) return null;
  return (
    <prim.Stack
      role="status"
      direction="row"
      align="center"
      gap="sm"
      noShrink
      className={s.banner}
    >
      <prim.MonoText size="xs" color="error" tracking="wider" className={s.label}>
        {t("offline.failedBanner", { n: count })}
      </prim.MonoText>
      <prim.Button variant="danger" size="xs" shape="pill" mono onClick={onRetry}>
        {t("offline.retry")}
      </prim.Button>
    </prim.Stack>
  );
}
