import type { CSSProperties, ReactNode } from "react";
import * as prim from "../primitives";

interface Props {
  title: string;
  hint?: string;
  gap?: number;
  minHeight?: CSSProperties["minHeight"];
  children: ReactNode;
}

// Standard scrolling view: the eyebrow header bleeds to the page edges (its
// negative margin cancels this exact padding), with the content stacked below.
export function Page({ title, hint, gap = 16, minHeight, children }: Props) {
  return (
    <div
      style={{
        padding: "16px 14px 24px",
        display: "flex",
        flexDirection: "column",
        gap,
        minHeight,
      }}
    >
      <div style={{ margin: "-16px -14px 0" }}>
        <prim.PageEyebrow title={title} hint={hint} />
      </div>
      {children}
    </div>
  );
}
