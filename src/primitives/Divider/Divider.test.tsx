import { createRef } from 'react'
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Divider } from './Divider'
import * as s from './Divider.css'

describe('<Divider />', () => {
  it('renders a div with aria-hidden by default and the soft tone', () => {
    const { container } = render(<Divider />)
    const el = container.firstChild as HTMLElement
    expect(el.tagName).toBe('DIV')
    expect(el.getAttribute('aria-hidden')).toBe('true')
    expect(el.className).toContain(s.root)
    expect(el.className).toContain(s.tone.soft)
  })

  it.each(['soft', 'raised'] as const)('applies tone=%s', (t) => {
    const { container } = render(<Divider tone={t} />)
    expect((container.firstChild as HTMLElement).className).toContain(s.tone[t])
  })

  it('applies grow when prop is true and omits it when false', () => {
    const { container, rerender } = render(<Divider grow />)
    expect((container.firstChild as HTMLElement).className).toContain(s.grow)

    rerender(<Divider />)
    expect((container.firstChild as HTMLElement).className).not.toContain(s.grow)
  })

  it('allows aria-hidden to be overridden', () => {
    const { container } = render(<Divider aria-hidden={false} role="separator" />)
    const el = container.firstChild as HTMLElement
    expect(el.getAttribute('aria-hidden')).toBe('false')
    expect(el.getAttribute('role')).toBe('separator')
  })

  it('merges a consumer-supplied className', () => {
    const { container } = render(<Divider className="extra" />)
    expect((container.firstChild as HTMLElement).className).toContain('extra')
  })

  it('forwards id and data-* attributes', () => {
    const { container } = render(<Divider id="d" data-testid="div" />)
    const el = container.firstChild as HTMLElement
    expect(el.id).toBe('d')
    expect(el.getAttribute('data-testid')).toBe('div')
  })

  it('forwards ref to the underlying element', () => {
    const ref = createRef<HTMLDivElement>()
    const { container } = render(<Divider ref={ref} />)
    expect(ref.current).toBe(container.firstChild)
  })
})
