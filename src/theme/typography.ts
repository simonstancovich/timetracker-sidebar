// Typography tokens — font families, sizes, weights, line heights, letter
// spacing. Theme-agnostic (text *colors* live in `colors.ts`).
//
// Sizes follow a t-shirt scale; the px values reflect what the renderer
// already uses in inline styles. New code should reference these names
// instead of literals so scaling the type system is a one-file change.

export const fontFamily = {
  body: "-apple-system,'Segoe UI Variable','Segoe UI',system-ui,sans-serif",
  mono: "'SF Mono','Cascadia Code',monospace",
} as const

// Sizes are numeric (no `px` suffix) so they drop straight into React inline
// styles without string concatenation.
export const fontSize = {
  '2xs': 9,
  xs:    10,
  sm:    11,
  base:  12,
  md:    13,
  lg:    14,
  xl:    15,
  '2xl': 17,
  '3xl': 18,
  '4xl': 22,
  display: 28,
  timer: 44,        // paused timer clock
  timerRunning: 50, // running timer clock
} as const

export const fontWeight = {
  normal:   400,
  medium:   500,
  semibold: 600,
  bold:     700,
  black:    800,
} as const

export const lineHeight = {
  none:    1,
  tight:   1.1,
  snug:    1.25,
  normal:  1.3,
  relaxed: 1.4,
  loose:   1.5,
} as const

export const letterSpacing = {
  tightest: -0.5,
  tighter:  -0.4,
  tight:    -0.3,
  normal:    0,
  wide:      0.3,
  wider:     0.5,
  widest:    0.8,
  loose:     1,
  looser:    1.2,
  loosest:   1.5,
  display:   3,    // big timer clock
} as const
