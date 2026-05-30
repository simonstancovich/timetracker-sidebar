import { style, styleVariants } from "@vanilla-extract/css";
import { spacing, vars } from "../../theme";

export const root = style({ display: "grid" });

export const columns = styleVariants({
  2: { gridTemplateColumns: "repeat(2, 1fr)" },
  3: { gridTemplateColumns: "repeat(3, 1fr)" },
  4: { gridTemplateColumns: "repeat(4, 1fr)" },
  5: { gridTemplateColumns: "repeat(5, 1fr)" },
  6: { gridTemplateColumns: "repeat(6, 1fr)" },
  7: { gridTemplateColumns: "repeat(7, 1fr)" },
});

export const gap = styleVariants(spacing, (v) => ({ gap: v }));

export const paddingX = styleVariants(spacing, (v) => ({
  paddingLeft: v,
  paddingRight: v,
}));
export const paddingY = styleVariants(spacing, (v) => ({
  paddingTop: v,
  paddingBottom: v,
}));

export const align = styleVariants({
  left: { textAlign: "left" },
  center: { textAlign: "center" },
  right: { textAlign: "right" },
});

export const borderY = style({
  borderTop: `1px solid ${vars.border.strong}`,
  borderBottom: `1px solid ${vars.border.strong}`,
});
