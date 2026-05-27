import * as s from "./PageEyebrow.css";

// Section header band: italic-serif title, optional mono hint, hairline divider.
export function PageEyebrow({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className={s.root}>
      <span className={s.title}>{title}</span>
      {hint && <span className={s.hint}>{hint}</span>}
      <span aria-hidden className={s.divider} />
    </div>
  );
}
