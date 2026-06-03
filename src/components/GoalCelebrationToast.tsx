import { useTranslation } from "../lib/i18n";
import { cx } from "../lib/cx";
import * as prim from "../primitives";
import { CheckIcon } from "../icons/CheckIcon";
import * as s from "./GoalCelebrationToast.css";

interface Celebration {
  title: string;
  sub: string;
}

interface Props {
  celebration: Celebration | null;
  liftedForAch: boolean;
}

export function GoalCelebrationToast({ celebration, liftedForAch }: Props) {
  const { t } = useTranslation();
  if (!celebration) return null;
  return (
    <prim.Stack
      role="status"
      aria-live="polite"
      direction="row"
      align="center"
      className={cx(s.toast, liftedForAch ? s.toastOffset.lifted : s.toastOffset.default)}
    >
      <prim.IconTile size="md" className={s.iconTile}>
        <CheckIcon size={24} />
      </prim.IconTile>
      <prim.Stack gap="xs" minWidth0>
        <prim.MonoText
          size="2xs"
          color="green"
          tracking="loosest"
          transform="uppercase"
        >
          {t("goal.eyebrow")}
        </prim.MonoText>
        <prim.Text size="xl" weight="black" tracking="tight">
          {celebration.title}
        </prim.Text>
        <prim.Text size="sm" color="tertiary">
          {celebration.sub}
        </prim.Text>
      </prim.Stack>
    </prim.Stack>
  );
}
