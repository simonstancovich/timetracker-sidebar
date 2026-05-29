import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Skeleton } from './Skeleton'
import * as s from './Skeleton.css'

describe('<Skeleton />', () => {
  it('renders a div with the shimmer root class by default', () => {
    const { container } = render(<Skeleton />)
    const el = container.firstChild as HTMLElement
    expect(el.tagName).toBe('DIV')
    expect(el.className).toContain(s.root)
  })

  it('renders a span when inline is true', () => {
    const { container } = render(<Skeleton inline />)
    expect((container.firstChild as HTMLElement).tagName).toBe('SPAN')
  })

  it('marks the placeholder aria-hidden so SRs skip it', () => {
    const { container } = render(<Skeleton />)
    expect(container.firstChild).toHaveAttribute('aria-hidden')
  })

  it('applies the chosen height and radius classes', () => {
    const { container } = render(<Skeleton height="lg" radius="sm" />)
    const cls = (container.firstChild as HTMLElement).className
    expect(cls).toContain(s.height.lg)
    expect(cls).toContain(s.radius.sm)
  })

  it('merges a consumer-supplied className', () => {
    const { container } = render(<Skeleton className="extra" />)
    expect((container.firstChild as HTMLElement).className).toContain('extra')
  })
})
