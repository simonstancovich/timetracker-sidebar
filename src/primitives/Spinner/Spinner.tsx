import { cx } from "../../lib/cx";
import * as s from "./Spinner.css";

export type SpinnerSize = keyof typeof s.size;
export type SpinnerLayout = keyof typeof s.wrapper;

interface Props {
  size?: SpinnerSize;
  label?: string;
  layout?: SpinnerLayout;
  className?: string;
}

export function Spinner({
  size = "md",
  label,
  layout = "inline",
  className,
}: Props) {
  const wrapperClass = cx(s.wrapper[layout], className);
  const discClass = cx(s.disc, s.size[size]);
  return (
    <div className={wrapperClass} role="status" aria-live="polite">
      <div className={discClass} aria-hidden />
      {label && <div className={s.label}>{label}</div>}
    </div>
  );
}
