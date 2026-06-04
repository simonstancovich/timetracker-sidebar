import { style } from "@vanilla-extract/css";

export const wrap = style({
  selectors: {
    "&&": { alignItems: "center", gap: 8 },
  },
});

export const row = style({
  selectors: {
    "&&": {
      display: "flex",
      flexDirection: "row",
      gap: 8,
      justifyContent: "center",
      flexWrap: "wrap",
    },
  },
});
