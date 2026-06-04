import { useTranslation } from "../lib/i18n";
import { cx } from "../lib/cx";
import * as prim from "../primitives";
import * as s from "./InvoiceableToggle.css";

interface Props {
  value: boolean;
  onToggle: () => void;
}

export function InvoiceableToggle({ value, onToggle }: Props) {
  const { t } = useTranslation();
  return (
    <prim.Button
      variant="link"
      data-tour="timer-invoiceable"
      role="switch"
      aria-checked={value}
      aria-label={t("timer.invoiceable")}
      onClick={onToggle}
      className={s.button}
    >
      <prim.Text as="span" className={s.label}>
        {t("timer.invoiceable")}
      </prim.Text>
      <prim.Stack
        as="span"
        inline
        direction="row"
        align="center"
        className={cx(s.trackBase, value ? s.trackOn : s.trackOff)}
      >
        <prim.Stack
          as="span"
          inline
          className={cx(s.thumbBase, value ? s.thumbOn : s.thumbOff)}
        >
          {null}
        </prim.Stack>
      </prim.Stack>
    </prim.Button>
  );
}
