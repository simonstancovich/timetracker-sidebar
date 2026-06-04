import { useTranslation } from "../lib/i18n";
import { cx } from "../lib/cx";
import * as prim from "../primitives";
import { CheckIcon } from "../icons/CheckIcon";
import * as s from "./TodoCheckbox.css";

interface Props {
  done: boolean;
  onToggle: () => void;
}

export function TodoCheckbox({ done, onToggle }: Props) {
  const { t } = useTranslation();
  return (
    <prim.Button
      variant="link"
      onClick={onToggle}
      aria-label={done ? t("todo.markUndone") : t("todo.markDone")}
      className={cx(s.box, done && s.boxDone)}
    >
      {done && <CheckIcon size={11} strokeWidth={2.5} />}
    </prim.Button>
  );
}
