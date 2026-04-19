import { style, styleVariants } from '@vanilla-extract/css'
import { spacing } from '../../theme'

export const root = style({ display: 'flex' })

export const direction = styleVariants({
  row:    { flexDirection: 'row' },
  column: { flexDirection: 'column' },
})

export const align = styleVariants({
  start:   { alignItems: 'flex-start' },
  center:  { alignItems: 'center' },
  end:     { alignItems: 'flex-end' },
  stretch: { alignItems: 'stretch' },
})

export const justify = styleVariants({
  start:        { justifyContent: 'flex-start' },
  center:       { justifyContent: 'center' },
  end:          { justifyContent: 'flex-end' },
  spaceBetween: { justifyContent: 'space-between' },
})

const gapMap = {
  none: 0, xs: spacing.xs, sm: spacing.sm, md: spacing.md,
  lg: spacing.lg, xl: spacing.xl, '2xl': spacing['2xl'],
}

export const gap = styleVariants(gapMap, (v) => ({ gap: v }))
export const padding = styleVariants(gapMap, (v) => ({ padding: v }))

export const fullHeight = style({ minHeight: '100vh' })
