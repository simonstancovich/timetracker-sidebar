// Vanilla-extract theme contract + light/dark class instances.
//
// This file compiles to CSS at build time. Components consume the exported
// `vars` object inside `.css.ts` files — each var lookup becomes a CSS
// custom property reference. Switching between `lightTheme` and `darkTheme`
// is a class swap on a wrapper element; no JS re-render needed.
//
// Values are populated from our existing `colors.ts` catalog via `pickColor`,
// so there's one source of truth for what "pink in light mode" means.

import { createThemeContract, createTheme } from '@vanilla-extract/css'
import { pickColor, chartColors } from './colors'
import { fontFamily, fontSize, fontWeight, lineHeight } from './typography'
import { spacing } from './spacing'
import { radii } from './radii'
import { shadows } from './shadows'

// ─── Contract ──────────────────────────────────────────────────────────────
// Defines the *shape* of the theme. `null` values are placeholders that each
// concrete theme instance fills in. Think of this as the TypeScript interface
// for themes, lifted into CSS-custom-property land.

export const vars = createThemeContract({
  typography: {
    primary:      null,
    secondary:    null,
    tertiary:     null,
    faint:        null,
    accent:       null,
    accentStrong: null,
    pink:         null,
    pinkVivid:    null,
    green:        null,
    onAccent:     null,
  },
  background: {
    page:        null,
    surface:     null,
    raised:      null,
    glass:       null,
    accent:      null,
    accentMuted: null,
    pink:        null,
    pinkPaper:   null,
    green:       null,
  },
  border: {
    soft:   null,
    strong: null,
    green:  null,
  },
  chart: {
    '0': null,
    '1': null,
    '2': null,
    '3': null,
  },
  shadow: {
    brand: null,
    heavy: null,
  },
  font: {
    body: null,
    mono: null,
  },
  // Numeric tokens (sizes, radii, spacing) don't need a contract because
  // they don't vary per theme. Components import them directly from the
  // per-category files. Keeping the contract focused on per-theme values.
})

// ─── Concrete theme instances ──────────────────────────────────────────────
// Each `createTheme` call returns a CSS class name. Apply one to a wrapper
// element; everything inside reads the matching custom-property values.

const chartL = chartColors('light')
const chartD = chartColors('dark')

export const lightTheme = createTheme(vars, {
  typography: {
    primary:      pickColor('typography', 'primary',      'light'),
    secondary:    pickColor('typography', 'secondary',    'light'),
    tertiary:     pickColor('typography', 'tertiary',     'light'),
    faint:        pickColor('typography', 'faint',        'light'),
    accent:       pickColor('typography', 'accent',       'light'),
    accentStrong: pickColor('typography', 'accentStrong', 'light'),
    pink:         pickColor('typography', 'pink',         'light'),
    pinkVivid:    pickColor('typography', 'pinkVivid',    'light'),
    green:        pickColor('typography', 'green',        'light'),
    onAccent:     pickColor('typography', 'onAccent',     'light'),
  },
  background: {
    page:        pickColor('background', 'page',        'light'),
    surface:     pickColor('background', 'surface',     'light'),
    raised:      pickColor('background', 'raised',      'light'),
    glass:       pickColor('background', 'glass',       'light'),
    accent:      pickColor('background', 'accent',      'light'),
    accentMuted: pickColor('background', 'accentMuted', 'light'),
    pink:        pickColor('background', 'pink',        'light'),
    pinkPaper:   pickColor('background', 'pinkPaper',   'light'),
    green:       pickColor('background', 'green',       'light'),
  },
  border: {
    soft:   pickColor('border', 'soft',   'light'),
    strong: pickColor('border', 'strong', 'light'),
    green:  pickColor('border', 'green',  'light'),
  },
  chart: { '0': chartL[0], '1': chartL[1], '2': chartL[2], '3': chartL[3] },
  shadow: { brand: shadows.brand, heavy: shadows.heavy },
  font:   { body: fontFamily.body, mono: fontFamily.mono },
})

export const darkTheme = createTheme(vars, {
  typography: {
    primary:      pickColor('typography', 'primary',      'dark'),
    secondary:    pickColor('typography', 'secondary',    'dark'),
    tertiary:     pickColor('typography', 'tertiary',     'dark'),
    faint:        pickColor('typography', 'faint',        'dark'),
    accent:       pickColor('typography', 'accent',       'dark'),
    accentStrong: pickColor('typography', 'accentStrong', 'dark'),
    pink:         pickColor('typography', 'pink',         'dark'),
    pinkVivid:    pickColor('typography', 'pinkVivid',    'dark'),
    green:        pickColor('typography', 'green',        'dark'),
    onAccent:     pickColor('typography', 'onAccent',     'dark'),
  },
  background: {
    page:        pickColor('background', 'page',        'dark'),
    surface:     pickColor('background', 'surface',     'dark'),
    raised:      pickColor('background', 'raised',      'dark'),
    glass:       pickColor('background', 'glass',       'dark'),
    accent:      pickColor('background', 'accent',      'dark'),
    accentMuted: pickColor('background', 'accentMuted', 'dark'),
    pink:        pickColor('background', 'pink',        'dark'),
    pinkPaper:   pickColor('background', 'pinkPaper',   'dark'),
    green:       pickColor('background', 'green',       'dark'),
  },
  border: {
    soft:   pickColor('border', 'soft',   'dark'),
    strong: pickColor('border', 'strong', 'dark'),
    green:  pickColor('border', 'green',  'dark'),
  },
  chart: { '0': chartD[0], '1': chartD[1], '2': chartD[2], '3': chartD[3] },
  shadow: { brand: shadows.brand, heavy: shadows.heavy },
  font:   { body: fontFamily.body, mono: fontFamily.mono },
})

// Re-export the numeric scales so `.css.ts` files have one import to reach.
export { fontSize, fontWeight, lineHeight, spacing, radii, shadows }
