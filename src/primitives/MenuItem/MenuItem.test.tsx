import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MenuItem } from './MenuItem'
import * as s from './MenuItem.css'

describe('<MenuItem />', () => {
  it('renders with role="option" and aria-selected="false" by default', () => {
    render(<MenuItem>Acme</MenuItem>)
    const opt = screen.getByRole('option', { name: 'Acme' })
    expect(opt).toHaveAttribute('aria-selected', 'false')
    expect(opt.className).not.toContain(s.highlighted)
  })

  it('toggles aria-selected and the highlighted class when highlighted', () => {
    const { rerender } = render(<MenuItem highlighted>Acme</MenuItem>)
    const opt = screen.getByRole('option')
    expect(opt).toHaveAttribute('aria-selected', 'true')
    expect(opt.className).toContain(s.highlighted)

    rerender(<MenuItem>Acme</MenuItem>)
    expect(screen.getByRole('option')).toHaveAttribute('aria-selected', 'false')
  })

  it('forwards onMouseDown and onMouseEnter', async () => {
    const onMouseDown = vi.fn()
    const onMouseEnter = vi.fn()
    render(
      <MenuItem onMouseDown={onMouseDown} onMouseEnter={onMouseEnter}>
        Acme
      </MenuItem>,
    )
    const opt = screen.getByRole('option')
    await userEvent.pointer({ target: opt })
    await userEvent.pointer({ keys: '[MouseLeft>]', target: opt })
    expect(onMouseDown).toHaveBeenCalled()
    expect(onMouseEnter).toHaveBeenCalled()
  })

  it('merges a consumer-supplied className', () => {
    render(<MenuItem className="extra">Acme</MenuItem>)
    expect(screen.getByRole('option').className).toContain('extra')
  })
})
