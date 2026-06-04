import type { MouseEvent } from "react";
import { cx } from "../lib/cx";
import * as prim from "../primitives";
import { PauseIcon } from "../icons/PauseIcon";
import { PlayIcon } from "../icons/PlayIcon";
import * as s from "./EntryActionButton.css";

interface Props {
  active: boolean;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
  title: string;
}

export function EntryActionButton({ active, onClick, title }: Props) {
  return (
    <prim.Button
      variant="link"
      onClick={onClick}
      title={title}
      className={cx(s.button, s.tone[active ? "pause" : "resume"])}
    >
      {active ? <PauseIcon size={10} /> : <PlayIcon size={10} />}
    </prim.Button>
  );
}
