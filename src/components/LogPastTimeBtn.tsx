import { useTranslation } from "../lib/i18n";
import * as prim from "../primitives";
import { PlusIcon } from "../icons/PlusIcon";
import * as s from "./LogPastTimeBtn.css";

interface Props {
  onClick: () => void;
}

export function LogPastTimeBtn({ onClick }: Props) {
  const { t } = useTranslation();
  return (
    <prim.Stack direction="row" className={s.wrap}>
      <prim.Button
        variant="link"
        onClick={onClick}
        aria-label={t("timer.logPastTime")}
        className={s.button}
      >
        <PlusIcon size={13} />
        {t("today.logTime")}
      </prim.Button>
    </prim.Stack>
  );
}
