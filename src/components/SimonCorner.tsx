import * as prim from "../primitives";
import * as s from "./SimonCorner.css";

interface Props {
  active: boolean;
  onTap: () => void;
}

export function SimonCorner({ active, onTap }: Props) {
  return (
    <prim.Stack
      onClick={onTap}
      aria-hidden
      position="absolute"
      className={s.corner}
    >
      {active && (
        <prim.Stack as="span" inline className={s.dot}>{null}</prim.Stack>
      )}
    </prim.Stack>
  );
}
