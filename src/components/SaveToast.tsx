import * as prim from "../primitives";
import { SuccessCheckIcon } from "../icons/SuccessCheckIcon";
import * as s from "./SaveToast.css";

interface SaveToastData {
  cheer: string;
  hours: string;
  xp: number;
}

interface Props {
  toast: SaveToastData | null;
}

export function SaveToast({ toast }: Props) {
  if (!toast) return null;
  return (
    <prim.Stack role="status" aria-live="polite" className={s.backdrop}>
      <prim.Stack align="center" className={s.card}>
        <SuccessCheckIcon ringClassName={s.ring} checkClassName={s.check} />
        <prim.Stack align="center">
          <prim.Text size="xl" weight="black" tracking="tight">
            {toast.cheer}
          </prim.Text>
          <prim.MonoText size="sm" weight="normal" color="tertiary" tracking="wide">
            +{toast.hours}  ·  +{toast.xp} XP
          </prim.MonoText>
        </prim.Stack>
      </prim.Stack>
    </prim.Stack>
  );
}
