import { createRef } from 'react'
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

  it('applies per-axis and per-side padding classes', () => {
    const { container } = render(
      <Stack
        paddingX="md"
        paddingY="sm"
        paddingTop="lg"
        paddingRight="xs"
        paddingBottom="xl"
        paddingLeft="2xl"
      >
        <span />
      </Stack>,
    )
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain(s.paddingX.md)
    expect(el.className).toContain(s.paddingY.sm)
    expect(el.className).toContain(s.paddingTop.lg)
    expect(el.className).toContain(s.paddingRight.xs)
    expect(el.className).toContain(s.paddingBottom.xl)
    expect(el.className).toContain(s.paddingLeft['2xl'])
  })

  it('applies background and border classes', () => {
    const { container } = render(
      <Stack background="page" border="bottom"><span /></Stack>,
    )
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain(s.background.page)
    expect(el.className).toContain(s.border.bottom)
  })

  it('applies borderColor, borderStyle and borderRadius classes', () => {
    const { container } = render(
      <Stack
        border="all"
        borderColor="green"
        borderStyle="dashed"
        borderRadius="lg"
      >
        <span />
      </Stack>,
    )
    const cls = (container.firstChild as HTMLElement).className
    expect(cls).toContain(s.borderColor.green)
    expect(cls).toContain(s.borderStyle.dashed)
    expect(cls).toContain(s.borderRadius.lg)
  })

  it('applies baseline align and minWidth0 classes', () => {
    const { container } = render(
      <Stack direction="row" align="baseline" minWidth0><span /></Stack>,
    )
    const cls = (container.firstChild as HTMLElement).className
    expect(cls).toContain(s.align.baseline)
    expect(cls).toContain(s.minWidth0)
  })

  it('applies position and fullWidth classes', () => {
    const { container } = render(
      <Stack position="relative" fullWidth><span /></Stack>,
    )
    const cls = (container.firstChild as HTMLElement).className
    expect(cls).toContain(s.position.relative)
    expect(cls).toContain(s.fullWidth)
  })

  it('applies per-side offset classes', () => {
    const { container } = render(
      <Stack position="absolute" top="none" right="sm" bottom="none" left="md">
        <span />
      </Stack>,
    )
    const cls = (container.firstChild as HTMLElement).className
    expect(cls).toContain(s.top.none)
    expect(cls).toContain(s.right.sm)
    expect(cls).toContain(s.bottom.none)
    expect(cls).toContain(s.left.md)
  })

  it('forwards ref to the underlying div', () => {
    const ref = createRef<HTMLDivElement>()
    const { container } = render(<Stack ref={ref}><span /></Stack>)
    expect(ref.current).toBe(container.firstChild)
  })

  it('omits per-axis padding classes when prop is undefined', () => {
    const { container } = render(<Stack><span /></Stack>)
    const cls = (container.firstChild as HTMLElement).className
    expect(cls).not.toContain(s.paddingX.md)
    expect(cls).not.toContain(s.paddingTop.md)
    expect(cls).not.toContain(s.background.page)
    expect(cls).not.toContain(s.border.bottom)
  })
})
