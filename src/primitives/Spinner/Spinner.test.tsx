import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Spinner } from './Spinner'
import * as s from './Spinner.css'

describe('<Spinner />', () => {
  it('renders a status role for screen readers', () => {
    render(<Spinner />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders the disc as presentation (aria-hidden)', () => {
    const { container } = render(<Spinner />)
    expect(container.querySelector(`.${s.disc}`)).toHaveAttribute('aria-hidden')
  })

  it('applies default size=md and layout=inline', () => {
    const { container } = render(<Spinner />)
    const root = container.firstChild as HTMLElement
    expect(root.className).toContain(s.wrapper.inline)
    const disc = container.querySelector(`.${s.disc}`) as HTMLElement
    expect(disc.className).toContain(s.size.md)
  })

  it('respects size prop', () => {
    const { container } = render(<Spinner size="lg" />)
    const disc = container.querySelector(`.${s.disc}`) as HTMLElement
    expect(disc.className).toContain(s.size.lg)
  })

  it('switches to fill layout', () => {
    const { container } = render(<Spinner layout="fill" />)
    expect((container.firstChild as HTMLElement).className).toContain(s.wrapper.fill)
  })

  it('renders the optional label when provided', () => {
    render(<Spinner label="Loading projects…" />)
    expect(screen.getByText('Loading projects…')).toBeInTheDocument()
  })

  it('omits the label when not provided', () => {
    const { container } = render(<Spinner />)
    expect(container.querySelector(`.${s.label}`)).toBeNull()
  })
})
