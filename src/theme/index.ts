// Public theme API. Components should import from `'../theme'` — never reach
// into the per-category files directly. The categories exist to keep each
// concern small enough to scan; the import surface is one place.

// Color tokens. Prefer `colors` (the catalog) + `pickColor` (the resolver) in
// new code; the cryptic `light`/`dark` records remain for back-compat with
// existing inline styles.
export {
  colors, pickColor, chartColors, alpha,
  light, dark, themes,
  type Theme, type Mode,
} from './colors'

// Other token categories.
export { fontFamily, fontSize, fontWeight, lineHeight, letterSpacing } from './typography'
export { spacing } from './spacing'
export { widths } from './widths'
export { sizes } from './sizes'
export { radii } from './radii'
export { shadows } from './shadows'
export { zIndex } from './zIndex'
export { opacity } from './opacity'
export { duration, easing, transitions } from './transitions'

// Vanilla-extract theme contract + concrete theme class names. Components
// written as `.css.ts` files consume `vars` to reference CSS custom
// properties that swap correctly between lightTheme and darkTheme.
export { vars, lightTheme, darkTheme } from './theme.css'
