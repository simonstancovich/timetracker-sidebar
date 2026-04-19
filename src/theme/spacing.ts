// Spacing tokens — padding, margin, gap. Numeric (no `px` suffix) so they
// drop straight into React inline styles. Reflects the values already in use
// in the renderer; new code should reference these names rather than literals.
//
// Scale roughly follows a 2/4/8/12/16/24/32 progression with extras for the
// in-between values the layout uses ad-hoc.

export const spacing = {
  none:  0,
  '0.5': 2,
  '1':   4,
  '1.5': 6,
  '2':   8,
  '2.5': 10,
  '3':   12,
  '3.5': 14,
  '4':   16,
  '5':   18,
  '6':   22,
  '7':   24,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
} as const
