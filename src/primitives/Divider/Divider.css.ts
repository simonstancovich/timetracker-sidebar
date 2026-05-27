import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "../../theme";

export const root = style({ height: 1 });

export const tone = styleVariants({
  soft: { background: vars.border.soft },
  raised: { background: vars.background.raised },
});

// Fill the available width inside a flex row.
export const grow = style({ flex: 1 });
