import { createRef } from 'react'
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ActivityRing } from './ActivityRing'
import * as s from './ActivityRing.css'

describe('<ActivityRing />', () => {
  it('renders root + svg + content classes', () => {
    const { container } = render(
      <ActivityRing progress={0.5} done={false}>
        x
      </ActivityRing>,
    )
    const root = container.firstChild as HTMLElement
    expect(root.className).toContain(s.root)
    expect(root.querySelector(`.${s.svg}`)).toBeInTheDocument()
    expect(root.querySelector(`.${s.content}`)?.textContent).toBe('x')
  })

  it('uses ring class when done=false, ringDone when done=true', () => {
    const { container, rerender } = render(
      <ActivityRing progress={0.5} done={false}>
        x
      </ActivityRing>,
    )
    expect(container.querySelector(`.${s.ring}`)).toBeInTheDocument()
    expect(container.querySelector(`.${s.ringDone}`)).toBeNull()

    rerender(
      <ActivityRing progress={0.5} done>
        x
      </ActivityRing>,
    )
    expect(container.querySelector(`.${s.ring}`)).toBeNull()
    expect(container.querySelector(`.${s.ringDone}`)).toBeInTheDocument()
  })

  it.each([
    [-0.5, 0],
    [0, 0],
    [0.5, 0.5],
    [1, 1],
    [1.5, 1],
  ])('clamps progress=%s to %s', (input, clamped) => {
    const { container } = render(
      <ActivityRing progress={input} done={false} size={40} stroke={4}>
        x
      </ActivityRing>,
    )
    const arc = container.querySelectorAll('circle')[1] as SVGCircleElement
    const r = (40 - 4) / 2
    const circ = 2 * Math.PI * r
    const expected = (circ * (1 - clamped)).toString()
    expect(arc.getAttribute('stroke-dashoffset')).toBe(expected)
  })

  it('omits ticks by default and renders 8 lines (4 major + 4 minor) when withTicks', () => {
    const { container, rerender } = render(
      <ActivityRing progress={0} done={false}>
        x
      </ActivityRing>,
    )
    expect(container.querySelectorAll('line').length).toBe(0)

    rerender(
      <ActivityRing progress={0} done={false} withTicks>
        x
      </ActivityRing>,
    )
    expect(container.querySelectorAll('line').length).toBe(8)
    expect(container.querySelectorAll(`line.${s.tickMajor}`).length).toBe(4)
    expect(container.querySelectorAll(`line.${s.tick}`).length).toBe(4)
  })

  it('marks the svg as aria-hidden (decorative)', () => {
    const { container } = render(
      <ActivityRing progress={0.5} done={false}>
        x
      </ActivityRing>,
    )
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
  })

  it('applies size to width/height of the wrapper and svg', () => {
    const { container } = render(
      <ActivityRing progress={0.5} done={false} size={42}>
        x
      </ActivityRing>,
    )
    const root = container.firstChild as HTMLElement
    expect(root.style.width).toBe('42px')
    expect(root.style.height).toBe('42px')
    expect(container.querySelector('svg')?.getAttribute('width')).toBe('42')
  })

  it('merges a consumer-supplied className', () => {
    const { container } = render(
      <ActivityRing progress={0} done={false} className="extra">
        x
      </ActivityRing>,
    )
    expect((container.firstChild as HTMLElement).className).toContain('extra')
  })

  it('forwards id and data-* attributes', () => {
    const { container } = render(
      <ActivityRing progress={0} done={false} id="ring" data-testid="ar">
        x
      </ActivityRing>,
    )
    const el = container.firstChild as HTMLElement
    expect(el.id).toBe('ring')
    expect(el.getAttribute('data-testid')).toBe('ar')
  })

  it('forwards ref to the underlying element', () => {
    const ref = createRef<HTMLDivElement>()
    const { container } = render(
      <ActivityRing progress={0} done={false} ref={ref}>
        x
      </ActivityRing>,
    )
    expect(ref.current).toBe(container.firstChild)
  })
})
