import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { chart } from "../../theme";

interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, "style" | "children"> {
  colorIndex: number;
  children: ReactNode;
}

export const ChartLabel = forwardRef<HTMLSpanElement, Props>(function ChartLabel(
  { colorIndex, children, ...rest },
  ref,
) {
  return (
    <span ref={ref} {...rest} style={{ color: chart[colorIndex % chart.length] }}>
      {children}
    </span>
  );
});
