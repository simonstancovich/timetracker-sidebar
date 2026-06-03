import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../lib/cx";
import { vars, radii, zIndex } from "../theme";
import { fadeUp } from "../styles/intro.css";

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "style"> {
  top: number;
  left: number;
  maxWidth: number;
  children: ReactNode;
}

// The floating coachmark card. Position is runtime geometry (stays inline);
// the surface is themed via `vars` so it tracks light/dark without a prop.
export const TourTooltip = forwardRef<HTMLDivElement, Props>(function TourTooltip(
  { top, left, maxWidth, className, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cx(fadeUp, className)}
      style={{
        position: "fixed",
        top,
        left,
        maxWidth,
        background: vars.background.surface,
        border: `1px solid ${vars.border.soft}`,
        borderRadius: radii.xl,
        padding: "13px 15px 12px",
        boxShadow: "0 14px 40px rgba(0, 0, 0, 0.4)",
        zIndex: zIndex.introTooltip,
        color: vars.typography.primary,
      }}
      {...rest}
    >
      {children}
    </div>
  );
});
