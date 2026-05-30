import { createRef } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IconButton } from './IconButton'
import * as s from './IconButton.css'

describe('<IconButton />', () => {
  it('renders a type="button" with the aria-label', () => {
    render(<IconButton aria-label="Minimize">▼</IconButton>)
    const btn = screen.getByRole('button', { name: 'Minimize' })
    expect(btn).toHaveAttribute('type', 'button')
    expect(btn).toHaveTextContent('▼')
  })

  it('applies default variant=soft and size=sm', () => {
    render(<IconButton aria-label="Min">▼</IconButton>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain(s.variant.soft)
    expect(btn.className).toContain(s.size.sm)
  })

  it('respects variant and size props', () => {
    render(<IconButton aria-label="Min" variant="ghost" size="md">▼</IconButton>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain(s.variant.ghost)
    expect(btn.className).toContain(s.size.md)
  })

  it('forwards onClick', async () => {
    const onClick = vi.fn()
    render(<IconButton aria-label="Min" onClick={onClick}>▼</IconButton>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('forwards arbitrary button attributes', () => {
    render(
      <IconButton aria-label="Min" title="Dock as top bar" data-testid="mb">
        ▼
      </IconButton>,
    )
    const btn = screen.getByTestId('mb')
    expect(btn).toHaveAttribute('title', 'Dock as top bar')
  })

  it('respects disabled and blocks onClick when disabled', async () => {
    const onClick = vi.fn()
    render(
      <IconButton aria-label="Min" onClick={onClick} disabled>
        ▼
      </IconButton>,
    )
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
    await userEvent.click(btn)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('forwards ref to the underlying button', () => {
    const ref = createRef<HTMLButtonElement>()
    render(
      <IconButton aria-label="Min" ref={ref}>
        ▼
      </IconButton>,
    )
    expect(ref.current).toBe(screen.getByRole('button'))
  })

  it('merges a consumer-supplied className', () => {
    render(<IconButton aria-label="Min" className="extra">▼</IconButton>)
    expect(screen.getByRole('button').className).toContain('extra')
  })

  it('supports the content-sized ring variant', () => {
    render(
      <IconButton aria-label="Hours" variant="ring" size="fit">
        x
      </IconButton>,
    )
    const btn = screen.getByRole('button')
    expect(btn.className).toContain(s.variant.ring)
    expect(btn.className).toContain(s.size.fit)
  })

  it('renders a badge slot in the corner when provided', () => {
    const { container } = render(
      <IconButton aria-label="Hours" badge={<i data-testid="dot" />}>
        x
      </IconButton>,
    )
    const badgeEl = container.querySelector(`span.${s.badge}`)
    expect(badgeEl).toBeInTheDocument()
    expect(screen.getByTestId('dot')).toBeInTheDocument()
  })
})
