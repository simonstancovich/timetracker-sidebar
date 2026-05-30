import { createRef } from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { IconTile } from './IconTile'
import * as s from './IconTile.css'

describe('<IconTile />', () => {
  it('renders children', () => {
    render(<IconTile>x</IconTile>)
    expect(screen.getByText('x')).toBeInTheDocument()
  })

  it('applies default size=md', () => {
    const { container } = render(<IconTile>x</IconTile>)
    expect((container.firstChild as HTMLElement).className).toContain(s.size.md)
  })

  it('respects size prop', () => {
    const { container } = render(<IconTile size="xl">x</IconTile>)
    expect((container.firstChild as HTMLElement).className).toContain(s.size.xl)
  })

  it('is aria-hidden by default (decorative)', () => {
    const { container } = render(<IconTile>x</IconTile>)
    expect((container.firstChild as HTMLElement).getAttribute('aria-hidden')).toBe('true')
  })

  it('allows aria-hidden to be opted out and forwards aria-label', () => {
    const { container } = render(
      <IconTile aria-hidden={false} aria-label="Timer">
        x
      </IconTile>,
    )
    const el = container.firstChild as HTMLElement
    expect(el.getAttribute('aria-hidden')).toBe('false')
    expect(el.getAttribute('aria-label')).toBe('Timer')
  })

  it('merges a consumer-supplied className', () => {
    const { container } = render(<IconTile className="extra">x</IconTile>)
    expect((container.firstChild as HTMLElement).className).toContain('extra')
  })

  it('forwards id', () => {
    const { container } = render(<IconTile id="logo">x</IconTile>)
    expect((container.firstChild as HTMLElement).id).toBe('logo')
  })

  it('forwards ref to the underlying element', () => {
    const ref = createRef<HTMLDivElement>()
    const { container } = render(<IconTile ref={ref}>x</IconTile>)
    expect(ref.current).toBe(container.firstChild)
  })
})
