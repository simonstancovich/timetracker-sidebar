import { style, styleVariants } from "@vanilla-extract/css";
import { spacing, radii, vars } from "../../theme";

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
  baseline: { alignItems: "baseline" },
});

export const justify = styleVariants({
  start: { justifyContent: "flex-start" },
  center: { justifyContent: "center" },
  end: { justifyContent: "flex-end" },
  spaceBetween: { justifyContent: "space-between" },
});

export const gap = styleVariants(spacing, (v) => ({ gap: v }));

export const padding = styleVariants(spacing, (v) => ({ padding: v }));
export const paddingX = styleVariants(spacing, (v) => ({
  paddingLeft: v,
  paddingRight: v,
}));
export const paddingY = styleVariants(spacing, (v) => ({
  paddingTop: v,
  paddingBottom: v,
}));
export const paddingTop = styleVariants(spacing, (v) => ({ paddingTop: v }));
export const paddingRight = styleVariants(spacing, (v) => ({
  paddingRight: v,
}));
export const paddingBottom = styleVariants(spacing, (v) => ({
  paddingBottom: v,
}));
export const paddingLeft = styleVariants(spacing, (v) => ({ paddingLeft: v }));

export const background = styleVariants({
  page: { background: vars.background.page },
  surface: { background: vars.background.surface },
  raised: { background: vars.background.raised },
  green: { background: vars.background.green },
  pink: { background: vars.background.pink },
  accent: { background: vars.background.accent },
  warning: { background: vars.background.warning },
});

export const border = styleVariants({
  top: { borderTop: `1px solid ${vars.border.soft}` },
  right: { borderRight: `1px solid ${vars.border.soft}` },
  bottom: { borderBottom: `1px solid ${vars.border.soft}` },
  left: { borderLeft: `1px solid ${vars.border.soft}` },
  all: { border: `1px solid ${vars.border.soft}` },
});

export const borderColor = styleVariants({
  soft: { borderColor: vars.border.soft },
  strong: { borderColor: vars.border.strong },
  accent: { borderColor: vars.border.accent },
  green: { borderColor: vars.border.green },
  pink: { borderColor: vars.border.pink },
  warning: { borderColor: vars.border.warning },
});

export const borderStyle = styleVariants({
  solid: { borderStyle: "solid" },
  dashed: { borderStyle: "dashed" },
});

export const borderRadius = styleVariants(radii, (v) => ({ borderRadius: v }));

export const position = styleVariants({
  relative: { position: "relative" },
  absolute: { position: "absolute" },
  fixed: { position: "fixed" },
});

export const top = styleVariants(spacing, (v) => ({ top: v }));
export const right = styleVariants(spacing, (v) => ({ right: v }));
export const bottom = styleVariants(spacing, (v) => ({ bottom: v }));
export const left = styleVariants(spacing, (v) => ({ left: v }));

export const fullWidth = style({ width: "100%" });
export const fullHeight = style({ minHeight: "100vh" });

export const noShrink = style({ flexShrink: 0 });

export const wrap = style({ flexWrap: "wrap" });

export const minWidth0 = style({ minWidth: 0 });

export const rowGap = styleVariants(spacing, (v) => ({ rowGap: v }));
export const columnGap = styleVariants(spacing, (v) => ({ columnGap: v }));
