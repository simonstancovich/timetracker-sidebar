import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Stack } from './Stack'
import * as s from './Stack.css'

describe('<Stack />', () => {
  it('renders children inside a div', () => {
    const { getByText } = render(<Stack><span>hi</span></Stack>)
    expect(getByText('hi')).toBeInTheDocument()
  })

  it('applies direction, align, justify, gap and padding classes', () => {
    const { container } = render(
      <Stack direction="row" align="center" justify="spaceBetween" gap="lg" padding="xl">
        <span />
      </Stack>,
    )
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain(s.direction.row)
    expect(el.className).toContain(s.align.center)
    expect(el.className).toContain(s.justify.spaceBetween)
    expect(el.className).toContain(s.gap.lg)
    expect(el.className).toContain(s.padding.xl)
  })

  it('applies the fullHeight class only when prop is true', () => {
    const { container, rerender } = render(<Stack><span /></Stack>)
    expect((container.firstChild as HTMLElement).className).not.toContain(s.fullHeight)
    rerender(<Stack fullHeight><span /></Stack>)
    expect((container.firstChild as HTMLElement).className).toContain(s.fullHeight)
  })

  it('passes through className', () => {
    const { container } = render(<Stack className="custom"><span /></Stack>)
    expect((container.firstChild as HTMLElement).className).toContain('custom')
  })
})
