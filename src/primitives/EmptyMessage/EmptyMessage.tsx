import type { ReactNode } from "react";
import { cx } from "../../lib/cx";
import * as s from "./EmptyMessage.css";

export function EmptyMessage({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cx(s.root, className)}>{children}</div>;
}
