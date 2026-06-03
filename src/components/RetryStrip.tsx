import { useTranslation } from "../lib/i18n";
import * as prim from "../primitives";
import * as s from "./RetryStrip.css";

interface Props {
  label: string;
  onRetry: () => void;
}

export function RetryStrip({ label, onRetry }: Props) {
  const { t } = useTranslation();
  return (
    <prim.Stack
      role="status"
      direction="row"
      align="center"
      gap="sm"
      borderRadius="sm"
      className={s.strip}
    >
      <prim.MonoText size="sm" weight="semibold" color="danger" className={s.label}>
        {label}
      </prim.MonoText>
      <prim.Button variant="danger" size="xs" shape="pill" mono onClick={onRetry}>
        {t("offline.retry")}
      </prim.Button>
    </prim.Stack>
  );
}
