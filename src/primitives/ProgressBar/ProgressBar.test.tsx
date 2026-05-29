import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProgressBar } from './ProgressBar'
import * as s from './ProgressBar.css'

describe('<ProgressBar />', () => {
  it('renders with role="progressbar"', () => {
    render(<ProgressBar value={0.5} />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('reflects value via aria-valuenow (0–100, rounded)', () => {
    const { rerender } = render(<ProgressBar value={0} />)
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('0')

    rerender(<ProgressBar value={0.333} />)
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('33')

    rerender(<ProgressBar value={1} />)
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('100')
  })

  it('clamps out-of-range values to 0–100', () => {
    const { rerender } = render(<ProgressBar value={-0.5} />)
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('0')

    rerender(<ProgressBar value={1.7} />)
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('100')
  })

  it('sets the fill width to the percent value', () => {
    const { container } = render(<ProgressBar value={0.42} />)
    const fill = container.querySelector(`.${s.fill}`) as HTMLElement
    expect(fill.style.width).toBe('42%')
  })

  it('defaults to tone=accent, size=thin', () => {
    const { container } = render(<ProgressBar value={0.5} />)
    const track = container.firstChild as HTMLElement
    expect(track.className).toContain(s.trackSize.thin)
    const fill = container.querySelector(`.${s.fill}`) as HTMLElement
    expect(fill.className).toContain(s.tone.accent)
  })

  it('applies the chosen tone and size classes', () => {
    const { container } = render(<ProgressBar value={0.5} tone="urgent" size="mid" />)
    const track = container.firstChild as HTMLElement
    const fill = container.querySelector(`.${s.fill}`) as HTMLElement
    expect(track.className).toContain(s.trackSize.mid)
    expect(fill.className).toContain(s.tone.urgent)
  })

  it('applies grow when prop is true', () => {
    const { container, rerender } = render(<ProgressBar value={0.5} />)
    expect((container.firstChild as HTMLElement).className).not.toContain(s.grow)
    rerender(<ProgressBar value={0.5} grow />)
    expect((container.firstChild as HTMLElement).className).toContain(s.grow)
  })

  it('forwards aria-label and other HTML attributes', () => {
    render(
      <ProgressBar value={0.5} aria-label="Loading progress" data-testid="pb" />,
    )
    const el = screen.getByTestId('pb')
    expect(el.getAttribute('aria-label')).toBe('Loading progress')
  })

  it('passes through className', () => {
    const { container } = render(<ProgressBar value={0.5} className="custom" />)
    expect((container.firstChild as HTMLElement).className).toContain('custom')
  })
})
