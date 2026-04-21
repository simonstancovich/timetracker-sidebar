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

  it('respects disabled', () => {
    render(<IconButton aria-label="Min" disabled>▼</IconButton>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('merges a consumer-supplied className', () => {
    render(<IconButton aria-label="Min" className="extra">▼</IconButton>)
    expect(screen.getByRole('button').className).toContain('extra')
  })
})
