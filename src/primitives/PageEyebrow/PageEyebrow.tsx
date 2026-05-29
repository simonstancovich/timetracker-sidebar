import type { HTMLAttributes } from "react";
import { cx } from "../../lib/cx";
import * as s from "./PageEyebrow.css";

interface Props extends Omit<HTMLAttributes<HTMLElement>, "style" | "children"> {
  title: string;
  hint?: string;
}

export function PageEyebrow({ title, hint, className, ...rest }: Props) {
  return (
    <header {...rest} className={cx(s.root, className)}>
      <span className={s.title}>{title}</span>
      {hint && <span className={s.hint}>{hint}</span>}
      <span aria-hidden className={s.divider} />
    </header>
  );
}
