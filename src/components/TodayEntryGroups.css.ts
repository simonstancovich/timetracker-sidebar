import { style } from "@vanilla-extract/css";
import { vars } from "../theme";

export const wrap = style({
  selectors: { "&&": { gap: 11 } },
});

export const group = style({});

export const groupHeader = style({
  marginBottom: 6,
  selectors: {
    "&&": {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
  },
});

export const groupName = style({
  fontFamily: vars.font.display,
  fontSize: 17,
  lineHeight: 1.1,
  letterSpacing: -0.1,
});

export const groupHours = style({
  fontSize: 11,
  fontWeight: 700,
  fontFamily: vars.font.mono,
  selectors: { "&&": { color: vars.typography.tertiary } },
});

export const entryList = style({
  selectors: { "&&": { gap: 5 } },
});

export const skeletonStack = style({
  padding: "4px 0",
  selectors: { "&&": { gap: 8 } },
});

export const emptyWrap = style({
  textAlign: "center",
  padding: "28px 12px",
  fontSize: 13,
  lineHeight: 1.5,
});

export const emptyHeading = style({
  color: vars.typography.secondary,
  fontWeight: 600,
  marginBottom: 4,
});

export const emptySubtitle = style({
  color: vars.typography.faint,
  fontSize: 11,
});

export const skeletonHeading = style({
  selectors: { "&&": { height: 18, width: "40%" } },
});
export const skeletonCard = style({
  selectors: { "&&": { height: 52 } },
});
