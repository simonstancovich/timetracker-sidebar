import { style, styleVariants } from "@vanilla-extract/css";
import { spacing } from "../../theme";

export const root = style({ display: "flex" });

export const direction = styleVariants({
  row: { flexDirection: "row" },
  column: { flexDirection: "column" },
});

export const align = styleVariants({
  start: { alignItems: "flex-start" },
  center: { alignItems: "center" },
  end: { alignItems: "flex-end" },
  stretch: { alignItems: "stretch" },
});

export const justify = styleVariants({
  start: { justifyContent: "flex-start" },
  center: { justifyContent: "center" },
  end: { justifyContent: "flex-end" },
  spaceBetween: { justifyContent: "space-between" },
});

export const gap = styleVariants(spacing, (v) => ({ gap: v }));
export const padding = styleVariants(spacing, (v) => ({ padding: v }));

export const fullHeight = style({ minHeight: "100vh" });
