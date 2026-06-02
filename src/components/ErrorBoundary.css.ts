import { style } from "@vanilla-extract/css";

// All values here are hardcoded literals (no theme vars) because the thing
// that crashed might be the theme system. The fallback has to render no
// matter what's broken upstream.

export const root = style({
  height: "100vh",
  gap: 14,
  textAlign: "center",
  padding: 24,
  background: "#0b0910",
  color: "#faf8ff",
  fontFamily: "-apple-system,'Segoe UI Variable','Segoe UI',system-ui,sans-serif",
});

export const icon = style({
  fontSize: 30,
});

export const title = style({
  fontFamily: '"Instrument Serif","Georgia",serif',
  fontStyle: "italic",
  fontSize: 22,
  lineHeight: 1.2,
});

export const body = style({
  display: "block",
  fontSize: 13,
  color: "#d0c9e8",
  maxWidth: 300,
  lineHeight: 1.5,
});

export const actionRow = style({
  marginTop: 4,
  gap: 10,
});

export const primaryBtn = style({
  padding: "10px 20px",
  borderRadius: 999,
  background: "#c96442",
  color: "#fff",
  border: "none",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
});

export const ghostBtn = style({
  padding: "10px 20px",
  borderRadius: 999,
  background: "transparent",
  color: "#d0c9e8",
  border: "1px solid rgba(166,146,214,0.3)",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
});
