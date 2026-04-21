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
  const wrapperClass = [s.wrapper[layout], className].filter(Boolean).join(" ");
  const discClass = [s.disc, s.size[size]].join(" ");
  return (
    <div className={wrapperClass} role="status" aria-live="polite">
      <div className={discClass} aria-hidden />
      {label && <div className={s.label}>{label}</div>}
    </div>
  );
}
