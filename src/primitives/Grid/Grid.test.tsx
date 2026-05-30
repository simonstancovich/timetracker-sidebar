import { createRef } from 'react'
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Grid } from './Grid'
import * as s from './Grid.css'

describe('<Grid />', () => {
  it('applies the column-count and gap variant classes', () => {
    const { container } = render(
      <Grid columns={7} gap="xs">
        <span>x</span>
      </Grid>,
    )
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain(s.root)
    expect(el.className).toContain(s.columns[7])
    expect(el.className).toContain(s.gap.xs)
  })

  it('defaults gap to none and merges a consumer className', () => {
    const { container } = render(
      <Grid columns={3} className="extra">
        x
      </Grid>,
    )
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain(s.columns[3])
    expect(el.className).toContain(s.gap.none)
    expect(el.className).toContain('extra')
  })

  it.each([2, 3, 4, 5, 6, 7] as const)('supports columns=%i', (n) => {
    const { container } = render(<Grid columns={n}>x</Grid>)
    expect((container.firstChild as HTMLElement).className).toContain(s.columns[n])
  })

  it('applies paddingX and paddingY when provided', () => {
    const { container } = render(
      <Grid columns={2} paddingX="md" paddingY="sm">
        x
      </Grid>,
    )
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain(s.paddingX.md)
    expect(el.className).toContain(s.paddingY.sm)
  })

  it('applies an align variant when provided', () => {
    const { container } = render(
      <Grid columns={3} align="center">
        x
      </Grid>,
    )
    expect((container.firstChild as HTMLElement).className).toContain(s.align.center)
  })

  it('applies borderY when true and omits it when false', () => {
    const { container, rerender } = render(
      <Grid columns={3} borderY>
        x
      </Grid>,
    )
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain(s.borderY)

    rerender(<Grid columns={3}>x</Grid>)
    expect((container.firstChild as HTMLElement).className).not.toContain(s.borderY)
  })

  it('forwards id, aria-* and data-* attributes', () => {
    const { container } = render(
      <Grid columns={2} id="g" aria-label="Stats" data-testid="grid">
        x
      </Grid>,
    )
    const el = container.firstChild as HTMLElement
    expect(el.id).toBe('g')
    expect(el.getAttribute('aria-label')).toBe('Stats')
    expect(el.getAttribute('data-testid')).toBe('grid')
  })

  it('forwards ref to the underlying element', () => {
    const ref = createRef<HTMLDivElement>()
    const { container } = render(
      <Grid columns={2} ref={ref}>
        x
      </Grid>,
    )
    expect(ref.current).toBe(container.firstChild)
  })
})
