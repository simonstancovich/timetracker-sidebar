import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { StatusDot } from './StatusDot'
import * as s from './StatusDot.css'

describe('<StatusDot />', () => {
  it('renders a span with aria-hidden (decorative)', () => {
    const { container } = render(<StatusDot color="pink" />)
    const el = container.firstChild as HTMLElement
    expect(el.tagName).toBe('SPAN')
    expect(el).toHaveAttribute('aria-hidden')
  })

  it('applies default size=sm and the given color', () => {
    const { container } = render(<StatusDot color="pink" />)
    const cls = (container.firstChild as HTMLElement).className
    expect(cls).toContain(s.size.sm)
    expect(cls).toContain(s.color.pink)
  })

  it('respects size and color overrides', () => {
    const { container } = render(<StatusDot color="warning" size="lg" />)
    const cls = (container.firstChild as HTMLElement).className
    expect(cls).toContain(s.size.lg)
    expect(cls).toContain(s.color.warning)
  })

  it('attaches the matching glow class only when glow is true', () => {
    const { container, rerender } = render(<StatusDot color="pink" />)
    expect((container.firstChild as HTMLElement).className).not.toContain(s.glow.pink)
    rerender(<StatusDot color="pink" glow />)
    expect((container.firstChild as HTMLElement).className).toContain(s.glow.pink)
  })

  it('attaches the pulse class only when pulse is true', () => {
    const { container, rerender } = render(<StatusDot color="pink" />)
    expect((container.firstChild as HTMLElement).className).not.toContain(s.pulseClass)
    rerender(<StatusDot color="pink" pulse />)
    expect((container.firstChild as HTMLElement).className).toContain(s.pulseClass)
  })

  it('merges a consumer-supplied className', () => {
    const { container } = render(<StatusDot color="pink" className="extra" />)
    expect((container.firstChild as HTMLElement).className).toContain('extra')
  })
})
