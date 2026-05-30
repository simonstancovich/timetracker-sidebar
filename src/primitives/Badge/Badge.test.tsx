import { createRef } from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from './Badge'
import * as s from './Badge.css'

describe('<Badge />', () => {
  it('renders as a span with children', () => {
    render(<Badge tone="pink">9.2</Badge>)
    const el = screen.getByText('9.2')
    expect(el.tagName).toBe('SPAN')
  })

  it('applies the root class', () => {
    const { container } = render(<Badge tone="pink">x</Badge>)
    expect((container.firstChild as HTMLElement).className).toContain(s.root)
  })

  it.each(['pink', 'green', 'accent'] as const)('applies tone=%s', (t) => {
    const { container } = render(<Badge tone={t}>x</Badge>)
    expect((container.firstChild as HTMLElement).className).toContain(s.tone[t])
  })

  it('merges a consumer-supplied className', () => {
    const { container } = render(
      <Badge tone="pink" className="extra">
        x
      </Badge>,
    )
    expect((container.firstChild as HTMLElement).className).toContain('extra')
  })

  it('forwards id, aria-* and data-* attributes', () => {
    const { container } = render(
      <Badge tone="green" id="b" aria-label="Streak" data-testid="bd">
        x
      </Badge>,
    )
    const el = container.firstChild as HTMLElement
    expect(el.id).toBe('b')
    expect(el.getAttribute('aria-label')).toBe('Streak')
    expect(el.getAttribute('data-testid')).toBe('bd')
  })

  it('forwards ref to the underlying element', () => {
    const ref = createRef<HTMLSpanElement>()
    const { container } = render(
      <Badge tone="accent" ref={ref}>
        x
      </Badge>,
    )
    expect(ref.current).toBe(container.firstChild)
  })
})
