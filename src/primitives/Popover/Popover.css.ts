import { style } from "@vanilla-extract/css";
import { vars, spacing, radii, shadows, zIndex } from "../../theme";

// Anchored below the nearest `position: relative` ancestor, stretched to match
// its width with a small gap. The dual-layer background (solid page color +
// translucent surface overlay) is intentional: in dark mode `surface` is
// translucent, letting `backdrop-filter` produce the frosted-glass look; in
// light mode `surface` is opaque white and the layer reads as a flat surface.
export const root = style({
  position: "absolute",
  top: `calc(100% + ${spacing.xs}px)`,
  left: 0,
  right: 0,
  background: vars.background.page,
  backgroundImage: `linear-gradient(${vars.background.surface}, ${vars.background.surface})`,
  backdropFilter: "blur(20px) saturate(140%)",
  WebkitBackdropFilter: "blur(20px) saturate(140%)",
  border: `1px solid ${vars.border.strong}`,
  borderRadius: radii.md,
  boxShadow: shadows.card,
  // Cap height + scroll keep long option lists from overflowing the viewport.
  // Bespoke pixel value — promote to a t-shirt enum the moment a second
  // call site needs a different size.
  maxHeight: 220,
  overflowY: "auto",
  zIndex: zIndex.dropdown,
});
