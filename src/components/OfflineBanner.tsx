import { useTranslation } from "../lib/i18n";
import { cx } from "../lib/cx";
import * as prim from "../primitives";
import * as s from "./OfflineBanner.css";

interface Props {
  online: boolean;
  pendingCount: number;
  syncing: boolean;
}

export function OfflineBanner({ online, pendingCount, syncing }: Props) {
  const { t } = useTranslation();
  if (online && pendingCount === 0) return null;

  const tone = online ? "sync" : "offline";
  const pulsing = online || syncing;
  const text = !online
    ? pendingCount > 0
      ? t("offline.banner", { n: pendingCount })
      : t("error.offlineBanner")
    : t("offline.syncing", { n: pendingCount });

  return (
    <prim.Stack
      role="status"
      direction="row"
      align="center"
      noShrink
      className={cx(s.banner, s.tone[tone])}
    >
      <prim.Stack
        as="span"
        inline
        className={cx(s.dot, s.dotTone[tone], pulsing && s.dotPulsing)}
      >
        {null}
      </prim.Stack>
      {text}
    </prim.Stack>
  );
}
