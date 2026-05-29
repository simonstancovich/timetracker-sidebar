import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PageEyebrow } from './PageEyebrow'
import * as s from './PageEyebrow.css'

describe('<PageEyebrow />', () => {
  it('renders as a <header> landmark', () => {
    const { container } = render(<PageEyebrow title="Today" />)
    expect(container.querySelector('header')).toBeInTheDocument()
  })

  it('renders the title text', () => {
    render(<PageEyebrow title="Today" />)
    expect(screen.getByText('Today')).toBeInTheDocument()
  })

  it('renders the optional hint when provided', () => {
    render(<PageEyebrow title="Today" hint="3 entries" />)
    expect(screen.getByText('3 entries')).toBeInTheDocument()
  })

  it('omits the hint span when no hint is passed', () => {
    const { container } = render(<PageEyebrow title="Today" />)
    expect(container.querySelector(`.${s.hint}`)).toBeNull()
  })

  it('renders the divider as aria-hidden', () => {
    const { container } = render(<PageEyebrow title="Today" />)
    const divider = container.querySelector(`.${s.divider}`)
    expect(divider).toHaveAttribute('aria-hidden')
  })

  it('merges a consumer-supplied className', () => {
    const { container } = render(<PageEyebrow title="Today" className="extra" />)
    expect((container.firstChild as HTMLElement).className).toContain('extra')
  })

  it('forwards id and aria-* attributes', () => {
    const { container } = render(
      <PageEyebrow id="today-eyebrow" aria-label="Today summary" title="Today" />,
    )
    const el = container.firstChild as HTMLElement
    expect(el.id).toBe('today-eyebrow')
    expect(el.getAttribute('aria-label')).toBe('Today summary')
  })
})
