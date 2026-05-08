import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Pill } from './Pill'
import * as s from './Pill.css'

describe('<Pill />', () => {
  it('renders a type="button" with children', () => {
    render(<Pill>05:58:53</Pill>)
    const btn = screen.getByRole('button', { name: '05:58:53' })
    expect(btn).toHaveAttribute('type', 'button')
  })

  it('applies the base root class', () => {
    const { container } = render(<Pill>x</Pill>)
    expect((container.firstChild as HTMLElement).className).toContain(s.root)
  })

  it('is neutral when no highlight is set', () => {
    const { container } = render(<Pill>x</Pill>)
    const cls = (container.firstChild as HTMLElement).className
    expect(cls).not.toContain(s.highlight.pink)
    expect(cls).not.toContain(s.highlight.accent)
    expect(cls).not.toContain(s.highlight.green)
  })

  it('applies the pink highlight', () => {
    const { container } = render(<Pill highlight="pink">x</Pill>)
    expect((container.firstChild as HTMLElement).className).toContain(s.highlight.pink)
  })

  it('forwards onClick and arbitrary attributes', async () => {
    const onClick = vi.fn()
    render(
      <Pill onClick={onClick} title="Jump to timer" aria-label="Timer status">
        x
      </Pill>,
    )
    const btn = screen.getByRole('button', { name: 'Timer status' })
    expect(btn).toHaveAttribute('title', 'Jump to timer')
    await userEvent.click(btn)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('respects disabled', () => {
    render(<Pill disabled>x</Pill>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('merges a consumer-supplied className', () => {
    render(<Pill className="extra">x</Pill>)
    expect(screen.getByRole('button').className).toContain('extra')
  })
})
