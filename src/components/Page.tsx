import type { ReactNode } from "react";
import * as prim from "../primitives";
import * as s from "./Page.css";

interface Props {
  title: string;
  hint?: string;
  gap?: prim.StackGap;
  fullHeight?: boolean;
  children: ReactNode;
}

export function Page({ title, hint, gap = "lg", fullHeight = false, children }: Props) {
  return (
    <prim.Stack gap={gap} flex1={fullHeight} className={s.root}>
      <prim.Stack className={s.eyebrowBleed}>
        <prim.PageEyebrow title={title} hint={hint} />
      </prim.Stack>
      {children}
    </prim.Stack>
  );
}
