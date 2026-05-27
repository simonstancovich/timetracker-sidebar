import { describe, it, expect } from 'vitest'
import {
  colors, pickColor, chartColors, alpha, vars,
  fontFamily, fontSize, fontWeight, lineHeight, letterSpacing,
  spacing, widths, sizes, radii, shadows, zIndex, opacity, duration, easing, transitions,
} from './index'

describe('colors — catalog shape', () => {
  it('exposes the four use-categories', () => {
    expect(colors).toHaveProperty('brand')
    expect(colors).toHaveProperty('typography')
    expect(colors).toHaveProperty('background')
    expect(colors).toHaveProperty('border')
    expect(colors).toHaveProperty('chart')
  })

  it('brand contains a light-mode accent at violet400 (hex color)', () => {
    // The "violet*" keys are slot names — they no longer always hold violet
    // while we iterate on the palette. What matters is the slot exists and
    // resolves to a hex color.
    expect(colors.brand.violet400).toMatch(/^#[0-9a-f]{6}$/i)
  })

  it('typography pink shades exist for both modes', () => {
    expect(colors.typography.pink400).toMatch(/^#/)
    expect(colors.typography.pink500).toMatch(/^#/)
  })

  it('chart palettes are 4-element arrays per mode', () => {
    expect(colors.chart.light).toHaveLength(4)
    expect(colors.chart.dark).toHaveLength(4)
  })
})

describe('pickColor — typography', () => {
  it('resolves "primary" to ink in light mode', () => {
    expect(pickColor('typography', 'primary', 'light')).toBe(colors.typography.ink)
  })

  it('resolves "primary" to gray100 in dark mode', () => {
    expect(pickColor('typography', 'primary', 'dark')).toBe(colors.typography.gray100)
  })

  it('resolves "pink" to pink500 in light mode and pink400 in dark mode', () => {
    expect(pickColor('typography', 'pink', 'light')).toBe(colors.typography.pink500)
    expect(pickColor('typography', 'pink', 'dark')).toBe(colors.typography.pink400)
  })

  it('resolves "onAccent" to white in both modes', () => {
    expect(pickColor('typography', 'onAccent', 'light')).toBe('#ffffff')
    expect(pickColor('typography', 'onAccent', 'dark')).toBe('#ffffff')
  })
})

describe('pickColor — background', () => {
  it('resolves "page" to the right surface per mode', () => {
    expect(pickColor('background', 'page', 'light')).toBe(colors.background.pageLight)
    expect(pickColor('background', 'page', 'dark')).toBe(colors.background.pageDark)
  })

  it('resolves "surface" (light=white card, dark=glass)', () => {
    expect(pickColor('background', 'surface', 'light')).toBe(colors.background.white)
    expect(pickColor('background', 'surface', 'dark')).toBe(colors.background.glassDark)
  })
})

describe('pickColor — border', () => {
  it('resolves soft + strong borders per mode', () => {
    expect(pickColor('border', 'soft', 'light')).toBe(colors.border.softLight)
    expect(pickColor('border', 'strong', 'dark')).toBe(colors.border.strongDark)
  })
})

describe('chartColors / alpha helpers', () => {
  it('chartColors returns the per-mode palette', () => {
    expect(chartColors('light')).toBe(colors.chart.light)
    expect(chartColors('dark')).toBe(colors.chart.dark)
  })

  it('alpha builds rgba strings', () => {
    expect(alpha('white', 0.5)).toBe('rgba(255,255,255,0.5)')
    expect(alpha('black', 0.25)).toBe('rgba(0,0,0,0.25)')
  })
})

describe('vars contract', () => {
  it('exposes the extended tokens added for the M→vars unification', () => {
    expect(vars.background.button).toMatch(/^var\(/)
    expect(vars.shadow.button).toMatch(/^var\(/)
    expect(vars.typography.goalInk).toMatch(/^var\(/)
    expect(vars.typography.danger).toMatch(/^var\(/)
  })
})

describe('typography', () => {
  it('exposes body and mono font stacks', () => {
    expect(fontFamily.body).toMatch(/sans-serif|system-ui/)
    expect(fontFamily.mono).toMatch(/monospace/)
  })

  it('font sizes are positive numbers (no px suffix)', () => {
    for (const v of Object.values(fontSize)) {
      expect(typeof v).toBe('number')
      expect(v).toBeGreaterThan(0)
    }
  })

  it('weight scale is monotonic', () => {
    expect(fontWeight.normal).toBeLessThan(fontWeight.medium)
    expect(fontWeight.medium).toBeLessThan(fontWeight.semibold)
    expect(fontWeight.semibold).toBeLessThan(fontWeight.bold)
    expect(fontWeight.bold).toBeLessThan(fontWeight.black)
  })

  it('line heights are unitless positive numbers', () => {
    for (const v of Object.values(lineHeight)) {
      expect(typeof v).toBe('number')
      expect(v).toBeGreaterThan(0)
    }
  })

  it('letter spacing scale is monotonic from tightest to loosest', () => {
    expect(letterSpacing.tightest).toBeLessThan(letterSpacing.normal)
    expect(letterSpacing.normal).toBeLessThan(letterSpacing.loosest)
  })
})

describe('spacing', () => {
  it('starts at 0 and grows monotonically through the t-shirt scale', () => {
    expect(spacing.none).toBe(0)
    expect(spacing.xs).toBeLessThan(spacing.sm)
    expect(spacing.sm).toBeLessThan(spacing.md)
    expect(spacing.md).toBeLessThan(spacing.lg)
    expect(spacing.lg).toBeLessThan(spacing.xl)
    expect(spacing.xl).toBeLessThan(spacing['2xl'])
  })
})

describe('widths', () => {
  it('numeric widths grow monotonically from narrow to lg', () => {
    expect(widths.narrow).toBeLessThan(widths.prose)
    expect(widths.prose).toBeLessThan(widths.md)
    expect(widths.md).toBeLessThan(widths.lg)
  })

  it('exposes a full token as "100%"', () => {
    expect(widths.full).toBe('100%')
  })

  it('prose is 280 (the readable-column default used by LoginScreen)', () => {
    expect(widths.prose).toBe(280)
  })
})

describe('sizes', () => {
  it('box dimensions grow monotonically from xs to 2xl', () => {
    expect(sizes.xs).toBeLessThan(sizes.sm)
    expect(sizes.sm).toBeLessThan(sizes.md)
    expect(sizes.md).toBeLessThan(sizes.lg)
    expect(sizes.lg).toBeLessThan(sizes.xl)
    expect(sizes.xl).toBeLessThan(sizes['2xl'])
  })
})

describe('radii', () => {
  it('xs through 2xl grow monotonically', () => {
    expect(radii.xs).toBeLessThan(radii.sm)
    expect(radii.sm).toBeLessThan(radii.md)
    expect(radii.md).toBeLessThan(radii.lg)
    expect(radii.lg).toBeLessThan(radii.xl)
    expect(radii.xl).toBeLessThan(radii['2xl'])
  })

  it('pill is the large sentinel value', () => {
    expect(radii.pill).toBeGreaterThan(radii['2xl'])
  })

  it('circle is the special-case 50% string', () => {
    expect(radii.circle).toBe('50%')
  })
})

describe('shadows', () => {
  it('exposes the brand and heavy variants', () => {
    expect(shadows.brand).toMatch(/rgba|#/)
    expect(shadows.heavy).toMatch(/rgba|#/)
  })

  it('none is literally "none"', () => {
    expect(shadows.none).toBe('none')
  })
})

describe('zIndex', () => {
  it('layer scale is monotonic from base to introTooltip', () => {
    expect(zIndex.base).toBeLessThan(zIndex.dropdown)
    expect(zIndex.dropdown).toBeLessThan(zIndex.modalBackdrop)
    expect(zIndex.modalBackdrop).toBeLessThan(zIndex.modal)
    expect(zIndex.modal).toBeLessThan(zIndex.introMask)
    expect(zIndex.introMask).toBeLessThan(zIndex.introHighlight)
    expect(zIndex.introHighlight).toBeLessThan(zIndex.introTooltip)
  })
})

describe('opacity', () => {
  it('full < disabled-less-than-1, hidden is 0', () => {
    expect(opacity.full).toBe(1)
    expect(opacity.disabled).toBeGreaterThan(0)
    expect(opacity.disabled).toBeLessThan(1)
    expect(opacity.hidden).toBe(0)
  })
})

describe('transitions', () => {
  it('duration scale is monotonic', () => {
    expect(duration.instant).toBeLessThan(duration.quick)
    expect(duration.quick).toBeLessThan(duration.fast)
    expect(duration.fast).toBeLessThan(duration.base)
    expect(duration.base).toBeLessThan(duration.medium)
    expect(duration.medium).toBeLessThan(duration.slow)
  })

  it('interactive transition references the quick duration', () => {
    expect(transitions.interactive).toContain(`${duration.quick}ms`)
    expect(transitions.interactive).toContain('background')
    expect(transitions.interactive).toContain('box-shadow')
  })

  it('exposes named easings', () => {
    expect(easing.standard).toBe('ease')
    expect(easing.bounce).toMatch(/cubic-bezier/)
  })

  it('pre-composed transition strings interpolate the duration tokens', () => {
    expect(transitions.colorBg).toContain(`${duration.fast}ms`)
    expect(transitions.maxHeight).toContain(`${duration.base}ms`)
  })
})
