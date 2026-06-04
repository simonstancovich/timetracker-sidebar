import { useTranslation } from "../lib/i18n";
import { fmtClock } from "../lib/hours";
import * as prim from "../primitives";
import * as s from "./StashedTimerBanner.css";

interface Props {
  coName: string;
  seconds: number;
  onReturn: () => void;
}

export function StashedTimerBanner({ coName, seconds, onReturn }: Props) {
  const { t } = useTranslation();
  return (
    <prim.Button
      variant="link"
      onClick={onReturn}
      title={t("timer.returnToMain")}
      className={s.banner}
    >
      <prim.Stack as="span" inline align="baseline" gap="sm" minWidth0>
        <prim.Text as="span" className={s.label}>
          {t("timer.mainPaused")}
        </prim.Text>
        <prim.Text as="span" truncate className={s.name}>
          {coName}
        </prim.Text>
      </prim.Stack>
      <prim.Stack as="span" inline align="center" gap="sm" noShrink>
        <prim.MonoText as="span" tabular className={s.time}>
          {fmtClock(seconds)}
        </prim.MonoText>
        <prim.Text as="span" className={s.returnHint}>
          {t("timer.returnShort")} ↩
        </prim.Text>
      </prim.Stack>
    </prim.Button>
  );
}
