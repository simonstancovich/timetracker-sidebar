import { createRef } from 'react'
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Card } from './Card'
import * as s from './Card.css'

describe('<Card />', () => {
  it('applies default tone, radius and pad', () => {
    const { container } = render(<Card>x</Card>)
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain(s.root)
    expect(el.className).toContain(s.tone.default)
    expect(el.className).toContain(s.radius.lg)
    expect(el.className).toContain(s.pad.md)
  })

  it.each(['default', 'tinted', 'accent'] as const)('applies tone=%s', (t) => {
    const { container } = render(<Card tone={t}>x</Card>)
    expect((container.firstChild as HTMLElement).className).toContain(s.tone[t])
  })

  it.each(['lg', 'xl'] as const)('applies radius=%s', (r) => {
    const { container } = render(<Card radius={r}>x</Card>)
    expect((container.firstChild as HTMLElement).className).toContain(s.radius[r])
  })

  it.each(['none', 'sm', 'md', 'lg'] as const)('applies pad=%s', (p) => {
    const { container } = render(<Card pad={p}>x</Card>)
    expect((container.firstChild as HTMLElement).className).toContain(s.pad[p])
  })

  it('merges a consumer-supplied className', () => {
    const { container } = render(<Card className="extra">x</Card>)
    expect((container.firstChild as HTMLElement).className).toContain('extra')
  })

  it('forwards id, aria-* and data-* attributes', () => {
    const { container } = render(
      <Card id="panel" aria-label="Insight" data-testid="card">
        x
      </Card>,
    )
    const el = container.firstChild as HTMLElement
    expect(el.id).toBe('panel')
    expect(el.getAttribute('aria-label')).toBe('Insight')
    expect(el.getAttribute('data-testid')).toBe('card')
  })

  it('forwards ref to the underlying element', () => {
    const ref = createRef<HTMLDivElement>()
    const { container } = render(<Card ref={ref}>x</Card>)
    expect(ref.current).toBe(container.firstChild)
  })
})
