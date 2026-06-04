import type { ReactNode } from "react";
import { cx } from "../lib/cx";
import * as prim from "../primitives";
import { livePulseAnim } from "../styles/celebration.css";
import * as s from "./EntryBadge.css";

export type EntryBadgeTone = keyof typeof s.tone;

interface Props {
  tone: EntryBadgeTone;
  pulse?: boolean;
  title?: string;
  children: ReactNode;
}

export function EntryBadge({ tone, pulse = false, title, children }: Props) {
  return (
    <prim.Text
      as="span"
      title={title}
      className={cx(s.base, s.tone[tone], pulse && livePulseAnim)}
    >
      {children}
    </prim.Text>
  );
}
